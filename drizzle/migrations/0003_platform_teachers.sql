CREATE TABLE IF NOT EXISTS public.platform_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
  background_image_url text NOT NULL,
  background_image_path text NOT NULL,
  tools text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS platform_teachers_published_order_idx ON public.platform_teachers (is_published, sort_order, created_at);
GRANT SELECT ON public.platform_teachers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_teachers TO authenticated;
GRANT ALL ON public.platform_teachers TO service_role;
ALTER TABLE public.platform_teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published teachers" ON public.platform_teachers;
CREATE POLICY "Anyone can view published teachers" ON public.platform_teachers FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can add teachers" ON public.platform_teachers;
CREATE POLICY "Admins can add teachers" ON public.platform_teachers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update teachers" ON public.platform_teachers;
CREATE POLICY "Admins can update teachers" ON public.platform_teachers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete teachers" ON public.platform_teachers;
CREATE POLICY "Admins can delete teachers" ON public.platform_teachers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS platform_teachers_updated_at ON public.platform_teachers;
CREATE TRIGGER platform_teachers_updated_at BEFORE UPDATE ON public.platform_teachers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP POLICY IF EXISTS "Teacher images are public" ON storage.objects;
CREATE POLICY "Teacher images are public" ON storage.objects FOR SELECT USING (bucket_id = 'teacher-images');
DROP POLICY IF EXISTS "Admins can upload teacher images" ON storage.objects;
CREATE POLICY "Admins can upload teacher images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'teacher-images' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update teacher images" ON storage.objects;
CREATE POLICY "Admins can update teacher images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'teacher-images' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'teacher-images' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete teacher images" ON storage.objects;
CREATE POLICY "Admins can delete teacher images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'teacher-images' AND public.has_role(auth.uid(), 'admin'));