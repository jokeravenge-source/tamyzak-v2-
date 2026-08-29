CREATE OR REPLACE FUNCTION public.admin_common_mistakes(_limit integer DEFAULT 50)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT jsonb_build_object(
    'total_mistakes', (SELECT COUNT(*) FROM public.my_mistakes),
    'unresolved', (SELECT COUNT(*) FROM public.my_mistakes WHERE resolved = false),
    'affected_users', (SELECT COUNT(DISTINCT user_id) FROM public.my_mistakes),
    'by_subject', COALESCE((
      SELECT jsonb_agg(x) FROM (
        SELECT COALESCE(subject, 'unknown') AS subject,
               COUNT(*)::int AS mistakes,
               COUNT(DISTINCT user_id)::int AS users
        FROM public.my_mistakes
        GROUP BY 1 ORDER BY 2 DESC LIMIT 20
      ) x), '[]'::jsonb),
    'by_source', COALESCE((
      SELECT jsonb_agg(x) FROM (
        SELECT COALESCE(source, 'other') AS source,
               COUNT(*)::int AS mistakes,
               COUNT(DISTINCT user_id)::int AS users
        FROM public.my_mistakes
        GROUP BY 1 ORDER BY 2 DESC LIMIT 20
      ) x), '[]'::jsonb),
    'top_questions', COALESCE((
      SELECT jsonb_agg(x) FROM (
        SELECT question,
               MAX(COALESCE(subject, '')) AS subject,
               MAX(COALESCE(chapter, '')) AS chapter,
               MAX(COALESCE(source, 'other')) AS source,
               MAX(COALESCE(correct_answer, '')) AS correct_answer,
               COUNT(DISTINCT user_id)::int AS users,
               SUM(COALESCE(times_wrong, 1))::int AS wrong_total,
               SUM(CASE WHEN resolved THEN 0 ELSE 1 END)::int AS still_unresolved
        FROM public.my_mistakes
        GROUP BY question
        ORDER BY wrong_total DESC, users DESC
        LIMIT GREATEST(1, LEAST(_limit, 200))
      ) x), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_common_mistakes(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_common_mistakes(integer) TO authenticated;