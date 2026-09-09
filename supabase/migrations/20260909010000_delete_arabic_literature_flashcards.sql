-- Arabic literature is represented by chapters 1 and 7 in the flashcard bank.
-- Keep the Arabic grammar chapters untouched.
DELETE FROM public.custom_flashcards
WHERE lower(subject) = 'arabic'
  AND chapter IN ('1', '7');
