-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 7
-- Seed the supplied Golgi apparatus MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec7-exam',
  'Lecture 7 — Golgi Apparatus',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Which scientist first described the Golgi apparatus in nerve cells in 1898?',
      'choices', jsonb_build_array('Robert Brown', 'Camillo Golgi', 'Matthias Schleiden', 'Theodor Schwann'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the structural description of the Golgi apparatus according to the textbook?',
      'choices', jsonb_build_array('It consists of tubules and rough vesicles containing abundant ribosomes.', 'It represents a cellular secretory system; it occupies a specific location in the cytoplasm between the nucleus and the plasma membrane, and its boundaries are difficult to distinguish precisely.', 'It is a spherical, double-membrane structure containing cristae and respiratory enzymes.', 'A network of fine filaments composed of actin and myosin proteins.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What exactly does the Golgi apparatus consist of, and what are the three compartments defined by its membranes?',
      'choices', jsonb_build_array('It consists of vesicular sacs surrounded by a thick cellulose wall impregnated with lignin.', 'It consists of three compartments defined by smooth membranes: the first (larvae), the second (bubbles), and the third (large vacuoles).', 'It consists of three compartments defined by smooth membranes: the first is flattened sacs (dragonflies), the second is vesicles, and the third is large vacuoles.', 'It consists of three compartments defined by smooth membranes: the first comprises flattened sacs called cisternae; the second, vesicles; and the third, large vacuoles.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'How many cisternae are found in the first compartment of the Golgi apparatus, according to the textbook?',
      'choices', jsonb_build_array('(1–2) flattened sacs', '(3–10) flattened sacs', '(20–30) flattened sacs', 'They vary randomly, reaching up to hundreds'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Why does the Golgi apparatus lack ribosomes according to the textbook?',
      'choices', jsonb_build_array('Therefore, it is called the granular secretory apparatus.', 'Therefore, it is called the apparatus lacking a cell membrane.', 'Therefore, it is described as a smooth-membraned apparatus (it does not contain ribosomes).', 'Because its ribosomes migrate to the cytoplasm immediately after growth.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What is the Golgi apparatus called in plant cells, and what is its function, according to the textbook?',
      'choices', jsonb_build_array('It is called a plastid, and its function is to convert glucose into starch.', 'It is called a dictyosome; it synthesizes cellulose and certain components of the plant cell wall.', 'It is called a kinetosome, and its function is to control the movement of cilia.', 'It is called a sporogenic organizer, and its function is to synthesize reproductive proteins.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the three secretory functions of the Golgi apparatus in animal cells, according to the textbook?',
      'choices', jsonb_build_array('1. Protein synthesis 2. ATP energy production 3. Autolysis.', '1. Synthesis and secretion of complex sugars. 2. Secretion of protein received from the endoplasmic reticulum (i.e., it does not synthesize protein). 3. Secretion of various substances such as hormones, enzymes, etc.', '1. Water absorption 2. Storage of steroid lipids 3. Anaerobic cellular respiration.', '1. Detoxification of drugs 2. Formation of the egg sac 3. Binary fission.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Why does the Golgi apparatus not synthesize protein, even though it secretes it?',
      'choices', jsonb_build_array('Because it receives the protein in a ready-made form from developing mitochondria.', 'Because its membranes (cisternae) lack ribosomes—which are responsible for protein synthesis—so it receives the protein from the endoplasmic reticulum.', 'Because protein secretion is limited to plant cells (dictyosomes) only.', 'Due to the presence of 40 hydrolytic enzymes that inhibit the synthesis of proteinaceous materials.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec7-exam'
    AND title = 'Lecture 7 — Golgi Apparatus'
);
