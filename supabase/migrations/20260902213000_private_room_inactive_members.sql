-- Automatically remove private-room members who never start a timer within
-- 15 minutes, whose timer is still at 0:00, or whose timer heartbeat is stale.
CREATE OR REPLACE FUNCTION public.cleanup_inactive_study_room_members()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  removed_count integer;
BEGIN
  WITH removed AS (
    DELETE FROM public.study_room_members AS member
    WHERE
      (
        EXISTS (
          SELECT 1
          FROM public.active_sessions AS session
          WHERE session.user_id = member.user_id
            AND (
              session.elapsed_seconds <= 0
              OR session.last_seen_at < now() - interval '15 minutes'
            )
        )
        OR (
          member.last_seen_at < now() - interval '15 minutes'
          AND NOT EXISTS (
            SELECT 1
            FROM public.active_sessions AS session
            WHERE session.user_id = member.user_id
          )
        )
      )
    RETURNING 1
  )
  SELECT count(*)::integer INTO removed_count FROM removed;

  RETURN removed_count;
END;
$function$;

REVOKE ALL ON FUNCTION public.cleanup_inactive_study_room_members() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_inactive_study_room_members() TO service_role;

CREATE INDEX IF NOT EXISTS study_room_members_last_seen_idx
  ON public.study_room_members (last_seen_at);

CREATE INDEX IF NOT EXISTS active_sessions_last_seen_elapsed_idx
  ON public.active_sessions (last_seen_at, elapsed_seconds);

SELECT cron.unschedule('cleanup-inactive-study-room-members')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-inactive-study-room-members'
);

SELECT cron.schedule(
  'cleanup-inactive-study-room-members',
  '* * * * *',
  $$SELECT public.cleanup_inactive_study_room_members();$$
);
