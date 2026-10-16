-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 5
-- Seed the supplied eukaryotic-cell MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec5-exam',
  'Lecture 5 — Eukaryotic Cells',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are eukaryotic cells according to the textbook?',
      'choices', jsonb_build_array('Cells that lack a nuclear membrane and are found in bacteria and mycoplasma.', 'Cells that possess a true nucleus and are found in the kingdoms of Protista, Fungi, Plantae, and Animalia.', 'Non-cellular structures representing a link between living and non-living matter.', 'Primitive cells in terms of shape and structure that lack membrane-bound organelles.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the general shapes of eukaryotic cells?',
      'choices', jsonb_build_array('Spherical and constant across all living organisms.', 'Variable; some have fixed shapes (spherical, pyramidal, tubular, cuboidal, columnar, oval, flat, stellate, spindle-shaped), while others have non-fixed shapes that change over time.', 'Branched, filamentous shapes that always contain cellulose and lignin molecules.', 'Permanently circular shapes containing cup-shaped plastids.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Give an example from the textbook of a eukaryotic cell with a "non-fixed" shape that changes over time.',
      'choices', jsonb_build_array('Mature red blood cells.', 'Amoeba.', 'Bacillus bacteria.', 'Oak tree bark cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain, based on the textbook: What causes the change in shape of certain eukaryotic cells, such as Amoeba?',
      'choices', jsonb_build_array('The breakdown of their outer cell wall due to harsh environmental conditions.', 'The function performed by the cells; the shape is often adapted to the function they carry out.', 'A lack of photosynthetic pigments and enzymatic systems in the cytoplasm.', 'The embryo consuming the endosperm tissue during reproductive development.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the general size of eukaryotic cells, and do they require a microscope to be seen?',
      'choices', jsonb_build_array('They are very large and can always be seen with the naked eye.', 'They are mostly microscopic cells requiring a microscope to be seen, though they are undoubtedly larger than prokaryotic cells.', 'They are much smaller in size than viruses and mycoplasma.', 'They have a fixed size of 100 millimeters in all living tissues.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain, based on the textbook: Why do eukaryotic cells require surface area provided by the plasma membrane?',
      'choices', jsonb_build_array('To enable direct (amitotic) division without chromosomal changes.', 'To allow for the appropriate exchange of materials with their surroundings.', 'To prevent excess sperm from entering the embryo sac.', 'To store carbohydrates in the form of solid animal starch.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the main components of eukaryotic cells, based on the textbook?',
      'choices', jsonb_build_array('1. Nuclear region. 2. Ribosomes. 3. Sex pili.', '1. Cell wall and plasma membrane in the plant cell, and plasma membrane only in the animal cell. 2. Cytoplasm. 3. Nucleus.', '1. Chloroplasts. 2. Mitochondria. 3. Contractile vacuoles only.', '1. Protein coat. 2. Hybrid nucleic acids. 3. Rigid mid-sections.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec5-exam'
    AND title = 'Lecture 5 — Eukaryotic Cells'
);
