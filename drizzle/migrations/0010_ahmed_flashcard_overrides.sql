CREATE TABLE public.ahmed_flashcard_overrides (
 chapter integer NOT NULL,
 language text NOT NULL,
 card_id text NOT NULL,
 question text,
 answer text,
 deleted boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (chapter, language, card_id)
);
GRANT SELECT ON public.ahmed_flashcard_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ahmed_flashcard_overrides TO authenticated;
GRANT ALL ON public.ahmed_flashcard_overrides TO service_role;
ALTER TABLE public.ahmed_flashcard_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads Ahmed card corrections" ON public.ahmed_flashcard_overrides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert Ahmed card corrections" ON public.ahmed_flashcard_overrides FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update Ahmed card corrections" ON public.ahmed_flashcard_overrides FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins reset Ahmed card corrections" ON public.ahmed_flashcard_overrides FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.validate_ahmed_flashcard_override() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.chapter NOT BETWEEN 1 AND 8 OR NEW.language NOT IN ('ar','en') OR length(trim(NEW.card_id)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid card identity'; END IF;
 IF NOT NEW.deleted AND (NEW.question IS NULL OR NEW.answer IS NULL OR length(trim(NEW.question)) NOT BETWEEN 1 AND 12000 OR length(trim(NEW.answer)) NOT BETWEEN 1 AND 30000) THEN RAISE EXCEPTION 'Question and answer are required'; END IF;
 NEW.updated_at := now();
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_ahmed_flashcard_override BEFORE INSERT OR UPDATE ON public.ahmed_flashcard_overrides FOR EACH ROW EXECUTE FUNCTION public.validate_ahmed_flashcard_override();