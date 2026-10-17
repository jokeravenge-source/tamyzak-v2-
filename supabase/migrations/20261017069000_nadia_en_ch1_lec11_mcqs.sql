-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 11
-- Seed the supplied cytoskeleton MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec11-exam',
  'Lecture 11 — Cytoskeleton',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'According to the textbook, what does the cytoskeleton system provide to eukaryotic cells?',
      'choices', jsonb_build_array('It gives them the ability to secrete complex steroid hormones.', 'It provides structural support to maintain the cell''s shape and serves as a means of movement and transport for organelles within the cell.', 'It gives them the ability to convert glucose into storage starch.', 'It provides the cell with a semi-permeable membrane surrounding the nuclear region.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What constitutes the cytoskeleton system in eukaryotic cells?',
      'choices', jsonb_build_array('Flattened sacs called cisternae and smooth vesicles.', 'Microfilaments and microtubules.', 'A single-layered membrane containing hydrolytic enzymes.', 'Rigid cellulose and lignin molecules within the cell wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are "microfilaments," and what are their structural characteristics according to the text?',
      'choices', jsonb_build_array('Hollow tubular structures composed of the protein tubulin.', 'Thin, straight structures first clearly observed in muscle cells; they consist of actin filaments (made of the protein actin) and myosin filaments (made of the protein myosin).', 'Folds and invaginations extending in various directions within the inner membrane.', 'Numerous small granules responsible for synthesizing proteins.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary physiological function of the fine filaments (actin and myosin) in the cell?',
      'choices', jsonb_build_array('Eliminating the toxic effects of certain toxins and anesthetic drugs.', 'Both are responsible for the cell''s ability to contract and relax.', 'Increasing the surface area available for respiratory enzymes.', 'Forming a gelatinous egg sac around the oocyte.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are "microtubules," and what is their primary protein according to the textbook?',
      'choices', jsonb_build_array('Straight, thin filaments composed of the protein actin.', 'They are larger than fine filaments and consist of tubular structures made of a protein called tubulin.', 'Sacs surrounded by a single-layered membrane containing various enzymes.', 'Minute vascular cavities filled with clear cellular fluid.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What important role do microtubules play during cell division?',
      'choices', jsonb_build_array('Stimulating the autolysis of cytoplasmic components.', 'Playing a vital role in chromosome movement during cell division.', 'Secreting viscous fluid and mucous substances onto the stigma.', 'Increasing the size of lipid bodies during hibernation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which of the following is considered one of the various functions performed by microtubules in the cell, as stated in the text?',
      'choices', jsonb_build_array('Synthesizing and secreting complex sugars in the Golgi bodies.', 'They are important for the cytoskeleton, organization, and transport of materials, and they are involved in the structure of flagella and cilia.', 'Secretion of steroid hormones in the adrenal glands.', 'Digestion of food particles and aged mitochondria.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where are microtubules found in living cells, and what do they form near the nucleus?',
      'choices', jsonb_build_array('They are found only in the cytoplasm of prokaryotic cells (bacteria).', 'They are typically found in the cytoplasm of animal cells—particularly in lower organisms like amoebas—and they form the centrosomes.', 'They are concentrated in a fibrous form within the endosperm tissue of mature seeds.', 'They are found attached to the outer ovary wall of a hermaphroditic flower.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec11-exam'
    AND title = 'Lecture 11 — Cytoskeleton'
);
