-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 14
-- Seed the supplied nucleus structure and importance MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec14-exam',
  'Lecture 14 — Nucleus: Importance and Structure',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the biological importance of the nucleus in the cell, according to the textbook?',
      'choices', jsonb_build_array('It serves as a major center for lipid storage and steroid hormone secretion.', 'The nucleus is the most important component of the cell in living organisms; cell survival depends on the various metabolic exchanges between the nucleus and the cytoplasm, and a cell that loses its nucleus survives for a short time before disintegrating.', 'It acts as a means of movement and transport for cellular organelles within the cytoplasm.', 'It carries out digestion within temporary food vacuoles.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which example from the textbook is a eukaryotic cell that loses its nucleus upon maturation, survives for a short time, and then disintegrates?',
      'choices', jsonb_build_array('Neutrophil white blood cells', 'Mature mammalian red blood cells', 'Amoeba and Paramecium cells', 'Skeletal muscle cells'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do nuclear shapes appear in different cells, and is there a correlation between the shape of the nucleus and the shape of the cell?',
      'choices', jsonb_build_array('They have a fixed spherical shape in all living tissue cells.', 'They exhibit variations in shape—being spherical, oval, lobed, or irregular—and there is a correlation between the shape of the nucleus and the shape of the cell.', 'They are branched and filamentous, always containing cellulose molecules.', 'They are cup-shaped or ribbon-shaped and contain chlorophyll.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which example from the textbook consists of cells in which the nucleus is "lobed"?',
      'choices', jsonb_build_array('Cartilage cells', 'White blood cells', 'Liver cells', 'Potato tuber cells'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the largest distinct cellular organelle within a eukaryotic cell?',
      'choices', jsonb_build_array('Mitochondria', 'Nucleus (its size varies depending on the cell type and is related to the volume of the cytoplasm).', 'Golgi apparatus', 'Centrosome'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the description provided in the textbook regarding the location of the nucleus in embryonic cells compared to secretory cells (such as mucous or fat cells)?',
      'choices', jsonb_build_array('It is lateral in embryonic cells and central in secretory cells.', 'It is central in embryonic cells, whereas it assumes a lateral or peripheral position in some secretory cells.', 'It floats within the vacuole, always positioned at the ends.', 'It is permanently located at the base of cilia and flagella.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the general rule regarding the number of nuclei in cells, and what are specific examples of binucleated cells?',
      'choices', jsonb_build_array('They are always multinucleated in all living organisms.', 'The vast majority of cells are uninucleated; however, there are cases where cells are binucleated, such as in cartilage cells, liver cells, and muscle tissue.', 'They lack nuclei during early embryonic stages and develop them upon reaching maturity.', 'They contain four migratory male nuclei and four stationary nuclei.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the nucleus consist of in terms of its four structural components, as stated in the textbook?',
      'choices', jsonb_build_array('Smooth membranes, cisternae, vesicles, and vacuoles.', 'Nuclear envelope, nucleoplasm, nucleolus, and chromatin network.', 'Microfilaments, microtubules, centrioles, and the kinetochore.', 'Cell wall, plasma membrane, cytoplasm, and nuclear region.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the "nuclear envelope," and what are its functional characteristics, as stated in the textbook?',
      'choices', jsonb_build_array('A thick, permeable membrane surrounding the bacterial cell externally, composed of polysaccharides.', 'A thin, bilayered membrane defining the nucleus; it possesses selective permeability, encloses the nuclear contents, and connects them to the cytoplasm via minute pores through which certain molecules pass.', 'A disc-shaped, sac-like structure containing chlorophyll and photosynthetic enzymes.', 'A gelatinous, albuminous covering secreted around bacterial cells.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec14-exam'
    AND title = 'Lecture 14 — Nucleus: Importance and Structure'
);
