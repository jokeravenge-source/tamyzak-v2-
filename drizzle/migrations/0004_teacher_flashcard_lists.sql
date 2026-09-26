ALTER TABLE public.platform_teachers
  ADD COLUMN IF NOT EXISTS flashcard_list_ids text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.platform_teachers.flashcard_list_ids IS
  'Flashcard collection identifiers selected by an admin for this teacher profile.';

UPDATE public.platform_teachers
SET flashcard_list_ids = ARRAY['physics-hydar-diwan']::text[]
WHERE 'flashcards' = ANY(tools)
  AND cardinality(flashcard_list_ids) = 0;