-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 21
-- Seed the supplied seed formation MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec21-exam',
  'Lecture 21 — Seed Formation',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'When does seed formation begin in flowering plants?',
      'choices', jsonb_build_array('Immediately upon the pollen grain landing on the stigma and the pollen tube beginning to grow.', 'Immediately after the double fertilization process, as the ovule transforms into a seed.', 'After the fruit has fully developed and its external color has changed.', 'Upon the degeneration of the synergid cells and the division of the antipodal cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What structural component forms the seed coats (testa)?',
      'choices', jsonb_build_array('The thickened outer ovary wall.', 'The integument(s) of the ovule after they have grown and hardened.', 'The endosperm tissue after it has been consumed by the embryo.', 'The funiculus (stalk) connected to the receptacle.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What constitutes a mature seed in dicotyledonous plants (such as broad beans and kidney beans) when endosperm is absent?',
      'choices', jsonb_build_array('Endosperm and embryonic cotyledons only.', 'The embryo (plumule, radicle, and hypocotyl) and the two cotyledons that have stored food, all enclosed by the testa.', 'The nucellus and the fused pollen grain.', 'Dead antipodal cells surrounded by a thick cellulose wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain (based on Ms. Nadia''s study guide): Why do mature broad bean and kidney bean seeds lack endosperm tissue?',
      'choices', jsonb_build_array('Because the endosperm nucleus did not undergo any mitotic divisions from the start.', 'Because the embryo completely consumes the endosperm during its growth and formation within the ovule.', 'Due to the breakdown of the endosperm by enzymes secreted through the micropyle.', 'Because the endosperm tissue transforms directly into a hard seed coat.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does a mature seed in monocotyledonous plants (such as corn, wheat, and rice) consist of?',
      'choices', jsonb_build_array('The embryo and the seed coat only, without any storage tissue.', 'The embryo, the cotyledon, and the food-storing endosperm tissue (which the embryo does not consume until after germination).', 'Four male cells and three fused polar nuclei.', 'The degenerated nucellus and the hardened funicle.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal set of the seed embryo compared to the endosperm tissue contained within it?',
      'choices', jsonb_build_array('Embryo (1n), Endosperm (2n).', 'Embryo (2n), Endosperm (3n).', 'Embryo (3n), Endosperm (2n).', 'Embryo (2n), Endosperm (1n).'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec21-exam'
    AND title = 'Lecture 21 — Seed Formation'
);
