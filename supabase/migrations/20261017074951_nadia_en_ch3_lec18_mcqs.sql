-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 18
-- Seed the supplied pollination MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec18-exam',
  'Lecture 18 — Pollination — Part One',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the precise scientific definition of pollination in flowering plants?',
      'choices', jsonb_build_array('The union of the pollen grain nucleus with the egg nucleus inside the ovule to form the zygote.', 'The transfer of pollen grains from the anther to the stigma of the same flower or another flower of the same species.', 'The mitotic division of the microspore nucleus to form the generative cell.', 'The release of pollen grains from the anther sacs after the rupture of the partition wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is self-pollination according to the curriculum classification?',
      'choices', jsonb_build_array('The transfer of pollen grains from the anther of a flower to the stigma of another flower on a different plant of a different species.', 'The transfer of pollen grains from the anther of a flower to the stigma of the same flower, or to the stigma of another flower belonging to the same plant.', 'The transfer of pollen grains by wind without the intervention of living organisms.', 'Pollination that occurs inside the ovary before the flower bud opens.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is cross-pollination?',
      'choices', jsonb_build_array('The transfer of pollen grains from the anther of a flower to the stigma of another flower on another plant of the same species or of other species belonging to the same genus.', 'The fusion of the pollen grain with the antipodal cells inside the embryo sac.', 'The transfer of pollen grains from the anther to the stigma of the same hermaphroditic flower.', 'Pollination carried out artificially by humans only in greenhouses.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'Explain—based on Ms. Nadia''s study guide—why cross-pollination is considered biologically more important than self-pollination.',
      'choices', jsonb_build_array('Because cross-pollination consumes a smaller amount of pollen during transfer.', 'Because the resulting fruits and seeds are larger, more numerous, and faster-growing, producing offspring that are stronger and better adapted to the environment.', 'Because self-pollination leads to plant sterility and immediate damage to the ovary.', 'Because cross-pollination does not require transport agents such as water or insects.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Farmers are advised to place honeybee hives in or near orchards; what is the official ministry-approved reason for this?',
      'choices', jsonb_build_array('Because bees secrete hormones that stimulate the growth of the nucellus within the ovule.', 'To ensure cross-pollination of the flowers, thereby achieving abundant production and high-quality fruit.', 'Because bees feed on harmful insects that eat the petals.', 'To maintain a constant temperature around the flower buds.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which organism is considered the insect that contributes most significantly to the process of cross-pollination in plants?',
      'choices', jsonb_build_array('Butterflies and locusts.', 'Honeybees.', 'Ground beetles.', 'Termites.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the other factors and agents, besides insects, that contribute to pollen transfer and the completion of cross-pollination?',
      'choices', jsonb_build_array('Wind, water, certain animals such as birds and bats, and humans (artificial pollination).', 'Dry soil, central particles, and gravity alone.', 'Zygomycetes and swimming spores in ponds.', 'Strong light and atmospheric humidity without a physical medium.'),
      'answer_index', 0
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec18-exam'
    AND title = 'Lecture 18 — Pollination — Part One'
);
