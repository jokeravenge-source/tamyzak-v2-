ALTER TABLE public.premium_promo_codes ADD COLUMN IF NOT EXISTS duration_months integer, ADD COLUMN IF NOT EXISTS duration_amount integer, ADD COLUMN IF NOT EXISTS duration_unit text;
CREATE OR REPLACE FUNCTION public.coupon_access_end(_start timestamptz, _amount integer, _unit text) RETURNS timestamptz LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$ BEGIN
IF _amount IS NULL OR _amount < 1 OR _amount > 1200 THEN RAISE EXCEPTION 'Enter an amount between 1 and 1200'; END IF;
IF _unit = 'hours' THEN RETURN _start + make_interval(secs => _amount * 3600);
ELSIF _unit = 'days' THEN RETURN _start + make_interval(secs => _amount * 86400);
ELSIF _unit = 'months' THEN RETURN ((_start AT TIME ZONE 'Asia/Baghdad') + make_interval(months => _amount)) AT TIME ZONE 'Asia/Baghdad';
ELSE RAISE EXCEPTION 'Invalid duration unit'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.coupon_access_end(timestamptz,integer,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.coupon_access_end(timestamptz,integer,text) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.admin_premium_coupons(_action text, _id text DEFAULT NULL, _code text DEFAULT NULL, _amount integer DEFAULT NULL, _unit text DEFAULT NULL, _active boolean DEFAULT true) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _normalized text; _target text; _seconds integer;
BEGIN
IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501'; END IF;
IF _action = 'list' THEN RETURN COALESCE((SELECT jsonb_agg(row_to_json(c) ORDER BY c.created_at DESC) FROM (SELECT p.*, (SELECT count(*) FROM public.premium_promo_redemptions r WHERE r.campaign_id = p.id) AS redemptions FROM public.premium_promo_codes p) c), '[]'::jsonb); END IF;
IF _action = 'toggle' THEN UPDATE public.premium_promo_codes SET is_active = COALESCE(_active, false) WHERE id = _id; IF NOT FOUND THEN RAISE EXCEPTION 'Coupon not found'; END IF; RETURN jsonb_build_object('ok',true); END IF;
IF _action NOT IN ('create','update') THEN RAISE EXCEPTION 'Invalid action'; END IF;
PERFORM public.coupon_access_end(now(), _amount, _unit);
_normalized := regexp_replace(btrim(COALESCE(_code,'')), '[[:space:]]+', ' ', 'g');
IF char_length(_normalized) < 1 OR char_length(_normalized) > 100 THEN RAISE EXCEPTION 'Code must contain 1 to 100 characters'; END IF;
-- Serialize code creation and edits so normalized codes cannot collide.
PERFORM pg_advisory_xact_lock(824610);
IF EXISTS (SELECT 1 FROM public.premium_promo_codes WHERE regexp_replace(btrim(code), '[[:space:]]+', ' ', 'g') = _normalized AND (_action = 'create' OR id IS DISTINCT FROM _id)) THEN RAISE EXCEPTION 'This code already exists'; END IF;
_seconds := CASE _unit WHEN 'hours' THEN _amount * 3600 WHEN 'days' THEN _amount * 86400 ELSE 1 END;
IF _action = 'create' THEN
_target := 'admin-coupon-' || gen_random_uuid()::text;
INSERT INTO public.premium_promo_codes(id,code,starts_at,expires_at,is_active,duration_seconds,grants_full_access,duration_months,duration_amount,duration_unit) VALUES (_target,_normalized,now(),'infinity',COALESCE(_active,true),_seconds,false,CASE WHEN _unit='months' THEN _amount ELSE NULL END,_amount,_unit);
ELSE
UPDATE public.premium_promo_codes SET code=_normalized,duration_seconds=_seconds,duration_months=CASE WHEN _unit='months' THEN _amount ELSE NULL END,duration_amount=_amount,duration_unit=_unit WHERE id=_id AND duration_unit IS NOT NULL;
IF NOT FOUND THEN RAISE EXCEPTION 'Only dashboard coupons can be edited'; END IF;
_target := _id;
END IF;
RETURN jsonb_build_object('ok',true,'id',_target);
END $$;
REVOKE ALL ON FUNCTION public.admin_premium_coupons(text,text,text,integer,text,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_premium_coupons(text,text,text,integer,text,boolean) TO authenticated;
CREATE OR REPLACE FUNCTION public.redeem_premium_promo(_code text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _promo public.premium_promo_codes%ROWTYPE; _redeemed_at timestamptz; _ends_at timestamptz;
BEGIN
IF _uid IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','unauthenticated'); END IF;
SELECT * INTO _promo FROM public.premium_promo_codes WHERE regexp_replace(btrim(code),'[[:space:]]+',' ','g') = regexp_replace(btrim(COALESCE(_code,'')),'[[:space:]]+',' ','g') LIMIT 1 FOR SHARE;
IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'reason','invalid_code'); END IF;
IF NOT _promo.is_active OR now() < _promo.starts_at OR now() >= _promo.expires_at THEN RETURN jsonb_build_object('ok',false,'reason','expired'); END IF;
INSERT INTO public.premium_promo_redemptions(user_id,campaign_id) VALUES (_uid,_promo.id) ON CONFLICT(user_id,campaign_id) DO NOTHING;
SELECT redeemed_at INTO _redeemed_at FROM public.premium_promo_redemptions WHERE user_id=_uid AND campaign_id=_promo.id FOR UPDATE;
_ends_at := CASE WHEN _promo.duration_unit IS NOT NULL THEN public.coupon_access_end(_redeemed_at,_promo.duration_amount,_promo.duration_unit) WHEN _promo.duration_seconds IS NULL THEN _promo.expires_at ELSE LEAST(_promo.expires_at,_redeemed_at + make_interval(secs=>_promo.duration_seconds)) END;
IF _promo.duration_seconds IS NOT NULL THEN
INSERT INTO public.subscriptions(user_id,paddle_subscription_id,paddle_customer_id,product_id,price_id,status,environment,current_period_start,current_period_end,cancel_at_period_end) VALUES (_uid,'promo:'||_promo.id||':'||_uid::text,'promo:'||_uid::text,CASE WHEN _promo.grants_full_access THEN 'promo-full-access' ELSE 'promo-premium' END,'promo-free','trialing','live',_redeemed_at,_ends_at,true) ON CONFLICT(paddle_subscription_id) DO NOTHING;
SELECT current_period_end INTO _ends_at FROM public.subscriptions WHERE paddle_subscription_id='promo:'||_promo.id||':'||_uid::text AND user_id=_uid AND status IN ('active','trialing','past_due');
END IF;
IF _ends_at IS NULL OR now() >= _ends_at THEN RETURN jsonb_build_object('ok',false,'reason','already_redeemed','expires_at',_ends_at); END IF;
RETURN jsonb_build_object('ok',true,'expires_at',_ends_at);
END $$;
REVOKE ALL ON FUNCTION public.redeem_premium_promo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_premium_promo(text) TO authenticated;