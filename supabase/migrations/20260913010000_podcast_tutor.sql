-- Interactive Podcast Tutor: private, premium audio study sessions.

create table if not exists public.podcast_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  youtube_url text not null,
  title text,
  subject text,
  status text not null default 'processing'
    check (status in ('processing', 'ready', 'in_progress', 'completed', 'failed')),
  error_message text,
  voice_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.podcast_segments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.podcast_sessions(id) on delete cascade,
  segment_order integer not null check (segment_order between 1 and 5),
  narration_text text not null,
  narration_audio_url text,
  checkpoint_prompt text not null,
  answer_key text not null,
  student_answer_text text,
  student_answer_audio_url text,
  verdict text check (verdict in ('correct', 'partial', 'incorrect')),
  correction_text text,
  correction_audio_url text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, segment_order)
);

create index if not exists podcast_sessions_user_created_idx
  on public.podcast_sessions(user_id, created_at desc);
create index if not exists podcast_segments_session_order_idx
  on public.podcast_segments(session_id, segment_order);

alter table public.podcast_sessions enable row level security;
alter table public.podcast_segments enable row level security;

drop policy if exists "Students read their podcast sessions" on public.podcast_sessions;
create policy "Students read their podcast sessions"
  on public.podcast_sessions for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Students read safe podcast segment fields" on public.podcast_segments;
create policy "Students read safe podcast segment fields"
  on public.podcast_segments for select to authenticated
  using (
    exists (
      select 1 from public.podcast_sessions s
      where s.id = podcast_segments.session_id and s.user_id = auth.uid()
    )
  );

-- The answer key is deliberately not selectable by the browser. Edge Functions
-- use the service role to grade answers and return only the verdict/correction.
revoke all on public.podcast_sessions from anon, authenticated;
grant select on public.podcast_sessions to authenticated;
revoke all on public.podcast_segments from anon, authenticated;
grant select (
  id, session_id, segment_order, narration_text, narration_audio_url,
  checkpoint_prompt, student_answer_text, student_answer_audio_url, verdict,
  correction_text, correction_audio_url, completed_at, created_at
) on public.podcast_segments to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'podcast-audio',
  'podcast-audio',
  false,
  26214400,
  array['audio/mpeg', 'audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter publication supabase_realtime add table public.podcast_sessions;
