-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 21
-- Seed the supplied pinocytosis and exocytosis MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec21-exam',
  'Lecture 21 — Pinocytosis and Exocytosis',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the precise scientific description of pinocytosis according to the textbook?',
      'choices', jsonb_build_array('The process of bringing solid materials and microbes into the cytoplasm via a membranous pocket.', 'A process similar to phagocytosis; when liquid material enters from outside the cell, a small invagination forms in the cell membrane, surrounding the liquid material—which becomes enclosed in a vesicle—and this vesicle then detaches from the cell membrane and moves into the cell''s interior.', 'The movement of dissolved substances from areas of low concentration to areas of high concentration using ATP energy.', 'The disposal of undigested material remnants and their expulsion from the cell via smooth vesicles.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the main structural difference between the vesicle resulting from pinocytosis and the one resulting from phagocytosis (cell eating) regarding the type of material inside?',
      'choices', jsonb_build_array('The pinocytosis vesicle contains solid materials, while the phagocytosis vesicle contains steroid hormones.', 'The pinocytosis vesicle encloses liquid material, whereas the phagocytosis vesicle encloses solid material (a food vacuole).', 'Both possess constant selective permeability for the passage of sugar and salt molecules, with no difference between them.', 'The pinocytosis vesicle originates from the inner mitochondrial membrane, while the phagocytosis vesicle originates from the Golgi apparatus.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the precise scientific definition of exocytosis according to the biology textbook?',
      'choices', jsonb_build_array('The movement of molecules or ions of a diffusing substance from an area of high concentration to an area of low concentration through minute pores.', 'It refers to the process of releasing substances from inside the cell to the outside.', 'The exchange of dissolved substances and water between the cell and its surroundings through the rigid cell wall.', 'The invagination of the cell membrane to ingest liquid substances enclosed within a pinocytic vesicle.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the specific biological purposes or functions served by the process of exocytosis in cells?',
      'choices', jsonb_build_array('Building the new cell wall and forming the cell plate at the equatorial plane.', 'This process occurs in various cells to eliminate undigested material remnants taken in via phagocytosis, or to secrete substances such as hormones.', 'Generating high-energy ATP molecules through respiratory enzymes.', 'Developing gametes and spermatozoa during the hibernation period.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does the process of exocytosis occur mechanically and at the membrane level within the cell?',
      'choices', jsonb_build_array('The secretory vesicle undergoes autolysis in the cytoplasm due to lysosomal enzymes and disappears.', 'The secretory vesicle or waste vesicle fuses with the cell membrane and then opens outward to discharge its contents outside the cell.', 'The vesicle moves upward toward the nucleus to fuse with the nuclear envelope and chromatin network.', 'It moves through the contraction of rigid actin and myosin filaments against the osmotic concentration gradient.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec21-exam'
    AND title = 'Lecture 21 — Pinocytosis and Exocytosis'
);
