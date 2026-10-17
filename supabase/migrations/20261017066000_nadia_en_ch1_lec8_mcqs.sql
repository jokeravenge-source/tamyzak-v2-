-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 8
-- Seed the supplied mitochondria MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec8-exam',
  'Lecture 8 — Mitochondria',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are mitochondria in terms of shape and dimensions, according to the textbook?',
      'choices', jsonb_build_array('Spherical structures of constant diameter, always 100 micrometers in length.', 'Spherical or filamentous structures with a width of 0.5–1 micrometer and a length that may reach 10 micrometers.', 'Smooth tubules and vesicles completely lacking internal membranes.', 'Flattened sacs arranged in a vertical row, numbering between 3 and 10.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where are mitochondria found in living organisms, and how are they distributed?',
      'choices', jsonb_build_array('They are found in prokaryotic cells and concentrated around the nuclear region.', 'They are found in all eukaryotic cells, varying in size and distribution among different cells.', 'They are restricted to plant cells only and are absent in animal cells.', 'They are found floating only within the cavity of the contractile vacuole.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the structural composition of the mitochondrion regarding its outer membrane and surrounding layers?',
      'choices', jsonb_build_array('Surrounded by a thin, single membrane containing minute pores.', 'Surrounded by a double membrane (inner and outer layers).', 'Surrounded by a rigid chemical wall composed of proteins, lipids, and polysaccharides.', 'Lacking an outer membrane and directly connected to the cytoplasm.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the description provided in the textbook for the inner layer of the mitochondrial membrane?',
      'choices', jsonb_build_array('It is completely smooth and free of any folds or creases.', 'It exhibits numerous folds and invaginations taking on various shapes and orientations; these structures are known as cristae.', 'It is composed of cellulose molecules and hardened lignin.', 'It contains numerous granular ribosomes for protein synthesis.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are "cristae," and what is their primary function, verbatim?',
      'choices', jsonb_build_array('Folds in the outer membrane that serve to increase its surface area.', 'Folds and invaginations in the inner mitochondrial membrane; their function is to increase the surface area of the inner mitochondrial membrane.', 'Protein fibers made of actin and myosin that facilitate cell contraction.', 'Secretory channels that secrete complex steroid hormones.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Why are mitochondria known as the "powerhouses" of the cell according to the textbook?',
      'choices', jsonb_build_array('Because their membranes lack ribosomes and they have the ability to synthesize lipids.', 'Because of their role in producing the majority of high-energy adenosine triphosphate (ATP) molecules.', 'Because they contain various types of chlorophyll pigments and store starch.', 'Because of their ability to neutralize the toxic effects of anesthetic drugs.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary function of mitochondria according to the biology textbook?',
      'choices', jsonb_build_array('Photosynthesis and sugar synthesis.', 'Cellular respiration, due to the presence of respiratory enzymes.', 'Cellular secretion of hormones and complex enzymes.', 'Autolysis of cytoplasmic components after death.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec8-exam'
    AND title = 'Lecture 8 — Mitochondria'
);
