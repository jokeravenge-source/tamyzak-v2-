-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 6
-- Seed the supplied cytoplasm and endoplasmic reticulum MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec6-exam',
  'Lecture 6 — Cytoplasm and Endoplasmic Reticulum',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the cytoplasm in terms of its location in eukaryotic cells?',
      'choices', jsonb_build_array('It is located outside the rigid cell wall, surrounding the cell.', 'It represents the cellular material located between the plasma membrane and the nucleus.', 'It is found exclusively inside the nucleolus for storing RNA molecules.', 'It fills the cavity of the contractile vacuole to regulate water.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the approximate percentage of water in the chemical composition of the cytoplasm, according to the textbook?',
      'choices', jsonb_build_array('50%', '80%', '15%', '5%'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the complete chemical composition of the cytoplasm according to the curriculum?',
      'choices', jsonb_build_array('80% proteins, 15% water, 5% lipids and sugars.', '80% water, 15% proteins, and the remaining 5% consists of lipids, sugars, and various salts.', '90% cellulose, 5% lignin, 5% amino acids.', '60% phospholipids and 40% complex carbohydrates.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the cytoplasm contain within its internal structure, according to the text?',
      'choices', jsonb_build_array('It contains only free genetic material without a nuclear membrane.', 'It contains cellular organelles—which represent the living structures within the cytoplasm—as well as non-living components represented by particles formed as a result of cell organelle activity.', 'It is limited to the presence of numerous granular ribosomes, without other structures.', 'It consists entirely of rigid actin and myosin filaments.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the endoplasmic reticulum?',
      'choices', jsonb_build_array('A double membrane surrounding the nucleus and containing minute pores.', 'An interconnected network system of tubules and vesicles; it derives its name from its branching and interlacing nature.', 'An agranular secretory organelle located near the nucleus, discovered by Camillo Golgi.', 'Spherical particles containing more than 40 hydrolytic enzymes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where does the endoplasmic reticulum connect within the cell?',
      'choices', jsonb_build_array('It connects to the plasma membrane externally and the cell wall internally.', 'It connects to the plasma membrane in certain areas and to the nuclear membrane in others.', 'It connects directly to the chloroplasts and the micropyle.', 'It connects to the midpiece of the sperm and its kinetosome.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary general function of the endoplasmic reticulum (as stated in the text)?',
      'choices', jsonb_build_array('It serves as a center for generating high-energy ATP within the cell.', 'It serves as a site for the synthesis of lipids, carbohydrates, and proteins.', 'It carries out the process of autolysis (self-digestion) of the cell after death.', 'It secretes viscous fluid and mucous substances onto the stigma.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How is the endoplasmic reticulum classified according to the textbook?',
      'choices', jsonb_build_array('Plant endoplasmic reticulum and animal endoplasmic reticulum.', 'Two types: rough endoplasmic reticulum and smooth endoplasmic reticulum.', 'Haploid network and diploid network.', 'Sperm-transporting network and common urogenital network.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Why does the rough endoplasmic reticulum acquire its rough or granular appearance?',
      'choices', jsonb_build_array('Due to the presence of germination pores and spines on its outer wall.', 'Due to the presence of ribosomes on the surfaces of its tubules.', 'As a result of lignin deposition on its convoluted surfaces.', 'Due to the fusion of small vesicular cells with its membrane.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the three functions of the rough endoplasmic reticulum?',
      'choices', jsonb_build_array('1. Cellulose synthesis 2. Starch storage 3. Auxin production.', '1. Plays an active role in protein synthesis 2. Acts as a structural network for the cytoplasmic matrix 3. Transports materials within the cell, particularly to the Golgi bodies.', '1. Hormone secretion 2. Detoxification 3. ATP energy generation.', '1. Autolysis 2. Phagocytosis 3. Binary fission.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does the smooth endoplasmic reticulum differ structurally from the rough endoplasmic reticulum?',
      'choices', jsonb_build_array('It has extremely thick walls and contains chromoplasts.', 'It differs from the rough type by lacking ribosomes, resulting in a smooth surface.', 'It lacks tubules and vesicles, consisting only of circular lobes.', 'It contains 40 hydrolytic enzymes floating in the cytoplasm.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the functions of the smooth endoplasmic reticulum according to the textbook?',
      'choices', jsonb_build_array('Synthesizing proteins and directing them toward the nucleolus for chromosome formation.', 'Transporting materials within the cell and acting as a structural network for the cytoplasmic matrix; playing a key role in detoxifying certain poisons and anesthetic drugs; serving as sites for lipid synthesis, assembly, and storage; and secreting steroid hormones.', 'Performing photosynthesis and converting glucose into solid starch.', 'Forming spindle fibers and moving chromosomes during cell division.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec6-exam'
    AND title = 'Lecture 6 — Cytoplasm and Endoplasmic Reticulum'
);
