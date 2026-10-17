-- Present Nadia's Arabic Chapter 1 and Chapter 5 MCQ sets by subject topic.
-- Topic keys remain unchanged so existing questions, notes, and links keep working.
UPDATE public.teacher_topic_mcqs
SET title = regexp_replace(
  title,
  '^المحاضرة[[:space:]]+[0-9]+[[:space:]]+—[[:space:]]+',
  ''
)
WHERE teacher_id = 'nadia-al-nuaimy'
  AND (
    topic_key LIKE 'nadia-ar-ch1-lec%-exam'
    OR topic_key LIKE 'nadia-ar-ch5-lec%-exam'
  );
