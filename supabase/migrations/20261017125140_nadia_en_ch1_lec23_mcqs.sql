-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 23
-- Seed the supplied aerobic respiration and Krebs cycle MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec23-exam',
  'Lecture 23 — Aerobic Respiration and the Krebs Cycle',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'When and where does pyruvic acid enter the aerobic respiration pathway (Krebs cycle) according to the textbook?',
      'choices', jsonb_build_array('In the absence of oxygen; this occurs in the cytoplasm.', 'When oxygen is available; this occurs inside the mitochondria.', 'Inside the nucleolus during ribosome synthesis.', 'At the plasma membrane during active transport.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the first chemical transformation pyruvic acid (3C) undergoes after entering the mitochondria and before entering the Krebs cycle?',
      'choices', jsonb_build_array('It converts directly into lactic acid to produce 2 ATP.', 'It undergoes autolysis and converts into phosphorylated glyceraldehyde.', 'It converts into a molecule of Acetyl-CoA (a 2-carbon compound), releasing a CO₂ molecule and 2H.', 'It merges with cellulose molecules in the cell wall.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'Which 2-carbon (2C) compound serves as the entry point into the Krebs cycle, according to the text?',
      'choices', jsonb_build_array('Pyruvic acid.', 'Acetyl-CoA.', 'Citric acid.', 'Oxaloacetic acid.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'With which compound does Acetyl-CoA (2C) combine at the start of the Krebs cycle, and what is formed as the cycle''s initial product?',
      'choices', jsonb_build_array('It combines with lactic acid to form ethyl alcohol.', 'It combines with a four-carbon compound, oxaloacetic acid (4C), to form a six-carbon compound, citric acid (6C).', 'It combines with phospholipid molecules to produce stored lipids.', 'It fuses with the diploid nucleus.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the energy yield (ATP molecules) resulting from a single Krebs cycle (one cycle for a single Acetyl-CoA molecule) inside the mitochondria?',
      'choices', jsonb_build_array('2 ATP.', '12 ATP.', '24 ATP.', '38 ATP.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the energy yield (ATP molecules) resulting from two Krebs cycles (i.e., from the complete oxidation of a single glucose molecule during aerobic respiration inside the mitochondria)?',
      'choices', jsonb_build_array('12 ATP.', '24 ATP (since one glucose molecule yields two pyruvic acid molecules that enter two Krebs cycles).', '36 ATP.', 'Only 2 ATP.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the total and final yield of high-energy molecules (ATP) resulting from the complete oxidation of a single glucose molecule (glycolysis + aerobic respiration) as stated in the textbook?',
      'choices', jsonb_build_array('2 ATP.', '12 ATP.', '38 ATP.', '46 ATP.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What is the correct sequence of chemical compound transformations within the Krebs cycle according to the biology textbook?',
      'choices', jsonb_build_array('Citric acid ➔ Pyruvic acid ➔ Acetyl-CoA.', 'Acetyl-CoA (2C) + Oxaloacetic acid (4C) ➔ Citric acid (6C) ➔ A series of transformations releasing energy, CO₂, and H to regenerate oxaloacetic acid.', 'Glucose ➔ Fructose diphosphate ➔ Lactic acid.', 'Pyruvic acid ➔ Acetaldehyde ➔ Ethyl alcohol.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec23-exam'
    AND title = 'Lecture 23 — Aerobic Respiration and the Krebs Cycle'
);
