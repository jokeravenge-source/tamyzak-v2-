CREATE TABLE IF NOT EXISTS public.student_weakness_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  iso_week text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  weak_areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  detected_areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  UNIQUE (user_id, iso_week)
);

ALTER TABLE public.student_weakness_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own weakness sessions"
ON public.student_weakness_sessions FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Students create own weakness sessions"
ON public.student_weakness_sessions FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Students update own weakness sessions"
ON public.student_weakness_sessions FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS student_weakness_sessions_active_idx
  ON public.student_weakness_sessions (user_id, status, updated_at DESC);

DROP TRIGGER IF EXISTS student_weakness_sessions_set_updated_at ON public.student_weakness_sessions;
CREATE TRIGGER student_weakness_sessions_set_updated_at
BEFORE UPDATE ON public.student_weakness_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Keep all confirmed weak areas while preserving the original primary target
-- columns used by existing Study Today, MCQ and flashcard routes.
ALTER TABLE public.weekly_learning_profiles
  ADD COLUMN IF NOT EXISTS weak_areas jsonb NOT NULL DEFAULT '[]'::jsonb;

GRANT SELECT, INSERT, UPDATE ON public.student_weakness_sessions TO authenticated;
