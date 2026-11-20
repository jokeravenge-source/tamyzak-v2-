CREATE TABLE public.nadawi_contest_questions (
  id text PRIMARY KEY,
  item jsonb NOT NULL
);
CREATE TABLE public.nadawi_contest_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL CHECK (jsonb_array_length(items) = 41),
  started_at timestamptz NOT NULL,
  question_started_at timestamptz NOT NULL,
  question_index integer NOT NULL DEFAULT 0 CHECK (question_index BETWEEN 0 AND 41),
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 41),
  completed_at timestamptz,
  elapsed_ms bigint CHECK (elapsed_ms >= 0)
);
CREATE INDEX nadawi_contest_rankings_idx ON public.nadawi_contest_attempts
  (score DESC, elapsed_ms ASC, completed_at ASC) WHERE completed_at IS NOT NULL;
ALTER TABLE public.nadawi_contest_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nadawi_contest_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nadawi_contest_questions, public.nadawi_contest_attempts FROM PUBLIC, anon, authenticated;