-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 20
-- Seed the supplied phagocytosis MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec20-exam',
  'Lecture 20 — Phagocytosis',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the alternative name for phagocytosis according to the textbook?',
      'choices', jsonb_build_array('Pinocytosis (cell drinking).', 'Phagocytosis (cell eating).', 'Exocytosis.', 'Active transport.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the biological significance of phagocytosis (cell eating) in the biological world?',
      'choices', jsonb_build_array('It is the common method of anaerobic respiration in zygomycete fungi.', 'It is the common method of nutrition in protists like Amoeba, and it is also the method by which white blood cells engulf cell debris and microbes found in the blood.', 'It is the sole method for synthesizing cellulose and plant cell wall components.', 'It regulates the exit of water and salts from the contractile vacuole.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does the process of phagocytosis begin in terms of cell structure and the cell membrane?',
      'choices', jsonb_build_array('It begins with the inward folding of the inner mitochondrial membrane to form cristae.', 'The cell membrane forms a pocket surrounding the solid material; subsequently, this pocket—or vesicle—pinches off from the cell surface and moves into the cytoplasm.', 'Carrier substances secrete proteins that move from the inner surface to the outer surface.', 'It begins with the formation of a cell plate at the equator of the dividing cell.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the name of the vesicle or structure containing the captured solid material within the cytoplasm after it has separated from the cell membrane?',
      'choices', jsonb_build_array('Contractile vacuole.', 'Food vacuole.', 'Secretory vesicles.', 'Kinetosome.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How are the contents of the food vacuole—resulting from the process of phagocytosis—digested within the cytoplasm according to the text?',
      'choices', jsonb_build_array('They are digested by enzymes secreted from lysosomes into the vacuole.', 'They undergo autolysis due to high hydrostatic pressure within the vacuole.', 'They are expelled directly toward the nucleus to fuse with RNA.', 'They combine with lipid molecules stored in the smooth endoplasmic reticulum.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the correct sequence of steps for phagocytosis, from start to digestion, according to the textbook?',
      'choices', jsonb_build_array('Enzyme secretion ➔ Food vacuole formation ➔ Invagination of the plasma membrane.', 'Formation of a pocket in the cell membrane surrounding the solid material ➔ Detachment of the pocket to form a food vacuole within the cytoplasm ➔ Digestion of contents by lysosomal enzymes.', 'Movement of the carrier substance ➔ Expenditure of ATP energy ➔ Movement of materials against the concentration gradient.', 'Formation of a secretory vesicle ➔ Fusion with the cell membrane ➔ Expulsion of waste.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec20-exam'
    AND title = 'Lecture 20 — Phagocytosis'
);
