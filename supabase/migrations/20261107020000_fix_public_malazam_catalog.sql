-- has_role is intentionally not executable by anon. A SELECT policy that
-- includes it, even behind an OR, makes anonymous catalog reads fail with
-- 42501 before rows can be returned. Keep public reads independent of it.
BEGIN;

ALTER POLICY "Published malazam are publicly readable"
ON public.malazam
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Admins read all malazam" ON public.malazam;
CREATE POLICY "Admins read all malazam"
ON public.malazam FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Admin writes, hidden records, private PDF objects, and Telegram download
-- verification keep their existing permissions. Do not grant has_role to anon.
COMMIT;
