-- A single parent-controlled score balance per follow-up link.
-- Every student starts at 5; adjustments are atomic to avoid lost updates.
CREATE TABLE IF NOT EXISTS public.parent_student_score_balances (
  link_id uuid PRIMARY KEY REFERENCES public.parent_follow_links(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 5 CHECK (score >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parent_student_score_balances ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.parent_student_score_balances FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.parent_student_score_balances TO service_role;

CREATE OR REPLACE FUNCTION public.adjust_parent_student_score(
  _link_id uuid,
  _student_user_id uuid,
  _delta integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _score integer;
BEGIN
  IF _delta NOT BETWEEN -100 AND 100 OR _delta = 0 THEN
    RAISE EXCEPTION 'invalid_delta';
  END IF;

  INSERT INTO public.parent_student_score_balances (link_id, student_user_id, score)
  VALUES (_link_id, _student_user_id, greatest(0, 5 + _delta))
  ON CONFLICT (link_id) DO UPDATE
    SET score = greatest(0, parent_student_score_balances.score + _delta),
        updated_at = now()
  RETURNING score INTO _score;

  RETURN _score;
END;
$function$;

REVOKE ALL ON FUNCTION public.adjust_parent_student_score(uuid, uuid, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_parent_student_score(uuid, uuid, integer)
  TO service_role;
