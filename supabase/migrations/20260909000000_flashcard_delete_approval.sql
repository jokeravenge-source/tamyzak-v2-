ALTER TABLE public.custom_flashcards
  ADD COLUMN IF NOT EXISTS delete_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS delete_requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.custom_flashcards.delete_requested_at IS
  'When set, an administrator has requested deletion and a second approval is required.';

COMMENT ON COLUMN public.custom_flashcards.delete_requested_by IS
  'Administrator who submitted the pending deletion request.';

CREATE INDEX IF NOT EXISTS custom_flashcards_delete_requested_idx
  ON public.custom_flashcards (delete_requested_at)
  WHERE delete_requested_at IS NOT NULL;
