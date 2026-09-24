-- Save the question prompt alongside each result so students can review it.
-- Earlier attempts remain valid and can be matched against the MCQ bank by hash.
ALTER TABLE public.topic_practice_attempts
  ADD COLUMN IF NOT EXISTS question_text text;
