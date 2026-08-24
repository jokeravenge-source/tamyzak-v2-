ALTER TABLE public.battle_invites
  ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT 'physics',
  ADD COLUMN IF NOT EXISTS chapter integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'ar',
  ADD COLUMN IF NOT EXISTS question_count integer NOT NULL DEFAULT 10;