-- Correct the lecture assignment for Nadia Al-Nuaimi's English Chapter 1 cell-theory MCQ bank.
UPDATE public.teacher_topic_mcqs
SET
  topic_key = 'nadia-en-ch1-lec2-exam',
  title = 'Lecture 2 — Introduction to Cells and Cell Theory'
WHERE teacher_id = 'nadia-al-nuaimy'
  AND topic_key = 'nadia-en-ch1-lec1-exam'
  AND title = 'Lecture 1 — Introduction to Cells and Cell Theory';
