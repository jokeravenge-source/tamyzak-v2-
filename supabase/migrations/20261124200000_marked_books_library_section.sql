-- Split the existing Al-Malazam catalog into regular booklets and
-- Tamayzak-marked textbooks. Existing rows remain regular booklets.

ALTER TABLE public.malazam
  ADD COLUMN IF NOT EXISTS library_section text NOT NULL DEFAULT 'malazam';

ALTER TABLE public.malazam
  DROP CONSTRAINT IF EXISTS malazam_library_section_check;

ALTER TABLE public.malazam
  ADD CONSTRAINT malazam_library_section_check
  CHECK (library_section IN ('malazam', 'marked_book'));

CREATE INDEX IF NOT EXISTS malazam_section_catalog_idx
ON public.malazam (library_section, is_published, subject, sort_order, created_at DESC);
