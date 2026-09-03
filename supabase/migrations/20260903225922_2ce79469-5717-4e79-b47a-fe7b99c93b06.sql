CREATE OR REPLACE FUNCTION public.get_home_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _points integer := 0;
  _streak integer := 0;
  _missions integer := 0;
  _name text;
  _rank integer;
  _total integer := 0;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('display_name', null, 'total_points', 0, 'current_streak', 0, 'missions_done', 0, 'board_rank', null, 'board_total', 0);
  END IF;

  SELECT display_name INTO _name FROM public.profiles WHERE user_id = _uid;
  SELECT COALESCE(SUM(points), 0)::int INTO _points FROM public.user_points WHERE user_id = _uid;
  SELECT COALESCE(current_streak, 0) INTO _streak FROM public.user_progress WHERE user_id = _uid;
  SELECT COUNT(*)::int INTO _missions FROM public.mission_progress WHERE user_id = _uid AND completed;

  WITH board AS (
    SELECT user_id, SUM(points) AS pts, RANK() OVER (ORDER BY SUM(points) DESC) AS rnk
    FROM public.user_points GROUP BY user_id
  )
  SELECT (SELECT rnk::int FROM board WHERE user_id = _uid), (SELECT COUNT(*)::int FROM board)
  INTO _rank, _total;

  RETURN jsonb_build_object(
    'display_name', _name,
    'total_points', _points,
    'current_streak', COALESCE(_streak, 0),
    'missions_done', _missions,
    'board_rank', _rank,
    'board_total', COALESCE(_total, 0)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_home_dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_home_dashboard_stats() TO authenticated, service_role;