-- Telegram/admin activations already create normal live subscriptions.
-- Check auth.uid(), never a user ID or a paid flag supplied by the browser.
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
  );
$$;

REVOKE ALL ON FUNCTION public.can_use_premium_tools() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_use_premium_tools() TO authenticated, service_role;

-- Restore unlimited Premium use in older quota-based endpoints, keeping
-- existing free daily allowances and the Baghdad reset date unchanged.
CREATE OR REPLACE FUNCTION public.claim_daily_feature(_feature text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _used_count int;
  _daily_limit int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF public.can_use_premium_tools() THEN RETURN true; END IF;

  IF _feature IN ('agent','chat','psych','companion','tutor','subject_tutor') THEN
    _daily_limit := 5;
  ELSE
    _daily_limit := 1;
  END IF;

  SELECT count(*) INTO _used_count FROM public.feature_usage
  WHERE user_id = _uid AND feature = _feature
    AND used_on = (now() AT TIME ZONE 'Asia/Baghdad')::date;
  IF _used_count >= _daily_limit THEN RETURN false; END IF;
  INSERT INTO public.feature_usage (user_id, feature, used_on)
  VALUES (_uid, _feature, (now() AT TIME ZONE 'Asia/Baghdad')::date);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_daily_feature_limit(_feature text, _limit integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _used_count int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF public.can_use_premium_tools() THEN RETURN true; END IF;

  SELECT count(*) INTO _used_count FROM public.feature_usage
  WHERE user_id = _uid AND feature = _feature
    AND used_on = (now() AT TIME ZONE 'Asia/Baghdad')::date;
  IF _used_count >= GREATEST(_limit, 0) THEN RETURN false; END IF;
  INSERT INTO public.feature_usage (user_id, feature, used_on)
  VALUES (_uid, _feature, (now() AT TIME ZONE 'Asia/Baghdad')::date);
  RETURN true;
END;
$$;
