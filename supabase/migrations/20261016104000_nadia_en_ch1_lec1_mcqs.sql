-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 1
-- Seed the supplied introduction to cells and cell theory MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec1-exam',
  'Lecture 1 — Introduction to Cells and Cell Theory',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are cells in terms of the structural composition of all living organisms?',
      'choices', jsonb_build_array('They are non-cellular structures representing a link between living and non-living matter.', 'Cells are considered the structural units of all living organisms.', 'They are vascular parts specialized for absorbing water from the environment.', 'They are protoplasmic masses that move randomly and lack a nucleus.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the two main types of cells based on structure?',
      'choices', jsonb_build_array('Plant cells and animal cells.', 'Prokaryotic cells and eukaryotic cells.', 'Embryonic cells and adult cells.', 'Autotrophic cells and parasitic cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What distinguishes a prokaryotic cell regarding its nucleus and organelles?',
      'choices', jsonb_build_array('It has a distinct nucleus surrounded by a nuclear membrane and contains mitochondria.', 'It lacks a nuclear membrane and nucleolus—referred to as a nucleoid or nuclear region—and lacks membrane-bound organelles such as Golgi bodies and mitochondria.', 'It contains cup-shaped chloroplasts and a kinetosome.', 'It contains 40 hydrolytic enzymes in the cytoplasm.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What distinguishes a eukaryotic cell according to the textbook?',
      'choices', jsonb_build_array('It has a distinct nucleus surrounded by a nuclear envelope and possesses cell organelles.', 'It completely lacks a plasma membrane and consists only of a cell wall.', 'It contains a floating nuclear region without ribosomes.', 'It is limited only to prokaryotic organisms such as bacteria.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'Who was the first person to use the word "cell" after examining the structure of oak tree bark and describing the cork-like units in a section of cork?',
      'choices', jsonb_build_array('Antonie van Leeuwenhoek', 'Robert Hooke', 'Robert Brown', 'Matthias Schleiden'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How did the scientist Robert Hooke define the cell in his experiments?',
      'choices', jsonb_build_array('As a mass of cytoplasm containing a circular nucleus in the center.', 'As an air chamber resembling the cavity of a honeycomb cell.', 'As a basal body that moves via cilia.', 'As a free-floating protoplasmic sac that divides by binary fission.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which scientist described the cell nucleus and reported on it in 1831?',
      'choices', jsonb_build_array('Robert Hooke', 'Robert Brown', 'Theodor Schwann', 'Matthias Schleiden'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What scientific achievement did the German scientist Matthias Schleiden present in 1838?',
      'choices', jsonb_build_array('He announced that all animals are composed of cells.', 'He concluded that all plants are composed of cells.', 'He built the first simple microscope to examine microorganisms.', 'He discovered the phenomenon of recombination in colon bacteria.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What scientific achievement did the German zoologist Theodor Schwann announce in 1839?',
      'choices', jsonb_build_array('He announced that all animals are composed of cells.', 'He concluded that all plants are composed of cells.', 'He described the nuclear membrane surrounding the nuclear region.', 'He demonstrated that viruses are non-cellular, free-floating structures.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'Which two scientists'' work formed the basis of the Cell Theory?',
      'choices', jsonb_build_array('Robert Hooke and Robert Brown', 'Matthias Schleiden and Theodor Schwann', 'Camillo Golgi and van Leeuwenhoek', 'Rudolf Virchow and Antonie van Leeuwenhoek'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the three fundamental principles upon which the Cell Theory is based?',
      'choices', jsonb_build_array('1. Organisms reproduce sexually. 2. Cells die via autolysis. 3. The nucleus contains chromosomes.', '1. Living organisms are composed of cells. 2. Cells are the basic structural and functional units of living organisms. 3. Cells arise from other cells through division.', '1. Cells contain vacuoles. 2. The cell wall is composed of cellulose. 3. Plasmids transfer genes.', '1. All cells are visible to the naked eye. 2. Cells divide amitotically. 3. The plasma membrane is rigid.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec1-exam'
    AND title = 'Lecture 1 — Introduction to Cells and Cell Theory'
);
