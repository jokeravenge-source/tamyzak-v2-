-- Existing inbox messages predate the reward and keep a zero balance change.
ALTER TABLE public.study_room_encouragements
  ADD COLUMN IF NOT EXISTS reward_points integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.encourage_study_room_member(_room uuid, _recipient uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  sender text;
  accepted_at timestamptz;
  cheer_reward constant integer := 5;
BEGIN
  IF caller IS NULL OR _recipient IS NULL OR caller = _recipient
     OR is_banned_from_room(_room)
     OR NOT EXISTS (SELECT 1 FROM study_rooms WHERE id = _room AND is_active)
     OR NOT EXISTS (SELECT 1 FROM study_room_members WHERE room_id = _room AND user_id = _recipient)
     OR EXISTS (SELECT 1 FROM study_room_bans WHERE room_id = _room AND user_id = _recipient) THEN
    RAISE EXCEPTION 'ROOM_MEMBERSHIP_REQUIRED';
  END IF;

  SELECT display_name INTO sender FROM study_room_members WHERE room_id = _room AND user_id = caller FOR NO KEY UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ROOM_MEMBERSHIP_REQUIRED'; END IF;
  IF EXISTS (
    SELECT 1 FROM study_room_encouragements WHERE room_id = _room AND sender_id = caller
      AND created_at > now() - interval '5 seconds'
  ) THEN RAISE EXCEPTION 'ENCOURAGEMENT_COOLDOWN'; END IF;

  INSERT INTO study_room_encouragements (room_id, sender_id, recipient_id, sender_name, reward_points)
  VALUES (_room, caller, _recipient, sender, cheer_reward)
  ON CONFLICT (room_id, sender_id, recipient_id) DO UPDATE
    SET sender_name = EXCLUDED.sender_name, created_at = now(), seen_at = NULL, reward_points = EXCLUDED.reward_points
    WHERE study_room_encouragements.created_at <= now() - interval '1 minute'
  RETURNING created_at INTO accepted_at;
  IF NOT FOUND THEN RAISE EXCEPTION 'ENCOURAGEMENT_COOLDOWN'; END IF;

  INSERT INTO public.user_points (user_id, source, points, ref_id)
  VALUES (_recipient, 'study_room_cheer', cheer_reward,
    concat_ws(':', _room, caller, extract(epoch from accepted_at)))
  ON CONFLICT (user_id, source, ref_id) WHERE ref_id IS NOT NULL DO NOTHING;

  PERFORM realtime.send('{}'::jsonb, 'changed', 'study-room-inbox:' || _room::text || ':' || _recipient::text, true);
END;
$$;

CREATE OR REPLACE FUNCTION public.study_room_activity(_room uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  room_owner uuid;
BEGIN
  SELECT owner_id INTO room_owner FROM study_rooms WHERE id = _room AND is_active;
  IF room_owner IS NULL OR caller IS NULL OR NOT is_study_room_member(_room) OR is_banned_from_room(_room) THEN
    RAISE EXCEPTION 'ROOM_MEMBERSHIP_REQUIRED';
  END IF;

  RETURN jsonb_build_object(
    'owner', room_owner = caller,
    'inbox', COALESCE((
      SELECT jsonb_agg(to_jsonb(n) ORDER BY n.created_at DESC) FROM (
        SELECT sender_id, sender_name, created_at, reward_points FROM study_room_encouragements
        WHERE room_id = _room AND recipient_id = caller AND seen_at IS NULL
        ORDER BY created_at DESC LIMIT 10
      ) AS n
    ), '[]'::jsonb),
    'mic', (
      SELECT CASE WHEN state = 'live' AND live_until <= now() THEN 'approved' ELSE state END
      FROM study_room_mic_requests WHERE room_id = _room AND user_id = caller
    ),
    'requests', CASE WHEN room_owner = caller THEN COALESCE((
      SELECT jsonb_agg(jsonb_build_object('user_id', m.user_id, 'name', m.display_name, 'state', r.state)
        ORDER BY (r.state = 'pending') DESC, m.display_name)
      FROM study_room_mic_requests AS r
      JOIN study_room_members AS m USING (room_id, user_id)
      WHERE r.room_id = _room AND r.user_id <> caller AND r.state <> 'declined'
    ), '[]'::jsonb) ELSE '[]'::jsonb END,
    'speaker', (
      SELECT jsonb_build_object('user_id', r.user_id, 'name', m.display_name, 'connection_id', r.connection_id)
      FROM study_room_mic_requests AS r
      JOIN study_room_members AS m USING (room_id, user_id)
      WHERE r.room_id = _room AND r.state = 'live' AND r.live_until > now()
    )
  );
END;
$$;
