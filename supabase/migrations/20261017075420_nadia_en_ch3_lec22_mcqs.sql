-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 22
-- Seed the supplied fruit formation and parthenocarpy MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec22-exam',
  'Lecture 22 — Fruit Formation and Parthenocarpy',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'When does fruit growth and formation typically begin in flowering plants?',
      'choices', jsonb_build_array('When the petals fall off due to dry winds.', 'Fruit growth usually begins following pollination and fertilization, as the ovary wall enlarges and transforms into a fruit containing seeds.', 'After the embryo has completely consumed the endosperm tissue within the seed.', 'When the seed germinates in the soil and forms the radicle and plumule.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which plant hormones stimulate the ovary, causing it to enlarge and transform into a fruit?',
      'choices', jsonb_build_array('Auxins and gibberellins (hormonal substances produced by pollen grains or developing ovules).', 'Plant estrogen and progesterone.', 'Digestive enzymes secreted by antipodal cells.', 'Chemical substances found in bacterial cell walls.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What term is given to fruits formed from the enlargement of the ovary along with other parts external to it (such as the receptacle or floral envelopes)?',
      'choices', jsonb_build_array('True fruits.', 'Parthenocarpic fruits.', 'False fruits (Spurious fruits).', 'Aggregate fruits.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'Give an example from the curriculum of false fruits resulting from the enlargement of the floral receptacle or floral envelopes.',
      'choices', jsonb_build_array('Apples (where the receptacle enlarges), strawberries, and figs (where the floral envelopes enlarge).', 'Broad beans, kidney beans, and peas.', 'Bananas, oranges, and watermelons.', 'Tomatoes, cucumbers, and eggplants.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is parthenocarpy in plants?',
      'choices', jsonb_build_array('The growth of an embryo from a fertilized egg following the double fertilization process.', 'Stimulating the ovaries to grow and form mature fruits without pollination or fertilization, resulting in seedless fruits.', 'The transformation of endosperm tissue into a hard seed coat surrounding the seed.', 'The division of the microspore nucleus to produce generative cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Give an example from the curriculum of plants that produce fruits via natural parthenocarpy (naturally seedless).',
      'choices', jsonb_build_array('Apples, pears, and apricots.', 'Bananas, navel oranges, and some types of grapes.', 'Fava beans, wheat, and corn.', 'Tomatoes, melons, and watermelons.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain—based on Ms. Nadia''s study guide—why parthenocarpic fruits (whether natural or artificial) are seedless.',
      'choices', jsonb_build_array('Because the embryo completely consumes the seed coats during its rapid growth.', 'Because the fertilization process that leads to seed formation does not occur; the ovary grows and matures into a fruit without forming seeds.', 'Due to spraying the ovary with chemicals that immediately break down the embryo sac.', 'Because the nucellus tissue is haploid (1n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How can farmers produce seedless fruits artificially (artificial parthenocarpy)?',
      'choices', jsonb_build_array('By completely blocking light from the flowers during the period of ovule development.', 'By spraying or injecting flower ovaries with specific plant hormones (auxins and gibberellins) that stimulate ovary growth without fertilization.', 'By growing the plants in aqueous media rich in salt and inorganic salts.', 'By combining two different strains of sterile pollen.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec22-exam'
    AND title = 'Lecture 22 — Fruit Formation and Parthenocarpy'
);
