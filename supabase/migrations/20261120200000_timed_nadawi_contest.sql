CREATE TABLE public.nadawi_contest_questions (
  id text PRIMARY KEY,
  item jsonb NOT NULL
);
CREATE TABLE public.nadawi_contest_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL CHECK (jsonb_array_length(items) = 41),
  started_at timestamptz NOT NULL,
  question_started_at timestamptz NOT NULL,
  question_index integer NOT NULL DEFAULT 0 CHECK (question_index BETWEEN 0 AND 41),
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 41),
  completed_at timestamptz,
  elapsed_ms bigint CHECK (elapsed_ms >= 0)
);
CREATE INDEX nadawi_contest_rankings_idx ON public.nadawi_contest_attempts
  (score DESC, elapsed_ms ASC, completed_at ASC) WHERE completed_at IS NOT NULL;
ALTER TABLE public.nadawi_contest_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nadawi_contest_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nadawi_contest_questions, public.nadawi_contest_attempts FROM PUBLIC, anon, authenticated;

INSERT INTO public.nadawi_contest_questions(id,item) SELECT value->>'id', value FROM jsonb_array_elements($nadawi_bank$[{"id": "Q1.1", "kind": "mcq", "prompt": "Why do police officers have many different duties?", "choices": ["Because they work only at airports.", "Because the law covers many different situations.", "Because they do not investigate crimes.", "Because drivers choose their duties."], "word_bank": [], "answer_key": {"correct": "Because the law covers many different situations."}}, {"id": "Q1.2", "kind": "mcq", "prompt": "How can witnesses help the police?", "choices": ["By repairing the police cars.", "By deciding the prison sentence.", "By describing the suspect and saying when the crime happened.", "By replacing fingerprint experts."], "word_bank": [], "answer_key": {"correct": "By describing the suspect and saying when the crime happened."}}, {"id": "Q1.3", "kind": "mcq", "prompt": "What is a radar speed gun?", "choices": ["A device used to measure a moving vehicle's speed.", "A machine that checks baggage for metal.", "A device that prints driving licences.", "A machine that controls traffic lights."], "word_bank": [], "answer_key": {"correct": "A device used to measure a moving vehicle's speed."}}, {"id": "Q1.4", "kind": "mcq", "prompt": "What do some people claim about radar speed guns?", "choices": ["That they always prevent every accident.", "That they cannot be used beside a road.", "That they work only on parked cars.", "That an inaccurate reading can lead to an unfair ticket."], "word_bank": [], "answer_key": {"correct": "That an inaccurate reading can lead to an unfair ticket."}}, {"id": "Q1.5", "kind": "mcq", "prompt": "Radar guns can only measure the speed of cars moving towards them.", "choices": ["True", "False"], "word_bank": [], "answer_key": {"correct": "False"}}, {"id": "Q1.6", "kind": "mcq", "prompt": "Which pair gives two duties of police officers?", "choices": ["Designing cars and selling tickets for flights.", "Teaching every school subject and treating all illnesses.", "Controlling road traffic and preventing offences.", "Repairing aircraft and printing newspapers."], "word_bank": [], "answer_key": {"correct": "Controlling road traffic and preventing offences."}}, {"id": "Q2A.1", "kind": "mcq", "prompt": "Choose the correct rewrite expressing expectation: You like exercising, so I don't think you'll have trouble getting fit.", "choices": ["You like exercising, so you should having trouble getting fit.", "You like exercising, so you shouldn't have trouble getting fit.", "You like exercising, so you shouldn't to have trouble getting fit.", "You like exercising, so you should has trouble getting fit."], "word_bank": [], "answer_key": {"correct": "You like exercising, so you shouldn't have trouble getting fit."}}, {"id": "Q2A.2", "kind": "mcq", "prompt": "We use ___ to say that it is important not to do something.", "choices": ["don't have to", "needn't", "mustn't", "may"], "word_bank": [], "answer_key": {"correct": "mustn't"}}, {"id": "Q2A.3", "kind": "mcq", "prompt": "Ahmed is travelling tomorrow. Give him advice using 'have your baggage with you'.", "choices": ["You should have your baggage with you.", "You should had your baggage with you.", "You should to have your baggage with you.", "You should having your baggage with you."], "word_bank": [], "answer_key": {"correct": "You should have your baggage with you."}}, {"id": "Q2A.4", "kind": "mcq", "prompt": "Choose the correct rewrite using 'make': The manager told me to send the e-mail.", "choices": ["The manager made me to send the e-mail.", "The manager made me sent the e-mail.", "The manager made me sending the e-mail.", "The manager made me send the e-mail."], "word_bank": [], "answer_key": {"correct": "The manager made me send the e-mail."}}, {"id": "Q2A.5", "kind": "mcq", "prompt": "Which sentence offers your friend a cup of tea?", "choices": ["Would you get me a cup of tea?", "Would you like a cup of tea?", "You must give me a cup of tea.", "Did you drink a cup of tea?"], "word_bank": [], "answer_key": {"correct": "Would you like a cup of tea?"}}, {"id": "Q2A.6", "kind": "mcq", "prompt": "Choose the polite request using 'Would': Get me a drink of water.", "choices": ["Would you getting me a drink of water?", "Would you to get me a drink of water?", "Would you get me a drink of water, please?", "Would you got me a drink of water?"], "word_bank": [], "answer_key": {"correct": "Would you get me a drink of water, please?"}}, {"id": "Q2A.7", "kind": "mcq", "prompt": "Choose the correct expectation: This is a new computer, so ___.", "choices": ["it should be faster than the other one", "it should to be faster than the other one", "it should being faster than the other one", "it should is faster than the other one"], "word_bank": [], "answer_key": {"correct": "it should be faster than the other one"}}, {"id": "Q2A.8", "kind": "mcq", "prompt": "Rewrite using a causative verb: They arrived late because of the traffic jam.", "choices": ["The traffic jam made them to arrive late.", "The traffic jam made them arrived late.", "The traffic jam made them arriving late.", "The traffic jam made them arrive late."], "word_bank": [], "answer_key": {"correct": "The traffic jam made them arrive late."}}, {"id": "Q2A.9", "kind": "mcq", "prompt": "Make a suggestion using 'we could': We watch the film.", "choices": ["We could watching the film.", "We could watch the film.", "We could to watch the film.", "We could watched the film."], "word_bank": [], "answer_key": {"correct": "We could watch the film."}}, {"id": "Q2A.10", "kind": "mcq", "prompt": "At our school, we must ___ a uniform.", "choices": ["wore", "wearing", "wear", "worn"], "word_bank": [], "answer_key": {"correct": "wear"}}, {"id": "Q2A.11", "kind": "mcq", "prompt": "Which sentence means that a specialist repaired my camera for me?", "choices": ["I had my camera repaired.", "I had my camera repair.", "I made my camera repaired.", "I had my camera repairing."], "word_bank": [], "answer_key": {"correct": "I had my camera repaired."}}, {"id": "Q2A.12", "kind": "mcq", "prompt": "Ask about people's necessity to follow the law using 'must'.", "choices": ["Do people must follow the law?", "Must people to follow the law?", "Must people following the law?", "Must people follow the law?"], "word_bank": [], "answer_key": {"correct": "Must people follow the law?"}}, {"id": "Q2B.1", "kind": "mcq", "prompt": "You ___ pick me up in the car. I'll get the bus.", "choices": ["have to", "needn't"], "word_bank": [], "answer_key": {"correct": "needn't"}}, {"id": "Q2B.2", "kind": "mcq", "prompt": "You ___ ask a neighbour to collect mail while you are away.", "choices": ["should", "shouldn't"], "word_bank": [], "answer_key": {"correct": "should"}}, {"id": "Q2B.3", "kind": "mcq", "prompt": "I ___ to leave so soon.", "choices": ["needn't", "don't have"], "word_bank": [], "answer_key": {"correct": "don't have"}}, {"id": "Q2B.4", "kind": "mcq", "prompt": "___ pick you up and take you to the office?", "choices": ["Would you like", "Would you like me to"], "word_bank": [], "answer_key": {"correct": "Would you like me to"}}, {"id": "Q2B.5", "kind": "mcq", "prompt": "He learnt about computers in the military. He ___ be able to help me fix mine.", "choices": ["should", "shouldn't"], "word_bank": [], "answer_key": {"correct": "should"}}, {"id": "Q2B.6", "kind": "mcq", "prompt": "He had his house ___ into when he was on a holiday.", "choices": ["broke", "broken"], "word_bank": [], "answer_key": {"correct": "broken"}}, {"id": "Q3A.1", "kind": "short", "prompt": "The police think they will ___ someone soon.", "choices": [], "word_bank": ["essential", "powder", "solid", "arrest", "base", "valuables"], "answer_key": {"answers": ["arrest"]}}, {"id": "Q3A.2", "kind": "short", "prompt": "Don't leave ___ in the car. (valuable possessions)", "choices": [], "word_bank": ["essential", "powder", "solid", "arrest", "base", "valuables"], "answer_key": {"answers": ["valuables"]}}, {"id": "Q3A.3", "kind": "short", "prompt": "The police use special ___ to see fingerprints.", "choices": [], "word_bank": ["essential", "powder", "solid", "arrest", "base", "valuables"], "answer_key": {"answers": ["powder"]}}, {"id": "Q3A.4", "kind": "short", "prompt": "Officers can be doctors at the army ___.", "choices": [], "word_bank": ["essential", "powder", "solid", "arrest", "base", "valuables"], "answer_key": {"answers": ["base"]}}, {"id": "Q3A.5", "kind": "short", "prompt": "Make sure your door is ___. (strong and firm)", "choices": [], "word_bank": ["essential", "powder", "solid", "arrest", "base", "valuables"], "answer_key": {"answers": ["solid"]}}, {"id": "Q3B.1", "kind": "short", "prompt": "arrest = put someone in prison; dispose of = get ___ of.", "choices": [], "word_bank": [], "answer_key": {"answers": ["rid"]}}, {"id": "Q3B.2", "kind": "short", "prompt": "On the phone, introduce yourself: '___ is Samir Esam.'", "choices": [], "word_bank": [], "answer_key": {"answers": ["this"]}}, {"id": "Q3B.3", "kind": "short", "prompt": "Avoid ___ in illegal places. (leaving your car)", "choices": [], "word_bank": [], "answer_key": {"answers": ["parking"]}}, {"id": "Q3B.4", "kind": "short", "prompt": "In the military, you can take a test to become an ___. (officer / official)", "choices": [], "word_bank": [], "answer_key": {"answers": ["officer"]}}, {"id": "Q3B.5", "kind": "short", "prompt": "Your car mustn't ___ broken lights.", "choices": [], "word_bank": [], "answer_key": {"answers": ["have"]}}, {"id": "Q3B.6", "kind": "short", "prompt": "Put your bags on the ___ belt, please. (conveyor / seat)", "choices": [], "word_bank": [], "answer_key": {"answers": ["conveyor"]}}, {"id": "Q3C.1", "kind": "short", "prompt": "Write the abbreviation of 'frequent'.", "choices": [], "word_bank": [], "answer_key": {"answers": ["freq"]}}, {"id": "Q3C.2", "kind": "short", "prompt": "play → player; teach → ___", "choices": [], "word_bank": [], "answer_key": {"answers": ["teacher"]}}, {"id": "Q3C.3", "kind": "short", "prompt": "The opposite of 'military' is ___.", "choices": [], "word_bank": [], "answer_key": {"answers": ["civilian"]}}, {"id": "Q3C.4", "kind": "short", "prompt": "hurt → injured; called → ___", "choices": [], "word_bank": [], "answer_key": {"answers": ["named"]}}, {"id": "Q3C.5", "kind": "short", "prompt": "Engl. → English; driving lic. → driving ___ (British English)", "choices": [], "word_bank": [], "answer_key": {"answers": ["licence"]}}, {"id": "Q3C.6", "kind": "short", "prompt": "radar speed → gun; speeding → ___", "choices": [], "word_bank": [], "answer_key": {"answers": ["fine"]}}]$nadawi_bank$::jsonb);

-- Only RPCs read/write attempts. In particular, clients cannot supply scores or times.
CREATE FUNCTION public._nadawi_contest_step(_id uuid, _index integer DEFAULT NULL, _answer text DEFAULT NULL, _accept boolean DEFAULT false)
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
  UPDATE public.nadawi_contest_attempts SET question_index=a.question_index, question_started_at=a.question_started_at,
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
REVOKE ALL ON FUNCTION public._nadawi_contest_step(uuid,integer,text,boolean) FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.start_nadawi_contest()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  attempt_id uuid;
  shuffled jsonb;
  t timestamptz := clock_timestamp();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT id INTO attempt_id FROM public.nadawi_contest_attempts WHERE user_id=auth.uid();
  IF FOUND THEN RETURN public._nadawi_contest_step(attempt_id); END IF;
  IF t < timestamptz '2026-11-20 20:30:00+03' THEN RAISE EXCEPTION 'CONTEST_NOT_OPEN'; END IF;
  SELECT jsonb_agg(
    CASE WHEN q.item->>'kind'='mcq' THEN
      q.item || jsonb_build_object('choices',(SELECT jsonb_agg(option.value ORDER BY random()) FROM jsonb_array_elements(q.item->'choices') AS option(value)))
      ELSE q.item END ORDER BY random()) INTO shuffled
  FROM public.nadawi_contest_questions q;
  IF jsonb_array_length(shuffled) IS DISTINCT FROM 41 THEN RAISE EXCEPTION 'QUESTION_BANK_INCOMPLETE'; END IF;
  INSERT INTO public.nadawi_contest_attempts(user_id,items,started_at,question_started_at)
    VALUES(auth.uid(),shuffled,t,t) ON CONFLICT(user_id) DO NOTHING RETURNING id INTO attempt_id;
  IF attempt_id IS NULL THEN SELECT id INTO attempt_id FROM public.nadawi_contest_attempts WHERE user_id=auth.uid(); END IF;
  RETURN public._nadawi_contest_step(attempt_id);
END $$;

CREATE FUNCTION public.get_nadawi_contest_state()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE attempt_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT id INTO attempt_id FROM public.nadawi_contest_attempts WHERE user_id=auth.uid();
  IF NOT FOUND THEN RETURN jsonb_build_object('status','not_started','server_now',clock_timestamp()); END IF;
  RETURN public._nadawi_contest_step(attempt_id);
END $$;

CREATE FUNCTION public.submit_nadawi_contest_answer(_attempt_id uuid, _question_index integer, _answer text DEFAULT NULL)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT public._nadawi_contest_step(_attempt_id,_question_index,_answer,true);
$$;

CREATE FUNCTION public.get_nadawi_contest_leaderboard()
RETURNS TABLE(rank bigint, display_name text, score integer, elapsed_ms bigint, is_me boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t timestamptz := clock_timestamp();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  -- Settle fully elapsed attempts even if their owners never reopen the page.
  UPDATE public.nadawi_contest_attempts a SET
    completed_at = a.question_started_at + interval '30 seconds' * (41-a.question_index),
    elapsed_ms = floor(extract(epoch FROM (a.question_started_at + interval '30 seconds' * (41-a.question_index) - a.started_at))*1000)::bigint,
    answers = a.answers || (SELECT jsonb_agg(jsonb_build_object('index',i,'answer',NULL,'correct',false,'elapsed_ms',30000,'timed_out',true) ORDER BY i) FROM generate_series(a.question_index,40) i),
    question_started_at = a.question_started_at + interval '30 seconds' * (41-a.question_index),
    question_index = 41
  WHERE a.completed_at IS NULL AND t >= a.question_started_at + interval '30 seconds' * (41-a.question_index);
  RETURN QUERY
  WITH results AS (
    SELECT dense_rank() OVER(ORDER BY a.score DESC,a.elapsed_ms ASC) AS place,
      row_number() OVER(ORDER BY a.score DESC,a.elapsed_ms ASC,a.completed_at ASC,a.id) AS row_no,
      a.user_id,a.score,a.elapsed_ms
    FROM public.nadawi_contest_attempts a WHERE a.completed_at IS NOT NULL
  )
  SELECT r.place,coalesce(nullif(btrim(p.display_name),''),'Student'),r.score,r.elapsed_ms,r.user_id=auth.uid()
  FROM results r LEFT JOIN public.profiles p ON p.user_id=r.user_id
  WHERE r.row_no<=20 OR r.user_id=auth.uid() ORDER BY r.place,r.row_no;
END $$;

REVOKE ALL ON FUNCTION public.start_nadawi_contest() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_nadawi_contest_state() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_nadawi_contest_answer(uuid,integer,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_nadawi_contest_leaderboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_nadawi_contest(),public.get_nadawi_contest_state(),
  public.submit_nadawi_contest_answer(uuid,integer,text),public.get_nadawi_contest_leaderboard() TO authenticated;
