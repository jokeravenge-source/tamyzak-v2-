CREATE TABLE public.trip_journeys (
  id text PRIMARY KEY,
  user_id uuid NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.trip_journeys TO authenticated;
GRANT ALL ON public.trip_journeys TO service_role;
ALTER TABLE public.trip_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journeys read" ON public.trip_journeys FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own journeys insert" ON public.trip_journeys FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own journeys update" ON public.trip_journeys FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE INDEX trip_journeys_user_idx ON public.trip_journeys(user_id);