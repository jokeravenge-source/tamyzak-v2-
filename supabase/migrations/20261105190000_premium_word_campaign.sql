-- Temporary Arabic Premium campaigns. Codes are private database records so
-- future words can be added without exposing a list through the client app.
CREATE TABLE IF NOT EXISTS public.premium_promo_codes (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  starts_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT premium_promo_codes_valid_window CHECK (expires_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.premium_promo_redemptions (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id text NOT NULL REFERENCES public.premium_promo_codes(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, campaign_id)
);

ALTER TABLE public.premium_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_promo_redemptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.premium_promo_codes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.premium_promo_redemptions FROM PUBLIC, anon, authenticated;

-- First campaign: ends at 10:00 AM Baghdad time on Sunday, Nov 8 2026.
INSERT INTO public.premium_promo_codes (id, code, starts_at, expires_at, is_active)
VALUES (
  'future-2026-11',
  'المستقبل',
  '2026-11-05 00:00:00+03',
  '2026-11-08 10:00:00+03',
  true
)
ON CONFLICT (id) DO UPDATE
SET code = EXCLUDED.code,
    starts_at = EXCLUDED.starts_at,
    expires_at = EXCLUDED.expires_at,
    is_active = EXCLUDED.is_active;

CREATE OR REPLACE FUNCTION public.redeem_premium_promo(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _promo public.premium_promo_codes%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  SELECT * INTO _promo
  FROM public.premium_promo_codes
  WHERE code = btrim(COALESCE(_code, ''))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code');
  END IF;
  IF NOT _promo.is_active OR now() < _promo.starts_at OR now() >= _promo.expires_at THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;

  INSERT INTO public.premium_promo_redemptions (user_id, campaign_id)
  VALUES (_uid, _promo.id)
  ON CONFLICT (user_id, campaign_id) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'expires_at', _promo.expires_at);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_premium_promo(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_premium_promo(text) TO authenticated;

-- Keep paid subscriptions/admin access intact and add any active, unexpired
-- word-campaign redemption as another server-verified entitlement.
CREATE OR REPLACE FUNCTION public.can_use_premium_tools()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'jokeravenge@gmail.com')
    OR public.has_active_premium(auth.uid(), 'live')
    OR EXISTS (
      SELECT 1
      FROM public.premium_promo_redemptions redemption
      JOIN public.premium_promo_codes promo ON promo.id = redemption.campaign_id
      WHERE redemption.user_id = auth.uid()
        AND promo.is_active
        AND now() >= promo.starts_at
        AND promo.expires_at > now()
    )
  );
$$;

REVOKE ALL ON FUNCTION public.can_use_premium_tools() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_use_premium_tools() TO authenticated, service_role;
