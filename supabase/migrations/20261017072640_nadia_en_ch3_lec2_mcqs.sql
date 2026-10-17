-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 2
-- Seed the supplied spermatogenesis MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec2-exam',
  'Lecture 2 — Spermatogenesis',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Where are spermatozoa (sperm cells) formed in mammals, and what are the precursor cells that initiate the process?',
      'choices', jsonb_build_array('In the transport ducts; starting from primordial germ cells.', 'In the testis (within the seminiferous tubules); starting from the primordial germ cells lining the tubules.', 'In the epididymis; starting from diploid spermatogonia.', 'In the seminal vesicle; starting from secretory Golgi cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal complement of "spermatogonia" following their ordinary (mitotic) divisions?',
      'choices', jsonb_build_array('Haploid (1n).', 'Diploid (2n).', 'Triploid (3n).', 'Tetraploid (4n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the name of the cell resulting from the growth and enlargement of a spermatogonium, and what is its chromosomal complement?',
      'choices', jsonb_build_array('Secondary spermatocyte (1n).', 'Spermatid (1n).', 'Primary spermatocyte (2n).', 'Mature sperm (1n).'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What is produced by the first meiotic division of a primary spermatocyte (2n)?',
      'choices', jsonb_build_array('Two secondary spermatocytes of equal size, each being haploid (1n).', 'Four spermatids of equal size (1n).', 'Two secondary spermatocytes of unequal size (2n).', 'New spermatogonia ready for growth.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the final product of the second meiotic division of the two secondary spermatocytes?',
      'choices', jsonb_build_array('Two diploid spermatogonia.', 'Four spermatids of equal size that are haploid (n).', 'One mature sperm and three degenerating polar bodies.', 'A fertilized egg ready for division.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the correct sequence of stages for spermatogenesis from beginning to end?',
      'choices', jsonb_build_array('Primary spermatocyte ➔ Spermatogonium ➔ Spermatid ➔ Secondary spermatocyte.', 'Spermatogonium ➔ Primary spermatocyte ➔ Secondary spermatocyte ➔ Spermatid ➔ Mature sperm.', 'Spermatid ➔ Secondary spermatocyte ➔ Primary spermatocyte ➔ Mature sperm.', 'Germ cells ➔ Spermatid ➔ Spermatogonium ➔ Mature sperm.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec2-exam'
    AND title = 'Lecture 2 — Spermatogenesis'
);
