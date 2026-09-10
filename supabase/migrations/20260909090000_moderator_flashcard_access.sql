-- Moderators can manage flashcards, but do not inherit access to other admin data.
CREATE POLICY "Moderators insert flashcards"
ON public.custom_flashcards
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'moderator'::public.app_role));

CREATE POLICY "Moderators update flashcards"
ON public.custom_flashcards
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'moderator'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'moderator'::public.app_role));

CREATE POLICY "Moderators delete flashcards"
ON public.custom_flashcards
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'moderator'::public.app_role));
