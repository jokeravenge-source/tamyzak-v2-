-- Start the English reading trial on the student's first visit to the tool.
-- Access lasts for exactly 72 hours, then requires the existing live Premium
-- membership. The browser can read its own trial, but only this RPC can create it.
CREATE TABLE public.english_reading_trials (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '3 days'),
  CONSTRAINT english_reading_trial_window CHECK (expires_at = started_at + interval '3 days')
);

ALTER TABLE public.english_reading_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their English reading trial"
  ON public.english_reading_trials
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

REVOKE ALL ON TABLE public.english_reading_trials FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.english_reading_trials TO authenticated;
GRANT ALL ON TABLE public.english_reading_trials TO service_role;

CREATE OR REPLACE FUNCTION public.claim_english_reading_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _trial public.english_reading_trials%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Admins, the owner account, and paid members keep unlimited access.
  IF public.can_use_premium_tools() THEN
    RETURN jsonb_build_object(
      'access', true,
      'premium', true,
      'started_at', null,
      'expires_at', null
    );
  END IF;

  INSERT INTO public.english_reading_trials (user_id)
  VALUES (_uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO _trial
  FROM public.english_reading_trials
  WHERE user_id = _uid;

  RETURN jsonb_build_object(
    'access', now() < _trial.expires_at,
    'premium', false,
    'started_at', _trial.started_at,
    'expires_at', _trial.expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_english_reading_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_english_reading_access() TO authenticated, service_role;