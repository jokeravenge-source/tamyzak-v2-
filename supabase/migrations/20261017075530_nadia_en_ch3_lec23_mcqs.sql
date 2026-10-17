-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 23
-- Seed the supplied fruit classification and seed dispersal MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec23-exam',
  'Lecture 23 — Fruit Classification and Seed Dispersal',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are the layers of the fruit wall (pericarp) composed of, in order from outside to inside?',
      'choices', jsonb_build_array('The middle layer, the outer layer, and the inner layer.', 'The outer layer (skin), the middle layer (fleshy part), and the inner layer (pit or inner casing).', 'The testa, the endosperm, and the storage embryo.', 'Sepals, petals, and stamens.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the precise scientific description of simple fruits, including an example?',
      'choices', jsonb_build_array('Fruits formed by the enlargement of the floral receptacle outside the ovary, such as apples.', 'Fruits formed from a single flower with one carpel or several fused carpels, such as tomatoes, cucumbers, broad beans, and apricots.', 'Fruits formed from several clustered flowers surrounded by thick floral envelopes, such as figs.', 'Fruits that develop parthenocarpically (without seeds) due to the application of auxins.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the definition of aggregate fruits according to the curriculum classification?',
      'choices', jsonb_build_array('Fruits formed from a single flower containing multiple separate carpels; the fruit arises from the aggregation of these carpels attached to a single receptacle, such as the strawberry.', 'Fruits arising from the fusion of several independent flowers to form a single fruit.', 'Dry, fibrous fruits lacking a fleshy middle layer, such as wheat and rice.', 'Fruits that secrete a sticky fluid onto the stigma to attract insects.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What are composite fruits?',
      'choices', jsonb_build_array('Fruits formed from a single fused carpel of a single flower.', 'Fruits formed from a cluster of flowers (inflorescence) where each flower produces a fruit, and they remain joined together to form a single fruit upon maturity, such as pineapples and figs.', 'Fruits containing a single embryonic cotyledon and storing endosperm.', 'Fruits that shed their seeds immediately upon exposure to strong winds.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the key natural factors and methods that facilitate the dispersal of fruits and seeds away from the parent plant?',
      'choices', jsonb_build_array('Wind, water, animals, and humans, in addition to the fruit''s own dehiscence (opening) mechanisms.', 'Gravity, plasmids, and the cellular chromatin network only.', 'Zygomycetes (conjugation fungi) and zoospores (swimming spores) in ponds and swamps.', 'Strong light and atmospheric humidity, without a physical medium.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What structural adaptations do seeds and fruits possess to enable dispersal by wind?',
      'choices', jsonb_build_array('Having thick, fleshy walls containing vast amounts of water.', 'Being lightweight or having wing-like or parachute-like structures (hairs/bristles), as seen in the seeds of dry fruits.', 'Possessing hooks or spines that attach to external objects.', 'Secreting sticky, resinous substances that adhere to surfaces.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do fruits and seeds adapt to be dispersed by water?',
      'choices', jsonb_build_array('They are very heavy, causing them to settle at the bottom of rivers.', 'They are lightweight or have air-filled cavities in their outer covering that help them float on the water''s surface, such as coconuts.', 'They rely on the division of the microspore nucleus to generate kinetic energy.', 'They are surrounded by a thick cellulose wall that hardens due to aquatic lignin.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What adaptations do some fruits and seeds possess to be dispersed by animals?',
      'choices', jsonb_build_array('They are completely dry and lack aromatic scents or an outer skin.', 'They have spines or hooks that attach to animal skin and fur, or they are fleshy fruits that are eaten, with their seeds excreted in waste.', 'They contain germination pores from which motile sexual cilia emerge.', 'They are smooth and round, rolling along the forest floor due to gravity.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec23-exam'
    AND title = 'Lecture 23 — Fruit Classification and Seed Dispersal'
);
