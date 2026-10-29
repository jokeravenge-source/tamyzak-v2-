ALTER TABLE public.telegram_verifications
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS token_used_at timestamptz,
  ADD COLUMN IF NOT EXISTS connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS connection_source text;

UPDATE public.telegram_verifications
SET token_expires_at = created_at + interval '15 minutes'
WHERE token_expires_at IS NULL AND verified = false;

UPDATE public.telegram_verifications
SET token_used_at = COALESCE(token_used_at, updated_at),
    connected_at = COALESCE(connected_at, updated_at)
WHERE verified = true;

ALTER TABLE public.telegram_verifications
  DROP CONSTRAINT IF EXISTS telegram_verifications_connection_source_check;

ALTER TABLE public.telegram_verifications
  ADD CONSTRAINT telegram_verifications_connection_source_check
  CHECK (connection_source IS NULL OR connection_source ~ '^[a-z0-9_-]{1,48}$');

CREATE INDEX IF NOT EXISTS idx_telegram_verifications_connection_source
  ON public.telegram_verifications(connection_source, connected_at DESC)
  WHERE connected_at IS NOT NULL;
