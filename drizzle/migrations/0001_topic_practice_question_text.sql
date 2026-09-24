ALTER TABLE public.topic_practice_attempts
  ADD COLUMN IF NOT EXISTS question_text text;
