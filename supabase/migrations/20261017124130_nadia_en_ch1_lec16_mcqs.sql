-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 16
-- Seed the supplied cellular activities and diffusion MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec16-exam',
  'Lecture 16 — Cellular Activities and Diffusion',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Explain, based on the textbook: What characterizes living cells regarding their cellular activities?',
      'choices', jsonb_build_array('The division of the centrosome and its migration toward the cell poles.', 'It is attributed to the cell performing various vital functions that rely on metabolic exchanges and the movement of materials.', 'The breakdown of the plasma membrane and the effect of hydrolytic enzymes.', 'The gradual loss of the nucleus as living cells mature.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How are cellular activities generally classified according to the biology textbook?',
      'choices', jsonb_build_array('Direct divisions and indirect divisions.', 'Passage of materials across membranes and cellular metabolism.', 'Sexual reproduction and asexual (parthenogenetic) reproduction.', 'Monocotyledonous plant activities and dicotyledonous plant activities.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the biological significance of the passage of materials across membranes as a major cellular activity?',
      'choices', jsonb_build_array('It is limited to the construction of the rigid plant cell wall by the dictyosome.', 'It is a fundamental vital process for regulating cellular functional states; it determines the exit of waste products and water from the cell, playing a major role in maintaining and sustaining the cell''s vital processes and building living matter.', 'It facilitates the production of most high-energy ATP molecules within the mitochondria.', 'It controls sperm maturation and storage within the convoluted seminiferous tubules.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary method by which substances cross membranes and their molecules and ions spread from areas of high concentration to areas of low concentration?',
      'choices', jsonb_build_array('Active transport.', 'Diffusion.', 'Phagocytosis.', 'Pinocytosis.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How can the phenomenon of diffusion be observed as a simple experimental step, as described in the textbook?',
      'choices', jsonb_build_array('By placing red blood cells in an isotonic solution.', 'By placing crystals of copper sulfate or potassium permanganate in a beaker of water, where we observe the spread of the colored substance resulting from the crystals dissolving in the water.', 'By spraying the cell''s surroundings with plant hormones such as auxins and gibberellins.', 'By injecting the cytoplasm of an amoeba with photosynthetic pigments.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain, based on the textbook: Why does the colored substance resulting from dissolved crystals spread clearly over short distances, while its spread diminishes over long distances?',
      'choices', jsonb_build_array('Because the colored molecules combine with hydrogen molecules and spontaneously decompose.', 'Because the distance traveled by the diffusing molecules is directly proportional to the time of diffusion; over time, the diffusion will encompass all parts of the water in the beaker.', 'Due to the rapid evaporation of water from the beaker caused by room temperature.', 'As a result of the crystals settling at the bottom of the beaker and transforming into a solid cellulosic substance.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec16-exam'
    AND title = 'Lecture 16 — Cellular Activities and Diffusion'
);
