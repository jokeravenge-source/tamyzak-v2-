-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 10
-- Seed the supplied lysosomes MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec10-exam',
  'Lecture 10 — Lysosomes',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are lysosomes, based on the structural and membrane description provided in the textbook?',
      'choices', jsonb_build_array('Double-membrane organelles containing cristae and respiratory enzymes.', 'Sacs surrounded by a single-layer membrane, containing numerous hydrolytic enzymes (more than 40 enzymes).', 'Rough tubular structures connected to the plasma membrane that lack enzymes.', 'Spherical bodies containing pigments that provide color to flowers and fruits.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary function of the numerous enzymes found within lysosomes?',
      'choices', jsonb_build_array('Producing high-energy ATP molecules for the cell.', 'Being responsible for the process of intracellular digestion.', 'Synthesizing and assembling lipids for storage in the liver.', 'Synthesizing cellulose and certain cell wall components.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'In which types of cells are lysosomes found, and where are they particularly prominent?',
      'choices', jsonb_build_array('They are found in prokaryotic cells and are particularly prominent in Mycoplasma.', 'They are found in almost all cells, particularly those characterized by phagocytic ability, such as neutrophilic white blood cells.', 'They are restricted solely to the cells of advanced dicotyledonous plants.', 'They are found floating exclusively within the nucleolus cavity.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which of the following is considered one of the functions performed by lysosomes, as stated in the textbook?',
      'choices', jsonb_build_array('Synthesizing proteins and detoxifying anesthetic drugs.', 'Clearing the cell cytoplasm of certain food particles, mitochondrial fragments, microorganisms, and other impurities.', 'Absorbing solar energy and converting glucose into starch.', 'Secreting steroid hormones and stimulating centrosome division.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What important role do lysosomes play in the process of metamorphosis in animals?',
      'choices', jsonb_build_array('They lead to an increase in the size of embryonic cells and their stabilization.', 'They lead to the disappearance of the tadpole''s tail as it transforms into an adult frog.', 'They secrete mucous substances that facilitate the emergence of the nymph from the egg.', 'They stimulate cell division via longitudinal binary fission.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the process by which enzymes are released from lysosomes into the cell cytoplasm, resulting in the digestion of cytoplasmic macromolecules and, consequently, cell death?',
      'choices', jsonb_build_array('Phagocytosis.', 'Autolysis.', 'Active transport.', 'Amitosis.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the environmental significance of the autolysis process facilitated by lysosomes?',
      'choices', jsonb_build_array('Stimulating the growth of bacteria and blue-green algae in ponds.', 'Contributing to the recycling of elements in nature following the death of organisms.', 'Preventing water loss in swamps and shallow lakes.', 'Helping plants adapt to life on dry land.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec10-exam'
    AND title = 'Lecture 10 — Lysosomes'
);
