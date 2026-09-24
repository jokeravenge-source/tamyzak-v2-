-- Restore streak days for students who studied before user_progress began
-- tracking streaks. A day counts only when a real study session was saved or
-- positive activity points were earned. Use the same Baghdad dates as award_points.
WITH activity AS (
  SELECT user_id, (created_at AT TIME ZONE 'Asia/Baghdad')::date AS day
  FROM public.study_sessions
  WHERE duration_seconds > 0
    AND created_at >= now() - interval '61 days'
  UNION
  SELECT user_id, (created_at AT TIME ZONE 'Asia/Baghdad')::date AS day
  FROM public.user_points
  WHERE points > 0
    AND source IN (
      'daily_login', 'flashcard_session', 'mcq_quiz', 'ministerial_set',
      'video_to_notes', 'accuracy_bonus', 'summary', 'flashcard', 'mcq',
      'essay', 'session', 'live_battle'
    )
    AND created_at >= now() - interval '61 days'
), numbered AS (
  SELECT user_id, day,
         day - row_number() OVER (PARTITION BY user_id ORDER BY day)::integer AS island
  FROM activity
), latest_run AS (
  SELECT user_id, max(day) AS last_day, count(*)::integer AS days
  FROM numbered
  GROUP BY user_id, island
  HAVING max(day) >= (now() AT TIME ZONE 'Asia/Baghdad')::date - 1
), restored AS (
  SELECT user_id, LEAST(days, 60) AS days, last_day
  FROM latest_run
  WHERE last_day = (SELECT max(r.last_day) FROM latest_run r WHERE r.user_id = latest_run.user_id)
)
INSERT INTO public.user_progress (user_id, current_streak, longest_streak, last_active_date)
SELECT user_id, days, days, last_day FROM restored
ON CONFLICT (user_id) DO UPDATE
SET current_streak = GREATEST(public.user_progress.current_streak, EXCLUDED.current_streak),
    longest_streak = GREATEST(public.user_progress.longest_streak, EXCLUDED.longest_streak),
    last_active_date = GREATEST(public.user_progress.last_active_date, EXCLUDED.last_active_date);
