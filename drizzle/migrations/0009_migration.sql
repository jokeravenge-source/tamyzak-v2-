CREATE TABLE public.video_notes_cache (
  cache_key text PRIMARY KEY,
  notes text NOT NULL,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.video_notes_cache TO service_role;
ALTER TABLE public.video_notes_cache ENABLE ROW LEVEL SECURITY;