-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 4 · Lecture 4
-- Seed the supplied cellular differentiation, morphogenesis, and germ layers MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch4-lec4-exam',
  'Lecture 4 — Cellular Differentiation and Germ Layers',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is meant by the process of "cellular differentiation" according to the biology textbook?',
      'choices', jsonb_build_array('An increase in the size of embryonic cells due to nutrient absorption without division.', 'The ability of embryonic cells, during the early stages of development, to acquire specific functional and structural characteristics that distinguish them from other cells, enabling them to perform a specific function.', 'The breakdown of the animal cell''s plasma membrane and its transformation into a rigid wall.', 'The reduction of the chromosome number by half within gastrula cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the process of "morphogenesis" as defined in the textbook?',
      'choices', jsonb_build_array('A series of repeated mitotic divisions of the zygote without an increase in total size.', 'The biological processes leading to the growth and formation of the embryo''s organs and body, allowing it to assume the appearance of the adult organism in terms of shape and structural tissue arrangement.', 'The conversion of glucose into ethyl alcohol and carbon dioxide gas.', 'The fusion of two male nuclei with the polar nuclei inside the developing ovule.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Why do embryonic cells undergo different patterns of cellular differentiation although they all contain the same genes?',
      'choices', jsonb_build_array('Due to the unequal distribution of chromosomes during the anaphase stage of cell division.', 'As a result of differential gene expression, where specific genes are activated in cells of a particular tissue to produce specific proteins, while other genes in the same cells are inhibited and become inactive.', 'Because some cells lose their nuclei and completely disintegrate immediately after maturation.', 'Due to the effect of gonadotropic hormones from the pituitary gland during the secretory phase.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What arises and forms from the "ectoderm" layer following differentiation and organogenesis in the embryo?',
      'choices', jsonb_build_array('The digestive system and its accessory glands, such as the prostate and Cowper''s glands.', 'The nervous system (brain and spinal cord), the epidermis of the skin, and sense organs.', 'The mental and circulatory systems and striated skeletal muscles.', 'The notochord and the insect genital pad.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What arises and forms from the "mesoderm" layer in the organism''s body?',
      'choices', jsonb_build_array('The respiratory system and the inner lining of the large intestine.', 'The circulatory system (heart and blood vessels), skeletal system (bones and cartilage), muscular system, and urogenital system.', 'Mature mammalian red blood cells only, excluding the blood vessels.', 'The epidermis of the skin, hair, and nails in a fibrous form.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What arises and forms from the "endoderm" layer after organogenesis is complete?',
      'choices', jsonb_build_array('The peripheral and central nervous systems, including all their tubules.', 'The inner lining of the digestive tract and its accessory glands (such as the liver and pancreas), and the lining of the respiratory system.', 'Scattered vascular bundles in the plant stem.', 'The external scrotum and the coiled seminiferous tubules.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the concept of "embryonic induction" in embryonic development?',
      'choices', jsonb_build_array('Expelling waste and undigested materials via exocytosis vesicles.', 'The ability of specific embryonic tissues or cells to influence neighboring cells or tissues, directing their growth and differentiation to form a specific structure (such as the effect of the notochord on the formation of the neural tube).', 'Spraying auxins and gibberellins to stimulate plant ovaries to develop parthenocarpically.', 'Recycling elements in nature following the death of organisms through the action of enzymes.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch4-lec4-exam'
    AND title = 'Lecture 4 — Cellular Differentiation and Germ Layers'
);
