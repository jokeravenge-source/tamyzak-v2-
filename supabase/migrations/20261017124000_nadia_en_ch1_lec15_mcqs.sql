-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 15
-- Seed the supplied chromatin reticulum and chromosome number MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec15-exam',
  'Lecture 15 — Chromatin Reticulum and Chromosome Numbers',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'How does the chromatin reticulum appear within the nucleus of a eukaryotic cell during interphase?',
      'choices', jsonb_build_array('It appears as numerous small granules scattered throughout the cytoplasm.', 'It appears as irregular, intertwined, thread-like structures.', 'It appears as parallel, flattened sacs bounded by smooth membranes.', 'It appears as hollow tubules made of the protein tubulin.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'When do the chromatin reticulum threads become distinct and transform into defined rod-like structures?',
      'choices', jsonb_build_array('When the cell is placed in a hypertonic solution.', 'During cell division.', 'When the cell loses its nucleus and completely disintegrates.', 'During the process of autolysis (self-digestion) after cell death.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the scientific name for the limited number of rod-like structures formed by the condensation of chromatin threads during division?',
      'choices', jsonb_build_array('Terminal bodies.', 'Chromosomes.', 'Microtubules.', 'Secretory cisternae.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What do chromosomes carry, and what is their primary function?',
      'choices', jsonb_build_array('They break down inorganic chemicals and produce most ATP molecules.', 'They carry the genes through which hereditary traits are transmitted from parents to offspring.', 'They secrete a substance to build a gelatinous egg sac around the oocyte.', 'They carry the hydrolytic enzymes responsible for intracellular digestion.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain, based on the textbook text: Why have chromosomes gained great importance in biology and genetics?',
      'choices', jsonb_build_array('Due to their ability to store carbohydrates in the form of solid starch.', 'Due to the role they play in heredity, reproduction, variation, mutations, and more.', 'Because they move in a wave-like motion using flagella and reproductive cilia.', 'Because they secrete viscous fluid and mucous substances to protect the cervix.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'According to the biology textbook, what is the nature of the chromosome count in the cells of living organisms generally?',
      'choices', jsonb_build_array('It is variable and random within the cells of a single individual from time to time.', 'The chromosome count is constant in the cells of individuals of the same species, but it differs from one species to another.', 'It is undefined and ranges between hundreds and thousands in all somatic cells.', 'It is completely absent in embryonic cells and appears only at reproductive maturity.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the number of chromosomes in human somatic cells, according to the text?',
      'choices', jsonb_build_array('23 chromosomes.', '46 chromosomes.', '12 chromosomes.', '64 chromosomes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the number of chromosomes in human gametes (sex cells such as sperm and ova)?',
      'choices', jsonb_build_array('46 chromosomes.', '23 chromosomes (as the number is reduced by half as a result of meiosis).', '12 chromosomes.', '6 chromosomes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which organism has the lowest chromosome count in its somatic cells according to the textbook, and what is that number?',
      'choices', jsonb_build_array('Housefly, 12 chromosomes.', 'Ascaris worm; it contains only two chromosomes in its somatic cells.', 'Frog, 26 chromosomes.', 'Spanish butterfly, 380 chromosomes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the number of chromosomes in the somatic cells of the housefly and the frog, respectively, according to the textbook''s table?',
      'choices', jsonb_build_array('Housefly: 6, Frog: 12.', 'Housefly: 12, Frog: 26.', 'Housefly: 26, Frog: 12.', 'Housefly: 12, Frog: 64.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the number of chromosomes in the somatic cells of the horse according to the textbook?',
      'choices', jsonb_build_array('46 chromosomes.', '64 chromosomes.', '380 chromosomes.', '2 chromosomes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which organism has 380 chromosomes in its somatic cells according to the table in the textbook?',
      'choices', jsonb_build_array('Ascaris worm.', 'Spanish fly.', 'Arabian horse.', 'Homo sapiens.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the number of chromosomes in a horse''s sperm or egg (gametes) after the process of chromosomal reduction?',
      'choices', jsonb_build_array('64 chromosomes.', '32 chromosomes.', '46 chromosomes.', '12 chromosomes.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec15-exam'
    AND title = 'Lecture 15 — Chromatin Reticulum and Chromosome Numbers'
);
