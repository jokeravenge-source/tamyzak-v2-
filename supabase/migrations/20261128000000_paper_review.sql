CREATE TABLE IF NOT EXISTS public.paper_reviews (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id uuid NOT NULL,
  image_digest text NOT NULL CHECK (image_digest ~ '^[a-f0-9]{64}$'),
  free_day date,
  lease_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  report jsonb,
  practice_passed_at timestamptz,
  PRIMARY KEY (user_id, request_id),
  UNIQUE (user_id, free_day),
  CHECK ((report IS NULL) = (completed_at IS NULL)),
  CHECK (practice_passed_at IS NULL OR completed_at IS NOT NULL)
);

ALTER TABLE public.paper_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.paper_reviews FROM PUBLIC, anon, authenticated;

-- The Edge Function authenticates the account and reads can_use_premium_tools
-- using the student's token before sending the verified entitlement here.
CREATE OR REPLACE FUNCTION public.paper_review_status(_user_id uuid, _premium boolean)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  WITH today AS (SELECT (now() AT TIME ZONE 'Asia/Baghdad')::date AS day),
  free_use AS (
    SELECT r.completed_at
    FROM public.paper_reviews r, today
    WHERE r.user_id = _user_id AND r.free_day = today.day
      AND (r.completed_at IS NOT NULL OR r.created_at > now() - interval '3 minutes')
  )
  SELECT jsonb_build_object(
    'premium', _premium,
    'remaining', CASE WHEN _premium THEN NULL WHEN EXISTS (SELECT 1 FROM free_use) THEN 0 ELSE 1 END,
    'pending', NOT _premium AND EXISTS (SELECT 1 FROM free_use WHERE completed_at IS NULL),
    'resetAt', (today.day + 1)::timestamp AT TIME ZONE 'Asia/Baghdad',
    'completedPractices', (
      SELECT count(*) FROM public.paper_reviews WHERE user_id = _user_id AND practice_passed_at IS NOT NULL
    )
  ) FROM today;
$$;

CREATE OR REPLACE FUNCTION public.reserve_paper_review(
  _user_id uuid, _request_id uuid, _image_digest text, _premium boolean
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  _day date := (now() AT TIME ZONE 'Asia/Baghdad')::date;
  _lease uuid;
  _previous public.paper_reviews%ROWTYPE;
BEGIN
  -- Expired processing leases can be replaced. A completed review is retained
  -- so a network retry of that same photo can return the original result.
  DELETE FROM public.paper_reviews
  WHERE user_id = _user_id AND completed_at IS NULL AND created_at <= now() - interval '3 minutes';

  INSERT INTO public.paper_reviews (user_id, request_id, image_digest, free_day)
  VALUES (_user_id, _request_id, _image_digest, CASE WHEN _premium THEN NULL ELSE _day END)
  ON CONFLICT DO NOTHING
  RETURNING lease_id INTO _lease;

  IF _lease IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'reserved', 'leaseId', _lease);
  END IF;

  SELECT * INTO _previous FROM public.paper_reviews
  WHERE user_id = _user_id AND request_id = _request_id;
  IF FOUND THEN
    IF _previous.image_digest <> _image_digest THEN
      RETURN jsonb_build_object('status', 'conflict');
    END IF;
    IF _previous.completed_at IS NOT NULL THEN
      RETURN jsonb_build_object('status', 'cached', 'report', _previous.report, 'practicePassed', _previous.practice_passed_at IS NOT NULL);
    END IF;
    RETURN jsonb_build_object('status', 'pending');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.paper_reviews WHERE user_id = _user_id AND free_day = _day AND completed_at IS NULL
  ) THEN
    RETURN jsonb_build_object('status', 'pending');
  END IF;
  RETURN jsonb_build_object('status', 'daily_limit');
END;
$$;

CREATE OR REPLACE FUNCTION public.settle_paper_review(_user_id uuid, _request_id uuid, _lease_id uuid, _report jsonb)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  IF _report IS NULL THEN
    DELETE FROM public.paper_reviews
    WHERE user_id = _user_id AND request_id = _request_id AND lease_id = _lease_id AND completed_at IS NULL;
  ELSE
    UPDATE public.paper_reviews SET report = _report, completed_at = now()
    WHERE user_id = _user_id AND request_id = _request_id AND lease_id = _lease_id AND completed_at IS NULL;
  END IF;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.answer_paper_review(_user_id uuid, _request_id uuid, _choice integer)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  _practice jsonb;
  _correct integer;
BEGIN
  SELECT report->'practice' INTO _practice FROM public.paper_reviews
  WHERE user_id = _user_id AND request_id = _request_id AND completed_at IS NOT NULL;
  IF _practice IS NULL OR jsonb_typeof(_practice) <> 'object' OR _choice IS NULL OR _choice NOT BETWEEN 0 AND 2 THEN
    RETURN NULL;
  END IF;

  _correct := (_practice->>'correctIndex')::integer;
  IF _choice = _correct THEN
    UPDATE public.paper_reviews SET practice_passed_at = now()
    WHERE user_id = _user_id AND request_id = _request_id AND practice_passed_at IS NULL;
  END IF;
  RETURN jsonb_build_object('correct', _choice = _correct, 'explanation', _practice->>'explanation');
END;
$$;

REVOKE ALL ON FUNCTION public.paper_review_status(uuid, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_paper_review(uuid, uuid, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.settle_paper_review(uuid, uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.answer_paper_review(uuid, uuid, integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.paper_review_status(uuid, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_paper_review(uuid, uuid, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.settle_paper_review(uuid, uuid, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.answer_paper_review(uuid, uuid, integer) TO service_role;
