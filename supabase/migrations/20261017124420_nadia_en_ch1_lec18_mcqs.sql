-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 18
-- Seed the supplied osmosis and osmotic solution MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec18-exam',
  'Lecture 18 — Osmosis and Osmotic Solutions',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the precise scientific definition of osmosis according to the textbook?',
      'choices', jsonb_build_array('The movement of molecules or ions of a diffusing substance from an area of high concentration to an area of low concentration.', 'The movement of water molecules across a selectively permeable membrane (the plasma membrane) driven by a concentration gradient; water molecules move according to the laws of diffusion, as osmosis is a specific type of diffusion.', 'The exchange of substances between the cell and its surroundings across the rigid cell wall without energy consumption.', 'The exit of waste products and mucous substances from inside the cell to the outside via secretory vesicles.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens during an osmosis experiment using a selectively permeable membrane (such as cellophane) when the water concentration is equal on both sides of the membrane?',
      'choices', jsonb_build_array('The water level in the funnel tube rises very rapidly.', 'The influx of water molecules equals the number of exiting molecules, resulting in a stable water level in the funnel.', 'The cellophane membrane disintegrates immediately due to hydrostatic pressure.', 'The water level in the outer glass basin drops until it dries up.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens when a sugar solution is added to the funnel tube in an osmosis experiment, and how does the water rise?',
      'choices', jsonb_build_array('The entry of water molecules into the funnel stops completely.', 'We observe a rise in the water level within the funnel tube; this indicates that water is passing through the cellophane membrane into the sugar solution inside the funnel, generating hydrostatic pressure.', 'The color of the water inside the outer glass basin changes to yellow.', 'Cells divide parthenogenetically without the need for an aqueous or hormonal medium.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'When does the entry of water molecules into the thistle funnel containing the sugar solution stop during the osmosis experiment?',
      'choices', jsonb_build_array('When the cellophane membrane completely decomposes.', 'It stops when the hydrostatic pressure equals the osmotic pressure.', 'When the water in the outer glass basin is completely depleted.', 'When the sugar solution transforms into a solid cellulosic substance.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How are solutions classified based on their osmotic concentration and their effect on cells, according to the textbook?',
      'choices', jsonb_build_array('Acidic solutions, basic solutions, and chemically neutral solutions.', 'Three solutions: isotonic solution, hypotonic solution, and hypertonic solution.', 'Monopolar solutions and chromosomal bipolar solutions.', 'Fibrous plant solutions and albumin-secreting animal solutions.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is an isotonic solution, and what is its effect on cell volume?',
      'choices', jsonb_build_array('A solution in which the water concentration outside the cell is lower than in the cytoplasm, causing the cell to gain water.', 'A solution in which the water concentration outside the cell equals that within the cell''s cytoplasm; the cell neither gains nor loses water, and its volume remains constant.', 'A solution that causes the cell to swell and immediately burst due to the entry of salt molecules.', 'It is a solution composed of 80% proteins and 15% complex phospholipids.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is a hypotonic solution, and what is its specific effect on an animal cell?',
      'choices', jsonb_build_array('It is characterized by a high concentration of non-permeable solutes, leading to cell shrinkage.', 'This solution is characterized by a low concentration of non-permeable solutes compared to the solutes in the cell''s cytoplasm; the cell gains water, causing the animal cell to swell and burst.', 'It causes water to exit the central vacuole and the plasma membrane to pull away from the cell wall.', 'It is a solution that stimulates the division of centrioles and their migration toward opposite poles of the cell.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec18-exam'
    AND title = 'Lecture 18 — Osmosis and Osmotic Solutions'
);
