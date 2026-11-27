CREATE TABLE IF NOT EXISTS public.community_friends (
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, friend_id),
  CONSTRAINT community_friends_no_self CHECK (owner_id <> friend_id),
  CONSTRAINT community_friends_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT community_friends_friend_account_fkey FOREIGN KEY (friend_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS community_friends_friend_id_idx ON public.community_friends (friend_id);
ALTER TABLE public.community_friends ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.community_friends FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.community_friends TO authenticated;
GRANT ALL ON TABLE public.community_friends TO service_role;

DROP POLICY IF EXISTS "Read own friends" ON public.community_friends;
CREATE POLICY "Read own friends" ON public.community_friends FOR SELECT TO authenticated
  USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Add own friends" ON public.community_friends;
CREATE POLICY "Add own friends" ON public.community_friends FOR INSERT TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Remove own friends" ON public.community_friends;
CREATE POLICY "Remove own friends" ON public.community_friends FOR DELETE TO authenticated
  USING (owner_id = (SELECT auth.uid()));
