-- Present Nadia's English Chapter 1 and Chapter 5 MCQ sets by subject topic.
-- Existing topic keys remain stable for notes, questions, and deep links.
UPDATE public.teacher_topic_mcqs
SET title = regexp_replace(
  title,
  '^Lecture[[:space:]]+[0-9]+[[:space:]]+—[[:space:]]+',
  ''
)
WHERE teacher_id = 'nadia-al-nuaimy'
  AND (
    topic_key LIKE 'nadia-en-ch1-lec%-exam'
    OR topic_key LIKE 'nadia-en-ch5-lec%-exam'
  );
