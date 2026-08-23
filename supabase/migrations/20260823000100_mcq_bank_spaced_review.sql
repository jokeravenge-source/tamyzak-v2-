-- Track MCQ-bank mistakes per account and schedule them for spaced review.
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

alter table public.mcq_bank_review_attempts enable row level security;

-- The functions below are the only client access path; they always scope work
-- to auth.uid(), so a student cannot read or modify another student's reviews.
create or replace function public.get_due_mcq_bank_reviews()
returns table(question_id uuid)
language sql
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

  -- Lock the student's record for this question so double taps cannot earn
  -- multiple rewards or create competing review dates.
  perform 1
  from public.mcq_bank_review_attempts
  where user_id = v_user_id and question_id = _question_id
  for update;

  v_first_attempt := not found;

  if v_correct then
    if v_first_attempt then
      insert into public.mcq_bank_review_attempts (
        user_id, question_id, attempt_count, last_answer_correct, next_review_at
      )
      values (v_user_id, _question_id, 1, true, null);

      -- Only the first attempt can earn points. The ledger check also protects
      -- students who already have an older answer record.
      v_ref_id := 'mcq-bank:' || _question_id::text;
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
        insert into public.user_progress (user_id, lifetime_points)
        values (v_user_id, v_points)
        on conflict (user_id) do update
        set lifetime_points = public.user_progress.lifetime_points + excluded.lifetime_points,
            updated_at = now();
      end if;
    else
      -- A correct review resolves the mistake and removes its reminder.
      update public.mcq_bank_review_attempts
      set attempt_count = attempt_count + 1,
          last_attempt_at = now(),
          last_answer_correct = true,
          next_review_at = null
      where user_id = v_user_id and question_id = _question_id;
    end if;
  elsif v_first_attempt then
    v_review_due_at := now() + interval '4 days';
    insert into public.mcq_bank_review_attempts (
      user_id, question_id, attempt_count, last_answer_correct, next_review_at
    )
    values (v_user_id, _question_id, 1, false, v_review_due_at);
  else
    -- Every incorrect review is scheduled again four days from now.
    v_review_due_at := now() + interval '4 days';
    update public.mcq_bank_review_attempts
    set attempt_count = attempt_count + 1,
        last_attempt_at = now(),
        last_answer_correct = false,
        next_review_at = v_review_due_at
    where user_id = v_user_id and question_id = _question_id;
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
