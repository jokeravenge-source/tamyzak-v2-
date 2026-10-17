-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 22
-- Seed the supplied cell metabolism and glycolysis MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec22-exam',
  'Lecture 22 — Cell Metabolism and Glycolysis',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the precise scientific definition of cell metabolism according to the textbook?',
      'choices', jsonb_build_array('The movement of molecules or ions of a substance diffusing from an area of high concentration to an area of low concentration.', 'The sum of chemical transformations occurring within the cell, mediated by cellular enzymes; it includes the processes of catabolism and anabolism.', 'The process of direct division of the nucleus and cytoplasm without distinct chromosomal changes.', 'The exchange of substances between the cell and its external environment across selectively permeable membranes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the fundamental difference between catabolism and anabolism regarding energy, according to the textbook?',
      'choices', jsonb_build_array('Catabolism consumes energy, while anabolism always releases energy.', 'Catabolism is the process by which substances are broken down, accompanied by energy release; anabolism results in the synthesis of new products and is accompanied by energy consumption.', 'Both processes consume energy derived from cellulose molecules and hardened lignin.', 'Catabolism occurs only in plant cells, while anabolism occurs in animal cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary respiratory substrate that undergoes a series of transformations during glycolysis?',
      'choices', jsonb_build_array('The complex sucrose molecule.', 'The glucose molecule.', 'Free amino acids.', 'Lipids and steroid fats.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where exactly does glycolysis occur within the cell, and what is the reason for this, as stated in the text?',
      'choices', jsonb_build_array('It occurs in the mitochondria due to the presence of respiratory enzymes.', 'It occurs in the cytoplasm due to the presence of its enzymes.', 'It occurs inside the nucleolus due to its association with ribosome synthesis.', 'It occurs at the selectively permeable plasma membrane to absorb energy.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the first step that occurs to a glucose molecule (6C) upon entering the cytoplasm, and how much energy does it consume?',
      'choices', jsonb_build_array('It converts directly into two molecules of pyruvic acid and produces 4 ATP.', 'It is activated by phosphorylation and converts into glucose monophosphate, consuming one ATP molecule.', 'It merges with phospholipid molecules without consuming any energy.', 'It converts into fructose diphosphate and produces 2 ATP.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is formed after glucose monophosphate is transformed by a specific enzyme and then activated by a second phosphorylation?',
      'choices', jsonb_build_array('It converts into fructose monophosphate, then—via a second phosphorylation—into fructose diphosphate (consuming a second ATP molecule).', 'It converts directly into active pyruvic acid (2C).', 'A small circular DNA molecule floating in the cytoplasm is formed.', 'It converts into two molecules of phosphorylated glyceraldehyde, and a massive amount of energy is released.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What happens next to the fructose diphosphate molecule (6C) in the cytoplasm, according to the text?',
      'choices', jsonb_build_array('It undergoes meiotic division to reduce the number of carbon atoms by half.', 'It splits into two molecules of phosphorylated glyceraldehyde (3C).', 'It converts directly into ethyl alcohol and carbon dioxide gas.', 'It is secreted outside the cell membrane via exocytosis.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the final yield of pyruvic acid molecules from the oxidation of a single glucose molecule during glycolysis?',
      'choices', jsonb_build_array('One molecule of pyruvic acid (6C).', 'Two molecules of pyruvic acid (3C).', 'Four molecules of pyruvic acid (2C).', 'It converts entirely and directly into lactic acid.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the net gain of high-energy molecules (ATP) resulting from the entire glycolysis process, as stated in the textbook?',
      'choices', jsonb_build_array('4 ATP molecules.', 'Two (2) ATP molecules (since 4 ATP are produced and 2 ATP are consumed during phosphorylation).', '36 ATP molecules.', 'No energy is produced; the cell consumes energy from the mitochondria.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec22-exam'
    AND title = 'Lecture 22 — Cell Metabolism and Glycolysis'
);
