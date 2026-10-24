CREATE TABLE public.player_lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text,
  youtube_url text NOT NULL,
  video_id text NOT NULL CHECK (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.player_lectures TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_lectures TO authenticated;
GRANT ALL ON public.player_lectures TO service_role;
ALTER TABLE public.player_lectures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published player lectures" ON public.player_lectures FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins manage player lectures" ON public.player_lectures FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX player_lectures_published_order_idx ON public.player_lectures (published, sort_order, created_at DESC);
CREATE TRIGGER player_lectures_set_updated_at BEFORE UPDATE ON public.player_lectures FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();