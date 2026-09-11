-- Sentence completions use the same glossary vocabulary, so remove them too.
DELETE FROM public.mcq_banks
WHERE subject = 'english_literature'
  AND chapter = 1
  AND source = 'English Literature Section 1'
  AND sort_order BETWEEN 29 AND 36;
