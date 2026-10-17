-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 3
-- Seed the supplied oogenesis MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec3-exam',
  'Lecture 3 — Oogenesis',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Where are ova formed in vertebrates, and what is the chromosomal set of "oogonia"?',
      'choices', jsonb_build_array('In the oviduct; they are haploid (1n).', 'In the ovary; they are diploid (2n).', 'In the uterus; they are diploid (2n).', 'In the ovarian follicle; they are haploid (1n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What constitutes the "ovarian follicle" in mammals?',
      'choices', jsonb_build_array('The secondary oocyte along with the first polar body.', 'The primary oocyte surrounded by small cells called follicular cells.', 'The ooblast surrounded by primordial germ cells.', 'The oogonium along with its nourishing blood vessels.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain—based on the study guide—why the first meiotic division of the primary oocyte results in two cells of unequal size.',
      'choices', jsonb_build_array('Due to the unequal distribution of chromosomes during anaphase.', 'Due to unequal cytoplasmic division; the larger cell is called the secondary oocyte, and the smaller one is the first polar body.', 'Because the smaller cell completely loses its nucleus and degenerates.', 'As a result of the inhibitory effect of pituitary hormones (FSH) on growth.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What cells result from the second meiotic division of the secondary oocyte (1n) and the first polar body?',
      'choices', jsonb_build_array('Four mature eggs of equal size (1n).', 'One large ootid (which develops into a mature egg) and three haploid polar bodies (1n).', 'New diploid oogonia.', 'A diploid zygote and two polar bodies.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal set for each of the following: the ootid and the second polar body?',
      'choices', jsonb_build_array('Ootid (2n), second polar body (1n).', 'Ootid (1n), second polar body (1n).', 'Ootid (2n), second polar body (2n).', 'Ootid (1n), second polar body (2n).'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec3-exam'
    AND title = 'Lecture 3 — Oogenesis'
);
