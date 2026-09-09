ALTER TABLE public.custom_flashcards
  ADD COLUMN IF NOT EXISTS delete_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS delete_requested_by uuid;