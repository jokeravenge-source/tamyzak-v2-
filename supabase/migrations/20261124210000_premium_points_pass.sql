BEGIN;

DROP FUNCTION IF EXISTS public.redeem_premium_with_points(text);

CREATE OR REPLACE FUNCTION public.redeem_premium_with_points(
  _environment text DEFAULT 'live',
  _request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cost CONSTANT integer := 1000;
  _env text := CASE WHEN _environment = 'sandbox' THEN 'sandbox' ELSE 'live' END;
  _receipt uuid := COALESCE(_request_id, gen_random_uuid());
  _subscription_id text := 'points_' || _receipt::text;
  _balance integer;
  _access jsonb;
  _permanent boolean;
  _end timestamptz;
  _start timestamptz;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  -- All or Nothing reserves points under this same account lock.
  PERFORM 1 FROM public.user_progress WHERE user_id = _uid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_enough_points', 'balance', 0, 'cost', _cost);
  END IF;
  _balance := public.points_balance();

  -- A retry can recover the original receipt even if the balance is now zero.
  SELECT current_period_end INTO _end FROM public.subscriptions
  WHERE paddle_subscription_id = _subscription_id AND user_id = _uid
    AND environment = _env AND price_id = 'points_1000';
  IF FOUND THEN
    RETURN jsonb_build_object('ok', true, 'balance', _balance, 'current_period_end', _end);
  END IF;

  IF _env = 'live' THEN
    _access := public.premium_access_status();
    _end := (_access->>'expires_at')::timestamptz;
    _permanent := (_access->>'is_premium')::boolean AND _end IS NULL;
  ELSE
    SELECT COALESCE(bool_or(current_period_end IS NULL OR current_period_end = 'infinity'), false),
      max(current_period_end) INTO _permanent, _end
    FROM public.subscriptions
    WHERE user_id = _uid AND environment = _env AND status IN ('active', 'trialing', 'past_due')
      AND (current_period_end IS NULL OR current_period_end > now());
  END IF;

  IF _permanent THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'permanent_premium', 'balance', _balance);
  END IF;
  IF _balance < _cost THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_enough_points', 'balance', _balance, 'cost', _cost);
  END IF;

  _start := GREATEST(now(), _end);
  _end := _start + interval '72 hours';

  INSERT INTO public.point_redemptions (id, user_id, reward, points_spent)
  VALUES (_receipt, _uid, 'premium_3d', _cost);

  INSERT INTO public.subscriptions (
    user_id, paddle_subscription_id, paddle_customer_id, product_id, price_id,
    status, current_period_start, current_period_end, cancel_at_period_end, environment
  ) VALUES (
    _uid, _subscription_id, 'points', 'points_premium', 'points_1000',
    'active', _start, _end, true, _env
  );

  RETURN jsonb_build_object('ok', true, 'balance', _balance - _cost, 'current_period_end', _end);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_premium_with_points(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_premium_with_points(text, uuid) TO authenticated;

COMMIT;
