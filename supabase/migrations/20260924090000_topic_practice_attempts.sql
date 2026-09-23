create table if not exists public.topic_practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  chapter text not null,
  category_key text not null,
  source text not null check (source in ('mcq_bank', 'flashcards', 'ministerial_bank')),
  question_key text not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists topic_practice_user_category_recent
  on public.topic_practice_attempts (user_id, subject, chapter, category_key, created_at desc);

alter table public.topic_practice_attempts enable row level security;

create policy "Students read own topic attempts" on public.topic_practice_attempts
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Students record own topic attempts" on public.topic_practice_attempts
  for insert to authenticated with check (user_id = (select auth.uid()));

grant select, insert on public.topic_practice_attempts to authenticated;
