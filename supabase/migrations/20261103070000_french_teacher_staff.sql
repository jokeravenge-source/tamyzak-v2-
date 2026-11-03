-- Subject-scoped teaching staff do not receive admin/moderator roles.
CREATE TABLE public.french_flashcard_staff (
  email text PRIMARY KEY CHECK (email = lower(trim(email))),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.french_flashcard_staff ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.is_french_flashcard_owner() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND lower(email) = 'majs11@gmail.com')
    AND public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

CREATE FUNCTION public.is_french_flashcard_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.french_flashcard_staff s
    JOIN auth.users u ON lower(u.email) = s.email WHERE u.id = auth.uid()
  );
$$;

CREATE POLICY "Owner manages French staff" ON public.french_flashcard_staff
FOR ALL TO authenticated USING (public.is_french_flashcard_owner())
WITH CHECK (public.is_french_flashcard_owner());

CREATE FUNCTION public.french_flashcard_access() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT jsonb_build_object(
  'allowed', public.is_french_flashcard_staff() OR public.has_role(auth.uid(), 'admin'::public.app_role),
  'owner', public.is_french_flashcard_owner()
); $$;

CREATE FUNCTION public.manage_french_flashcard_staff(staff_email text DEFAULT NULL, action text DEFAULT 'list')
RETURNS SETOF public.french_flashcard_staff
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_french_flashcard_owner() THEN RAISE EXCEPTION 'Owner access required'; END IF;
  IF action NOT IN ('list', 'add', 'remove') THEN RAISE EXCEPTION 'Invalid action'; END IF;
  IF action IN ('add', 'remove') THEN
    IF staff_email IS NULL OR length(trim(staff_email)) > 254 OR trim(staff_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
      RAISE EXCEPTION 'Enter a valid staff email';
    END IF;
    IF action = 'add' THEN
      INSERT INTO public.french_flashcard_staff(email) VALUES(lower(trim(staff_email))) ON CONFLICT DO NOTHING;
    ELSE
      DELETE FROM public.french_flashcard_staff WHERE email = lower(trim(staff_email));
    END IF;
  END IF;
  RETURN QUERY SELECT * FROM public.french_flashcard_staff ORDER BY email;
END; $$;

REVOKE ALL ON FUNCTION public.is_french_flashcard_owner(), public.is_french_flashcard_staff(), public.french_flashcard_access(), public.manage_french_flashcard_staff(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_french_flashcard_owner(), public.is_french_flashcard_staff(), public.french_flashcard_access(), public.manage_french_flashcard_staff(text,text) TO authenticated;

CREATE POLICY "French staff read all French additions" ON public.custom_flashcards
FOR SELECT TO authenticated USING (subject = 'french' AND public.is_french_flashcard_staff());
CREATE POLICY "French staff insert French additions" ON public.custom_flashcards
FOR INSERT TO authenticated WITH CHECK (subject = 'french' AND created_by = auth.uid() AND public.is_french_flashcard_staff());
CREATE POLICY "French staff update French additions" ON public.custom_flashcards
FOR UPDATE TO authenticated USING (subject = 'french' AND public.is_french_flashcard_staff())
WITH CHECK (subject = 'french' AND public.is_french_flashcard_staff());
CREATE POLICY "French staff delete French additions" ON public.custom_flashcards
FOR DELETE TO authenticated USING (subject = 'french' AND public.is_french_flashcard_staff());

CREATE POLICY "French staff insert library changes" ON public.french_flashcard_overrides
FOR INSERT TO authenticated WITH CHECK (public.is_french_flashcard_staff());
CREATE POLICY "French staff update library changes" ON public.french_flashcard_overrides
FOR UPDATE TO authenticated USING (public.is_french_flashcard_staff()) WITH CHECK (public.is_french_flashcard_staff());
CREATE POLICY "French staff restore library changes" ON public.french_flashcard_overrides
FOR DELETE TO authenticated USING (public.is_french_flashcard_staff());
