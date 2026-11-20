-- Own completed attempt only; answers never leave the server during a live round.
CREATE FUNCTION public.get_nadawi_contest_mistakes(_admin_test boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  a record;
  result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF _admin_test THEN
    IF public.has_role(auth.uid(),'admin') IS DISTINCT FROM true THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
    SELECT items, answers, completed_at INTO a FROM public.nadawi_contest_test_attempts WHERE user_id=auth.uid();
  ELSE
    SELECT items, answers, completed_at INTO a FROM public.nadawi_contest_attempts WHERE user_id=auth.uid();
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'ATTEMPT_NOT_FOUND'; END IF;
  IF a.completed_at IS NULL THEN RAISE EXCEPTION 'REVIEW_NOT_READY'; END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'question_number', (entry->>'index')::integer + 1,
    'prompt', item->>'prompt',
    'word_bank', item->'word_bank',
    'user_answer', CASE WHEN entry->>'answer' IS NULL THEN NULL
      WHEN item->>'kind'='mcq' AND entry->>'answer' ~ '^[0-9]$'
        THEN item->'choices'->>((entry->>'answer')::integer)
      ELSE entry->>'answer' END,
    'correct_answers', CASE WHEN item->>'kind'='mcq'
      THEN jsonb_build_array(item->'answer_key'->>'correct')
      ELSE item->'answer_key'->'answers' END,
    'timed_out', coalesce((entry->>'timed_out')::boolean, false)
  ) ORDER BY (entry->>'index')::integer), '[]'::jsonb) INTO result
  FROM jsonb_array_elements(a.answers) AS entries(entry)
  CROSS JOIN LATERAL (SELECT a.items->((entry->>'index')::integer) AS item) AS questions
  WHERE (entry->>'correct')::boolean IS NOT TRUE;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.get_nadawi_contest_mistakes(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_nadawi_contest_mistakes(boolean) TO authenticated;
