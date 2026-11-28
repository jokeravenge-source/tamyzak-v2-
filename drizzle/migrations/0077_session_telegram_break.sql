ALTER TABLE public.session_telegram_posts
  DROP CONSTRAINT IF EXISTS session_telegram_posts_kind_check;

ALTER TABLE public.session_telegram_posts
  ADD CONSTRAINT session_telegram_posts_kind_check CHECK (kind IN ('session', 'break', 'battle'));

CREATE OR REPLACE FUNCTION public.session_telegram_room_count()
RETURNS integer
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT (
    SELECT count(*)::integer
    FROM public.study_room_members AS member
    LEFT JOIN public.active_sessions AS timer
      ON timer.user_id = member.user_id
      AND timer.subject = COALESCE(room.subject, 'general')
    WHERE member.room_id = room.id
      AND (
        member.last_seen_at >= now() - interval '15 minutes'
        OR timer.last_seen_at >= now() - interval '15 minutes'
      )
  )
  FROM public.study_rooms AS room
  WHERE room.code = '37ECJK' AND room.is_active;
$$;

REVOKE ALL ON FUNCTION public.session_telegram_room_count() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.session_telegram_room_count() TO service_role;