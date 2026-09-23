ALTER TABLE public.study_rooms
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS study_rooms_public_active_created_idx
  ON public.study_rooms (is_public, is_active, created_at DESC)
  WHERE is_public = true AND is_active = true;
