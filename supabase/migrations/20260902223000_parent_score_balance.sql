CREATE TABLE IF NOT EXISTS public.parent_student_score_balances (
  link_id uuid PRIMARY KEY REFERENCES public.parent_follow_links(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 5 CHECK (score >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parent_student_score_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.parent_follow_links(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL,
  delta smallint NOT NULL CHECK (delta IN (-1, 1)),
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS parent_student_score_events_link_created_idx
  ON public.parent_student_score_events(link_id, created_at DESC);

ALTER TABLE public.parent_student_score_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_score_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.parent_student_score_balances FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.parent_student_score_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.parent_student_score_balances TO service_role;
GRANT ALL ON public.parent_student_score_events TO service_role;

CREATE OR REPLACE FUNCTION public.adjust_parent_student_score(_link_id uuid, _student_user_id uuid, _delta integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE current_score integer; next_score integer;
BEGIN
  IF _delta NOT IN (-1, 1) THEN RAISE EXCEPTION 'invalid_delta'; END IF;
  INSERT INTO public.parent_student_score_balances(link_id, student_user_id, score)
  VALUES (_link_id, _student_user_id, 5) ON CONFLICT (link_id) DO NOTHING;
  SELECT score INTO current_score FROM public.parent_student_score_balances WHERE link_id = _link_id FOR UPDATE;
  next_score := greatest(0, current_score + _delta);
  IF next_score = current_score THEN RETURN current_score; END IF;
  UPDATE public.parent_student_score_balances SET score = next_score, updated_at = now() WHERE link_id = _link_id;
  INSERT INTO public.parent_student_score_events(link_id, student_user_id, delta, balance_after)
  VALUES (_link_id, _student_user_id, _delta, next_score);
  RETURN next_score;
END;
$function$;

REVOKE ALL ON FUNCTION public.adjust_parent_student_score(uuid, uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_parent_student_score(uuid, uuid, integer) TO service_role;

DO $block$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.student_todos;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$block$;
