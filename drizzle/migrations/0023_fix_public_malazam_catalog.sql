-- Keep anonymous catalog reads independent of has_role, which anon cannot execute.
ALTER POLICY "Published malazam are publicly readable"
ON public.malazam
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Admins read all malazam" ON public.malazam;
CREATE POLICY "Admins read all malazam"
ON public.malazam FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
