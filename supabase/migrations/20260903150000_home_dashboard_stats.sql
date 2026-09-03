-- One compact, indexed read for the authenticated student's home dashboard.
-- This replaces downloading every user_points row to calculate leaderboard rank.
CREATE INDEX IF NOT EXISTS user_progress_lifetime_points_idx
  ON public.user_progress (lifetime_points DESC);

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
  _display_name text := '';
  _missions_done integer := 0;
  _board_rank integer;
  _board_total integer := 0;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT
    COALESCE(up.lifetime_points, 0),
    COALESCE(up.current_streak, 0)
  INTO _points, _streak
  FROM public.user_progress up
  WHERE up.user_id = _uid;

  -- Accounts created before user_progress was introduced may not have a row yet.
  IF NOT FOUND THEN
    SELECT COALESCE(sum(p.points), 0)::integer
      INTO _points
    FROM public.user_points p
    WHERE p.user_id = _uid;
  END IF;

  SELECT COALESCE(p.display_name, '')
    INTO _display_name
  FROM public.profiles p
  WHERE p.user_id = _uid
  LIMIT 1;

  SELECT count(*)::integer
    INTO _missions_done
  FROM public.mission_progress mp
  WHERE mp.user_id = _uid
    AND mp.completed = true;

  SELECT count(*)::integer
    INTO _board_total
  FROM public.user_progress;

  IF EXISTS (SELECT 1 FROM public.user_progress WHERE user_id = _uid) THEN
    SELECT count(*)::integer + 1
      INTO _board_rank
    FROM public.user_progress up
    WHERE up.lifetime_points > _points;
  ELSE
    _board_rank := NULL;
  END IF;

  RETURN jsonb_build_object(
    'display_name', _display_name,
    'total_points', _points,
    'current_streak', _streak,
    'missions_done', _missions_done,
    'board_rank', _board_rank,
    'board_total', _board_total
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_home_dashboard_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_home_dashboard_stats() TO authenticated;
