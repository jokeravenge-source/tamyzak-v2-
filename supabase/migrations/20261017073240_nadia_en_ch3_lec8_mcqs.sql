-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 8
-- Seed the supplied Chlamydomonas reproduction MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec8-exam',
  'Lecture 8 — Reproduction in Chlamydomonas',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the Chlamydomonas organism according to systematic classification?',
      'choices', jsonb_build_array('A unicellular ascomycete fungus living in dry soil.', 'A unicellular green alga living in ponds, swamps, and lakes.', 'A ciliated protozoan living in saltwater.', 'A dicotyledonous plant that reproduces vegetatively via resting spores.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What characterizes the vegetative Chlamydomonas cell in terms of structure and chromosomal set?',
      'choices', jsonb_build_array('It contains a single flagellum and is diploid (2n).', 'It possesses two flagella and a cup-shaped chloroplast, and is haploid (n).', 'It contains numerous cilia and a reticulate chloroplast, and is diploid (2n).', 'It completely lacks flagella and is triploid (3n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does asexual reproduction occur in Chlamydomonas?',
      'choices', jsonb_build_array('By forming motile zoospores (ranging from 2–8 or 16) inside the parent cell following its division.', 'By longitudinal binary fission of the vegetative cell.', 'By forming drought-resistant resting zygospores.', 'By external budding and the formation of algal colonies.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'When does the Chlamydomonas organism resort to sexual reproduction?',
      'choices', jsonb_build_array('When environmental conditions are highly favorable and food is abundant.', 'When temperatures improve during the spring season.', 'Under unfavorable environmental conditions (such as the drying up of ponds).', 'When cells lose their flagella and transform into permanently dormant cells.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What are the cells resulting from the repeated divisions of Chlamydomonas during sexual reproduction called?',
      'choices', jsonb_build_array('Large vegetative spores.', 'Isogametes (gametes that are alike and smaller than the parent cells).', 'Differentiated donor and recipient cells.', 'Degenerate polar bodies.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What structure results from the fusion of two isogametes of Chlamydomonas, and what is its chromosomal set?',
      'choices', jsonb_build_array('Zygospore (1n).', 'Zygote (diploid, 2n).', 'Vegetative cell (2n).', 'Positive and negative nuclei (4n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the zygote (2n) in Chlamydomonas to enable it to withstand harsh environmental conditions and desiccation?',
      'choices', jsonb_build_array('It loses its flagella, becomes enclosed in a thick cellulosic wall, and is called a zygospore.', 'It immediately divides by binary fission to produce new cells.', 'It migrates to the water''s surface and transforms into a free-floating vegetative alga.', 'It fuses with the old parent cell wall for protection.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What type of division does the zygospore (2n) undergo when environmental conditions improve, and what is produced as a result?',
      'choices', jsonb_build_array('Ordinary mitotic division resulting in two cells (2n).', 'Meiotic division resulting in four haploid spores (1n) that resemble the parent cell.', 'Direct division resulting in a larger zygospore.', 'Chromosomal doubling resulting in cells (4n).'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec8-exam'
    AND title = 'Lecture 8 — Reproduction in Chlamydomonas'
);
