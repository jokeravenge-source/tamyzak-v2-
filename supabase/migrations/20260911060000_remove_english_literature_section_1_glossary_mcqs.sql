-- Remove the direct glossary/word-meaning questions from English Literature Section 1.
-- Keep the True/False, comprehension, and sentence-completion questions.
DELETE FROM public.mcq_banks
WHERE subject = 'english_literature'
  AND chapter = 1
  AND source = 'English Literature Section 1'
  AND (
    sort_order BETWEEN 1 AND 6
    OR sort_order BETWEEN 21 AND 28
  );
