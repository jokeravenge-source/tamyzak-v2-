-- Existing rooms keep their configured days and receive zero additional hours.
ALTER TABLE public.study_challenges
  ADD COLUMN IF NOT EXISTS duration_hours integer NOT NULL DEFAULT 0;

ALTER TABLE public.study_challenges
  DROP CONSTRAINT IF EXISTS study_challenges_duration_days_check,
  DROP CONSTRAINT IF EXISTS study_challenges_duration_check;

ALTER TABLE public.study_challenges
  ADD CONSTRAINT study_challenges_duration_check CHECK (
    duration_days BETWEEN 0 AND 30
    AND duration_hours BETWEEN 0 AND 23
    AND duration_days::bigint * 24 + duration_hours BETWEEN 1 AND 720
    AND (challenge_type = 'all_or_nothing' OR (duration_days >= 1 AND duration_hours = 0))
  );

CREATE OR REPLACE FUNCTION public.create_all_or_nothing_challenge(
  _title text,
  _duration_days integer,
  _duration_hours integer,
  _invitee_ids uuid[],
  _wager_points integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _challenge_id uuid;
BEGIN
  IF _duration_days IS NULL OR _duration_hours IS NULL
     OR _duration_days NOT BETWEEN 0 AND 30
     OR _duration_hours NOT BETWEEN 0 AND 23
     OR _duration_days::bigint * 24 + _duration_hours NOT BETWEEN 1 AND 720 THEN
    RAISE EXCEPTION 'Challenge duration must be between 1 hour and 30 days';
  END IF;

  -- Reuse creation, invitations, and stake reservation. The effective duration
  -- is stored in the same transaction and used only when the room starts.
  _challenge_id := public.create_study_challenge_v3(
    _title, greatest(1, _duration_days), _invitee_ids, 'all_or_nothing', _wager_points
  );

  UPDATE public.study_challenges
  SET duration_days = _duration_days, duration_hours = _duration_hours
  WHERE id = _challenge_id;

  RETURN _challenge_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_all_or_nothing_challenge(text, integer, integer, uuid[], integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_all_or_nothing_challenge(text, integer, integer, uuid[], integer) TO authenticated;

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
    IF _member_status IS DISTINCT FROM 'accepted' AND _accepted_count >= 10 THEN
      RAISE EXCEPTION 'This All or Nothing room is full';
    END IF;
    IF _member_status IS DISTINCT FROM 'accepted' THEN
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

-- Earlier public joins could add a member without reserving their stake.
-- Ask those members to confirm again in open lobbies before counting them.
UPDATE public.study_challenge_members AS member
SET status = 'pending', joined_at = NULL
FROM public.study_challenges AS challenge
WHERE member.challenge_id = challenge.id
  AND challenge.challenge_type = 'all_or_nothing'
  AND challenge.room_state = 'lobby'
  AND challenge.status = 'active'
  AND challenge.lobby_expires_at > now()
  AND member.status = 'accepted'
  AND member.user_id <> challenge.creator_id
  AND NOT EXISTS (
    SELECT 1 FROM public.study_challenge_stakes AS stake
    WHERE stake.challenge_id = member.challenge_id
      AND stake.user_id = member.user_id
      AND stake.state = 'held'
  );

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

  IF _challenge.id IS NULL OR _challenge.creator_id IS DISTINCT FROM auth.uid() THEN
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

  IF _accepted_count < 3 THEN RAISE EXCEPTION 'At least 3 students must join before starting'; END IF;
  IF _accepted_count <> _held_count THEN RAISE EXCEPTION 'Every participant must have a confirmed stake'; END IF;

  _new_end := now() + make_interval(days => _challenge.duration_days, hours => _challenge.duration_hours);
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
      'durationHours', c.duration_hours,
      'lobbyExpiresAt', c.lobby_expires_at, 'winnerId', c.winner_id, 'settledAt', c.settled_at,
      'minimumPlayers', CASE WHEN c.challenge_type = 'all_or_nothing' THEN 3 ELSE NULL END,
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
