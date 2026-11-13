CREATE OR REPLACE FUNCTION public.can_take_study_room_ownership() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.user_id IN (
'9bfa55d4-c704-4b71-b76c-3190e94cdea0'::uuid,
'7a6ef4b4-97bf-4647-b6ce-9dc5603634e0'::uuid,
'8c4d7c21-561d-4aba-a725-d190995073af'::uuid,
'12d70bf3-d925-4570-b81e-83ed9dba136a'::uuid,
'd27f6875-8311-4a5e-80dd-678de64790ed'::uuid,
'5ae5ed8e-796b-4c69-82bd-fc72b4013d4c'::uuid,
'b2af86d5-c721-4fd7-843f-c2ef39dab017'::uuid,
'1a92bc34-0d13-412d-ac8e-330ca8552b67'::uuid,
'71013191-b96a-4ae4-892d-e23b86b79706'::uuid,
'460b2928-18a6-4a89-a866-286e3d258c05'::uuid
));
$$;
REVOKE ALL ON FUNCTION public.can_take_study_room_ownership() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_take_study_room_ownership() TO authenticated;

ALTER TABLE public.study_challenges ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.respond_study_challenge(_challenge_id uuid, _accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  if _accept and exists (select 1 from public.study_challenges c where c.id = _challenge_id and c.is_public and c.status = 'active' and c.ends_at > now()) then
    insert into public.study_challenge_members (challenge_id, user_id, invited_by, status, joined_at)
    select _challenge_id, auth.uid(), c.creator_id, 'accepted', now() from public.study_challenges c where c.id = _challenge_id
    on conflict (challenge_id, user_id) do update set status = 'accepted', joined_at = coalesce(public.study_challenge_members.joined_at, now());
    return;
  end if;

  update public.study_challenge_members m
  set status = case when _accept then 'accepted' else 'declined' end,
      joined_at = case when _accept then now() else null end
  from public.study_challenges c
  where m.challenge_id = _challenge_id and m.challenge_id = c.id and m.user_id = auth.uid()
    and m.status = 'pending' and c.status = 'active' and c.ends_at > now();

  if not found then raise exception 'This invitation is no longer available'; end if;
end;
$$;

CREATE OR REPLACE FUNCTION public.get_my_study_challenges()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  with mine as (
    select c.*, me.status as my_status, coalesce(cp.display_name, 'Student') as creator_name
    from public.study_challenges c
    join public.study_challenge_members me on me.challenge_id = c.id and me.user_id = auth.uid()
    left join public.profiles cp on cp.user_id = c.creator_id
    where me.status <> 'declined'
    union all
    select c.*, 'open'::text as my_status, coalesce(cp.display_name, 'Student') as creator_name
    from public.study_challenges c
    left join public.profiles cp on cp.user_id = c.creator_id
    where c.is_public and c.status = 'active' and c.ends_at > now()
      and not exists (select 1 from public.study_challenge_members m where m.challenge_id = c.id and m.user_id = auth.uid())
  ), participant_totals as (
    select m.challenge_id, m.user_id, m.status,
      coalesce(p.display_name, 'Student') as display_name,
      coalesce(sum(case when s.id is not null and s.created_at >= c.starts_at and s.created_at <= c.ends_at
        then greatest(0, least(s.duration_seconds, 43200)) else 0 end), 0)::bigint as total_seconds
    from public.study_challenge_members m
    join mine c on c.id = m.challenge_id
    left join public.profiles p on p.user_id = m.user_id
    left join public.study_sessions s on s.user_id = m.user_id
    where m.status <> 'declined'
    group by m.challenge_id, m.user_id, m.status, p.display_name
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id, 'title', c.title, 'creatorId', c.creator_id, 'creatorName', c.creator_name,
      'startsAt', c.starts_at, 'endsAt', c.ends_at, 'status', c.status, 'myStatus', c.my_status,
      'isPublic', c.is_public,
      'participants', (select coalesce(jsonb_agg(jsonb_build_object(
          'userId', pt.user_id, 'displayName', pt.display_name, 'status', pt.status, 'totalSeconds', pt.total_seconds
        ) order by case when pt.status = 'accepted' then 0 else 1 end, pt.total_seconds desc, pt.display_name asc), '[]'::jsonb)
        from participant_totals pt where pt.challenge_id = c.id)
    ) order by case when c.is_public and c.status = 'active' and c.ends_at > now() then 0 when c.my_status = 'pending' then 1 when c.status = 'active' and c.ends_at > now() then 2 else 3 end, c.ends_at desc), '[]'::jsonb)
  from mine c;
$$;
REVOKE ALL ON FUNCTION public.get_my_study_challenges() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_study_challenge(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_study_challenges() TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_study_challenge(uuid, boolean) TO authenticated;