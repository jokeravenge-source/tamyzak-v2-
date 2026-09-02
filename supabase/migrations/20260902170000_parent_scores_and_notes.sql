CREATE TABLE IF NOT EXISTS public.parent_student_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.parent_follow_links(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 80),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  score numeric NOT NULL CHECK (score >= 0),
  max_score numeric NOT NULL DEFAULT 100 CHECK (max_score > 0 AND score <= max_score),
  note text CHECK (note IS NULL OR char_length(note) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parent_student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.parent_follow_links(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text text NOT NULL CHECK (char_length(note_text) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS parent_student_scores_link_created_idx
  ON public.parent_student_scores(link_id, created_at DESC);
CREATE INDEX IF NOT EXISTS parent_student_notes_link_created_idx
  ON public.parent_student_notes(link_id, created_at DESC);

ALTER TABLE public.parent_student_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_notes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.parent_student_scores FROM anon, authenticated, public;
REVOKE ALL ON public.parent_student_notes FROM anon, authenticated, public;
GRANT ALL ON public.parent_student_scores TO service_role;
GRANT ALL ON public.parent_student_notes TO service_role;
