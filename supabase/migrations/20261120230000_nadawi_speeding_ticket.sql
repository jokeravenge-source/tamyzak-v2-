-- Correct Q3C.4/Q3C.6 for new, active and completed official/admin attempts.
BEGIN;

CREATE OR REPLACE FUNCTION public._nadawi_contest_step(_id uuid, _index integer DEFAULT NULL, _answer text DEFAULT NULL, _accept boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  a public.nadawi_contest_attempts%ROWTYPE;
  t timestamptz := clock_timestamp();
  deadline timestamptz;
  item jsonb;
  picked text;
  good boolean := false;
  value text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT * INTO a FROM public.nadawi_contest_attempts WHERE id = _id AND user_id = auth.uid() FOR UPDATE;
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
      value := lower(regexp_replace(regexp_replace(btrim(_answer), '[.!?,;:]+$', ''), '[[:space:]]+', ' ', 'g'));
      IF value = '' OR cardinality(regexp_split_to_array(value, '[[:space:]]+')) > coalesce((item->>'max_words')::integer,1) THEN RAISE EXCEPTION 'ONE_WORD_REQUIRED'; END IF;
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
  UPDATE public.nadawi_contest_attempts SET question_index=a.question_index, question_started_at=a.question_started_at,
    answers=a.answers, score=a.score, completed_at=a.completed_at, elapsed_ms=a.elapsed_ms WHERE id=a.id;
  IF a.completed_at IS NOT NULL THEN
    RETURN jsonb_build_object('status','completed','attempt_id',a.id,'server_now',t,'started_at',a.started_at,
      'completed_at',a.completed_at,'score',a.score,'total_questions',41,'elapsed_ms',a.elapsed_ms);
  END IF;
  item := a.items -> a.question_index;
  RETURN jsonb_build_object('status','active','attempt_id',a.id,'server_now',t,'started_at',a.started_at,
    'question_index',a.question_index,'total_questions',41,'deadline_at',a.question_started_at + interval '30 seconds',
    'question',jsonb_build_object('kind',item->>'kind','prompt',item->>'prompt','choices',item->'choices','word_bank',item->'word_bank','max_words',coalesce((item->>'max_words')::integer,1)));
END $$;

CREATE OR REPLACE FUNCTION public._nadawi_admin_contest_step(_id uuid, _index integer DEFAULT NULL, _answer text DEFAULT NULL, _accept boolean DEFAULT false)
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
      value := lower(regexp_replace(regexp_replace(btrim(_answer), '[.!?,;:]+$', ''), '[[:space:]]+', ' ', 'g'));
      IF value = '' OR cardinality(regexp_split_to_array(value, '[[:space:]]+')) > coalesce((item->>'max_words')::integer,1) THEN RAISE EXCEPTION 'ONE_WORD_REQUIRED'; END IF;
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
    'question',jsonb_build_object('kind',item->>'kind','prompt',item->>'prompt','choices',item->'choices','word_bank',item->'word_bank','max_words',coalesce((item->>'max_words')::integer,1)));
END $$;

UPDATE public.nadawi_contest_questions
SET item=CASE WHEN id='Q3C.6'
  THEN jsonb_set(item,'{answer_key,answers}','["ticket","speeding ticket"]'::jsonb) || '{"max_words":2}'::jsonb
  ELSE jsonb_set(item,'{answer_key,answers}','["named","alerted"]'::jsonb) END
WHERE id IN ('Q3C.4','Q3C.6');

-- Keep each student's shuffled order, answer text, deadlines and elapsed time.
UPDATE public.nadawi_contest_attempts a SET items=(
 SELECT jsonb_agg(CASE WHEN q->>'id'='Q3C.6'
   THEN jsonb_set(q,'{answer_key,answers}','["ticket","speeding ticket"]'::jsonb) || '{"max_words":2}'::jsonb
   WHEN q->>'id'='Q3C.4' THEN jsonb_set(q,'{answer_key,answers}','["named","alerted"]'::jsonb)
   ELSE q END ORDER BY position)
 FROM jsonb_array_elements(a.items) WITH ORDINALITY AS questions(q,position)
);
WITH corrections AS (
 SELECT a.id, jsonb_agg(CASE WHEN q->>'id' IN ('Q3C.4','Q3C.6')
   THEN jsonb_set(entry,'{correct}',to_jsonb(good)) ELSE entry END ORDER BY position) AS answers,
   sum(CASE WHEN q->>'id' IN ('Q3C.4','Q3C.6') THEN good::integer - coalesce((entry->>'correct')::boolean,false)::integer ELSE 0 END)::integer AS delta
 FROM public.nadawi_contest_attempts a
 CROSS JOIN LATERAL jsonb_array_elements(a.answers) WITH ORDINALITY AS entries(entry,position)
 CROSS JOIN LATERAL (SELECT a.items->((entry->>'index')::integer) AS q) questions
 CROSS JOIN LATERAL (SELECT coalesce(NOT coalesce((entry->>'timed_out')::boolean,false)
   AND (q->'answer_key'->'answers') ? lower(regexp_replace(regexp_replace(btrim(entry->>'answer'),'[.!?,;:]+$',''),'[[:space:]]+',' ','g')),false) AS good) grading
 GROUP BY a.id
)
UPDATE public.nadawi_contest_attempts a SET answers=c.answers,score=a.score+c.delta
FROM corrections c WHERE a.id=c.id;

-- Keep each student's shuffled order, answer text, deadlines and elapsed time.
UPDATE public.nadawi_contest_test_attempts a SET items=(
 SELECT jsonb_agg(CASE WHEN q->>'id'='Q3C.6'
   THEN jsonb_set(q,'{answer_key,answers}','["ticket","speeding ticket"]'::jsonb) || '{"max_words":2}'::jsonb
   WHEN q->>'id'='Q3C.4' THEN jsonb_set(q,'{answer_key,answers}','["named","alerted"]'::jsonb)
   ELSE q END ORDER BY position)
 FROM jsonb_array_elements(a.items) WITH ORDINALITY AS questions(q,position)
);
WITH corrections AS (
 SELECT a.id, jsonb_agg(CASE WHEN q->>'id' IN ('Q3C.4','Q3C.6')
   THEN jsonb_set(entry,'{correct}',to_jsonb(good)) ELSE entry END ORDER BY position) AS answers,
   sum(CASE WHEN q->>'id' IN ('Q3C.4','Q3C.6') THEN good::integer - coalesce((entry->>'correct')::boolean,false)::integer ELSE 0 END)::integer AS delta
 FROM public.nadawi_contest_test_attempts a
 CROSS JOIN LATERAL jsonb_array_elements(a.answers) WITH ORDINALITY AS entries(entry,position)
 CROSS JOIN LATERAL (SELECT a.items->((entry->>'index')::integer) AS q) questions
 CROSS JOIN LATERAL (SELECT coalesce(NOT coalesce((entry->>'timed_out')::boolean,false)
   AND (q->'answer_key'->'answers') ? lower(regexp_replace(regexp_replace(btrim(entry->>'answer'),'[.!?,;:]+$',''),'[[:space:]]+',' ','g')),false) AS good) grading
 GROUP BY a.id
)
UPDATE public.nadawi_contest_test_attempts a SET answers=c.answers,score=a.score+c.delta
FROM corrections c WHERE a.id=c.id;

COMMIT;
