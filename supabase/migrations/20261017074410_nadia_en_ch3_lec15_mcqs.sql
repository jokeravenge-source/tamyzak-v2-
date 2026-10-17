-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 15
-- Seed the supplied flower classification and monocot/dicot MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec15-exam',
  'Lecture 15 — Flower Classification and Monocots versus Dicots',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is a flower called that possesses both stamens and a pistil within the same structure?',
      'choices', jsonb_build_array('Sterile flower.', 'Hermaphroditic (perfect or complete) flower.', 'Unisexual flower.', 'Incomplete flower.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the correct description of an "incomplete flower"?',
      'choices', jsonb_build_array('A flower that lacks both male and female reproductive parts.', 'A flower that lacks one or more of the four floral parts (calyx, corolla, stamens, pistil).', 'A flower that does not contain a floral receptacle.', 'A flower whose petals fall off before pollination.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is a "sterile flower" according to curriculum classifications?',
      'choices', jsonb_build_array('A flower that contains only stamens and lacks a pistil.', 'A flower that has neither stamens nor a pistil.', 'A flower that does not secrete sticky fluid on the stigma.', 'A flower whose reproductive organs mature at widely different times.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the flowers like when a plant is described as "monoecious"?',
      'choices', jsonb_build_array('The plant bears only hermaphroditic flowers on all its branches.', 'The plant bears separate male and female flowers, but on the same individual.', 'The plant bears sterile flowers that do not produce fruit.', 'Male flowers are found on one plant and female flowers on another separate plant.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does the number of cotyledons in the embryo of monocotyledonous plants compare to that of dicotyledonous plants?',
      'choices', jsonb_build_array('Monocotyledons have one embryonic cotyledon, and dicotyledons have two embryonic cotyledons.', 'Monocotyledons have three cotyledons, and dicotyledons have one cotyledon.', 'Both possess an indeterminate number of cotyledons depending on the soil type.', 'The embryo is naked, lacking cotyledons in both types.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'How does leaf venation in monocotyledonous plants compare to that of dicotyledonous plants?',
      'choices', jsonb_build_array('In monocotyledons it is net-like (reticulate), and in dicotyledons it is parallel.', 'In monocotyledons it is parallel, and in dicotyledons it is net-like (reticulate).', 'It is circular in monocotyledons and absent in dicotyledons.', 'Both possess long, branching venation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the nature of vascular bundles in the stems of monocotyledonous plants compared to dicotyledonous plants?',
      'choices', jsonb_build_array('In monocotyledons, they are arranged in a ring, and in dicotyledons, they are scattered.', 'In monocotyledons, they are scattered, and in dicotyledons, they are arranged in a ring.', 'They are completely absent from the stem and concentrated only in the roots.', 'The vascular bundles are thick, woody fibers containing lignin in both types.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do the parts of the flower, in terms of number, compare between monocots and dicots?',
      'choices', jsonb_build_array('In monocots, they are in sets of three or multiples of three; in dicots, they are in sets of four or five, or multiples thereof.', 'In monocots, they are in sets of four; in dicots, they are in sets of two only.', 'They are always odd-numbered in monocots and even-numbered in dicots.', 'They do not follow any numerical pattern and grow randomly.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the predominant root type in monocots compared to dicots?',
      'choices', jsonb_build_array('In monocots, it is a taproot; in dicots, it is a fibrous root.', 'In monocots, it is a fibrous root; in dicots, it is a taproot.', 'Both possess floating aerial adventitious roots.', 'The root is a branched taproot in both, with no difference.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec15-exam'
    AND title = 'Lecture 15 — Flower Classification and Monocots versus Dicots'
);
