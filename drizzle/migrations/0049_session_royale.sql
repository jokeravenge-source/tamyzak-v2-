-- The scheduled session and private group battles share one timed, server-scored engine.
CREATE TABLE public.session_royales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot timestamptz UNIQUE,
  host_id uuid,
  expires_at timestamptz NOT NULL,
  starts_at timestamptz,
  cancelled boolean NOT NULL DEFAULT false,
  subject text,
  chapter integer,
  language text,
  questions jsonb NOT NULL DEFAULT '[]',
  CHECK ((slot IS NULL) <> (host_id IS NULL))
);
CREATE TABLE public.session_royale_votes (
  round_id uuid REFERENCES public.session_royales ON DELETE CASCADE,
  user_id uuid NOT NULL,
  subject text NOT NULL,
  chapter integer NOT NULL,
  language text NOT NULL,
  cast_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (round_id,user_id)
);
CREATE TABLE public.session_royale_players (
  round_id uuid REFERENCES public.session_royales ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  PRIMARY KEY (round_id,user_id)
);
CREATE TABLE public.session_royale_answers (
  round_id uuid NOT NULL,
  user_id uuid NOT NULL,
  question_index integer NOT NULL,
  choice integer NOT NULL,
  correct boolean NOT NULL,
  PRIMARY KEY (round_id,user_id,question_index),
  FOREIGN KEY (round_id,user_id) REFERENCES public.session_royale_players ON DELETE CASCADE
);
CREATE TABLE public.session_telegram_posts (
  slot timestamptz NOT NULL,
  kind text NOT NULL CHECK (kind IN ('session','battle')),
  state text NOT NULL DEFAULT 'sending' CHECK (state IN ('sending','sent','failed','unknown')),
  telegram_message_id text,
  PRIMARY KEY (slot,kind)
);
ALTER TABLE public.session_royales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_royale_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_royale_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_royale_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_telegram_posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.session_royales,public.session_royale_votes,public.session_royale_players,
  public.session_royale_answers,public.session_telegram_posts FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.session_royales,public.session_royale_votes,public.session_royale_players,
  public.session_royale_answers,public.session_telegram_posts TO service_role;
ALTER POLICY "Users can send invites" ON public.battle_invites
  WITH CHECK (auth.uid()=from_user_id AND from_user_id<>to_user_id AND status='pending' AND room_code NOT LIKE 'br:%');

CREATE FUNCTION public._royale_slot(_at timestamptz) RETURNS timestamptz
LANGUAGE sql IMMUTABLE SET search_path=public AS $$
  SELECT date_bin(interval '3 hours',_at,'2000-01-01 00:00:00 Asia/Baghdad'::timestamptz)
$$;

CREATE FUNCTION public._royale_study_member(_user uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM study_room_members m JOIN study_rooms r ON r.id=m.room_id
    WHERE m.user_id=_user AND r.code='37ECJK' AND r.is_active)
$$;

CREATE FUNCTION public._royale_bank(_subject text,_chapter int,_language text) RETURNS jsonb
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=public AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object('q',question,'choices',choices,'answer',answer_index) ORDER BY position),'[]')
  FROM (
    SELECT question,choices,answer_index,random() AS position
    FROM mcq_banks WHERE subject=_subject AND (_chapter=0 OR chapter=_chapter) AND language=_language
      AND length(trim(question))>0 AND CASE WHEN jsonb_typeof(choices)='array'
        THEN jsonb_array_length(choices)>=2 AND answer_index BETWEEN 0 AND jsonb_array_length(choices)-1 ELSE false END
    ORDER BY position LIMIT 10
  ) chosen
$$;

-- Serialize poll closure and tally complete ballots, not individual fields.
CREATE FUNCTION public._royale_finalize(_slot timestamptz) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r session_royales; topic record; bank jsonb;
BEGIN
  IF clock_timestamp() < _slot + interval '3 minutes' THEN RETURN NULL; END IF;
  SELECT * INTO r FROM session_royales WHERE slot=_slot FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF r.cancelled THEN RETURN NULL; END IF;
  IF r.starts_at IS NOT NULL THEN RETURN r.id; END IF;
  FOR topic IN SELECT v.subject,v.chapter,v.language FROM session_royale_votes v
    WHERE v.round_id=r.id GROUP BY v.subject,v.chapter,v.language
    ORDER BY count(*) DESC,min(v.cast_at),v.subject,v.chapter,v.language
  LOOP
    bank := _royale_bank(topic.subject,topic.chapter,topic.language);
    IF jsonb_array_length(bank)>0 THEN
      UPDATE session_royales SET subject=topic.subject,chapter=topic.chapter,language=topic.language,
        questions=bank,starts_at=_slot+interval '5 minutes' WHERE id=r.id;
      RETURN r.id;
    END IF;
  END LOOP;
  UPDATE session_royales SET cancelled=true WHERE id=r.id;
  RETURN NULL;
END $$;

CREATE FUNCTION public.session_royale_poll(_vote jsonb DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor uuid:=auth.uid(); moment timestamptz:=clock_timestamp(); boundary timestamptz:=_royale_slot(moment);
  r session_royales; topics jsonb; chosen jsonb; topic_subject text; topic_language text; topic_chapter int;
BEGIN
  IF actor IS NULL OR NOT _royale_study_member(actor) THEN RETURN NULL; END IF;
  IF moment < boundary+interval '3 minutes' THEN
    INSERT INTO session_royales(slot,expires_at) VALUES(boundary,boundary+interval '15 minutes')
      ON CONFLICT(slot) DO NOTHING;
    SELECT * INTO r FROM session_royales WHERE slot=boundary;
    IF _vote IS NOT NULL THEN
      PERFORM 1 FROM session_royales WHERE id=r.id FOR UPDATE;
      IF clock_timestamp()>=boundary+interval '3 minutes' THEN RAISE EXCEPTION 'POLL_CLOSED'; END IF;
      topic_subject:=_vote->>'subject'; topic_language:=_vote->>'language'; topic_chapter:=(_vote->>'chapter')::int;
      IF topic_chapter IS NULL OR topic_chapter<1 OR topic_language IS NULL OR topic_language NOT IN ('ar','en')
        OR jsonb_array_length(_royale_bank(topic_subject,topic_chapter,topic_language))=0 THEN
        RAISE EXCEPTION 'INVALID_TOPIC';
      END IF;
      INSERT INTO session_royale_votes(round_id,user_id,subject,chapter,language)
        VALUES(r.id,actor,topic_subject,topic_chapter,topic_language)
        ON CONFLICT(round_id,user_id) DO UPDATE SET subject=excluded.subject,chapter=excluded.chapter,
          language=excluded.language,cast_at=EXCLUDED.cast_at;
    END IF;
    SELECT jsonb_build_object('subject',subject,'chapter',chapter,'language',language) INTO chosen
      FROM session_royale_votes WHERE round_id=r.id AND user_id=actor;
    -- The pairs are exposed only during the voting window.
    WITH eligible AS (
      SELECT DISTINCT subject,chapter,language FROM mcq_banks
      WHERE chapter>0 AND language IN ('ar','en') AND length(trim(question))>0
        AND CASE WHEN jsonb_typeof(choices)='array'
          THEN jsonb_array_length(choices)>=2 AND answer_index BETWEEN 0 AND jsonb_array_length(choices)-1 ELSE false END
    ) SELECT coalesce(jsonb_agg(to_jsonb(eligible) ORDER BY language,subject,chapter),'[]') INTO topics FROM eligible;
    RETURN jsonb_build_object('id',r.id,'state','voting','closes_at',boundary+interval '3 minutes','vote',chosen,'topics',topics);
  END IF;
  IF _vote IS NOT NULL THEN RAISE EXCEPTION 'POLL_CLOSED'; END IF;
  IF moment>=boundary+interval '15 minutes' THEN RETURN NULL; END IF;
  PERFORM _royale_finalize(boundary);
  SELECT * INTO r FROM session_royales WHERE slot=boundary;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object('id',r.id,'state',CASE WHEN r.cancelled THEN 'no_votes' ELSE 'ready' END,
     'subject',r.subject,'chapter',r.chapter,'language',r.language,'starts_at',r.starts_at);
END $$;

CREATE FUNCTION public.create_study_royale(_invitees uuid[],_subject text,_chapter int,_language text,_questions jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor uuid:=auth.uid(); round_id uuid; display text;
BEGIN
  IF actor IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF coalesce(cardinality(_invitees),0) NOT BETWEEN 1 AND 10 OR actor=ANY(_invitees)
     OR (SELECT count(DISTINCT uid) FROM unnest(_invitees) AS u(uid))<>cardinality(_invitees)
     OR (SELECT count(*) FROM profiles WHERE user_id=ANY(_invitees))<>cardinality(_invitees) THEN
    RAISE EXCEPTION 'INVALID_INVITEES';
  END IF;
  IF _subject IS NULL OR _subject !~ '^[a-z_]{2,40}$' OR _chapter IS NULL OR _chapter<0
     OR _language IS NULL OR _language NOT IN ('ar','en') OR _questions IS NULL
     OR jsonb_typeof(_questions)<>'array' OR jsonb_array_length(_questions) NOT BETWEEN 1 AND 20
     OR pg_column_size(_questions)>153600 THEN RAISE EXCEPTION 'INVALID_QUESTIONS'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(_questions) q
    WHERE NOT coalesce(CASE WHEN jsonb_typeof(q->'choices')='array' AND (q->>'answer') ~ '^[0-9]{1,2}$'
      THEN length(trim(q->>'q'))>0 AND jsonb_array_length(q->'choices')>=2
        AND (q->>'answer')::integer < jsonb_array_length(q->'choices')
        AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(q->'choices') c WHERE jsonb_typeof(c)<>'string')
      ELSE false END,false)) THEN RAISE EXCEPTION 'INVALID_QUESTIONS'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(actor::text,0));
  IF EXISTS(SELECT 1 FROM session_royales WHERE host_id=actor AND starts_at IS NULL AND NOT cancelled AND expires_at>clock_timestamp()) THEN
    RAISE EXCEPTION 'ROOM_ALREADY_OPEN';
  END IF;
  SELECT left(display_name,40) INTO display FROM profiles WHERE user_id=actor;
  INSERT INTO session_royales(host_id,expires_at,subject,chapter,language,questions)
    VALUES(actor,clock_timestamp()+interval '3 minutes',_subject,_chapter,_language,_questions) RETURNING id INTO round_id;
  INSERT INTO session_royale_players VALUES(round_id,actor,coalesce(nullif(trim(display),''),'Student'));
  INSERT INTO battle_invites(from_user_id,to_user_id,from_name,room_code,subject,chapter,language,question_count,status)
    SELECT actor,invitee,coalesce(nullif(trim(display),''),'Student'),'br:'||round_id,_subject,_chapter,_language,
      jsonb_array_length(_questions),'pending' FROM unnest(_invitees) AS i(invitee);
  RETURN round_id;
END $$;

CREATE FUNCTION public.study_royale(_id uuid,_action text DEFAULT 'status',_index int DEFAULT NULL,_choice int DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor uuid:=auth.uid(); r session_royales; now_at timestamptz; player boolean; population int;
  elapsed int; idx int; q jsonb; state text; picked int; results jsonb; display text;
BEGIN
  IF actor IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF _action IS NULL OR _action NOT IN ('status','join','start','leave','answer') THEN RAISE EXCEPTION 'INVALID_ACTION'; END IF;
  IF _action='status' THEN SELECT * INTO r FROM session_royales WHERE id=_id;
  ELSE SELECT * INTO r FROM session_royales WHERE id=_id FOR UPDATE; END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'ROOM_NOT_AVAILABLE'; END IF;
  now_at:=clock_timestamp();
  IF r.slot IS NOT NULL AND r.starts_at IS NULL THEN RAISE EXCEPTION 'ROOM_NOT_AVAILABLE'; END IF;
  SELECT EXISTS(SELECT 1 FROM session_royale_players WHERE round_id=_id AND user_id=actor) INTO player;
  IF _action='join' AND NOT player AND NOT r.cancelled AND now_at<r.expires_at
     AND (r.starts_at IS NULL OR now_at<r.starts_at) THEN
    IF r.slot IS NULL THEN
      IF NOT EXISTS(SELECT 1 FROM battle_invites WHERE room_code='br:'||_id AND from_user_id=r.host_id AND to_user_id=actor AND status='accepted')
        THEN RAISE EXCEPTION 'INVITE_REQUIRED'; END IF;
    ELSIF NOT _royale_study_member(actor) THEN RAISE EXCEPTION 'ROOM_MEMBERS_ONLY'; END IF;
    IF (SELECT count(*) FROM session_royale_players WHERE round_id=_id)>=11 THEN RAISE EXCEPTION 'ROOM_FULL'; END IF;
    SELECT left(display_name,40) INTO display FROM profiles WHERE user_id=actor;
    INSERT INTO session_royale_players VALUES(_id,actor,coalesce(nullif(trim(display),''),'Student'));
    player:=true;
  END IF;
  IF NOT player THEN RAISE EXCEPTION 'ROOM_NOT_AVAILABLE'; END IF;
  SELECT count(*) INTO population FROM session_royale_players WHERE round_id=_id;
  IF _action='leave' AND NOT r.cancelled AND (r.starts_at IS NULL OR now_at<r.starts_at) THEN
    IF actor=r.host_id THEN
      UPDATE session_royales SET cancelled=true WHERE id=_id;
      UPDATE battle_invites SET status='cancelled' WHERE room_code='br:'||_id AND from_user_id=actor AND status='pending';
    ELSE DELETE FROM session_royale_players WHERE round_id=_id AND user_id=actor; END IF;
    RETURN NULL;
  END IF;
  IF _action='start' AND r.host_id=actor AND r.starts_at IS NULL AND NOT r.cancelled AND now_at<r.expires_at THEN
    IF population<2 THEN RAISE EXCEPTION 'NEED_TWO_PLAYERS'; END IF;
    UPDATE session_royales SET starts_at=now_at+interval '3 seconds' WHERE id=_id RETURNING * INTO r;
    UPDATE battle_invites SET status='cancelled' WHERE room_code='br:'||_id AND from_user_id=actor AND status='pending';
  END IF;
  elapsed:=floor(extract(epoch FROM (now_at-r.starts_at)))::int;
  IF r.cancelled OR (r.starts_at IS NULL AND now_at>=r.expires_at) OR (elapsed>=0 AND population<2) THEN state:='closed';
  ELSIF r.starts_at IS NULL OR elapsed<0 THEN state:='lobby';
  ELSIF elapsed>=25*jsonb_array_length(r.questions) THEN state:='done';
  ELSE
    state:='playing'; idx:=elapsed/25; q:=r.questions->idx;
    IF _action='answer' AND _index=idx AND _choice>=0 AND _choice<jsonb_array_length(q->'choices') THEN
      INSERT INTO session_royale_answers VALUES(_id,actor,idx,_choice,_choice=(q->>'answer')::int) ON CONFLICT DO NOTHING;
    END IF;
    SELECT choice INTO picked FROM session_royale_answers WHERE round_id=_id AND user_id=actor AND question_index=idx;
  END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(scores) ORDER BY score DESC,name,user_id),'[]') INTO results FROM (
    SELECT p.user_id,p.name,(p.user_id=actor) AS me,count(a.question_index) AS score
    FROM session_royale_players p LEFT JOIN session_royale_answers a
      ON a.round_id=p.round_id AND a.user_id=p.user_id AND a.correct
     AND (state='done' OR a.question_index<coalesce(idx,0))
    WHERE p.round_id=_id GROUP BY p.user_id,p.name
  ) scores;
  RETURN jsonb_build_object('state',state,'host',coalesce(r.host_id=actor,false),'starts_at',r.starts_at,
    'server_now',now_at,'expires_at',r.expires_at,'players',results,'subject',r.subject,'chapter',r.chapter,
    'language',r.language,'total',jsonb_array_length(r.questions),'index',idx,'picked',picked,
    'deadline',CASE WHEN idx IS NOT NULL THEN r.starts_at+make_interval(secs=>25*(idx+1)) END,'question',q-'answer');
END $$;

REVOKE ALL ON FUNCTION public._royale_slot(timestamptz),public._royale_study_member(uuid),
  public._royale_bank(text,int,text),public._royale_finalize(timestamptz),
  public.session_royale_poll(jsonb),public.create_study_royale(uuid[],text,int,text,jsonb),
  public.study_royale(uuid,text,int,int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public._royale_slot(timestamptz),public._royale_finalize(timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.session_royale_poll(jsonb),public.create_study_royale(uuid[],text,int,text,jsonb),
  public.study_royale(uuid,text,int,int) TO authenticated;
