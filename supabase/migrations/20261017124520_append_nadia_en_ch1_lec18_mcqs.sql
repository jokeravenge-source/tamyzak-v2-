-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 18
-- Append the supplied hypertonic solution, plasmolysis, and deplasmolysis MCQs.
UPDATE public.teacher_topic_mcqs
SET questions = questions || jsonb_build_array(
  jsonb_build_object(
    'question', 'What is a hypertonic solution, and what happens to an animal cell when placed in it?',
    'choices', jsonb_build_array('It is characterized by a low concentration of solutes; the cell gains water and swells.', 'It is characterized by a high concentration of solutes compared to the cytoplasm; water moves from the cytoplasm to the external solution, resulting in the shrinkage of animal cells.', 'The cell maintains a constant size and shape, unaffected by the presence of a closing valve.', 'The gelatinous substance of the cytoplasm transforms into clear cell sap.'),
    'answer_index', 1
  ),
  jsonb_build_object(
    'question', 'What is the phenomenon of plasmolysis that occurs in a plant cell when placed in a hypertonic solution?',
    'choices', jsonb_build_array('Cell swelling and rupture resulting from the massive influx of water molecules into the vacuole.', 'Due to the presence of the cell wall, the volume of a plant cell does not change significantly compared to animal cells; instead, the plasma membrane pulls away from the cell wall as water exits the cell.', 'Disintegration of the nucleus and nuclear envelope, and disappearance of the nucleolus during prophase.', 'The number of genetic chromosomes doubles, resulting in a tetraploid state (4n).'),
    'answer_index', 1
  ),
  jsonb_build_object(
    'question', 'How can a plasmolyzed plant cell be restored to its original state (pre-plasmolysis state), and what is this reverse phenomenon called?',
    'choices', jsonb_build_array('By treating the cell with plant hormones such as auxins and gibberellins; this is called parthenocarpy.', 'By adding water to the solution (reducing its osmotic concentration), the cell returns to its original state and absorbs water; this reverse process is called deplasmolysis.', 'By placing the plant cell in a more concentrated sugar solution; this is called autolysis.', 'By activating cell wall ribosomes to synthesize additional amounts of lignin.'),
    'answer_index', 1
  )
)
WHERE teacher_id = 'nadia-al-nuaimy'
  AND topic_key = 'nadia-en-ch1-lec18-exam'
  AND title = 'Lecture 18 — Osmosis and Osmotic Solutions'
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(questions) AS item
    WHERE item->>'question' = 'What is a hypertonic solution, and what happens to an animal cell when placed in it?'
  );
