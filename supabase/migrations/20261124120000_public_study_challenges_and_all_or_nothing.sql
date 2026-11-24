-- Public weekly/monthly study challenges and the invite-only All or Nothing mode.

ALTER TABLE public.study_challenges
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS challenge_type text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS public_series text,
  ADD COLUMN IF NOT EXISTS public_period_key text;

ALTER TABLE public.study_challenges
  DROP CONSTRAINT IF EXISTS study_challenges_challenge_type_check,
  DROP CONSTRAINT IF EXISTS study_challenges_public_series_check;

ALTER TABLE public.study_challenges
  ADD CONSTRAINT study_challenges_challenge_type_check
    CHECK (challenge_type IN ('standard', 'all_or_nothing')),
  ADD CONSTRAINT study_challenges_public_series_check
    CHECK (public_series IS NULL OR public_series IN ('weekly', 'monthly'));

CREATE UNIQUE INDEX IF NOT EXISTS study_challenges_public_period_key_uidx
  ON public.study_challenges (public_period_key)
  WHERE public_period_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS study_challenges_public_active_idx
  ON public.study_challenges (public_series, ends_at DESC)
  WHERE is_public AND status = 'active';

CREATE OR REPLACE FUNCTION public.create_study_challenge_v2(
  _title text,
  _duration_days integer,
  _invitee_ids uuid[],
  _challenge_type text DEFAULT 'standard'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _challenge_id uuid;
  _clean_invitees uuid[];
  _clean_type text := lower(btrim(coalesce(_challenge_type, 'standard')));
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF char_length(btrim(coalesce(_title, ''))) NOT BETWEEN 1 AND 80 THEN
    RAISE EXCEPTION 'Challenge title must be between 1 and 80 characters';
  END IF;
  IF _duration_days NOT BETWEEN 1 AND 30 THEN
    RAISE EXCEPTION 'Challenge duration must be between 1 and 30 days';
  END IF;
  IF _clean_type NOT IN ('standard', 'all_or_nothing') THEN
    RAISE EXCEPTION 'Unsupported challenge type';
  END IF;

  SELECT coalesce(array_agg(DISTINCT p.user_id), '{}'::uuid[])
  INTO _clean_invitees
  FROM public.profiles p
  WHERE p.user_id = ANY(coalesce(_invitee_ids, '{}'::uuid[]))
    AND p.user_id <> _user_id;

  IF cardinality(_clean_invitees) < 1 THEN RAISE EXCEPTION 'Invite at least one friend'; END IF;
  IF cardinality(_clean_invitees) > 20 THEN RAISE EXCEPTION 'A challenge can include up to 20 friends'; END IF;

  INSERT INTO public.study_challenges (creator_id, title, ends_at, challenge_type)
  VALUES (_user_id, btrim(_title), now() + make_interval(days => _duration_days), _clean_type)
  RETURNING id INTO _challenge_id;

  INSERT INTO public.study_challenge_members (challenge_id, user_id, invited_by, status, joined_at)
  VALUES (_challenge_id, _user_id, _user_id, 'accepted', now());

  INSERT INTO public.study_challenge_members (challenge_id, user_id, invited_by)
  SELECT _challenge_id, invitee.user_id, _user_id
  FROM unnest(_clean_invitees) AS invitee(user_id);

  RETURN _challenge_id;
END;
$$;

-- Pending invitees can accept or decline. Any authenticated student can join an
-- active public challenge even though no membership row exists yet.
CREATE OR REPLACE FUNCTION public.respond_study_challenge(
  _challenge_id uuid,
  _accept boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _creator_id uuid;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;

  UPDATE public.study_challenge_members m
  SET status = CASE WHEN _accept THEN 'accepted' ELSE 'declined' END,
      joined_at = CASE WHEN _accept THEN now() ELSE NULL END
  FROM public.study_challenges c
  WHERE m.challenge_id = _challenge_id
    AND m.challenge_id = c.id
    AND m.user_id = _user_id
    AND m.status = 'pending'
    AND c.status = 'active'
    AND c.ends_at > now();

  IF FOUND THEN RETURN; END IF;
  IF NOT _accept THEN RAISE EXCEPTION 'This invitation is no longer available'; END IF;

  SELECT creator_id INTO _creator_id
  FROM public.study_challenges
  WHERE id = _challenge_id
    AND is_public
    AND status = 'active'
    AND ends_at > now();

  IF _creator_id IS NULL THEN RAISE EXCEPTION 'This challenge is no longer available'; END IF;

  INSERT INTO public.study_challenge_members (challenge_id, user_id, invited_by, status, joined_at)
  VALUES (_challenge_id, _user_id, _creator_id, 'accepted', now())
  ON CONFLICT (challenge_id, user_id) DO UPDATE
  SET status = 'accepted', joined_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_tamayzak_public_challenges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _admin_id uuid;
  _stamp text := to_char(clock_timestamp() AT TIME ZONE 'Asia/Baghdad', 'YYYYMMDDHH24MISSMS');
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('tamayzak-public-study-challenges'));

  SELECT user_id INTO _admin_id
  FROM public.user_roles
  WHERE role = 'admin'::public.app_role
  ORDER BY created_at, user_id
  LIMIT 1;

  IF _admin_id IS NULL THEN RETURN; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.study_challenges
    WHERE is_public AND public_series = 'weekly' AND status = 'active' AND ends_at > now()
  ) THEN
    INSERT INTO public.study_challenges (
      creator_id, title, starts_at, ends_at, is_public, challenge_type, public_series, public_period_key
    ) VALUES (
      _admin_id, 'Weekly Tamayzak Challenge', now(), now() + interval '7 days', true,
      'standard', 'weekly', 'tamayzak-weekly:' || _stamp
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.study_challenges
    WHERE is_public AND public_series = 'monthly' AND status = 'active' AND ends_at > now()
  ) THEN
    INSERT INTO public.study_challenges (
      creator_id, title, starts_at, ends_at, is_public, challenge_type, public_series, public_period_key
    ) VALUES (
      _admin_id, 'Monthly Tamayzak Challenge', now(), now() + interval '30 days', true,
      'standard', 'monthly', 'tamayzak-monthly:' || _stamp
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_study_challenges()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  WITH mine AS (
    SELECT c.*, me.status AS my_status, coalesce(cp.display_name, 'Student') AS creator_name
    FROM public.study_challenges c
    JOIN public.study_challenge_members me ON me.challenge_id = c.id AND me.user_id = auth.uid()
    LEFT JOIN public.profiles cp ON cp.user_id = c.creator_id
    WHERE me.status <> 'declined'
    UNION ALL
    SELECT c.*, 'open'::text AS my_status, coalesce(cp.display_name, 'Tamayzak') AS creator_name
    FROM public.study_challenges c
    LEFT JOIN public.profiles cp ON cp.user_id = c.creator_id
    WHERE c.is_public AND c.status = 'active' AND c.ends_at > now()
      AND NOT EXISTS (
        SELECT 1 FROM public.study_challenge_members m
        WHERE m.challenge_id = c.id AND m.user_id = auth.uid()
      )
  ), session_intervals AS (
    SELECT m.challenge_id, m.user_id,
      greatest(c.starts_at, lower(p.period)) AS study_start,
      least(upper(p.period), c.ends_at, now()) AS study_end
    FROM public.study_challenge_members m
    JOIN mine c ON c.id = m.challenge_id
    JOIN public.study_sessions s ON s.user_id = m.user_id
    CROSS JOIN LATERAL unnest(coalesce(s.study_periods, tstzmultirange(tstzrange(
      s.created_at - make_interval(secs => greatest(0, least(s.duration_seconds, 43200))),
      s.created_at, '[)')))) p(period)
    WHERE m.status = 'accepted' AND s.created_at <= now()
      AND s.created_at > c.starts_at AND s.duration_seconds > 0
  ), session_ranges AS (
    SELECT challenge_id, user_id,
      range_agg(tstzrange(study_start, study_end, '[)')) AS studied
    FROM session_intervals
    WHERE study_end > study_start
    GROUP BY challenge_id, user_id
  ), participant_totals AS (
    SELECT m.challenge_id, m.user_id, m.status,
      coalesce(p.display_name, 'Student') AS display_name,
      coalesce((SELECT floor(sum(extract(epoch FROM upper(study_period) - lower(study_period))))
        FROM unnest(r.studied) AS study_period), 0)::bigint AS total_seconds
    FROM public.study_challenge_members m
    JOIN mine c ON c.id = m.challenge_id
    LEFT JOIN public.profiles p ON p.user_id = m.user_id
    LEFT JOIN session_ranges r ON r.challenge_id = m.challenge_id AND r.user_id = m.user_id
    WHERE m.status <> 'declined'
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id, 'title', c.title, 'creatorId', c.creator_id, 'creatorName', c.creator_name,
      'startsAt', c.starts_at, 'endsAt', c.ends_at, 'status', c.status, 'myStatus', c.my_status,
      'isPublic', c.is_public, 'challengeType', c.challenge_type, 'publicSeries', c.public_series,
      'participants', (SELECT coalesce(jsonb_agg(jsonb_build_object(
          'userId', pt.user_id, 'displayName', pt.display_name, 'status', pt.status, 'totalSeconds', pt.total_seconds
        ) ORDER BY CASE WHEN pt.status = 'accepted' THEN 0 ELSE 1 END, pt.total_seconds DESC, pt.display_name ASC), '[]'::jsonb)
        FROM participant_totals pt WHERE pt.challenge_id = c.id)
    ) ORDER BY CASE WHEN c.is_public AND c.status = 'active' AND c.ends_at > now() THEN 0 WHEN c.my_status = 'pending' THEN 1 WHEN c.status = 'active' AND c.ends_at > now() THEN 2 ELSE 3 END, c.ends_at DESC), '[]'::jsonb)
  FROM mine c;
$$;

REVOKE ALL ON FUNCTION public.create_study_challenge_v2(text, integer, uuid[], text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_study_challenge(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_tamayzak_public_challenges() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_study_challenges() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_study_challenge_v2(text, integer, uuid[], text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_study_challenge(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_tamayzak_public_challenges() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_my_study_challenges() TO authenticated;

COMMENT ON FUNCTION public.ensure_tamayzak_public_challenges() IS
  'Keeps one rolling seven-day and one rolling thirty-day public Tamayzak study challenge active.';

SELECT public.ensure_tamayzak_public_challenges();

DO $$
DECLARE _job_id bigint;
BEGIN
  FOR _job_id IN SELECT jobid FROM cron.job WHERE jobname = 'tamayzak-public-study-challenges'
  LOOP
    PERFORM cron.unschedule(_job_id);
  END LOOP;
END $$;

SELECT cron.schedule(
  'tamayzak-public-study-challenges',
  '5 * * * *',
  'SELECT public.ensure_tamayzak_public_challenges();'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'study_challenge_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.study_challenge_members;
  END IF;
END $$;

ALTER TABLE public.study_challenge_members REPLICA IDENTITY FULL;
