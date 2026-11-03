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

-- Admin-managed edits for the bundled French flashcard library.
-- The source cards remain in code; this table stores only changed or hidden cards.
CREATE TABLE IF NOT EXISTS public.french_flashcard_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter integer NOT NULL CHECK (chapter BETWEEN 1 AND 7),
  card_index integer NOT NULL CHECK (card_index >= 0),
  question text NOT NULL,
  answer text NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chapter, card_index)
);

GRANT SELECT ON public.french_flashcard_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.french_flashcard_overrides TO authenticated;
GRANT ALL ON public.french_flashcard_overrides TO service_role;

ALTER TABLE public.french_flashcard_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "French flashcard overrides are publicly readable"
ON public.french_flashcard_overrides
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins insert French flashcard overrides"
ON public.french_flashcard_overrides
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'moderator'::public.app_role)
);

CREATE POLICY "Admins update French flashcard overrides"
ON public.french_flashcard_overrides
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'moderator'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'moderator'::public.app_role)
);

CREATE POLICY "Admins delete French flashcard overrides"
ON public.french_flashcard_overrides
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'moderator'::public.app_role)
);

CREATE TRIGGER french_flashcard_overrides_set_updated_at
BEFORE UPDATE ON public.french_flashcard_overrides
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS french_flashcard_overrides_chapter_idx
ON public.french_flashcard_overrides (chapter, card_index);