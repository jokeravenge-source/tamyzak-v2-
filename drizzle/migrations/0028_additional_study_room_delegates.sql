CREATE OR REPLACE FUNCTION public.can_take_study_room_ownership() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.user_id IN (
'9bfa55d4-c704-4b71-b76c-3190e94cdea0'::uuid,
'7a6ef4b4-97bf-4647-b6ce-9dc5603634e0'::uuid,
'8c4d7c21-561d-4aba-a725-d190995073af'::uuid,
'12d70bf3-d925-4570-b81e-83ed9dba136a'::uuid,
'd27f6875-8311-4a5e-80dd-678de64790ed'::uuid,
'5ae5ed8e-796b-4c69-82bd-fc72b4013d4c'::uuid,
'b2af86d5-c721-4fd7-843f-c2ef39dab017'::uuid,
'1a92bc34-0d13-412d-ac8e-330ca8552b67'::uuid,
'71013191-b96a-4ae4-892d-e23b86b79706'::uuid
));
$$;
REVOKE ALL ON FUNCTION public.can_take_study_room_ownership() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_take_study_room_ownership() TO authenticated;