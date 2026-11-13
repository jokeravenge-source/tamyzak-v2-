-- Regression fixture: run only in an empty, disposable PostgreSQL 14+ database.
-- psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/tests/challenge-study-window.sql
BEGIN;
CREATE SCHEMA auth;
CREATE ROLE authenticated;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '00000000-0000-0000-0000-000000000001'::uuid $$;
CREATE TABLE public.profiles (user_id uuid PRIMARY KEY, display_name text);
CREATE TABLE public.study_challenges (
  id uuid PRIMARY KEY, creator_id uuid, title text, starts_at timestamptz,
  ends_at timestamptz, status text, is_public boolean
);
CREATE TABLE public.study_challenge_members (challenge_id uuid, user_id uuid, status text);
CREATE TABLE public.study_sessions (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id uuid, created_at timestamptz, duration_seconds integer);
INSERT INTO public.profiles SELECT ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
  CASE i WHEN 1 THEN 'Koki' ELSE 'Student ' || i END FROM generate_series(1, 9) i;
INSERT INTO public.study_challenges VALUES
('10000000-0000-0000-0000-000000000001', auth.uid(), 'Active', now() - interval '1 hour', now() + interval '7 days', 'active', true),
('10000000-0000-0000-0000-000000000002', auth.uid(), 'Ended', now() - interval '3 hours', now() - interval '1 hour', 'active', false),
('10000000-0000-0000-0000-000000000003', auth.uid(), 'Public open', now() - interval '1 hour', now() + interval '1 day', 'active', true);
INSERT INTO public.study_challenge_members
SELECT c.id, p.user_id, CASE WHEN p.display_name = 'Student 7' THEN 'pending' WHEN p.display_name = 'Student 8' THEN 'declined' ELSE 'accepted' END
FROM public.study_challenges c CROSS JOIN public.profiles p WHERE c.title <> 'Public open';
INSERT INTO public.study_sessions (user_id, created_at, duration_seconds) VALUES
(auth.uid(), now() - interval '15 minutes', 43200), -- 12-hour saved timer: only 45 minutes eligible.
('00000000-0000-0000-0000-000000000002', now() - interval '10 minutes', 900), -- Valid 15 minutes.
('00000000-0000-0000-0000-000000000003', now() - interval '20 minutes', 1200),
('00000000-0000-0000-0000-000000000003', now() - interval '10 minutes', 1200), -- 30-minute union, not 40.
('00000000-0000-0000-0000-000000000004', now() + interval '10 minutes', 3600), -- Future saves excluded.
('00000000-0000-0000-0000-000000000005', now() - interval '2 hours', 900), -- Entirely before active challenge.
('00000000-0000-0000-0000-000000000006', now() - interval '30 minutes', -10), -- Invalid duration.
('00000000-0000-0000-0000-000000000007', now() - interval '10 minutes', 900), -- Pending member not ranked.
('00000000-0000-0000-0000-000000000008', now() - interval '10 minutes', 900); -- Declined member absent.

\ir ../../drizzle/migrations/0032_challenge_study_window.sql

DO $$
DECLARE active jsonb; ended jsonb; open_challenge jsonb; scores jsonb;
BEGIN
  SELECT value INTO active FROM jsonb_array_elements(public.get_my_study_challenges()) WHERE value->>'title' = 'Active';
  SELECT value INTO ended FROM jsonb_array_elements(public.get_my_study_challenges()) WHERE value->>'title' = 'Ended';
  SELECT value INTO open_challenge FROM jsonb_array_elements(public.get_my_study_challenges()) WHERE value->>'title' = 'Public open';
  SELECT jsonb_object_agg(value->>'displayName', value->'totalSeconds') INTO scores FROM jsonb_array_elements(active->'participants');
  ASSERT (scores->>'Koki')::int = 2700, 'Pre-challenge portion must be removed';
  ASSERT (scores->>'Student 2')::int = 900, 'Valid study time must be unchanged';
  ASSERT (scores->>'Student 3')::int = 1800, 'Overlapping sessions must be merged';
  ASSERT (scores->>'Student 4')::int = 0, 'Future session must not count';
  ASSERT (scores->>'Student 5')::int = 0, 'Pre-challenge session must not count';
  ASSERT (scores->>'Student 6')::int = 0, 'Negative duration must not count';
  ASSERT (scores->>'Student 7')::int = 0, 'Pending member must not earn time';
  ASSERT NOT scores ? 'Student 8', 'Declined member must stay hidden';
  ASSERT (scores->>'Student 9')::int = 0, 'No sessions must yield zero';
  ASSERT open_challenge->>'myStatus' = 'open', 'Public join behavior must remain intact';
  ASSERT (SELECT (value->>'totalSeconds')::int = 7200 FROM jsonb_array_elements(ended->'participants') WHERE value->>'displayName' = 'Koki'), 'A save after the end must count only the intersecting window';
  ASSERT NOT EXISTS (SELECT FROM jsonb_array_elements(active->'participants') WHERE (value->>'totalSeconds')::int > 3600), 'No participant can exceed challenge elapsed time';
  ASSERT (SELECT count(*) = 9 FROM public.study_sessions), 'Source sessions must not be deleted';
END $$;
ROLLBACK;
