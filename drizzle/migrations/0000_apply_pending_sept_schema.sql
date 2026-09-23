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
grant select, insert, update on public.weekly_learning_profiles to authenticated;
grant all on public.weekly_learning_profiles to service_role;
alter table public.weekly_learning_profiles enable row level security;
drop policy if exists "Users read own weekly learning profiles" on public.weekly_learning_profiles;
create policy "Users read own weekly learning profiles" on public.weekly_learning_profiles for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own weekly learning profiles" on public.weekly_learning_profiles;
create policy "Users create own weekly learning profiles" on public.weekly_learning_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users update own weekly learning profiles" on public.weekly_learning_profiles;
create policy "Users update own weekly learning profiles" on public.weekly_learning_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists weekly_learning_profiles_user_week_idx on public.weekly_learning_profiles (user_id, iso_week);

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS telegram_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS push_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS link_updated_at timestamptz;
ALTER TABLE public.telegram_notifications_sent ADD COLUMN IF NOT EXISTS message_id bigint;
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_sent_key ON public.telegram_notifications_sent (notification_key);
UPDATE public.notifications AS notification SET telegram_sent = true
WHERE EXISTS (SELECT 1 FROM public.telegram_notifications_sent AS delivery WHERE delivery.notification_key = 'notif:' || notification.id::text);
DROP POLICY IF EXISTS "Admins update notifications" ON public.notifications;
CREATE POLICY "Admins update notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

ALTER TABLE public.study_rooms ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS study_rooms_public_active_created_idx ON public.study_rooms (is_public, is_active, created_at DESC) WHERE is_public = true AND is_active = true;

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
grant select, insert on public.topic_practice_attempts to authenticated;
grant all on public.topic_practice_attempts to service_role;
create index if not exists topic_practice_user_category_recent on public.topic_practice_attempts (user_id, subject, chapter, category_key, created_at desc);
alter table public.topic_practice_attempts enable row level security;
drop policy if exists "Students read own topic attempts" on public.topic_practice_attempts;
create policy "Students read own topic attempts" on public.topic_practice_attempts for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Students record own topic attempts" on public.topic_practice_attempts;
create policy "Students record own topic attempts" on public.topic_practice_attempts for insert to authenticated with check (user_id = (select auth.uid()));