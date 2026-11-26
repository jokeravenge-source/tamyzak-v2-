CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.study_room_encouragements (
  room_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  sender_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  seen_at timestamptz,
  PRIMARY KEY (room_id, sender_id, recipient_id),
  FOREIGN KEY (room_id, recipient_id) REFERENCES public.study_room_members(room_id, user_id) ON DELETE CASCADE,
  CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS study_room_encouragements_inbox ON public.study_room_encouragements (room_id, recipient_id, created_at DESC)
  WHERE seen_at IS NULL;

CREATE TABLE IF NOT EXISTS public.study_room_mic_requests (
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  state text NOT NULL CHECK (state IN ('pending', 'approved', 'declined', 'live')),
  connection_id uuid,
  live_until timestamptz,
  PRIMARY KEY (room_id, user_id),
  FOREIGN KEY (room_id, user_id) REFERENCES public.study_room_members(room_id, user_id) ON DELETE CASCADE,
  CHECK ((state = 'live') = (connection_id IS NOT NULL AND live_until IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS study_room_one_speaker ON public.study_room_mic_requests (room_id) WHERE state = 'live';

ALTER TABLE public.study_room_encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_room_mic_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_room_encouragements, public.study_room_mic_requests FROM PUBLIC, anon, authenticated;

-- Clients receive only state invalidations and their own call setup messages.
-- There is deliberately no broadcast INSERT policy for these topics.
DROP POLICY IF EXISTS "Study room members receive activity broadcasts" ON realtime.messages;
CREATE POLICY "Study room members receive activity broadcasts"
ON realtime.messages FOR SELECT TO authenticated
USING (
  extension = 'broadcast'
  AND EXISTS (
    SELECT 1 FROM public.study_room_members AS member
    JOIN public.study_rooms AS room ON room.id = member.room_id AND room.is_active
    WHERE member.user_id = (SELECT auth.uid())
      AND NOT public.is_banned_from_room(member.room_id)
      AND realtime.topic() IN (
        'study-room-activity:' || member.room_id::text,
        'study-room-inbox:' || member.room_id::text || ':' || member.user_id::text
      )
  )
);

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
        SELECT sender_id, sender_name, created_at FROM study_room_encouragements
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

CREATE OR REPLACE FUNCTION public.encourage_study_room_member(_room uuid, _recipient uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  sender text;
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

  INSERT INTO study_room_encouragements (room_id, sender_id, recipient_id, sender_name)
  VALUES (_room, caller, _recipient, sender)
  ON CONFLICT (room_id, sender_id, recipient_id) DO UPDATE
    SET sender_name = EXCLUDED.sender_name, created_at = now(), seen_at = NULL
    WHERE study_room_encouragements.created_at <= now() - interval '1 minute';
  IF NOT FOUND THEN RAISE EXCEPTION 'ENCOURAGEMENT_COOLDOWN'; END IF;

  PERFORM realtime.send('{}'::jsonb, 'changed', 'study-room-inbox:' || _room::text || ':' || _recipient::text, true);
END;
$$;

CREATE OR REPLACE FUNCTION public.dismiss_study_room_encouragements(_room uuid, _through timestamptz)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE study_room_encouragements SET seen_at = now()
  WHERE room_id = _room AND recipient_id = auth.uid() AND seen_at IS NULL AND created_at <= _through;
$$;

CREATE OR REPLACE FUNCTION public.set_study_room_mic(_room uuid, _action text, _requester uuid DEFAULT NULL, _connection uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  room_owner uuid;
BEGIN
  IF caller IS NULL OR NOT is_study_room_member(_room) OR is_banned_from_room(_room) THEN
    RAISE EXCEPTION 'ROOM_MEMBERSHIP_REQUIRED';
  END IF;

  IF _action = 'heartbeat' THEN
    UPDATE study_room_mic_requests SET live_until = now() + interval '30 seconds'
    WHERE room_id = _room AND user_id = caller AND state = 'live'
      AND connection_id = _connection AND live_until > now()
      AND EXISTS (SELECT 1 FROM study_rooms WHERE id = _room AND is_active);
    IF NOT FOUND THEN RAISE EXCEPTION 'MIC_ENDED'; END IF;
    RETURN;
  END IF;

  SELECT owner_id INTO room_owner FROM study_rooms WHERE id = _room AND is_active FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ROOM_MEMBERSHIP_REQUIRED'; END IF;

  CASE _action
    WHEN 'request' THEN
      INSERT INTO study_room_mic_requests (room_id, user_id, state) VALUES (_room, caller, 'pending')
      ON CONFLICT (room_id, user_id) DO UPDATE SET state = 'pending'
      WHERE study_room_mic_requests.state = 'declined';
    WHEN 'approve', 'decline', 'revoke' THEN
      IF caller <> room_owner THEN RAISE EXCEPTION 'ROOM_OWNER_REQUIRED'; END IF;
      UPDATE study_room_mic_requests
      SET state = CASE WHEN _action = 'approve' THEN 'approved' ELSE 'declined' END,
        connection_id = NULL, live_until = NULL
      WHERE room_id = _room AND user_id = _requester AND user_id <> caller
        AND ((_action <> 'revoke' AND state = 'pending') OR (_action = 'revoke' AND state IN ('approved', 'live')));
      IF NOT FOUND THEN RAISE EXCEPTION 'MIC_REQUEST_CHANGED'; END IF;
    WHEN 'start' THEN
      IF _connection IS NULL THEN RAISE EXCEPTION 'MIC_CONNECTION_REQUIRED'; END IF;
      UPDATE study_room_mic_requests SET state = 'approved', live_until = NULL, connection_id = NULL
      WHERE room_id = _room AND state = 'live' AND live_until <= now();
      IF EXISTS (SELECT 1 FROM study_room_mic_requests WHERE room_id = _room AND state = 'live') THEN
        RAISE EXCEPTION 'MIC_IN_USE';
      END IF;
      IF caller = room_owner THEN
        INSERT INTO study_room_mic_requests (room_id, user_id, state) VALUES (_room, caller, 'approved')
        ON CONFLICT (room_id, user_id) DO UPDATE SET state = 'approved';
      END IF;
      UPDATE study_room_mic_requests SET state = 'live', connection_id = _connection, live_until = now() + interval '30 seconds'
      WHERE room_id = _room AND user_id = caller AND state = 'approved';
      IF NOT FOUND THEN RAISE EXCEPTION 'MIC_APPROVAL_REQUIRED'; END IF;
    WHEN 'stop' THEN
      UPDATE study_room_mic_requests SET state = 'approved', connection_id = NULL, live_until = NULL
      WHERE room_id = _room AND user_id = caller AND state = 'live' AND connection_id = _connection;
    ELSE RAISE EXCEPTION 'MIC_INVALID_ACTION';
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_study_room_mic_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.state = NEW.state AND OLD.connection_id IS NOT DISTINCT FROM NEW.connection_id THEN
    RETURN NULL;
  END IF;
  PERFORM realtime.send('{}'::jsonb, 'changed',
    'study-room-activity:' || COALESCE(NEW.room_id, OLD.room_id)::text, true);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS notify_study_room_mic_change ON public.study_room_mic_requests;
CREATE TRIGGER notify_study_room_mic_change AFTER INSERT OR UPDATE OR DELETE ON public.study_room_mic_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_study_room_mic_change();

CREATE OR REPLACE FUNCTION public.reset_study_room_mic_on_transfer()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM study_room_mic_requests WHERE room_id = OLD.id;
  PERFORM realtime.send('{}'::jsonb, 'changed', 'study-room-activity:' || OLD.id::text, true);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS reset_study_room_mic_on_transfer ON public.study_rooms;
CREATE TRIGGER reset_study_room_mic_on_transfer AFTER UPDATE OF owner_id, is_active ON public.study_rooms
FOR EACH ROW WHEN (OLD.owner_id IS DISTINCT FROM NEW.owner_id OR (OLD.is_active AND NOT NEW.is_active))
EXECUTE FUNCTION public.reset_study_room_mic_on_transfer();

CREATE OR REPLACE FUNCTION public.disconnect_study_room_listener()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  speaker study_room_mic_requests%ROWTYPE;
BEGIN
  SELECT * INTO speaker FROM study_room_mic_requests
  WHERE room_id = OLD.room_id AND state = 'live' AND live_until > now() AND user_id <> OLD.user_id;
  IF FOUND THEN
    PERFORM realtime.send(
      jsonb_build_object('from', OLD.user_id, 'connection', speaker.connection_id, 'attempt', NULL::uuid,
        'description', jsonb_build_object('type', 'leave')),
      'voice', 'study-room-inbox:' || OLD.room_id::text || ':' || speaker.user_id::text, true);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS disconnect_study_room_listener ON public.study_room_members;
CREATE TRIGGER disconnect_study_room_listener AFTER DELETE ON public.study_room_members
FOR EACH ROW EXECUTE FUNCTION public.disconnect_study_room_listener();

CREATE OR REPLACE FUNCTION public.signal_study_room_voice(_room uuid, _target uuid, _connection uuid, _attempt uuid, _description jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  speaker uuid;
  kind text := _description ->> 'type';
BEGIN
  IF caller IS NULL OR _target IS NULL OR _attempt IS NULL OR caller = _target OR
     NOT is_study_room_member(_room) OR is_banned_from_room(_room)
     OR NOT EXISTS (SELECT 1 FROM study_rooms WHERE id = _room AND is_active)
     OR NOT EXISTS (SELECT 1 FROM study_room_members WHERE room_id = _room AND user_id = _target)
     OR EXISTS (SELECT 1 FROM study_room_bans WHERE room_id = _room AND user_id = _target) THEN
    RAISE EXCEPTION 'ROOM_MEMBERSHIP_REQUIRED';
  END IF;
  SELECT user_id INTO speaker FROM study_room_mic_requests
    WHERE room_id = _room AND state = 'live' AND connection_id = _connection AND live_until > now();
  IF speaker IS NULL OR kind IS NULL OR kind NOT IN ('offer', 'answer', 'leave')
     OR (kind <> 'leave' AND (jsonb_typeof(_description -> 'sdp') IS DISTINCT FROM 'string' OR length(_description ->> 'sdp') > 24000))
     OR (kind IN ('offer', 'leave') AND _target <> speaker) OR (kind = 'answer' AND caller <> speaker) THEN
    RAISE EXCEPTION 'MIC_SIGNAL_REJECTED';
  END IF;
  PERFORM realtime.send(jsonb_build_object('from', caller, 'connection', _connection, 'attempt', _attempt,
    'description', jsonb_build_object('type', kind, 'sdp', _description ->> 'sdp')),
    'voice', 'study-room-inbox:' || _room::text || ':' || _target::text, true);
END;
$$;

-- A coturn-compatible relay is optional. Keep its shared secret in Vault and
-- give members credentials that expire without exposing that shared secret.
CREATE OR REPLACE FUNCTION public.study_room_voice_ice(_room uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  relay_urls text;
  relay_secret text;
  relay_username text;
BEGIN
  IF auth.uid() IS NULL OR NOT is_study_room_member(_room) OR is_banned_from_room(_room)
     OR NOT EXISTS (SELECT 1 FROM study_rooms WHERE id = _room AND is_active) THEN
    RAISE EXCEPTION 'ROOM_MEMBERSHIP_REQUIRED';
  END IF;

  SELECT decrypted_secret INTO relay_urls FROM vault.decrypted_secrets WHERE name = 'study_room_turn_urls';
  SELECT decrypted_secret INTO relay_secret FROM vault.decrypted_secrets WHERE name = 'study_room_turn_secret';
  IF COALESCE(relay_urls, '') = '' OR COALESCE(relay_secret, '') = '' THEN RETURN '[]'::jsonb; END IF;

  relay_username := (extract(epoch FROM now() + interval '1 hour')::bigint)::text || ':' || auth.uid()::text;
  RETURN jsonb_build_array(jsonb_build_object(
    'urls', regexp_split_to_array(trim(relay_urls), '\s*,\s*'),
    'username', relay_username,
    'credential', encode(hmac(relay_username, relay_secret, 'sha1'), 'base64')
  ));
END;
$$;

REVOKE ALL ON FUNCTION public.study_room_activity(uuid),
  public.encourage_study_room_member(uuid, uuid), public.dismiss_study_room_encouragements(uuid, timestamptz),
  public.set_study_room_mic(uuid, text, uuid, uuid), public.signal_study_room_voice(uuid, uuid, uuid, uuid, jsonb), public.study_room_voice_ice(uuid),
  public.notify_study_room_mic_change(), public.reset_study_room_mic_on_transfer(),
  public.disconnect_study_room_listener() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.study_room_activity(uuid),
  public.encourage_study_room_member(uuid, uuid), public.dismiss_study_room_encouragements(uuid, timestamptz),
  public.set_study_room_mic(uuid, text, uuid, uuid), public.signal_study_room_voice(uuid, uuid, uuid, uuid, jsonb),
  public.study_room_voice_ice(uuid) TO authenticated;
