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

  -- Legacy callers must not turn unlimited usage into a Premium bypass.
  IF _feature IN (
    'mcq', 'essay', 'video-notes', 'video', 'agent', 'problem_generator',
    'physics_solver', 'surah-verify', 'poem-verify', 'hadith-verify',
    'english_essay', 'english_reading_generate', 'english_reading_grade',
    'exam_generator', 'exam_grade'
  ) THEN RETURN false; END IF;

  IF _feature = 'gift_daily_mcq' THEN
    SELECT count(*) INTO _used_count FROM public.feature_usage
    WHERE user_id = _uid AND feature = _feature
      AND used_on = (now() AT TIME ZONE 'Asia/Baghdad')::date;
    IF _used_count >= GREATEST(_limit, 0) THEN RETURN false; END IF;
  END IF;

  -- Retain usage tracking for older callers, without enforcing an AI quota.
  INSERT INTO public.feature_usage (user_id, feature, used_on)
  VALUES (_uid, _feature, (now() AT TIME ZONE 'Asia/Baghdad')::date);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_daily_feature(_feature text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.claim_daily_feature_limit(_feature, 1);
$$;