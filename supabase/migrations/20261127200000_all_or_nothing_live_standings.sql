-- Use the same saved focus union for the provisional leaderboard and settlement.
-- Return merged coverage only to accepted members of a running points room.
CREATE OR REPLACE FUNCTION public.study_challenge_saved_ranges(_challenge_id uuid)
RETURNS TABLE(user_id uuid, studied tstzmultirange)
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
  SELECT m.user_id, coalesce(r.studied, '{}'::tstzmultirange)
  FROM public.study_challenge_members m
  LEFT JOIN session_ranges r ON r.user_id = m.user_id
  WHERE m.challenge_id = _challenge_id AND m.status = 'accepted';
$$;


CREATE OR REPLACE FUNCTION public.study_challenge_totals(_challenge_id uuid)
RETURNS TABLE(user_id uuid, total_seconds bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT scores.user_id, coalesce((
    SELECT floor(sum(extract(epoch FROM upper(span.period) - lower(span.period))))
    FROM unnest(scores.studied) AS span(period)
  ), 0)::bigint
  FROM public.study_challenge_saved_ranges(_challenge_id) AS scores;
$$;

REVOKE ALL ON FUNCTION public.study_challenge_saved_ranges(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.study_challenge_totals(uuid) FROM PUBLIC;

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
    WHERE c.is_public AND c.status = 'active'
      AND c.ends_at > now()
      AND (c.room_state <> 'lobby' OR c.lobby_expires_at > now())
      AND NOT EXISTS (
        SELECT 1 FROM public.study_challenge_members m
        WHERE m.challenge_id = c.id AND m.user_id = auth.uid() AND m.status <> 'declined'
      )
  ), saved_ranges AS MATERIALIZED (
    SELECT c.id AS challenge_id, scores.user_id, scores.studied
    FROM mine c
    CROSS JOIN LATERAL public.study_challenge_saved_ranges(c.id) AS scores
  ), participant_totals AS (
    SELECT m.challenge_id, m.user_id, m.status,
      coalesce(p.display_name, 'Student') AS display_name,
      coalesce(t.total_seconds, 0)::bigint AS total_seconds,
      t.saved_focus,
      CASE WHEN t.saved_focus IS NOT NULL THEN m.joined_at END AS joined_at
    FROM public.study_challenge_members m
    JOIN mine c ON c.id = m.challenge_id
    LEFT JOIN public.profiles p ON p.user_id = m.user_id
    LEFT JOIN saved_ranges r ON r.challenge_id = c.id AND r.user_id = m.user_id
    LEFT JOIN LATERAL (
      SELECT floor(sum(extract(epoch FROM upper(span.period) - lower(span.period)))) AS total_seconds,
        CASE WHEN c.challenge_type = 'all_or_nothing' AND c.room_state = 'running'
          AND c.status = 'active' AND c.starts_at <= now() AND c.ends_at > now()
          AND c.my_status = 'accepted' AND m.status = 'accepted' AND m.joined_at IS NOT NULL
          THEN coalesce(jsonb_agg(jsonb_build_array(
            floor(extract(epoch FROM lower(span.period)) * 1000)::bigint,
            floor(extract(epoch FROM upper(span.period)) * 1000)::bigint
          ) ORDER BY lower(span.period)), '[]'::jsonb)
        END AS saved_focus
      FROM unnest(r.studied) AS span(period)
    ) AS t ON true
    WHERE m.status <> 'declined'
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id, 'title', c.title, 'creatorId', c.creator_id, 'creatorName', c.creator_name,
      'startsAt', c.starts_at, 'endsAt', c.ends_at, 'status', c.status, 'myStatus', c.my_status,
      'isPublic', c.is_public, 'challengeType', c.challenge_type, 'publicSeries', c.public_series,
      'roomState', c.room_state, 'wagerPoints', c.wager_points, 'durationDays', c.duration_days,
      'durationHours', c.duration_hours,
      'lobbyExpiresAt', c.lobby_expires_at, 'winnerId', c.winner_id, 'settledAt', c.settled_at,
      'minimumPlayers', CASE WHEN c.challenge_type = 'all_or_nothing' THEN 3 ELSE NULL END,
      'potPoints', CASE WHEN c.challenge_type = 'all_or_nothing' THEN
        c.wager_points * (SELECT count(*) FROM public.study_challenge_members pm
          WHERE pm.challenge_id = c.id AND pm.status = 'accepted') ELSE NULL END,
      'participants', (SELECT coalesce(jsonb_agg(jsonb_build_object(
          'userId', pt.user_id, 'displayName', pt.display_name, 'status', pt.status, 'totalSeconds', pt.total_seconds
        ) || CASE WHEN pt.saved_focus IS NOT NULL THEN jsonb_build_object(
          'savedFocus', pt.saved_focus, 'joinedAt', pt.joined_at
        ) ELSE '{}'::jsonb END ORDER BY CASE WHEN pt.status = 'accepted' THEN 0 ELSE 1 END, pt.total_seconds DESC, pt.display_name ASC), '[]'::jsonb)
        FROM participant_totals pt WHERE pt.challenge_id = c.id)
    ) ORDER BY
      CASE
        WHEN c.challenge_type = 'all_or_nothing' AND c.room_state = 'lobby' THEN 0
        WHEN c.is_public AND c.status = 'active' AND c.ends_at > now() THEN 1
        WHEN c.my_status = 'pending' THEN 2
        WHEN c.status = 'active' AND c.ends_at > now() THEN 3
        ELSE 4
      END,
      c.created_at DESC), '[]'::jsonb)
  FROM mine c;
$$;
