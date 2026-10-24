-- Allowlist of approved accounts can claim ownership of study rooms
-- they have joined. Checked by user id: display names are user-editable and
-- would let any student claim ownership by renaming themselves.
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
      AND p.user_id IN (
        '9bfa55d4-c704-4b71-b76c-3190e94cdea0',  -- Zahraa Alsafar🦦
        '7a6ef4b4-97bf-4647-b6ce-9dc5603634e0',  -- هِمَّمْ
        '8c4d7c21-561d-4aba-a725-d190995073af',  -- anne_redmoon
        '12d70bf3-d925-4570-b81e-83ed9dba136a',  -- abrar
        'd27f6875-8311-4a5e-80dd-678de64790ed',  -- hydrogen
        '5ae5ed8e-796b-4c69-82bd-fc72b4013d4c'   -- قمر عبدالله
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