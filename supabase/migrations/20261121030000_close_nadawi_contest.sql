-- Temporarily close every official entry point without editing saved results.
-- Admin-only practice endpoints remain independent. Restore the official RPC
-- definitions in a later reopening migration, accounting for the closed period.
CREATE OR REPLACE FUNCTION public.get_nadawi_contest_state()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  RETURN jsonb_build_object('status','closed','server_now',clock_timestamp());
END $$;

CREATE OR REPLACE FUNCTION public.start_nadawi_contest()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN public.get_nadawi_contest_state();
END $$;

CREATE OR REPLACE FUNCTION public.submit_nadawi_contest_answer(_attempt_id uuid, _question_index integer, _answer text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN public.get_nadawi_contest_state();
END $$;

CREATE OR REPLACE FUNCTION public.get_nadawi_contest_leaderboard()
RETURNS TABLE(rank bigint, display_name text, score integer, elapsed_ms bigint, is_me boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  RAISE EXCEPTION 'CONTEST_CLOSED';
END $$;

CREATE OR REPLACE FUNCTION public.get_nadawi_contest_mistakes(_admin_test boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  a record;
  result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF NOT coalesce(_admin_test,false) THEN RAISE EXCEPTION 'CONTEST_CLOSED'; END IF;
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

-- Reassert the public API permissions; internal grading functions stay private.
REVOKE ALL ON FUNCTION public.get_nadawi_contest_state(), public.start_nadawi_contest(),
 public.submit_nadawi_contest_answer(uuid,integer,text), public.get_nadawi_contest_leaderboard(),
 public.get_nadawi_contest_mistakes(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_nadawi_contest_state(), public.start_nadawi_contest(),
 public.submit_nadawi_contest_answer(uuid,integer,text), public.get_nadawi_contest_leaderboard(),
 public.get_nadawi_contest_mistakes(boolean) TO authenticated;
