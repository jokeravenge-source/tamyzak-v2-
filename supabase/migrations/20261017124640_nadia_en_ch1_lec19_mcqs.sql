-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 19
-- Seed the supplied active transport MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec19-exam',
  'Lecture 19 — Active Transport',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the precise scientific definition of active transport according to the textbook?',
      'choices', jsonb_build_array('The movement of water molecules across a selectively permeable membrane from areas of high concentration to areas of low concentration.', 'Cells sometimes absorb substances from their external environment even though the concentration of these substances inside the cell is higher than outside.', 'The exchange of materials between the cell and its environment regardless of molecular size or chemical nature.', 'The expulsion of waste and undigested materials from the cytoplasm via smooth secretory vesicles.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the cell primarily require as a prerequisite to perform active transport across its plasma membrane?',
      'choices', jsonb_build_array('The presence of chlorophyll pigments and developed grana systems.', 'The presence of carrier proteins in the cell membrane.', 'A bilayer cell wall reinforced with lignin.', 'The complete disappearance of the nucleus and nuclear envelope during interphase.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does the carrier substance located in the plasma membrane function during active transport, according to the text?',
      'choices', jsonb_build_array('The carrier substance completely breaks down to produce kinetic energy that propels water molecules.', 'It can move from the outside to the inside and vice versa; the carrier substance binds with a molecule or ion required by the cell and moves toward the inner surface of the membrane, where the transported substance is released into the cytoplasm.', 'They secrete thick mucous substances that neutralize the acidity of the osmotic fluid.', 'They attach to genetic chromosomes and pull them toward opposite poles of the cell.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the process of active transport require as a second, essential condition for expending energy and moving substances against the concentration gradient?',
      'choices', jsonb_build_array('It requires the expenditure of energy derived from adenosine triphosphate (ATP) molecules within the living cell.', 'It requires the presence of hydrostatic pressure exactly equal to the osmotic pressure.', 'It requires stimulating the process of autolysis in aging microorganisms.', 'It requires the division of mature mammalian red blood cells.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'Explain (based on the textbook): Why are cells that perform active transport characterized by a high concentration of mitochondria?',
      'choices', jsonb_build_array('Because mitochondria contain cellulose molecules necessary for repairing the plasma membrane.', 'Because active transport requires the expenditure of significant energy derived from ATP molecules produced by mitochondria (the powerhouses of the cell).', 'Because mitochondria secrete hydrolytic enzymes that break down the transported substances.', 'Due to the mitochondria''s ability to secrete steroid hormones and auxins.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the fundamental difference between active transport and diffusion regarding the direction of substance movement relative to the concentration gradient?',
      'choices', jsonb_build_array('In diffusion, substances move from low to high concentration, whereas in active transport, they move from high to low concentration.', 'In diffusion, substances move from areas of high concentration to areas of low concentration, whereas in active transport, movement occurs from areas of low concentration to areas of high concentration (against the concentration gradient).', 'Both rely on the movement of substances from a state of equal and constant concentration without change.', 'The movement of substances is random and depends entirely on the temperature of the glass beaker.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec19-exam'
    AND title = 'Lecture 19 — Active Transport'
);
