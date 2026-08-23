create table if not exists public.mcq_bank_review_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.mcq_banks(id) on delete cascade,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  first_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  last_answer_correct boolean not null default false,
  next_review_at timestamptz,
  primary key (user_id, question_id)
);

grant select on public.mcq_bank_review_attempts to authenticated;
grant all on public.mcq_bank_review_attempts to service_role;
alter table public.mcq_bank_review_attempts enable row level security;

drop policy if exists "own mcq review rows" on public.mcq_bank_review_attempts;
create policy "own mcq review rows" on public.mcq_bank_review_attempts
for select to authenticated using (user_id = auth.uid());

create or replace function public.get_due_mcq_bank_reviews()
returns table(question_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select r.question_id
  from public.mcq_bank_review_attempts r
  where r.user_id = auth.uid()
    and r.next_review_at is not null
    and r.next_review_at <= now()
  order by r.next_review_at asc;
$$;

grant execute on function public.get_due_mcq_bank_reviews() to authenticated;

create or replace function public.answer_mcq_bank(
  _question_id uuid,
  _choice_index integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_answer_index integer;
  v_explanation text;
  v_correct boolean;
  v_existing boolean;
  v_first_attempt boolean;
  v_points integer := 0;
  v_award_id uuid;
  v_ref_id text;
  v_review_due_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to answer questions';
  end if;

  select answer_index, explanation
    into v_answer_index, v_explanation
  from public.mcq_banks
  where id = _question_id;

  if not found then
    raise exception 'Question not found';
  end if;

  v_correct := _choice_index = v_answer_index;
  v_ref_id := 'mcq-bank:' || _question_id::text;

  perform 1
  from public.mcq_bank_review_attempts
  where user_id = v_user_id and question_id = _question_id
  for update;
  v_existing := found;
  v_first_attempt := not v_existing;

  if v_correct then
    if v_first_attempt then
      insert into public.mcq_bank_review_attempts (
        user_id, question_id, attempt_count, last_answer_correct, next_review_at
      )
      values (v_user_id, _question_id, 1, true, null);

      if not exists (
        select 1 from public.user_points
        where user_id = v_user_id and ref_id = v_ref_id
      ) then
        insert into public.user_points (user_id, source, points, ref_id)
        values (v_user_id, 'mcq', 5, v_ref_id)
        returning id into v_award_id;
      end if;

      if v_award_id is not null then
        v_points := 5;
      end if;
    else
      update public.mcq_bank_review_attempts
      set attempt_count = attempt_count + 1,
          last_attempt_at = now(),
          last_answer_correct = true,
          next_review_at = null
      where user_id = v_user_id and question_id = _question_id;
    end if;
  else
    v_review_due_at := now() + interval '3 days';
    if v_first_attempt then
      insert into public.mcq_bank_review_attempts (
        user_id, question_id, attempt_count, last_answer_correct, next_review_at
      )
      values (v_user_id, _question_id, 1, false, v_review_due_at);
    else
      update public.mcq_bank_review_attempts
      set attempt_count = attempt_count + 1,
          last_attempt_at = now(),
          last_answer_correct = false,
          next_review_at = v_review_due_at
      where user_id = v_user_id and question_id = _question_id;
    end if;
  end if;

  return jsonb_build_object(
    'correct', v_correct,
    'answer_index', v_answer_index,
    'explanation', v_explanation,
    'points', v_points,
    'first_attempt', v_first_attempt,
    'review_due_at', v_review_due_at
  );
end;
$$;

grant execute on function public.answer_mcq_bank(uuid, integer) to authenticated;

create table if not exists public.my_mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  ref_id text,
  subject text,
  chapter text,
  language text,
  question text not null,
  choices jsonb not null default '[]'::jsonb,
  correct_answer text,
  user_answer text,
  explanation text,
  times_wrong integer not null default 1,
  times_redone integer not null default 0,
  resolved boolean not null default false,
  next_review_at timestamptz not null default (now() + interval '3 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists my_mistakes_unique_item
  on public.my_mistakes (user_id, source, coalesce(ref_id, md5(question)));
create index if not exists my_mistakes_due_idx
  on public.my_mistakes (user_id, resolved, next_review_at);

grant select, insert, update, delete on public.my_mistakes to authenticated;
grant all on public.my_mistakes to service_role;
alter table public.my_mistakes enable row level security;

drop policy if exists "own mistakes" on public.my_mistakes;
create policy "own mistakes" on public.my_mistakes
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop trigger if exists my_mistakes_set_updated_at on public.my_mistakes;
create trigger my_mistakes_set_updated_at
before update on public.my_mistakes
for each row execute function public.update_updated_at_column();

create or replace function public.record_mistake(
  _source text,
  _question text,
  _ref_id text default null,
  _subject text default null,
  _chapter text default null,
  _language text default null,
  _choices jsonb default '[]'::jsonb,
  _correct_answer text default null,
  _user_answer text default null,
  _explanation text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
begin
  if v_user_id is null then
    return null;
  end if;
  if _question is null or length(btrim(_question)) = 0 then
    return null;
  end if;

  insert into public.my_mistakes (
    user_id, source, ref_id, subject, chapter, language, question,
    choices, correct_answer, user_answer, explanation, next_review_at
  ) values (
    v_user_id, _source, _ref_id, _subject, _chapter, _language, left(_question, 4000),
    coalesce(_choices, '[]'::jsonb), _correct_answer, _user_answer, _explanation,
    now() + interval '3 days'
  )
  on conflict (user_id, source, coalesce(ref_id, md5(question))) do update
  set times_wrong = public.my_mistakes.times_wrong + 1,
      resolved = false,
      user_answer = excluded.user_answer,
      correct_answer = coalesce(excluded.correct_answer, public.my_mistakes.correct_answer),
      explanation = coalesce(excluded.explanation, public.my_mistakes.explanation),
      choices = case when excluded.choices = '[]'::jsonb then public.my_mistakes.choices else excluded.choices end,
      next_review_at = now() + interval '3 days',
      updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.record_mistake(text, text, text, text, text, text, jsonb, text, text, text) to authenticated;

create or replace function public.resolve_mistake(_id uuid, _correct boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  update public.my_mistakes
  set times_redone = times_redone + 1,
      resolved = _correct,
      times_wrong = case when _correct then times_wrong else times_wrong + 1 end,
      next_review_at = case when _correct then now() + interval '30 days' else now() + interval '3 days' end,
      updated_at = now()
  where id = _id and user_id = auth.uid();
end;
$$;

grant execute on function public.resolve_mistake(uuid, boolean) to authenticated;