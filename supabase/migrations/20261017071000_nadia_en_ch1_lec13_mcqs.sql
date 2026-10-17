-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 13
-- Seed the supplied vacuoles MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec13-exam',
  'Lecture 13 — Vacuoles',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are vacuoles, and what is their nature within the cytoplasm of eukaryotic cells?',
      'choices', jsonb_build_array('Rough tubular structures connected to the plasma membrane and lacking cellular membranes.', 'Membrane-bound sacs found within the cell cytoplasm; in some protists, these vacuoles are specialized.', 'Spherical, double-membrane structures containing respiratory enzymes and cristae.', 'Solid, non-phospholipid components formed by the accumulation of dry chemical waste.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the function of "contractile vacuoles" in certain protists, such as Amoeba and Paramecium?',
      'choices', jsonb_build_array('They act as a center for converting glucose into starch for storage purposes.', 'They rid the cell of excess water and dissolved excretory substances.', 'They secrete steroid hormones and produce high-energy ATP molecules.', 'They digest food particles within the cytoplasm using hydrolytic enzymes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How are temporary "food vacuoles" formed in protists, and what occurs inside them?',
      'choices', jsonb_build_array('They form through standard mitotic nuclear division, and protein synthesis takes place inside them.', 'They form temporarily when the organism''s membrane engulfs food material; the food is digested within these vacuoles by enzymes secreted into the vacuole by lysosomes.', 'They form by the folding of the inner mitochondrial membrane; cellular respiration occurs within them.', 'They originate from the enlargement of the floral receptacle; carbohydrate storage occurs within them.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do vacuoles in plant cells compare to those in animal cells, and what do they contain?',
      'choices', jsonb_build_array('They are completely absent in plant cells and concentrated only in mature animal cells.', 'They are more prominent in plant cells than in animal cells; they are small in young cells and large in mature cells, containing a fluid known as cell sap.', 'They are very large and filled with starch in young cells, becoming smaller in older cells.', 'They contain 40 hydrolytic enzymes that facilitate the environmental recycling of elements.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the name given to the fluid that fills the vacuoles of mature plant cells?',
      'choices', jsonb_build_array('Stroma or clear space.', 'Cell sap.', 'Viscous protoplasmic syncytium.', 'Circular genetic plasmid.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec13-exam'
    AND title = 'Lecture 13 — Vacuoles'
);
