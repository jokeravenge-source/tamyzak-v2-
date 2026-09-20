create table if not exists public.weekly_learning_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  iso_week text not null,
  subject text not null,
  chapter_key text not null,
  chapter_number integer not null,
  topic_key text not null,
  topic_en text not null,
  topic_ar text not null,
  weakness_text text not null,
  plan_tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, iso_week)
);

alter table public.weekly_learning_profiles enable row level security;

create policy "Users read own weekly learning profiles"
on public.weekly_learning_profiles for select to authenticated
using (auth.uid() = user_id);

create policy "Users create own weekly learning profiles"
on public.weekly_learning_profiles for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users update own weekly learning profiles"
on public.weekly_learning_profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists weekly_learning_profiles_user_week_idx
on public.weekly_learning_profiles (user_id, iso_week);
