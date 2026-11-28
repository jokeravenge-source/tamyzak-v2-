-- Self-reported topics are separate from observed attempts and mistake history.
CREATE TABLE public.student_study_focus (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology', 'english', 'english_literature', 'french', 'islamic', 'math')),
  topic_keys text[] NOT NULL CHECK (
    cardinality(topic_keys) BETWEEN 1 AND 5
    AND array_ndims(topic_keys) = 1
    AND array_to_string(topic_keys, ',', '') ~ '^[a-z0-9][a-z0-9-]{0,63}(,[a-z0-9][a-z0-9-]{0,63}){0,4}$'
  ),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, subject)
);
ALTER TABLE public.student_study_focus ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.student_study_focus FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_study_focus TO authenticated;
CREATE POLICY student_study_focus_owner ON public.student_study_focus
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
