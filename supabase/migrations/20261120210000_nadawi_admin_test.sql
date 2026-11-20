-- Admin previews use separate private storage. Official attempts/rankings are untouched.
CREATE TABLE public.nadawi_contest_test_attempts
  (LIKE public.nadawi_contest_attempts INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES);
ALTER TABLE public.nadawi_contest_test_attempts
  ADD FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.nadawi_contest_test_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nadawi_contest_test_attempts FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public._nadawi_admin_contest_step(_id uuid, _index integer DEFAULT NULL, _answer text DEFAULT NULL, _accept boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  a public.nadawi_contest_test_attempts%ROWTYPE;
  t timestamptz := clock_timestamp();
  deadline timestamptz;
  item jsonb;
  picked text;
  good boolean := false;
  value text;
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(),'admin') IS DISTINCT FROM true THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  SELECT * INTO a FROM public.nadawi_contest_test_attempts WHERE id = _id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ATTEMPT_NOT_FOUND'; END IF;
  t := clock_timestamp();
  -- Time keeps running while the browser is closed. Catch up every elapsed window.
  WHILE a.completed_at IS NULL AND t >= a.question_started_at + interval '30 seconds' LOOP
    deadline := a.question_started_at + interval '30 seconds';
    a.answers := a.answers || jsonb_build_array(jsonb_build_object('index',a.question_index,'answer',NULL,'correct',false,'elapsed_ms',30000,'timed_out',true));
    a.question_index := a.question_index + 1;
    a.question_started_at := deadline;
    IF a.question_index = 41 THEN
      a.completed_at := deadline;
      a.elapsed_ms := floor(extract(epoch FROM (deadline - a.started_at)) * 1000)::bigint;
    END IF;
  END LOOP;
  -- A retried/late answer for an old index never applies to the next question.
  IF _accept AND a.completed_at IS NULL AND _index = a.question_index AND _answer IS NOT NULL THEN
    IF length(_answer) > 60 THEN RAISE EXCEPTION 'ANSWER_TOO_LONG'; END IF;
    item := a.items -> a.question_index;
    IF item ->> 'kind' = 'mcq' THEN
      IF _answer ~ '^[0-9]$' THEN
        picked := (item -> 'choices') ->> (_answer::integer);
        good := coalesce(picked = item -> 'answer_key' ->> 'correct', false);
      END IF;
    ELSE
      value := lower(regexp_replace(btrim(_answer), '[.!?,;:]+$', ''));
      IF value = '' OR btrim(_answer) ~ '[[:space:]]' THEN RAISE EXCEPTION 'ONE_WORD_REQUIRED'; END IF;
      good := (item -> 'answer_key' -> 'answers') ? value;
    END IF;
    a.answers := a.answers || jsonb_build_array(jsonb_build_object('index',a.question_index,'answer',_answer,'correct',good,
      'elapsed_ms',greatest(0,floor(extract(epoch FROM (t - a.question_started_at)) * 1000)::bigint),'timed_out',false));
    IF good THEN a.score := a.score + 1; END IF;
    a.question_index := a.question_index + 1;
    a.question_started_at := t;
    IF a.question_index = 41 THEN
      a.completed_at := t;
      a.elapsed_ms := floor(extract(epoch FROM (t - a.started_at)) * 1000)::bigint;
    END IF;
  END IF;
  UPDATE public.nadawi_contest_test_attempts SET question_index=a.question_index, question_started_at=a.question_started_at,
    answers=a.answers, score=a.score, completed_at=a.completed_at, elapsed_ms=a.elapsed_ms WHERE id=a.id;
  IF a.completed_at IS NOT NULL THEN
    RETURN jsonb_build_object('status','completed','attempt_id',a.id,'server_now',t,'started_at',a.started_at,
      'completed_at',a.completed_at,'score',a.score,'total_questions',41,'elapsed_ms',a.elapsed_ms);
  END IF;
  item := a.items -> a.question_index;
  RETURN jsonb_build_object('status','active','attempt_id',a.id,'server_now',t,'started_at',a.started_at,
    'question_index',a.question_index,'total_questions',41,'deadline_at',a.question_started_at + interval '30 seconds',
    'question',jsonb_build_object('kind',item->>'kind','prompt',item->>'prompt','choices',item->'choices','word_bank',item->'word_bank'));
END $$;

CREATE FUNCTION public.start_nadawi_admin_test(_restart boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  attempt_id uuid;
  shuffled jsonb;
  t timestamptz := clock_timestamp();
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(),'admin') IS DISTINCT FROM true THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  IF _restart THEN DELETE FROM public.nadawi_contest_test_attempts WHERE user_id=auth.uid(); END IF;
  SELECT id INTO attempt_id FROM public.nadawi_contest_test_attempts WHERE user_id=auth.uid();
  IF FOUND THEN RETURN public._nadawi_admin_contest_step(attempt_id); END IF;
  SELECT jsonb_agg(
    CASE WHEN q.item->>'kind'='mcq' THEN
      q.item || jsonb_build_object('choices',(SELECT jsonb_agg(option.value ORDER BY random()) FROM jsonb_array_elements(q.item->'choices') AS option(value)))
      ELSE q.item END ORDER BY random()) INTO shuffled
  FROM public.nadawi_contest_questions q;
  IF jsonb_array_length(shuffled) IS DISTINCT FROM 41 THEN RAISE EXCEPTION 'QUESTION_BANK_INCOMPLETE'; END IF;
  INSERT INTO public.nadawi_contest_test_attempts(user_id,items,started_at,question_started_at)
    VALUES(auth.uid(),shuffled,t,t) ON CONFLICT(user_id) DO NOTHING RETURNING id INTO attempt_id;
  IF attempt_id IS NULL THEN SELECT id INTO attempt_id FROM public.nadawi_contest_test_attempts WHERE user_id=auth.uid(); END IF;
  RETURN public._nadawi_admin_contest_step(attempt_id);
END $$;

CREATE FUNCTION public.get_nadawi_admin_test_state()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE attempt_id uuid;
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(),'admin') IS DISTINCT FROM true THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  SELECT id INTO attempt_id FROM public.nadawi_contest_test_attempts WHERE user_id=auth.uid();
  IF NOT FOUND THEN RETURN jsonb_build_object('status','not_started','server_now',clock_timestamp()); END IF;
  RETURN public._nadawi_admin_contest_step(attempt_id);
END $$;

CREATE FUNCTION public.submit_nadawi_admin_test_answer(_attempt_id uuid, _question_index integer, _answer text DEFAULT NULL)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
 SELECT public._nadawi_admin_contest_step(_attempt_id,_question_index,_answer,true);
$$;
REVOKE ALL ON FUNCTION public._nadawi_admin_contest_step(uuid,integer,text,boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.start_nadawi_admin_test(boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_nadawi_admin_test_state() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_nadawi_admin_test_answer(uuid,integer,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_nadawi_admin_test(boolean),public.get_nadawi_admin_test_state(),
 public.submit_nadawi_admin_test_answer(uuid,integer,text) TO authenticated;
