-- Nadia Al-Nuaimi · both curricula · Chapters 2, 3, and 4
-- Navigation is topic-based, so keep MCQ titles focused on the topic rather
-- than exposing the legacy lecture numbering. Topic keys remain unchanged.

UPDATE public.teacher_topic_mcqs
SET title = regexp_replace(
  title,
  '^(المحاضرة|Lecture)\s+[0-9]+\s+—\s+',
  '',
  'i'
)
WHERE teacher_id = 'nadia-al-nuaimy'
  AND topic_key ~ '^nadia-(ar|en)-ch(2|3|4)-lec[0-9]+-exam$';
