-- Escrow-backed All or Nothing study rooms.
-- Stakes use point_redemptions so the existing points_balance() remains the
-- single spendable-balance calculation. The winner receives the full pot as a
-- positive user_points ledger entry after the study window ends.

ALTER TABLE public.study_challenges
  ADD COLUMN IF NOT EXISTS room_state text NOT NULL DEFAULT 'running',
  ADD COLUMN IF NOT EXISTS wager_points integer,
  ADD COLUMN IF NOT EXISTS duration_days integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS lobby_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS winner_id uuid,
  ADD COLUMN IF NOT EXISTS settled_at timestamptz;

ALTER TABLE public.study_challenges
  DROP CONSTRAINT IF EXISTS study_challenges_room_state_check,
  DROP CONSTRAINT IF EXISTS study_challenges_wager_points_check,
  DROP CONSTRAINT IF EXISTS study_challenges_duration_days_check;

-- Any pre-wager All or Nothing room is unsafe to continue. Close it instead
-- of inventing a stake after students already joined. Do this before the new
-- wager constraint is installed.
UPDATE public.study_challenges
SET status = 'cancelled', room_state = 'cancelled', updated_at = now()
WHERE challenge_type = 'all_or_nothing' AND wager_points IS NULL;

ALTER TABLE public.study_challenges
  ADD CONSTRAINT study_challenges_room_state_check
    CHECK (room_state IN ('lobby', 'running', 'settled', 'cancelled')),
  ADD CONSTRAINT study_challenges_wager_points_check
    CHECK (
      challenge_type <> 'all_or_nothing'
      OR room_state = 'cancelled'
      OR wager_points BETWEEN 100 AND 1000
    ),
  ADD CONSTRAINT study_challenges_duration_days_check
    CHECK (duration_days BETWEEN 1 AND 30);

CREATE TABLE IF NOT EXISTS public.study_challenge_stakes (
  challenge_id uuid NOT NULL REFERENCES public.study_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL CHECK (points BETWEEN 100 AND 1000),
  redemption_id uuid,
  state text NOT NULL DEFAULT 'held' CHECK (state IN ('held', 'won', 'lost', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz,
  PRIMARY KEY (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS study_challenge_stakes_user_idx
  ON public.study_challenge_stakes (user_id, state, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS point_redemptions_all_or_nothing_uidx
  ON public.point_redemptions (user_id, reward)
  WHERE reward LIKE 'all_or_nothing:%';

GRANT SELECT ON public.study_challenge_stakes TO authenticated;
GRANT ALL ON public.study_challenge_stakes TO service_role;
ALTER TABLE public.study_challenge_stakes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own challenge stakes" ON public.study_challenge_stakes;
CREATE POLICY "Students view own challenge stakes"
ON public.study_challenge_stakes FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.reserve_all_or_nothing_stake(
  _challenge_id uuid,
  _user_id uuid,
  _points integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _lifetime integer;
  _spent integer;
  _balance integer;
  _redemption_id uuid;
  _existing_state text;
BEGIN
  IF _points NOT BETWEEN 100 AND 1000 THEN
    RAISE EXCEPTION 'The stake must be between 100 and 1000 points';
  END IF;

  SELECT state INTO _existing_state
  FROM public.study_challenge_stakes
  WHERE challenge_id = _challenge_id AND user_id = _user_id;
  IF _existing_state = 'held' THEN
    RETURN public.points_balance();
  END IF;

  INSERT INTO public.user_progress (user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT lifetime_points INTO _lifetime
  FROM public.user_progress
  WHERE user_id = _user_id
  FOR UPDATE;

  SELECT coalesce(sum(points_spent), 0)::integer INTO _spent
  FROM public.point_redemptions
  WHERE user_id = _user_id;

  _balance := greatest(coalesce(_lifetime, 0) - coalesce(_spent, 0), 0);
  IF _balance < _points THEN
    RAISE EXCEPTION 'Not enough points. This room requires % points and your balance is %', _points, _balance;
  END IF;

  INSERT INTO public.point_redemptions (user_id, reward, points_spent)
  VALUES (_user_id, 'all_or_nothing:' || _challenge_id::text, _points)
  RETURNING id INTO _redemption_id;

  INSERT INTO public.study_challenge_stakes (
    challenge_id, user_id, points, redemption_id, state, settled_at
  ) VALUES (
    _challenge_id, _user_id, _points, _redemption_id, 'held', NULL
  )
  ON CONFLICT (challenge_id, user_id) DO UPDATE
  SET points = excluded.points,
      redemption_id = excluded.redemption_id,
      state = 'held',
      settled_at = NULL;

  RETURN _balance - _points;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_all_or_nothing_stake(
  _challenge_id uuid,
  _user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  DELETE FROM public.point_redemptions
  WHERE user_id = _user_id
    AND reward = 'all_or_nothing:' || _challenge_id::text;

  UPDATE public.study_challenge_stakes
  SET state = 'refunded', redemption_id = NULL, settled_at = now()
  WHERE challenge_id = _challenge_id AND user_id = _user_id AND state = 'held';
END;
$$;

CREATE OR REPLACE FUNCTION public.create_study_challenge_v3(
  _title text,
  _duration_days integer,
  _invitee_ids uuid[],
  _challenge_type text DEFAULT 'standard',
  _wager_points integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _challenge_id uuid := gen_random_uuid();
  _clean_invitees uuid[];
  _clean_type text := lower(btrim(coalesce(_challenge_type, 'standard')));
  _is_all_or_nothing boolean;
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
  _is_all_or_nothing := _clean_type = 'all_or_nothing';
  IF _is_all_or_nothing AND _wager_points NOT BETWEEN 100 AND 1000 THEN
    RAISE EXCEPTION 'The stake must be between 100 and 1000 points';
  END IF;

  SELECT coalesce(array_agg(DISTINCT p.user_id), '{}'::uuid[])
  INTO _clean_invitees
  FROM public.profiles p
  WHERE p.user_id = ANY(coalesce(_invitee_ids, '{}'::uuid[]))
    AND p.user_id <> _user_id;

  IF NOT _is_all_or_nothing AND cardinality(_clean_invitees) < 1 THEN
    RAISE EXCEPTION 'Invite at least one friend';
  END IF;
  IF cardinality(_clean_invitees) > (CASE WHEN _is_all_or_nothing THEN 9 ELSE 20 END) THEN
    RAISE EXCEPTION 'This challenge has too many invited students';
  END IF;

  INSERT INTO public.study_challenges (
    id, creator_id, title, starts_at, ends_at, status, is_public,
    challenge_type, room_state, wager_points, duration_days, lobby_expires_at
  ) VALUES (
    _challenge_id, _user_id, btrim(_title), now(),
    CASE WHEN _is_all_or_nothing THEN now() + interval '30 days'
         ELSE now() + make_interval(days => _duration_days) END,
    'active', _is_all_or_nothing, _clean_type,
    CASE WHEN _is_all_or_nothing THEN 'lobby' ELSE 'running' END,
    CASE WHEN _is_all_or_nothing THEN _wager_points ELSE NULL END,
    _duration_days,
    CASE WHEN _is_all_or_nothing THEN now() + interval '7 days' ELSE NULL END
  );

  -- The room must exist before the escrow row can satisfy its foreign key.
  -- Any failure to reserve the owner's stake rolls this whole transaction back.
  IF _is_all_or_nothing THEN
    PERFORM public.reserve_all_or_nothing_stake(_challenge_id, _user_id, _wager_points);
  END IF;

  INSERT INTO public.study_challenge_members (challenge_id, user_id, invited_by, status, joined_at)
  VALUES (_challenge_id, _user_id, _user_id, 'accepted', now());

  INSERT INTO public.study_challenge_members (challenge_id, user_id, invited_by)
  SELECT _challenge_id, invitee.user_id, _user_id
  FROM unnest(_clean_invitees) AS invitee(user_id);

  RETURN _challenge_id;
END;
$$;

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
  _challenge public.study_challenges%ROWTYPE;
  _member_status text;
  _accepted_count integer;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;

  SELECT * INTO _challenge
  FROM public.study_challenges
  WHERE id = _challenge_id
  FOR UPDATE;

  IF _challenge.id IS NULL OR _challenge.status <> 'active' THEN
    RAISE EXCEPTION 'This challenge is no longer available';
  END IF;

  SELECT status INTO _member_status
  FROM public.study_challenge_members
  WHERE challenge_id = _challenge_id AND user_id = _user_id;

  IF _member_status IS NULL AND NOT _challenge.is_public THEN
    RAISE EXCEPTION 'This private challenge requires an invitation';
  END IF;

  IF _member_status = 'pending' AND NOT _accept THEN
    UPDATE public.study_challenge_members
    SET status = 'declined', joined_at = NULL
    WHERE challenge_id = _challenge_id AND user_id = _user_id;
    RETURN;
  END IF;
  IF NOT _accept THEN RAISE EXCEPTION 'This invitation is no longer available'; END IF;

  IF _challenge.challenge_type = 'all_or_nothing' THEN
    IF _challenge.room_state <> 'lobby'
       OR _challenge.lobby_expires_at IS NULL
       OR _challenge.lobby_expires_at <= now() THEN
      RAISE EXCEPTION 'This All or Nothing room has already started or closed';
    END IF;
    SELECT count(*)::integer INTO _accepted_count
    FROM public.study_challenge_members
    WHERE challenge_id = _challenge_id AND status = 'accepted';
    IF _member_status <> 'accepted' AND _accepted_count >= 10 THEN
      RAISE EXCEPTION 'This All or Nothing room is full';
    END IF;
    IF _member_status <> 'accepted' THEN
      PERFORM public.reserve_all_or_nothing_stake(_challenge_id, _user_id, _challenge.wager_points);
    END IF;
  ELSIF _challenge.ends_at <= now() THEN
    RAISE EXCEPTION 'This challenge is no longer available';
  END IF;

  INSERT INTO public.study_challenge_members (
    challenge_id, user_id, invited_by, status, joined_at
  ) VALUES (
    _challenge_id, _user_id, _challenge.creator_id, 'accepted', now()
  )
  ON CONFLICT (challenge_id, user_id) DO UPDATE
  SET status = 'accepted', joined_at = coalesce(public.study_challenge_members.joined_at, now());
END;
$$;

CREATE OR REPLACE FUNCTION public.start_all_or_nothing_challenge(_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _challenge public.study_challenges%ROWTYPE;
  _accepted_count integer;
  _held_count integer;
  _new_end timestamptz;
BEGIN
  SELECT * INTO _challenge
  FROM public.study_challenges
  WHERE id = _challenge_id
  FOR UPDATE;

  IF _challenge.id IS NULL OR _challenge.creator_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the room owner can start this challenge';
  END IF;
  IF _challenge.challenge_type <> 'all_or_nothing' OR _challenge.room_state <> 'lobby' THEN
    RAISE EXCEPTION 'This room cannot be started';
  END IF;
  IF _challenge.lobby_expires_at <= now() THEN RAISE EXCEPTION 'This lobby has expired'; END IF;

  SELECT count(*)::integer INTO _accepted_count
  FROM public.study_challenge_members
  WHERE challenge_id = _challenge_id AND status = 'accepted';
  SELECT count(*)::integer INTO _held_count
  FROM public.study_challenge_stakes
  WHERE challenge_id = _challenge_id AND state = 'held';

  IF _accepted_count < 5 THEN RAISE EXCEPTION 'At least 5 students must join before starting'; END IF;
  IF _accepted_count <> _held_count THEN RAISE EXCEPTION 'Every participant must have a confirmed stake'; END IF;

  _new_end := now() + make_interval(days => _challenge.duration_days);
  UPDATE public.study_challenges
  SET room_state = 'running', starts_at = now(), ends_at = _new_end,
      lobby_expires_at = NULL, updated_at = now()
  WHERE id = _challenge_id;

  RETURN jsonb_build_object(
    'ok', true,
    'participants', _accepted_count,
    'wagerPoints', _challenge.wager_points,
    'potPoints', _accepted_count * _challenge.wager_points,
    'endsAt', _new_end
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_all_or_nothing_challenge(_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _challenge public.study_challenges%ROWTYPE;
BEGIN
  SELECT * INTO _challenge
  FROM public.study_challenges
  WHERE id = _challenge_id
  FOR UPDATE;

  IF _challenge.id IS NULL
     OR _challenge.challenge_type <> 'all_or_nothing'
     OR _challenge.room_state <> 'lobby' THEN
    RAISE EXCEPTION 'This room can no longer be left';
  END IF;
  IF _challenge.creator_id = auth.uid() THEN
    RAISE EXCEPTION 'The owner must cancel the room instead';
  END IF;

  DELETE FROM public.study_challenge_members
  WHERE challenge_id = _challenge_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'You are not in this room'; END IF;

  PERFORM public.refund_all_or_nothing_stake(_challenge_id, auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_study_challenge(_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _challenge public.study_challenges%ROWTYPE;
  _member record;
BEGIN
  SELECT * INTO _challenge
  FROM public.study_challenges
  WHERE id = _challenge_id
  FOR UPDATE;

  IF _challenge.id IS NULL OR _challenge.creator_id <> auth.uid() OR _challenge.status <> 'active' THEN
    RAISE EXCEPTION 'Challenge cannot be cancelled';
  END IF;
  IF _challenge.challenge_type = 'all_or_nothing' AND _challenge.room_state <> 'lobby' THEN
    RAISE EXCEPTION 'An All or Nothing room cannot be cancelled after it starts';
  END IF;

  IF _challenge.challenge_type = 'all_or_nothing' THEN
    FOR _member IN
      SELECT user_id FROM public.study_challenge_stakes
      WHERE challenge_id = _challenge_id AND state = 'held'
    LOOP
      PERFORM public.refund_all_or_nothing_stake(_challenge_id, _member.user_id);
    END LOOP;
  END IF;

  UPDATE public.study_challenges
  SET status = 'cancelled', room_state = 'cancelled', updated_at = now()
  WHERE id = _challenge_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.study_challenge_totals(_challenge_id uuid)
RETURNS TABLE(user_id uuid, total_seconds bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  WITH challenge AS (
    SELECT * FROM public.study_challenges WHERE id = _challenge_id
  ), session_intervals AS (
    SELECT m.user_id,
      greatest(c.starts_at, lower(period.period)) AS study_start,
      least(upper(period.period), c.ends_at, now()) AS study_end
    FROM public.study_challenge_members m
    JOIN challenge c ON c.id = m.challenge_id
    JOIN public.study_sessions s ON s.user_id = m.user_id
    CROSS JOIN LATERAL unnest(coalesce(s.study_periods, tstzmultirange(tstzrange(
      s.created_at - make_interval(secs => greatest(0, least(s.duration_seconds, 43200))),
      s.created_at, '[)')))) period(period)
    WHERE m.status = 'accepted'
      AND s.created_at > c.starts_at
      AND s.created_at <= c.ends_at
      AND s.duration_seconds > 0
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

CREATE OR REPLACE FUNCTION public.settle_due_all_or_nothing_challenges()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _challenge public.study_challenges%ROWTYPE;
  _winner_id uuid;
  _participant_count integer;
  _pot integer;
  _settled integer := 0;
  _member record;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('settle-all-or-nothing-challenges'));

  FOR _challenge IN
    SELECT * FROM public.study_challenges
    WHERE challenge_type = 'all_or_nothing'
      AND room_state = 'lobby'
      AND lobby_expires_at <= now()
      AND status = 'active'
    FOR UPDATE SKIP LOCKED
  LOOP
    FOR _member IN
      SELECT user_id FROM public.study_challenge_stakes
      WHERE challenge_id = _challenge.id AND state = 'held'
    LOOP
      PERFORM public.refund_all_or_nothing_stake(_challenge.id, _member.user_id);
    END LOOP;
    UPDATE public.study_challenges
    SET status = 'cancelled', room_state = 'cancelled', updated_at = now()
    WHERE id = _challenge.id;
  END LOOP;

  FOR _challenge IN
    SELECT * FROM public.study_challenges
    WHERE challenge_type = 'all_or_nothing'
      AND room_state = 'running'
      AND ends_at <= now()
      AND status = 'active'
    FOR UPDATE SKIP LOCKED
  LOOP
    SELECT totals.user_id INTO _winner_id
    FROM public.study_challenge_totals(_challenge.id) totals
    JOIN public.study_challenge_members member
      ON member.challenge_id = _challenge.id AND member.user_id = totals.user_id
    ORDER BY totals.total_seconds DESC, member.joined_at ASC NULLS LAST, totals.user_id
    LIMIT 1;

    SELECT count(*)::integer INTO _participant_count
    FROM public.study_challenge_members
    WHERE challenge_id = _challenge.id AND status = 'accepted';
    _pot := _participant_count * _challenge.wager_points;

    IF _winner_id IS NOT NULL AND _participant_count >= 5 THEN
      INSERT INTO public.user_points (user_id, source, points, ref_id)
      VALUES (_winner_id, 'all_or_nothing_win', _pot, _challenge.id::text)
      ON CONFLICT (user_id, source, ref_id) WHERE ref_id IS NOT NULL DO NOTHING;

      UPDATE public.study_challenge_stakes
      SET state = CASE WHEN user_id = _winner_id THEN 'won' ELSE 'lost' END,
          settled_at = now()
      WHERE challenge_id = _challenge.id AND state = 'held';

      UPDATE public.study_challenges
      SET room_state = 'settled', winner_id = _winner_id,
          settled_at = now(), updated_at = now()
      WHERE id = _challenge.id;
      _settled := _settled + 1;
    END IF;
  END LOOP;

  RETURN _settled;
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
    WHERE c.is_public AND c.status = 'active'
      AND c.ends_at > now()
      AND (c.room_state <> 'lobby' OR c.lobby_expires_at > now())
      AND NOT EXISTS (
        SELECT 1 FROM public.study_challenge_members m
        WHERE m.challenge_id = c.id AND m.user_id = auth.uid() AND m.status <> 'declined'
      )
  ), participant_totals AS (
    SELECT m.challenge_id, m.user_id, m.status,
      coalesce(p.display_name, 'Student') AS display_name,
      coalesce(t.total_seconds, 0)::bigint AS total_seconds
    FROM public.study_challenge_members m
    JOIN mine c ON c.id = m.challenge_id
    LEFT JOIN public.profiles p ON p.user_id = m.user_id
    LEFT JOIN LATERAL public.study_challenge_totals(m.challenge_id) t
      ON t.user_id = m.user_id
    WHERE m.status <> 'declined'
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id, 'title', c.title, 'creatorId', c.creator_id, 'creatorName', c.creator_name,
      'startsAt', c.starts_at, 'endsAt', c.ends_at, 'status', c.status, 'myStatus', c.my_status,
      'isPublic', c.is_public, 'challengeType', c.challenge_type, 'publicSeries', c.public_series,
      'roomState', c.room_state, 'wagerPoints', c.wager_points, 'durationDays', c.duration_days,
      'lobbyExpiresAt', c.lobby_expires_at, 'winnerId', c.winner_id, 'settledAt', c.settled_at,
      'minimumPlayers', CASE WHEN c.challenge_type = 'all_or_nothing' THEN 5 ELSE NULL END,
      'potPoints', CASE WHEN c.challenge_type = 'all_or_nothing' THEN
        c.wager_points * (SELECT count(*) FROM public.study_challenge_members pm
          WHERE pm.challenge_id = c.id AND pm.status = 'accepted') ELSE NULL END,
      'participants', (SELECT coalesce(jsonb_agg(jsonb_build_object(
          'userId', pt.user_id, 'displayName', pt.display_name, 'status', pt.status, 'totalSeconds', pt.total_seconds
        ) ORDER BY CASE WHEN pt.status = 'accepted' THEN 0 ELSE 1 END, pt.total_seconds DESC, pt.display_name ASC), '[]'::jsonb)
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

REVOKE ALL ON FUNCTION public.reserve_all_or_nothing_stake(uuid, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refund_all_or_nothing_stake(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_study_challenge_v3(text, integer, uuid[], text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.start_all_or_nothing_challenge(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_all_or_nothing_challenge(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.settle_due_all_or_nothing_challenges() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.study_challenge_totals(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_study_challenge(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_study_challenge(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_study_challenges() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_study_challenge_v3(text, integer, uuid[], text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_all_or_nothing_challenge(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_all_or_nothing_challenge(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_study_challenge(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_study_challenge(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_study_challenges() TO authenticated;
GRANT EXECUTE ON FUNCTION public.settle_due_all_or_nothing_challenges() TO service_role;

-- cron.schedule upserts by job name, so no unschedule lookup is needed.
SELECT cron.schedule(
  'settle-all-or-nothing-challenges',
  '15 * * * *',
  'SELECT public.settle_due_all_or_nothing_challenges();'
);
