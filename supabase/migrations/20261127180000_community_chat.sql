CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000 AND body ~ '[^[:space:]]'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000 AND body ~ '[^[:space:]]'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_posts_feed_idx ON public.community_posts (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS community_comments_thread_idx ON public.community_comments (post_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS community_posts_author_idx ON public.community_posts (author_id);
CREATE INDEX IF NOT EXISTS community_comments_author_idx ON public.community_comments (author_id);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.community_posts, public.community_comments FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.community_posts, public.community_comments TO authenticated;
GRANT INSERT (id, author_id, body) ON TABLE public.community_posts TO authenticated;
GRANT INSERT (id, post_id, author_id, body) ON TABLE public.community_comments TO authenticated;
GRANT ALL ON TABLE public.community_posts, public.community_comments TO service_role;

DROP POLICY IF EXISTS "Signed-in accounts read community posts" ON public.community_posts;
CREATE POLICY "Signed-in accounts read community posts" ON public.community_posts
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);
DROP POLICY IF EXISTS "Accounts create their own community posts" ON public.community_posts;
CREATE POLICY "Accounts create their own community posts" ON public.community_posts
  FOR INSERT TO authenticated WITH CHECK (author_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Authors and moderators remove community posts" ON public.community_posts;
CREATE POLICY "Authors and moderators remove community posts" ON public.community_posts FOR DELETE TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR (SELECT public.has_role(auth.uid(), 'admin'::public.app_role))
    OR (SELECT public.has_role(auth.uid(), 'moderator'::public.app_role))
  );

DROP POLICY IF EXISTS "Signed-in accounts read community comments" ON public.community_comments;
CREATE POLICY "Signed-in accounts read community comments" ON public.community_comments
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);
DROP POLICY IF EXISTS "Accounts create their own community comments" ON public.community_comments;
CREATE POLICY "Accounts create their own community comments" ON public.community_comments
  FOR INSERT TO authenticated WITH CHECK (author_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Authors and moderators remove community comments" ON public.community_comments;
CREATE POLICY "Authors and moderators remove community comments" ON public.community_comments FOR DELETE TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR (SELECT public.has_role(auth.uid(), 'admin'::public.app_role))
    OR (SELECT public.has_role(auth.uid(), 'moderator'::public.app_role))
  );

CREATE OR REPLACE FUNCTION public.list_community_chat_posts(
  _before_at timestamptz DEFAULT NULL,
  _before_id uuid DEFAULT NULL
)
RETURNS TABLE (id uuid, author_id uuid, author_name text, body text, created_at timestamptz, comment_count integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  WITH page AS (
    SELECT p.id, p.author_id, p.body, p.created_at
    FROM public.community_posts AS p
    WHERE _before_at IS NULL OR (p.created_at, p.id) < (_before_at, _before_id)
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT 21
  )
  SELECT p.id, p.author_id, profile.display_name, p.body, p.created_at,
    (SELECT count(*)::integer FROM public.community_comments AS c WHERE c.post_id = p.id)
  FROM page AS p
  LEFT JOIN public.profiles AS profile ON profile.user_id = p.author_id
  ORDER BY p.created_at DESC, p.id DESC;
$$;

CREATE OR REPLACE FUNCTION public.list_community_chat_comments(
  _post_id uuid,
  _before_at timestamptz DEFAULT NULL,
  _before_id uuid DEFAULT NULL
)
RETURNS TABLE (id uuid, author_id uuid, author_name text, body text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT c.id, c.author_id, profile.display_name, c.body, c.created_at
  FROM public.community_comments AS c
  LEFT JOIN public.profiles AS profile ON profile.user_id = c.author_id
  WHERE c.post_id = _post_id AND (_before_at IS NULL OR (c.created_at, c.id) < (_before_at, _before_id))
  ORDER BY c.created_at DESC, c.id DESC
  LIMIT 31;
$$;

REVOKE ALL ON FUNCTION public.list_community_chat_posts(timestamptz, uuid),
  public.list_community_chat_comments(uuid, timestamptz, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_community_chat_posts(timestamptz, uuid),
  public.list_community_chat_comments(uuid, timestamptz, uuid) TO authenticated;
