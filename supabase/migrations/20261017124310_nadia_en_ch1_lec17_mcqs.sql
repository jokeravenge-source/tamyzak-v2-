-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 17
-- Seed the supplied permeability and membrane classification MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec17-exam',
  'Lecture 17 — Permeability and Types of Membranes',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the precise scientific definition of permeability according to the textbook?',
      'choices', jsonb_build_array('The movement of water molecules across a selectively permeable membrane based on solution concentration.', 'The phenomenon of material exchange between the cell and its surroundings via the plasma membrane.', 'The transport of substances from areas of low concentration to areas of high concentration using energy.', 'The autolysis of cytoplasmic components immediately after cell death.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the essential condition that substances must meet for the cell to absorb them through its plasma membrane?',
      'choices', jsonb_build_array('They must be solid substances insoluble in water.', 'They must first undergo meiosis to reduce their size.', 'They must be water-soluble to a certain degree to pass through the membrane.', 'They must combine with cellulose molecules and hardened lignin.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What condition must excretory products and waste materials meet to pass out of the cell?',
      'choices', jsonb_build_array('They must aggregate into solid, non-living inclusions.', 'They must be soluble in the cell''s cytoplasm to pass outward.', 'They must be secreted by lysosomes via phagocytosis.', 'They must be enclosed in a thick, gelatinous albuminous membrane.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How are membranes generally classified based on their permeability to substances, according to the textbook?',
      'choices', jsonb_build_array('Plant membranes, animal membranes, and primitive membranes.', 'Permeable membranes, semi-permeable membranes, selectively permeable membranes, and impermeable membranes.', 'Monolayer membranes and chromosomal bilayer membranes.', 'Fibrous membranes and rigid visceral membranes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are freely permeable membranes? Give an example from the textbook.',
      'choices', jsonb_build_array('Membranes that do not allow solutes to pass through at the same rate as solvents.', 'Membranes that allow substances to pass through regardless of their nature or molecular size, such as the cell wall.', 'Membranes that secrete plant auxins to inhibit the movement of water molecules.', 'Membranes that completely prevent the passage of substances, such as the serrated plasma membrane.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the description of semi-permeable membranes adopted in the textbook?',
      'choices', jsonb_build_array('Membranes that allow substances to pass through regardless of molecular size.', 'Membranes that typically do not allow solutes to pass through at the same rate as solvents.', 'Membranes containing minute germination pores that carry genetic genes.', 'Membranes that allow substances to pass through selectively based on the cell''s needs.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are selectively permeable membranes? Give an example from the text.',
      'choices', jsonb_build_array('Membranes that allow substances to pass through based on the nature of atmospheric conditions outside the cell.', 'It is the type that allows the passage of substances selectively based on the size of their molecules, such as the plasma membrane.', 'These are membranes composed of three rigid layers, like the wall of a young cell.', 'Membranes that completely lack phospholipids and prevent the passage of lipids and sugars.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Give an example from the textbook of impermeable membranes.',
      'choices', jsonb_build_array('The mature nuclear envelope.', 'Nylon membranes.', 'The plant cell wall.', 'The animal plasma membrane.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain, based on the textbook: Why is the permeability of the plasma membrane (as a living membrane) not a static (fixed) characteristic?',
      'choices', jsonb_build_array('Because it is affected by the direct and indirect division of replicating chromosomes.', 'Because it is influenced by various internal and external cellular factors.', 'Due to the breakdown of protein molecules embedded within the phospholipid bilayers.', 'As a result of changes in cell wall thickness caused by the addition of the woody substance lignin.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec17-exam'
    AND title = 'Lecture 17 — Permeability and Types of Membranes'
);
