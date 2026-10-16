-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 4
-- Seed the supplied bacterial-cell structure MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec4-exam',
  'Lecture 4 — Bacterial Cell Structure',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'According to the biology textbook, what does each bacterial cell represent?',
      'choices', jsonb_build_array('A multicellular primitive organism possessing a nuclear membrane.', 'A prokaryotic organism consisting of a single cell.', 'A non-cellular structure that reproduces only inside a host.', 'An organism completely lacking genetic material.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'According to the text, what surrounds the bacterial cell and protects its internal components?',
      'choices', jsonb_build_array('An external protein coat that secretes lytic enzymes.', 'A rigid wall surrounded internally by a plasma membrane.', 'A thin protective membrane lacking complex chemical compounds.', 'A viscous layer of cellulose and hardened lignin.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the textbook''s description of the plasma membrane located inside the bacterial cell wall?',
      'choices', jsonb_build_array('A rigid, impermeable membrane that prevents the passage of water molecules.', 'A semi-permeable membrane surrounding the cytoplasm.', 'A double envelope containing minute germination pores.', 'A fibrous connective tissue rich in collagen molecules.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which of the following represents the general appearance of the bacterial cell regarding the "cell envelope," according to the textbook''s classification table?',
      'choices', jsonb_build_array('The nuclear envelope and chromatin network.', 'The cell wall and the plasma membrane.', 'The rigid capsule and sex pili only.', 'The outer membrane that secretes albumin.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which of the following represents the general appearance of a bacterial cell regarding its cytoplasmic contents?',
      'choices', jsonb_build_array('Mitochondria and endoplasmic reticulum.', 'A nuclear region and ribosomes.', 'Golgi apparatus and contractile vacuoles.', 'A distinct nucleolus and nuclear envelope.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which of the following represents the "appendages" that a bacterial cell may possess to aid in movement or conjugation?',
      'choices', jsonb_build_array('Sensors, spines, and a genital pad.', 'Flagella, cilia, and sex pili.', 'Microfilaments and fibrous microtubules.', 'Vascular wings and a muscular closing valve.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec4-exam'
    AND title = 'Lecture 4 — Bacterial Cell Structure'
);
