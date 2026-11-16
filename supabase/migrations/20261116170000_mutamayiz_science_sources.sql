-- Curated provenance, never seeded from model memory or undated question banks.
CREATE TABLE IF NOT EXISTS public.science_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year text NOT NULL CHECK (academic_year ~ '^20[0-9]{2}-20[0-9]{2}$'),
  curriculum text NOT NULL CHECK (curriculum IN ('ar', 'en')),
  subject text NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology', 'math')),
  question text NOT NULL CHECK (char_length(question) BETWEEN 1 AND 6000),
  excerpt text NOT NULL CHECK (char_length(excerpt) BETWEEN 1 AND 6000),
  book_title text,
  book_edition text,
  chapter text,
  printed_page integer CHECK (printed_page BETWEEN 1 AND 10000),
  pdf_page integer CHECK (pdf_page BETWEEN 1 AND 10000),
  book_url text CHECK (book_url ~ '^https://'),
  classification text CHECK (classification IN ('curriculum', 'enrichment', 'mixed')),
  classification_url text CHECK (classification_url ~ '^https://'),
  exams jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(exams) = 'array' AND jsonb_array_length(exams) <= 50),
  verified boolean NOT NULL DEFAULT false,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', question || ' ' || excerpt)) STORED,
  CHECK ((printed_page IS NULL AND pdf_page IS NULL) OR (book_title IS NOT NULL AND book_edition IS NOT NULL AND book_url IS NOT NULL)),
  CHECK (classification IS NULL OR classification_url IS NOT NULL)
);
ALTER TABLE public.science_sources ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.science_sources TO authenticated;
GRANT ALL ON public.science_sources TO service_role;
DROP POLICY IF EXISTS "Students read verified science sources" ON public.science_sources;
CREATE POLICY "Students read verified science sources" ON public.science_sources FOR SELECT TO authenticated
  USING (verified OR public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins curate science sources" ON public.science_sources;
CREATE POLICY "Admins curate science sources" ON public.science_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS science_sources_search_idx ON public.science_sources USING gin(search_vector);
CREATE INDEX IF NOT EXISTS science_sources_curriculum_idx ON public.science_sources(academic_year, curriculum) WHERE verified;

CREATE OR REPLACE FUNCTION public.search_science_sources(question_text text, curriculum_key text, school_year text)
RETURNS SETOF public.science_sources
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  WITH terms AS (
    SELECT term FROM regexp_split_to_table(left(question_text, 6000), '[^[:alnum:]]+') term
    WHERE char_length(term) > 2 LIMIT 64
  ), query AS (
    SELECT websearch_to_tsquery('simple', coalesce(string_agg('"' || term || '"', ' OR '), '')) AS q FROM terms
  )
  SELECT s.* FROM public.science_sources s CROSS JOIN query
  WHERE s.verified AND s.academic_year = school_year AND s.curriculum = curriculum_key
    AND (s.question = left(question_text, 6000) OR s.search_vector @@ query.q)
  ORDER BY (s.question = left(question_text, 6000)) DESC,
    ts_rank_cd(s.search_vector, query.q) DESC, s.id
  LIMIT 8;
$$;
REVOKE ALL ON FUNCTION public.search_science_sources(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_science_sources(text, text, text) TO authenticated;
