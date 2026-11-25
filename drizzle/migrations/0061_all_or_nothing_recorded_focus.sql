CREATE TABLE IF NOT EXISTS public.study_timer_focus (
  session_id uuid PRIMARY KEY REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  periods tstzmultirange NOT NULL
);

ALTER TABLE public.study_timer_focus ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_timer_focus FROM PUBLIC, anon, authenticated;

ALTER TABLE public.study_challenges
  ADD COLUMN IF NOT EXISTS require_recorded_focus boolean;

-- Keep already-settled scoreboards on the rule used when they paid their winner.
UPDATE public.study_challenges
SET require_recorded_focus = (room_state <> 'settled')
WHERE challenge_type = 'all_or_nothing' AND require_recorded_focus IS NULL;

ALTER TABLE public.study_challenges
  ALTER COLUMN require_recorded_focus SET DEFAULT true;

CREATE OR REPLACE FUNCTION public.save_study_timer_session(
  _session_id uuid,
  _subject text,
  _mission text,
  _duration_seconds integer,
  _mission_completed boolean,
  _periods tstzmultirange
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _saved_id uuid;
  _saved_at timestamptz;
  _recorded tstzmultirange := '{}'::tstzmultirange;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF _duration_seconds IS NULL OR _duration_seconds NOT BETWEEN 1 AND 172800 THEN
    RAISE EXCEPTION 'Invalid study session duration';
  END IF;

  INSERT INTO public.study_sessions (
    id, user_id, subject, mission, duration_seconds, mission_completed, points
  ) VALUES (
    _session_id, _user_id, _subject, _mission, _duration_seconds, _mission_completed,
    (_duration_seconds / 3600) * 5
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id, created_at INTO _saved_id, _saved_at;

  IF _saved_id IS NULL THEN
    IF EXISTS (SELECT 1 FROM public.study_sessions WHERE id = _session_id AND user_id = _user_id) THEN
      RETURN _session_id;
    END IF;
    RAISE EXCEPTION 'Study session ID is unavailable';
  END IF;

  IF _periods IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM unnest(_periods) AS span(period)
    WHERE NOT coalesce(isfinite(lower(span.period)) AND isfinite(upper(span.period)), false)
  ) AND coalesce((
    SELECT sum(extract(epoch FROM upper(span.period) - lower(span.period)))
    FROM unnest(_periods) AS span(period)
  ), 0) <= _duration_seconds THEN
    _recorded := _periods * tstzmultirange(tstzrange(NULL, _saved_at, '[)'));
  END IF;

  INSERT INTO public.study_timer_focus (session_id, periods) VALUES (_saved_id, _recorded);
  RETURN _saved_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_study_timer_session(uuid, text, text, integer, boolean, tstzmultirange)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_study_timer_session(uuid, text, text, integer, boolean, tstzmultirange)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.study_challenge_totals(_challenge_id uuid)
RETURNS TABLE(user_id uuid, total_seconds bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  WITH challenge AS (
    SELECT c.*,
      c.challenge_type = 'all_or_nothing' AND coalesce(c.require_recorded_focus, false) AS only_recorded
    FROM public.study_challenges c
    WHERE c.id = _challenge_id
  ), session_intervals AS (
    SELECT m.user_id,
      greatest(lower(span.period), c.starts_at, CASE WHEN c.only_recorded THEN m.joined_at END) AS study_start,
      least(upper(span.period), c.ends_at, now()) AS study_end
    FROM public.study_challenge_members m
    JOIN challenge c ON c.id = m.challenge_id
    JOIN public.study_sessions s ON s.user_id = m.user_id
    LEFT JOIN public.study_timer_focus f ON f.session_id = s.id
    CROSS JOIN LATERAL unnest(
      CASE
        WHEN c.only_recorded AND s.flight_credit_id IS NULL THEN f.periods
        ELSE coalesce(s.study_periods, tstzmultirange(tstzrange(
          s.created_at - make_interval(secs => greatest(0, least(s.duration_seconds, 43200))),
          s.created_at, '[)')))
      END
    ) AS span(period)
    WHERE m.status = 'accepted'
      AND s.created_at > c.starts_at
      AND s.created_at <= c.ends_at
      AND (s.duration_seconds > 0 OR
        (c.only_recorded AND s.flight_credit_id IS NULL AND f.session_id IS NOT NULL))
      AND (NOT c.only_recorded OR (
        m.joined_at IS NOT NULL AND c.room_state IN ('running', 'settled') AND s.created_at <= now()
      ))
  ), session_ranges AS (
    SELECT intervals.user_id,
      range_agg(tstzrange(study_start, study_end, '[)')) AS studied
    FROM session_intervals intervals
    WHERE study_end > study_start
    GROUP BY intervals.user_id
  )
  SELECT m.user_id,
    coalesce((SELECT floor(sum(extract(epoch FROM upper(study_period) - lower(study_period))))
      FROM unnest(r.studied) AS study_period), 0)::bigint AS total_seconds
  FROM public.study_challenge_members m
  LEFT JOIN session_ranges r ON r.user_id = m.user_id
  WHERE m.challenge_id = _challenge_id AND m.status = 'accepted';
$$;

REVOKE ALL ON FUNCTION public.study_challenge_totals(uuid) FROM PUBLIC;
