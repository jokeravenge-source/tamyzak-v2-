-- Multi-day study challenges between friends. Scores are derived from saved
-- study_sessions, so the Sessions timer remains the single source of truth.

create table if not exists public.study_challenges (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at and ends_at <= starts_at + interval '30 days')
);

create table if not exists public.study_challenge_members (
  challenge_id uuid not null references public.study_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create index if not exists study_challenges_creator_idx
  on public.study_challenges (creator_id, created_at desc);
create index if not exists study_challenges_ends_idx
  on public.study_challenges (ends_at desc) where status = 'active';
create index if not exists study_challenge_members_user_idx
  on public.study_challenge_members (user_id, status, created_at desc);

grant select, insert, update on public.study_challenges to authenticated;
grant select, insert, update on public.study_challenge_members to authenticated;
grant all on public.study_challenges, public.study_challenge_members to service_role;

alter table public.study_challenges enable row level security;
alter table public.study_challenge_members enable row level security;

drop policy if exists "Participants can view study challenges" on public.study_challenges;
create policy "Participants can view study challenges"
on public.study_challenges for select to authenticated
using (creator_id = auth.uid());

drop policy if exists "Creators can update study challenges" on public.study_challenges;
create policy "Creators can update study challenges"
on public.study_challenges for update to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

drop policy if exists "Users can view own challenge membership" on public.study_challenge_members;
create policy "Users can view own challenge membership"
on public.study_challenge_members for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can answer challenge invites" on public.study_challenge_members;
create policy "Users can answer challenge invites"
on public.study_challenge_members for update to authenticated
using (user_id = auth.uid() and status = 'pending')
with check (user_id = auth.uid() and status in ('accepted', 'declined'));

create or replace function public.create_study_challenge(
  _title text,
  _duration_days integer,
  _invitee_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  _user_id uuid := auth.uid();
  _challenge_id uuid;
  _clean_invitees uuid[];
begin
  if _user_id is null then raise exception 'Authentication required'; end if;
  if char_length(btrim(coalesce(_title, ''))) not between 1 and 80 then
    raise exception 'Challenge title must be between 1 and 80 characters';
  end if;
  if _duration_days not between 1 and 30 then
    raise exception 'Challenge duration must be between 1 and 30 days';
  end if;

  select coalesce(array_agg(distinct p.user_id), '{}'::uuid[])
  into _clean_invitees
  from public.profiles p
  where p.user_id = any(coalesce(_invitee_ids, '{}'::uuid[]))
    and p.user_id <> _user_id;

  if cardinality(_clean_invitees) < 1 then raise exception 'Invite at least one friend'; end if;
  if cardinality(_clean_invitees) > 20 then raise exception 'A challenge can include up to 20 friends'; end if;

  insert into public.study_challenges (creator_id, title, ends_at)
  values (_user_id, btrim(_title), now() + make_interval(days => _duration_days))
  returning id into _challenge_id;

  insert into public.study_challenge_members (challenge_id, user_id, invited_by, status, joined_at)
  values (_challenge_id, _user_id, _user_id, 'accepted', now());

  insert into public.study_challenge_members (challenge_id, user_id, invited_by)
  select _challenge_id, invitee.user_id, _user_id
  from unnest(_clean_invitees) as invitee(user_id);

  return _challenge_id;
end;
$$;

create or replace function public.respond_study_challenge(
  _challenge_id uuid,
  _accept boolean
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  update public.study_challenge_members m
  set status = case when _accept then 'accepted' else 'declined' end,
      joined_at = case when _accept then now() else null end
  from public.study_challenges c
  where m.challenge_id = _challenge_id
    and m.challenge_id = c.id
    and m.user_id = auth.uid()
    and m.status = 'pending'
    and c.status = 'active'
    and c.ends_at > now();

  if not found then raise exception 'This invitation is no longer available'; end if;
end;
$$;

create or replace function public.cancel_study_challenge(_challenge_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update public.study_challenges
  set status = 'cancelled', updated_at = now()
  where id = _challenge_id and creator_id = auth.uid() and status = 'active' and ends_at > now();
  if not found then raise exception 'Challenge cannot be cancelled'; end if;
end;
$$;

create or replace function public.get_my_study_challenges()
returns jsonb
language sql
stable
security definer
set search_path = public, auth
as $$
  with mine as (
    select c.*, me.status as my_status,
      coalesce(cp.display_name, 'Student') as creator_name
    from public.study_challenges c
    join public.study_challenge_members me
      on me.challenge_id = c.id and me.user_id = auth.uid()
    left join public.profiles cp on cp.user_id = c.creator_id
    where me.status <> 'declined'
  ), participant_totals as (
    select m.challenge_id, m.user_id, m.status,
      coalesce(p.display_name, 'Student') as display_name,
      coalesce(sum(
        case when s.id is not null and s.created_at >= c.starts_at and s.created_at <= c.ends_at
          then greatest(0, least(s.duration_seconds, 43200)) else 0 end
      ), 0)::bigint as total_seconds
    from public.study_challenge_members m
    join mine c on c.id = m.challenge_id
    left join public.profiles p on p.user_id = m.user_id
    left join public.study_sessions s on s.user_id = m.user_id
    group by m.challenge_id, m.user_id, m.status, p.display_name
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'title', c.title,
      'creatorId', c.creator_id,
      'creatorName', c.creator_name,
      'startsAt', c.starts_at,
      'endsAt', c.ends_at,
      'status', c.status,
      'myStatus', c.my_status,
      'participants', (
        select coalesce(jsonb_agg(
          jsonb_build_object(
            'userId', pt.user_id,
            'displayName', pt.display_name,
            'status', pt.status,
            'totalSeconds', pt.total_seconds
          ) order by
            case when pt.status = 'accepted' then 0 else 1 end,
            pt.total_seconds desc,
            pt.display_name asc
        ), '[]'::jsonb)
        from participant_totals pt where pt.challenge_id = c.id
      )
    ) order by
      case when c.my_status = 'pending' then 0 when c.status = 'active' and c.ends_at > now() then 1 else 2 end,
      c.ends_at desc
  ), '[]'::jsonb)
  from mine c;
$$;

revoke all on function public.create_study_challenge(text, integer, uuid[]) from public;
revoke all on function public.respond_study_challenge(uuid, boolean) from public;
revoke all on function public.cancel_study_challenge(uuid) from public;
revoke all on function public.get_my_study_challenges() from public;
grant execute on function public.create_study_challenge(text, integer, uuid[]) to authenticated;
grant execute on function public.respond_study_challenge(uuid, boolean) to authenticated;
grant execute on function public.cancel_study_challenge(uuid) to authenticated;
grant execute on function public.get_my_study_challenges() to authenticated;

comment on function public.get_my_study_challenges() is
  'Returns only challenges the signed-in student belongs to, with leaderboard totals derived from saved Sessions study time.';
