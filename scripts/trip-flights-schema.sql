-- Server-owned flight clocks, membership, city ledger and visa redemption.
CREATE TABLE public.study_flight_routes (
  destination_id text PRIMARY KEY,
  plan jsonb NOT NULL
);
CREATE TABLE public.study_flights (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id uuid NOT NULL,
  destination_id text NOT NULL REFERENCES public.study_flight_routes(destination_id),
  plan jsonb NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  arrival_at timestamptz NOT NULL,
  paused_at timestamptz,
  paused_ms bigint NOT NULL DEFAULT 0 CHECK (paused_ms >= 0)
);
CREATE TABLE public.study_flight_members (
  flight_id text NOT NULL REFERENCES public.study_flights(id),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  seat_number integer NOT NULL CHECK (seat_number BETWEEN 1 AND 10),
  PRIMARY KEY (flight_id, user_id),
  UNIQUE (flight_id, seat_number)
);
CREATE TABLE public.study_flight_visits (
  user_id uuid NOT NULL,
  destination_id text NOT NULL REFERENCES public.study_flight_routes(destination_id),
  flight_id text REFERENCES public.study_flights(id),
  legacy_data jsonb,
  sold_at timestamptz,
  arrival_seen_at timestamptz,
  PRIMARY KEY (user_id, destination_id),
  CHECK ((flight_id IS NOT NULL) <> (legacy_data IS NOT NULL))
);
CREATE INDEX study_flights_owner_idx ON public.study_flights(owner_id);
CREATE INDEX study_flight_members_inbox_idx ON public.study_flight_members(user_id, status);
ALTER TABLE public.study_flight_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_flight_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_flight_visits ENABLE ROW LEVEL SECURITY;
-- No direct authenticated grants: all reads and writes use the scoped RPC.
REVOKE ALL ON public.study_flight_routes, public.study_flights, public.study_flight_members, public.study_flight_visits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.study_flight_routes, public.study_flights, public.study_flight_members, public.study_flight_visits TO service_role;

CREATE FUNCTION public.study_flight_inbox_internal(_uid uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'flightId', f.id, 'hostName', coalesce(p.display_name, 'Student'),
    'city', f.plan->>'destCity', 'cityAr', f.plan->>'destCityAr',
    'arrivalAt', extract(epoch FROM f.arrival_at)*1000
  ) ORDER BY f.started_at DESC), '[]'::jsonb)
  FROM public.study_flight_members m
  JOIN public.study_flights f ON f.id = m.flight_id
  LEFT JOIN public.profiles p ON p.user_id = f.owner_id
  WHERE m.user_id = _uid AND m.status = 'pending'
    AND (f.paused_at IS NOT NULL OR f.arrival_at > now());
$$;

CREATE FUNCTION public.study_flight_snapshot_internal(_uid uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object('userId', _uid, 'serverNow', extract(epoch FROM now())*1000,
    'journeys', coalesce((SELECT jsonb_agg(q.data ORDER BY (q.data->>'startedAt')::numeric DESC) FROM (
      SELECT f.plan || jsonb_build_object(
        'id', f.id, 'studentId', _uid, 'hostId', f.owner_id,
        'startedAt', extract(epoch FROM f.started_at)*1000,
        'arrivalAt', extract(epoch FROM f.arrival_at)*1000,
        'pausedAt', extract(epoch FROM f.paused_at)*1000, 'pausedMs', f.paused_ms,
        'arrivalSeenAt', extract(epoch FROM v.arrival_seen_at)*1000,
        'status', CASE WHEN f.paused_at IS NULL AND f.arrival_at <= now() THEN 'arrived' ELSE 'in_flight' END,
        'visaSoldAt', extract(epoch FROM v.sold_at)*1000, 'canSell', true, 'legacy', false,
        'passengers', CASE WHEN f.paused_at IS NULL AND f.arrival_at <= now() THEN '[]'::jsonb ELSE (
          SELECT coalesce(jsonb_agg(jsonb_build_object('userId', people.user_id,
            'displayName', coalesce(p.display_name, 'Student'), 'gender', p.gender,
            'character', p.character, 'status', people.status, 'seatNumber', people.seat_number
          ) ORDER BY people.seat_number), '[]'::jsonb)
          FROM (SELECT f.owner_id AS user_id, 'accepted'::text AS status, 0 AS seat_number
            UNION ALL SELECT m.user_id, m.status, m.seat_number FROM public.study_flight_members m
            WHERE m.flight_id = f.id AND (m.status = 'accepted' OR f.owner_id = _uid)) people
          LEFT JOIN public.profiles p ON p.user_id = people.user_id
        ) END
      ) AS data
      FROM public.study_flight_visits v JOIN public.study_flights f ON f.id = v.flight_id
      WHERE v.user_id = _uid
      UNION ALL
      SELECT v.legacy_data || jsonb_build_object('studentId', _uid, 'destinationId', v.destination_id,
        'legacy', true, 'canSell', false, 'visaSoldAt', null, 'passengers', '[]'::jsonb)
      FROM public.study_flight_visits v WHERE v.user_id = _uid AND v.legacy_data IS NOT NULL
    ) q), '[]'::jsonb),
    'invitations', public.study_flight_inbox_internal(_uid));
$$;

CREATE FUNCTION public.study_flights_action(
  _action text, _flight_id text DEFAULT NULL, _destination_id text DEFAULT NULL,
  _invitee_id uuid DEFAULT NULL, _accept boolean DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  _uid uuid := auth.uid();
  _f public.study_flights%ROWTYPE;
  _visit public.study_flight_visits%ROWTYPE;
  _member public.study_flight_members%ROWTYPE;
  _route jsonb;
  _count integer;
  _point_id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  IF _action = 'state' THEN RETURN public.study_flight_snapshot_internal(_uid); END IF;
  IF _action = 'inbox' THEN RETURN public.study_flight_inbox_internal(_uid); END IF;
  -- Start and accept serialize for this account across tabs/devices.
  IF _action IN ('create', 'respond') THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('study-flight-user:' || _uid::text, 0));
  END IF;
  IF _action = 'create' THEN
    SELECT f.* INTO _f FROM public.study_flights f JOIN public.study_flight_visits v ON v.flight_id = f.id
    WHERE v.user_id = _uid AND (f.paused_at IS NOT NULL OR f.arrival_at > now()) LIMIT 1;
    IF FOUND THEN RETURN jsonb_build_object('journeyId', _f.id, 'created', false); END IF;
    SELECT plan INTO _route FROM public.study_flight_routes WHERE destination_id = _destination_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'unknown_destination'; END IF;
    IF EXISTS (SELECT 1 FROM public.study_flight_visits WHERE user_id = _uid AND destination_id = _destination_id) THEN
      RAISE EXCEPTION 'city_already_visited';
    END IF;
    INSERT INTO public.study_flights(owner_id, destination_id, plan, arrival_at)
    VALUES (_uid, _destination_id, _route, now() + make_interval(secs => (_route->>'durationSec')::double precision))
    RETURNING * INTO _f;
    INSERT INTO public.study_flight_visits(user_id, destination_id, flight_id) VALUES (_uid, _destination_id, _f.id);
    RETURN jsonb_build_object('journeyId', _f.id, 'created', true);
  END IF;
  IF _action = 'sell' THEN
    SELECT * INTO _visit FROM public.study_flight_visits WHERE user_id = _uid AND flight_id = _flight_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'visa_not_redeemable'; END IF;
    SELECT * INTO _f FROM public.study_flights WHERE id = _visit.flight_id FOR UPDATE;
    SELECT * INTO _visit FROM public.study_flight_visits WHERE user_id = _uid AND flight_id = _flight_id FOR UPDATE;
    IF _visit.sold_at IS NOT NULL THEN RETURN jsonb_build_object('points', 0); END IF;
    IF _f.paused_at IS NOT NULL OR _f.arrival_at > now() THEN RAISE EXCEPTION 'flight_not_arrived'; END IF;
    UPDATE public.study_flight_visits SET sold_at = now() WHERE user_id = _uid AND destination_id = _visit.destination_id;
    INSERT INTO public.user_points(user_id, source, points, ref_id)
    VALUES (_uid, 'trip_visa', 100, _visit.destination_id)
    ON CONFLICT DO NOTHING RETURNING id INTO _point_id;
    RETURN jsonb_build_object('points', CASE WHEN _point_id IS NULL THEN 0 ELSE 100 END);
  END IF;
  SELECT * INTO _f FROM public.study_flights WHERE id = _flight_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'flight_not_found'; END IF;
  IF _action = 'respond' THEN
    SELECT * INTO _member FROM public.study_flight_members WHERE flight_id = _flight_id AND user_id = _uid FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'invitation_not_found'; END IF;
    IF _member.status <> 'pending' THEN
      IF (_member.status = 'accepted') = coalesce(_accept, false) THEN RETURN 'true'::jsonb; END IF;
      RAISE EXCEPTION 'invitation_already_answered';
    END IF;
    IF NOT coalesce(_accept, false) THEN
      UPDATE public.study_flight_members SET status = 'declined' WHERE flight_id = _flight_id AND user_id = _uid;
      RETURN 'true'::jsonb;
    END IF;
    IF _f.paused_at IS NULL AND _f.arrival_at <= now() THEN RAISE EXCEPTION 'flight_not_active'; END IF;
    IF EXISTS (SELECT 1 FROM public.study_flight_visits WHERE user_id = _uid AND destination_id = _f.destination_id) THEN
      RAISE EXCEPTION 'city_already_visited';
    END IF;
    IF EXISTS (SELECT 1 FROM public.study_flight_visits v JOIN public.study_flights f ON f.id = v.flight_id
      WHERE v.user_id = _uid AND (f.paused_at IS NOT NULL OR f.arrival_at > now())) THEN RAISE EXCEPTION 'already_in_flight'; END IF;
    INSERT INTO public.study_flight_visits(user_id, destination_id, flight_id) VALUES (_uid, _f.destination_id, _flight_id);
    UPDATE public.study_flight_members SET status = 'accepted' WHERE flight_id = _flight_id AND user_id = _uid;
    RETURN 'true'::jsonb;
  END IF;
  IF _action = 'seen' THEN
    IF _f.paused_at IS NOT NULL OR _f.arrival_at > now() THEN RAISE EXCEPTION 'flight_not_arrived'; END IF;
    UPDATE public.study_flight_visits SET arrival_seen_at = coalesce(arrival_seen_at, now()) WHERE user_id = _uid AND flight_id = _flight_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'flight_not_found'; END IF;
    RETURN 'true'::jsonb;
  END IF;
  IF _f.owner_id <> _uid THEN RAISE EXCEPTION 'host_only'; END IF;
  IF _f.paused_at IS NULL AND _f.arrival_at <= now() THEN RAISE EXCEPTION 'flight_not_active'; END IF;
  IF _action = 'invite' THEN
    IF _invitee_id = _uid OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _invitee_id) THEN RAISE EXCEPTION 'invalid_student'; END IF;
    SELECT * INTO _member FROM public.study_flight_members WHERE flight_id = _flight_id AND user_id = _invitee_id;
    IF FOUND THEN RETURN 'true'::jsonb; END IF;
    IF EXISTS (SELECT 1 FROM public.study_flight_visits WHERE user_id = _invitee_id AND destination_id = _f.destination_id) THEN RAISE EXCEPTION 'friend_city_already_visited'; END IF;
    SELECT count(*) INTO _count FROM public.study_flight_members WHERE flight_id = _flight_id;
    IF _count >= 10 THEN RAISE EXCEPTION 'flight_full'; END IF;
    INSERT INTO public.study_flight_members(flight_id, user_id, seat_number) VALUES (_flight_id, _invitee_id, _count + 1);
  ELSIF _action = 'pause' THEN
    IF _f.paused_at IS NULL THEN UPDATE public.study_flights SET paused_at = now() WHERE id = _flight_id; END IF;
  ELSIF _action = 'resume' THEN
    IF _f.paused_at IS NOT NULL THEN UPDATE public.study_flights
      SET arrival_at = arrival_at + (now() - paused_at),
        paused_ms = paused_ms + round(extract(epoch FROM (now() - paused_at))*1000)::bigint,
        paused_at = NULL WHERE id = _flight_id; END IF;
  ELSE RAISE EXCEPTION 'unknown_flight_action';
  END IF;
  RETURN 'true'::jsonb;
END;
$$;

-- Even a different generic points RPC may not mint a trip_visa award.
-- The sold ledger transition and award occur in the same transaction.
CREATE FUNCTION public.validate_flight_visa_points() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NEW.source = 'trip_visa' AND (NEW.points <> 100 OR NOT EXISTS (
    SELECT 1 FROM public.study_flight_visits v JOIN public.study_flights f ON f.id = v.flight_id
    WHERE v.user_id = NEW.user_id AND v.destination_id = NEW.ref_id AND v.sold_at IS NOT NULL
      AND f.paused_at IS NULL AND f.arrival_at <= now()
  )) THEN RAISE EXCEPTION 'unverified_flight_visa'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_flight_visa_points BEFORE INSERT ON public.user_points FOR EACH ROW EXECUTE FUNCTION public.validate_flight_visa_points();
REVOKE ALL ON FUNCTION public.study_flight_inbox_internal(uuid), public.study_flight_snapshot_internal(uuid), public.validate_flight_visa_points() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.study_flights_action(text,text,text,uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.study_flights_action(text,text,text,uuid,boolean) TO authenticated;

-- Filled after the immutable route catalog is inserted below. Freeze legacy
-- city history so selling a new visa or editing old browser JSON cannot reset it.
