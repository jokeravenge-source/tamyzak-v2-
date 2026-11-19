CREATE OR REPLACE FUNCTION public.answer_race_question(
  _attempt_id uuid, _question_id text, _subject text, _chapter integer,
  _language text, _question text, _choice text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  expected text;
  award_id uuid;
  reference text := 'race:' || _attempt_id::text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF _attempt_id IS NULL THEN RAISE EXCEPTION 'Attempt ID required'; END IF;
  SELECT choices->>answer_index INTO expected FROM public.mcq_banks
  WHERE subject = _subject AND chapter = _chapter AND language = _language
    AND (id::text = _question_id OR question = _question)
  ORDER BY (id::text = _question_id) DESC, id LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Question is not available in the server bank'; END IF;
  IF expected IS DISTINCT FROM _choice THEN
    RETURN jsonb_build_object('correct', false, 'points', 0);
  END IF;
  INSERT INTO public.user_points(user_id, source, points, ref_id)
  VALUES(uid, 'mcq', 10, reference)
  ON CONFLICT (user_id, source, ref_id) WHERE ref_id IS NOT NULL DO NOTHING
  RETURNING id INTO award_id;
  RETURN jsonb_build_object('correct', true, 'points', CASE WHEN award_id IS NULL THEN 0 ELSE 10 END);
END;
$$;
REVOKE ALL ON FUNCTION public.answer_race_question(uuid,text,text,integer,text,text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.answer_race_question(uuid,text,text,integer,text,text,text) TO authenticated;