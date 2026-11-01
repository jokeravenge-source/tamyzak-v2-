-- Keep English question translations separate from the Arabic source lessons.
-- A source-content hash invalidates the cache after an administrator edits notes.
CREATE TABLE public.english_lecture_question_cache (
  source_hash text PRIMARY KEY,
  teacher_id text NOT NULL,
  topic_key text NOT NULL,
  notes_parts jsonb NOT NULL CHECK (jsonb_typeof(notes_parts) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.english_lecture_question_cache ENABLE ROW LEVEL SECURITY;
-- The authenticated Edge Function verifies access to approved source lessons.
REVOKE ALL ON public.english_lecture_question_cache FROM anon, authenticated;
GRANT ALL ON public.english_lecture_question_cache TO service_role;
