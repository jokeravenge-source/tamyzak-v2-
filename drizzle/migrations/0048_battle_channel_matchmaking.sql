CREATE TABLE public.battle_channel_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  enabled boolean NOT NULL DEFAULT false,
  chat_id text NOT NULL DEFAULT '',
  invite_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.battle_channel_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.battle_channel_settings FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.battle_channel_settings TO service_role;

CREATE TABLE public.channel_battles (
  id uuid PRIMARY KEY,
  host_user_id uuid NOT NULL,
  guest_user_id uuid,
  room_key uuid NOT NULL DEFAULT gen_random_uuid(),
  host_name text NOT NULL,
  subject text NOT NULL CHECK(subject IN ('physics','chemistry','biology','math','arabic','english','english_literature','french','islamic')),
  chapter integer NOT NULL CHECK(chapter BETWEEN 0 AND 12),
  language text NOT NULL CHECK(language IN ('ar','en')),
  question_count integer NOT NULL CHECK(question_count BETWEEN 1 AND 20),
  status text NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting','claimed','started','cancelled','expired')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL DEFAULT clock_timestamp() + interval '3 minutes',
  host_seen_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  telegram_state text NOT NULL DEFAULT 'pending' CHECK(telegram_state IN ('pending','sending','sent','failed','unknown')),
  telegram_chat_id text,
  telegram_message_id bigint,
  telegram_synced_status text,
  CHECK(guest_user_id IS DISTINCT FROM host_user_id)
);
CREATE UNIQUE INDEX channel_battles_one_waiting_host ON public.channel_battles(host_user_id) WHERE status IN ('waiting','claimed');
CREATE INDEX channel_battles_host_created ON public.channel_battles(host_user_id,created_at DESC);
ALTER TABLE public.channel_battles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.channel_battles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.channel_battles TO authenticated;
GRANT ALL ON public.channel_battles TO service_role;
CREATE POLICY "Only battle participants read channel rooms" ON public.channel_battles FOR SELECT TO authenticated
 USING(auth.uid() = host_user_id OR auth.uid() = guest_user_id);
ALTER TABLE public.channel_battles REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='channel_battles'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_battles;
  END IF;
END $$;

CREATE FUNCTION public.get_battle_channel_config() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  RETURN (SELECT jsonb_build_object('enabled',enabled AND chat_id <> '', 'invite_url',invite_url) FROM public.battle_channel_settings WHERE id);
END $$;

CREATE FUNCTION public._channel_battle_payload(a public.channel_battles) RETURNS jsonb
LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT jsonb_build_object('id',a.id,'host_name',a.host_name,'subject',a.subject,'chapter',a.chapter,
 'language',a.language,'question_count',a.question_count,'status',a.status,'expires_at',a.expires_at,
 'server_now',clock_timestamp(),'room_key',a.room_key,'is_host',a.host_user_id=auth.uid());
$$;
REVOKE ALL ON FUNCTION public._channel_battle_payload(public.channel_battles) FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.create_channel_battle(_id uuid,_subject text,_chapter integer,_language text,_question_count integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.channel_battles; display text; t timestamptz := clock_timestamp();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF NOT coalesce((SELECT enabled FROM public.battle_channel_settings WHERE id),false) THEN RAISE EXCEPTION 'CHANNEL_UNAVAILABLE'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  SELECT * INTO a FROM public.channel_battles WHERE id=_id;
  IF FOUND THEN
    IF a.host_user_id <> auth.uid() THEN RAISE EXCEPTION 'ROOM_NOT_FOUND'; END IF;
    RETURN public._channel_battle_payload(a);
  END IF;
  UPDATE public.channel_battles SET status='expired' WHERE host_user_id=auth.uid() AND status IN ('waiting','claimed')
    AND (expires_at<=t OR host_seen_at<t-interval '35 seconds');
  IF EXISTS(SELECT 1 FROM public.channel_battles WHERE host_user_id=auth.uid() AND status IN ('waiting','claimed')) THEN RAISE EXCEPTION 'ALREADY_WAITING'; END IF;
  IF EXISTS(SELECT 1 FROM public.channel_battles WHERE host_user_id=auth.uid() AND created_at>t-interval '60 seconds') THEN RAISE EXCEPTION 'CHANNEL_RATE_LIMIT'; END IF;
  SELECT left(regexp_replace(btrim(display_name),'[[:space:]]+',' ','g'),40) INTO display FROM public.profiles WHERE user_id=auth.uid();
  INSERT INTO public.channel_battles(id,host_user_id,host_name,subject,chapter,language,question_count)
  VALUES(_id,auth.uid(),coalesce(nullif(display,''),'طالب تميّزك'),_subject,_chapter,_language,_question_count) RETURNING * INTO a;
  RETURN public._channel_battle_payload(a);
END $$;

CREATE FUNCTION public.get_channel_battle(_id uuid,_heartbeat boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.channel_battles; t timestamptz := clock_timestamp();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT * INTO a FROM public.channel_battles WHERE id=_id FOR UPDATE;
  IF NOT FOUND OR (a.host_user_id<>auth.uid() AND a.guest_user_id IS DISTINCT FROM auth.uid()) THEN RAISE EXCEPTION 'ROOM_NOT_FOUND'; END IF;
  IF _heartbeat AND a.host_user_id<>auth.uid() THEN RAISE EXCEPTION 'HOST_REQUIRED'; END IF;
  IF a.status IN ('waiting','claimed') AND (a.expires_at<=t OR a.host_seen_at<t-interval '35 seconds') THEN
    UPDATE public.channel_battles SET status='expired' WHERE id=_id RETURNING * INTO a;
  ELSIF _heartbeat AND a.status IN ('waiting','claimed') THEN
    UPDATE public.channel_battles SET host_seen_at=t WHERE id=_id RETURNING * INTO a;
  END IF;
  RETURN public._channel_battle_payload(a);
END $$;

CREATE FUNCTION public.claim_channel_battle(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.channel_battles; t timestamptz := clock_timestamp();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT * INTO a FROM public.channel_battles WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ROOM_NOT_FOUND'; END IF;
  IF a.host_user_id=auth.uid() THEN RAISE EXCEPTION 'OWN_CHALLENGE'; END IF;
  IF a.status IN ('waiting','claimed') AND (a.expires_at<=t OR a.host_seen_at<t-interval '35 seconds') THEN RAISE EXCEPTION 'ROOM_EXPIRED'; END IF;
  IF a.status='claimed' AND a.guest_user_id=auth.uid() THEN RETURN public._channel_battle_payload(a); END IF;
  IF a.status<>'waiting' THEN RAISE EXCEPTION 'ROOM_TAKEN'; END IF;
  UPDATE public.channel_battles SET guest_user_id=auth.uid(),status='claimed' WHERE id=_id RETURNING * INTO a;
  RETURN public._channel_battle_payload(a);
END $$;

CREATE FUNCTION public.close_channel_battle(_id uuid,_started boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.channel_battles;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT * INTO a FROM public.channel_battles WHERE id=_id AND host_user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'HOST_REQUIRED'; END IF;
  IF a.status IN ('waiting','claimed') THEN
    IF _started AND a.status<>'claimed' THEN RAISE EXCEPTION 'NO_OPPONENT'; END IF;
    UPDATE public.channel_battles SET status=CASE WHEN _started THEN 'started' ELSE 'cancelled' END WHERE id=_id RETURNING * INTO a;
  END IF;
  RETURN public._channel_battle_payload(a);
END $$;

REVOKE ALL ON FUNCTION public.get_battle_channel_config(),public.create_channel_battle(uuid,text,integer,text,integer),
 public.get_channel_battle(uuid,boolean),public.claim_channel_battle(uuid),public.close_channel_battle(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_battle_channel_config(),public.create_channel_battle(uuid,text,integer,text,integer),
 public.get_channel_battle(uuid,boolean),public.claim_channel_battle(uuid),public.close_channel_battle(uuid,boolean) TO authenticated;