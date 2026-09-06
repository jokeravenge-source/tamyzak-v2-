CREATE TABLE IF NOT EXISTS public.parent_student_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.parent_follow_links(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL,
  subject text NOT NULL,
  title text NOT NULL,
  score numeric NOT NULL,
  max_score numeric NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parent_student_scores TO authenticated;
GRANT ALL ON public.parent_student_scores TO service_role;
ALTER TABLE public.parent_student_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view their own parent scores" ON public.parent_student_scores
  FOR SELECT TO authenticated USING (student_user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.parent_student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.parent_follow_links(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL,
  note_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parent_student_notes TO authenticated;
GRANT ALL ON public.parent_student_notes TO service_role;
ALTER TABLE public.parent_student_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view their own parent notes" ON public.parent_student_notes
  FOR SELECT TO authenticated USING (student_user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.parent_student_score_balances (
  link_id uuid PRIMARY KEY REFERENCES public.parent_follow_links(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parent_student_score_balances TO authenticated;
GRANT ALL ON public.parent_student_score_balances TO service_role;
ALTER TABLE public.parent_student_score_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view their own parent score balance" ON public.parent_student_score_balances
  FOR SELECT TO authenticated USING (student_user_id = auth.uid());

CREATE TRIGGER parent_student_scores_updated_at BEFORE UPDATE ON public.parent_student_scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER parent_student_notes_updated_at BEFORE UPDATE ON public.parent_student_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER parent_student_score_balances_updated_at BEFORE UPDATE ON public.parent_student_score_balances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.adjust_parent_student_score(_link_id uuid, _student_user_id uuid, _delta integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _new integer;
BEGIN
  INSERT INTO public.parent_student_score_balances (link_id, student_user_id, score)
  VALUES (_link_id, _student_user_id, GREATEST(0, LEAST(100, 5 + _delta)))
  ON CONFLICT (link_id) DO UPDATE
    SET score = GREATEST(0, LEAST(100, public.parent_student_score_balances.score + _delta)),
        updated_at = now()
  RETURNING score INTO _new;
  RETURN _new;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.adjust_parent_student_score(uuid, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_parent_student_score(uuid, uuid, integer) TO service_role;