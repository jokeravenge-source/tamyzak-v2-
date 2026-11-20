-- Invitation rows remain protected by the existing participant RLS policies.
-- Publish changes so the recipient sees new/withdrawn invitations immediately.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'battle_invites'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_invites;
  END IF;
END $$;

-- Clients only change status: invitation identity and room settings stay immutable.
REVOKE UPDATE ON public.battle_invites FROM authenticated;
GRANT UPDATE (status) ON public.battle_invites TO authenticated;
DROP POLICY IF EXISTS "Participants can update invites" ON public.battle_invites;
CREATE POLICY "Senders cancel pending battle invites"
ON public.battle_invites FOR UPDATE TO authenticated
USING (auth.uid() = from_user_id AND status = 'pending')
WITH CHECK (auth.uid() = from_user_id AND status = 'cancelled');
CREATE POLICY "Recipients respond to fresh battle invites"
ON public.battle_invites FOR UPDATE TO authenticated
USING (auth.uid() = to_user_id AND status = 'pending' AND created_at > now() - interval '3 minutes')
WITH CHECK (auth.uid() = to_user_id AND status IN ('accepted', 'declined'));
