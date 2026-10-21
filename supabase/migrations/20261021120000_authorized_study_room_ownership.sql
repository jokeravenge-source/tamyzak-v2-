-- A small allowlist of approved accounts can claim ownership of study rooms
-- they have joined. This is intentionally separate from the admin role.
CREATE OR REPLACE FUNCTION public.can_take_study_room_ownership()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND regexp_replace(
        translate(lower(coalesce(p.display_name, '')), 'أإآىؤئ', 'ااايوي'),
        '[@ًٌٍَُِّْٰـ[:space:]]',
        '',
        'g'
      ) IN (
        'zahraalsafar🦦',
        'همم',
        'anne_redmoon',
        'abrar',
        'hydrogen',
        'قمرعبدالله'
      )
  );
$$;

REVOKE ALL ON FUNCTION public.can_take_study_room_ownership() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_take_study_room_ownership() TO authenticated;

-- The RPC only changes owner_id after checking both the allowlist and active
-- room membership; delegates do not receive broad UPDATE access to rooms.
CREATE OR REPLACE FUNCTION public.take_study_room_ownership(_room uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.can_take_study_room_ownership() THEN
    RAISE EXCEPTION 'Not authorized to take room ownership';
  END IF;

  IF NOT public.is_study_room_member(_room)
     OR public.is_banned_from_room(_room) THEN
    RAISE EXCEPTION 'Join the room before taking ownership';
  END IF;

  UPDATE public.study_rooms
  SET owner_id = auth.uid()
  WHERE id = _room AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active room not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.take_study_room_ownership(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.take_study_room_ownership(uuid) TO authenticated;
