-- A streak represents the current 60-day challenge. Keep both current and
-- historical values within that product limit regardless of the write path.
UPDATE public.user_progress
SET current_streak = LEAST(GREATEST(COALESCE(current_streak, 0), 0), 60),
    longest_streak = LEAST(GREATEST(COALESCE(longest_streak, 0), 0), 60),
    updated_at = now()
WHERE current_streak NOT BETWEEN 0 AND 60
   OR longest_streak NOT BETWEEN 0 AND 60;

CREATE OR REPLACE FUNCTION public.cap_user_streak_at_60_days()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.current_streak := LEAST(GREATEST(COALESCE(NEW.current_streak, 0), 0), 60);
  NEW.longest_streak := LEAST(60, GREATEST(COALESCE(NEW.longest_streak, 0), NEW.current_streak));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cap_user_streak_at_60_days ON public.user_progress;
CREATE TRIGGER cap_user_streak_at_60_days
BEFORE INSERT OR UPDATE OF current_streak, longest_streak
ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.cap_user_streak_at_60_days();
