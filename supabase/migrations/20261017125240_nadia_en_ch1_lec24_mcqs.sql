-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 24
-- Seed the supplied carbon dioxide fixation and photosynthesis MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec24-exam',
  'Lecture 24 — Carbon Dioxide Fixation and Photosynthesis',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'How do higher plants synthesize organic substances (carbohydrates) within their cells?',
      'choices', jsonb_build_array('By absorbing energy produced from lactic acid fermentation in muscles.', 'By fixing (reducing) carbon dioxide (CO₂) gas in the presence of water and utilizing solar energy.', 'Through the process of autolysis carried out by lysosomes at night.', 'By converting ethyl alcohol into free amino acids.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which two compounds are formed during the light reactions in the chloroplast and contribute to CO₂ fixation?',
      'choices', jsonb_build_array('Pyruvic acid and acetaldehyde.', 'Chemical energy in the form of ATP and reducing power in the form of NADPH.', 'Oxaloacetic acid and citric acid.', 'Cellulose molecules and hardened lignin.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain (based on the textbook): How does the process of fixing or reducing carbon dioxide (CO₂) lead to the formation of all complex organic molecules?',
      'choices', jsonb_build_array('Because this process occurs inside the mitochondria to produce most ATP molecules.', 'Because this reaction leads to the formation of carbohydrates (sugars), from which other organic compounds originate.', 'As a result of the breakdown of the plant cell''s plasma membrane and its transformation into a starch-storing substance.', 'Due to the fusion of the two polar nuclei with the degenerating antipodal cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where exactly do carbon dioxide fixation reactions (dark reactions) occur within the chloroplast?',
      'choices', jsonb_build_array('Inside the disc-like thylakoid membrane.', 'In the chloroplast matrix (the stroma).', 'In the lower spore-bearing structures of the leaves.', 'Attached to the young outer cell wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the major biological process in nature of which CO₂ fixation is an essential and integral part?',
      'choices', jsonb_build_array('Anaerobic cellular respiration.', 'Photosynthesis.', 'Bacterial transverse binary fission.', 'Cellular excretion of solid waste.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec24-exam'
    AND title = 'Lecture 24 — Carbon Dioxide Fixation and Photosynthesis'
);
