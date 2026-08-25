CREATE TABLE public.feature_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'feature',
  title_ar text NOT NULL,
  title_en text NOT NULL,
  desc_ar text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feature_announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_announcements TO authenticated;
GRANT ALL ON public.feature_announcements TO service_role;

ALTER TABLE public.feature_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active announcements"
ON public.feature_announcements FOR SELECT
USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert announcements"
ON public.feature_announcements FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update announcements"
ON public.feature_announcements FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete announcements"
ON public.feature_announcements FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER feature_announcements_updated_at
BEFORE UPDATE ON public.feature_announcements
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();