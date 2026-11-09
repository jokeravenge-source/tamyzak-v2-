-- A one-time, per-account 24-hour pass. Existing paid memberships and legacy
-- fixed-date campaigns are preserved. No billing-provider request is made.

ALTER TABLE public.premium_promo_codes
  ADD COLUMN IF NOT EXISTS duration_seconds integer
    CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  ADD COLUMN IF NOT EXISTS grants_full_access boolean NOT NULL DEFAULT false;

INSERT INTO public.premium_promo_codes
  (id, code, starts_at, expires_at, is_active, duration_seconds, grants_full_access)
VALUES ('ibn-al-baytar-day-pass', 'ابن البيطار', '2026-11-09 00:00:00+03', 'infinity', true, 86400, true)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, starts_at = EXCLUDED.starts_at,
  expires_at = EXCLUDED.expires_at, is_active = EXCLUDED.is_active,
  duration_seconds = EXCLUDED.duration_seconds, grants_full_access = EXCLUDED.grants_full_access;

CREATE OR REPLACE FUNCTION public.redeem_premium_promo(_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _promo public.premium_promo_codes%ROWTYPE;
  _redeemed_at timestamptz;
  _ends_at timestamptz;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;
  SELECT * INTO _promo FROM public.premium_promo_codes
  WHERE regexp_replace(btrim(code), '[[:space:]]+', ' ', 'g') =
        regexp_replace(btrim(COALESCE(_code, '')), '[[:space:]]+', ' ', 'g')
  LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code'); END IF;
  IF NOT _promo.is_active OR now() < _promo.starts_at OR now() >= _promo.expires_at THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;

  -- A unique receipt serializes concurrent calls. Re-entry never moves its start.
  INSERT INTO public.premium_promo_redemptions (user_id, campaign_id)
  VALUES (_uid, _promo.id) ON CONFLICT (user_id, campaign_id) DO NOTHING;
  SELECT redeemed_at INTO _redeemed_at FROM public.premium_promo_redemptions
  WHERE user_id = _uid AND campaign_id = _promo.id;
  _ends_at := CASE WHEN _promo.duration_seconds IS NULL THEN _promo.expires_at
    ELSE LEAST(_promo.expires_at, _redeemed_at + make_interval(secs => _promo.duration_seconds)) END;
  IF now() >= _ends_at THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_redeemed', 'expires_at', _ends_at);
  END IF;

  IF _promo.duration_seconds IS NOT NULL THEN
    -- Local promotional subscription, not a Paddle billing subscription. A new
    -- row leaves any longer/permanent paid membership completely untouched.
    INSERT INTO public.subscriptions (
      user_id, paddle_subscription_id, paddle_customer_id, product_id, price_id,
      status, environment, current_period_start, current_period_end, cancel_at_period_end
    ) VALUES (
      _uid, 'promo:' || _promo.id || ':' || _uid::text, 'promo:' || _uid::text,
      CASE WHEN _promo.grants_full_access THEN 'promo-full-access' ELSE 'promo-premium' END,
      'promo-free', 'trialing', 'live', _redeemed_at, _ends_at, true
    ) ON CONFLICT (paddle_subscription_id) DO NOTHING;
    IF NOT EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE paddle_subscription_id = 'promo:' || _promo.id || ':' || _uid::text
        AND user_id = _uid AND status IN ('active', 'trialing', 'past_due')
        AND current_period_end > now()
    ) THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'already_redeemed', 'expires_at', _ends_at);
    END IF;
  END IF;
  RETURN jsonb_build_object('ok', true, 'expires_at', _ends_at);
END;
$$;
REVOKE ALL ON FUNCTION public.redeem_premium_promo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_premium_promo(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.has_full_access_promo()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid() AND environment = 'live'
      AND product_id = 'promo-full-access' AND status IN ('active', 'trialing', 'past_due')
      AND current_period_end IS NOT NULL AND current_period_end > now()
  );
$$;
REVOKE ALL ON FUNCTION public.has_full_access_promo() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_full_access_promo() TO authenticated, service_role;

-- Return an authoritative deadline so an already-open browser tab re-locks too.
CREATE OR REPLACE FUNCTION public.premium_access_status()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _permanent boolean := false;
  _sub_end timestamptz;
  _promo_end timestamptz;
  _ends_at timestamptz;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('is_premium', false, 'expires_at', NULL, 'full_access', false); END IF;
  IF public.has_role(_uid, 'admin'::public.app_role)
    OR EXISTS (SELECT 1 FROM auth.users WHERE id = _uid AND email = 'jokeravenge@gmail.com') THEN
    RETURN jsonb_build_object('is_premium', true, 'expires_at', NULL, 'full_access', public.has_full_access_promo());
  END IF;
  SELECT COALESCE(bool_or(current_period_end IS NULL), false), max(current_period_end)
    INTO _permanent, _sub_end FROM public.subscriptions
    WHERE user_id = _uid AND environment = 'live' AND status IN ('active', 'trialing', 'past_due')
      AND (current_period_end IS NULL OR current_period_end > now());
  -- Rolling campaigns are represented by expiring subscriptions above. Never
  -- treat their campaign's activation window as the student's access deadline.
  SELECT max(promo.expires_at) INTO _promo_end
    FROM public.premium_promo_redemptions redemption
    JOIN public.premium_promo_codes promo ON promo.id = redemption.campaign_id
    WHERE redemption.user_id = _uid AND promo.duration_seconds IS NULL
      AND promo.is_active AND now() >= promo.starts_at AND now() < promo.expires_at;
  _ends_at := GREATEST(_sub_end, _promo_end);
  RETURN jsonb_build_object(
    'is_premium', _permanent OR COALESCE(_ends_at > now(), false),
    'expires_at', CASE WHEN _permanent OR _ends_at = 'infinity'::timestamptz THEN NULL ELSE _ends_at END,
    'full_access', public.has_full_access_promo()
  );
END;
$$;
REVOKE ALL ON FUNCTION public.premium_access_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.premium_access_status() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.can_use_premium_tools()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((public.premium_access_status()->>'is_premium')::boolean, false); $$;
REVOKE ALL ON FUNCTION public.can_use_premium_tools() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_use_premium_tools() TO authenticated, service_role;

-- Course read access expires with the same pass; no teacher/admin role or
-- permanent enrollment is granted by redeeming a student campaign code.
CREATE OR REPLACE FUNCTION public.is_course_enrolled(_course uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT (public.has_full_access_promo() AND EXISTS (
    SELECT 1 FROM public.courses WHERE id = _course AND is_published
  )) OR EXISTS (
    SELECT 1 FROM public.course_enrollments WHERE course_id = _course AND user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.is_course_enrolled(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_course_enrolled(uuid) TO authenticated, service_role;