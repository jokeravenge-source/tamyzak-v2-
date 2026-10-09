CREATE OR REPLACE FUNCTION public.cleanup_inactive_study_room_members()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  removed_count integer;
BEGIN
  -- Remove (not ban) members who have been in the room for over an hour
  -- without a running timer during the last hour. They can rejoin anytime.
  WITH removed AS (
    DELETE FROM public.study_room_members AS member
    WHERE member.joined_at < now() - interval '1 hour'
      AND NOT EXISTS (
        SELECT 1
        FROM public.active_sessions AS session
        WHERE session.user_id = member.user_id
          AND session.elapsed_seconds > 0
          AND session.last_seen_at >= now() - interval '1 hour'
      )
    RETURNING 1
  )
  SELECT count(*)::integer INTO removed_count FROM removed;
  RETURN removed_count;
END;
$function$;

REVOKE ALL ON FUNCTION public.cleanup_inactive_study_room_members() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_inactive_study_room_members() TO service_role;