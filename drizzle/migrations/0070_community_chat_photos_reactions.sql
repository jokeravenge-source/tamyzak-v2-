ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS photo_paths text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.community_posts
  DROP CONSTRAINT IF EXISTS community_posts_body_check,
  DROP CONSTRAINT IF EXISTS community_posts_content_check;
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_content_check CHECK (
  char_length(body) <= 2000
  AND COALESCE(array_ndims(photo_paths), 1) = 1
  AND cardinality(photo_paths) <= 4
  AND (cardinality(photo_paths) > 0 OR body ~ '[^[:space:]]')
);
GRANT INSERT (photo_paths) ON public.community_posts TO authenticated;
CREATE INDEX IF NOT EXISTS community_posts_photo_paths_idx ON public.community_posts USING gin (photo_paths)
  WHERE cardinality(photo_paths) > 0;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community-chat-photos', 'community-chat-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Chat members read attached photos" ON storage.objects;
CREATE POLICY "Chat members read attached photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'community-chat-photos' AND (SELECT auth.uid()) IS NOT NULL AND (
    split_part(name, '/', 1) = (SELECT auth.uid())::text OR EXISTS (
      SELECT 1 FROM public.community_posts AS p WHERE cardinality(p.photo_paths) > 0 AND p.photo_paths @> ARRAY[name]
    )
  ));

DROP POLICY IF EXISTS "Chat authors upload their own photos" ON storage.objects;
CREATE POLICY "Chat authors upload their own photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community-chat-photos' AND split_part(name, '/', 1) = (SELECT auth.uid())::text
    AND name ~ '^[^/]+/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[1-4][.](jpg|png|webp)$');

DROP POLICY IF EXISTS "Chat authors remove their unattached photos" ON storage.objects;
CREATE POLICY "Chat authors remove their unattached photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'community-chat-photos' AND split_part(name, '/', 1) = (SELECT auth.uid())::text AND NOT EXISTS (
    SELECT 1 FROM public.community_posts AS p WHERE cardinality(p.photo_paths) > 0 AND p.photo_paths @> ARRAY[name]
  ));

CREATE OR REPLACE FUNCTION public.validate_community_chat_photos()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  attachment text;
BEGIN
  IF cardinality(NEW.photo_paths) <> (SELECT count(DISTINCT path) FROM unnest(NEW.photo_paths) AS files(path)) THEN
    RAISE EXCEPTION 'Invalid or duplicate photo attachment' USING ERRCODE = '23514';
  END IF;
  FOREACH attachment IN ARRAY NEW.photo_paths LOOP
    IF attachment !~ ('^' || NEW.author_id::text || '/' || NEW.id::text || '/[1-4][.](jpg|png|webp)$')
       OR NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'community-chat-photos' AND name = attachment) THEN
      RAISE EXCEPTION 'Invalid or missing photo attachment' USING ERRCODE = '23514';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_community_chat_photos() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS validate_community_chat_photos ON public.community_posts;
CREATE TRIGGER validate_community_chat_photos BEFORE INSERT OR UPDATE OF photo_paths ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_community_chat_photos();

CREATE TABLE IF NOT EXISTS public.community_post_reactions (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('like', 'dislike')),
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS community_post_reactions_user_idx ON public.community_post_reactions (user_id);
ALTER TABLE public.community_post_reactions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.community_post_reactions FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.community_post_reactions TO service_role;

CREATE OR REPLACE FUNCTION public.community_chat_reaction_summary(_post_id uuid)
RETURNS TABLE (like_count integer, dislike_count integer, viewer_reaction text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT count(*) FILTER (WHERE r.reaction = 'like')::integer,
    count(*) FILTER (WHERE r.reaction = 'dislike')::integer,
    max(r.reaction) FILTER (WHERE r.user_id = (SELECT auth.uid()))
  FROM public.community_post_reactions AS r
  WHERE r.post_id = _post_id AND (SELECT auth.uid()) IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.set_community_chat_reaction(_post_id uuid, _reaction text)
RETURNS TABLE (like_count integer, dislike_count integer, viewer_reaction text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  viewer uuid := auth.uid();
BEGIN
  IF viewer IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF _reaction IS NULL THEN
    DELETE FROM public.community_post_reactions WHERE post_id = _post_id AND user_id = viewer;
  ELSE
    INSERT INTO public.community_post_reactions (post_id, user_id, reaction) VALUES (_post_id, viewer, _reaction)
    ON CONFLICT (post_id, user_id) DO UPDATE SET reaction = EXCLUDED.reaction;
  END IF;
  RETURN QUERY SELECT * FROM public.community_chat_reaction_summary(_post_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.list_community_chat_posts_v2(
  _before_at timestamptz DEFAULT NULL,
  _before_id uuid DEFAULT NULL
)
RETURNS TABLE (id uuid, author_id uuid, author_name text, body text, created_at timestamptz, comment_count integer,
  photo_paths text[], like_count integer, dislike_count integer, viewer_reaction text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT page.id, page.author_id, page.author_name, page.body, page.created_at, page.comment_count, p.photo_paths,
    r.like_count, r.dislike_count, r.viewer_reaction
  FROM public.list_community_chat_posts(_before_at, _before_id) AS page
  JOIN public.community_posts AS p ON p.id = page.id
  CROSS JOIN LATERAL public.community_chat_reaction_summary(p.id) AS r
  ORDER BY page.created_at DESC, page.id DESC;
$$;

REVOKE ALL ON FUNCTION public.community_chat_reaction_summary(uuid), public.set_community_chat_reaction(uuid, text),
  public.list_community_chat_posts_v2(timestamptz, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.community_chat_reaction_summary(uuid), public.set_community_chat_reaction(uuid, text),
  public.list_community_chat_posts_v2(timestamptz, uuid) TO authenticated;
