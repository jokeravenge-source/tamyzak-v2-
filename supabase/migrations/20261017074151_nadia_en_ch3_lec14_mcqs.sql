-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 14
-- Seed the supplied flowering plant reproduction MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec14-exam',
  'Lecture 14 — Reproduction in Flowering Plants — Part One',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is a flower, biologically and structurally, in advanced plants?',
      'choices', jsonb_build_array('An ordinary vegetative stem growing above the soil to absorb salts.', 'A specialized branch bearing modified leaves adapted for sexual reproduction and the formation of fruits and seeds.', 'A green, heart-shaped structure representing the independent gametophyte generation.', 'A spore-bearing capsule on a stalk, with cells undergoing direct division.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain—based on the study guide—why floral parts appear close together rather than separated by distinct internodes like those of a vegetative stem.',
      'choices', jsonb_build_array('Because the flower lacks sufficient genetic material for internode growth.', 'Because they originate from a specialized floral bud, where internodes do not elongate during growth and development.', 'Due to a lack of chlorophyll pigments and enzymatic systems in the floral branch.', 'Because the sepals press against the stem, preventing its elongation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the four parts of the flower, arranged from the outside in?',
      'choices', jsonb_build_array('Stamens, petals, sepals, and pistil.', 'Sepals, petals, stamens, and pistil.', 'Pistil, stamens, petals, and sepals.', 'Petals, stamens, calyx, and receptacle.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary function of the sepals, which collectively form the calyx?',
      'choices', jsonb_build_array('Attracting insects to facilitate cross-pollination.', 'Protecting the flower bud before it opens.', 'Producing pollen grains inside specialized sacs.', 'Forming ovules and protecting the resulting zygote.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What characterizes the petals, which collectively form the corolla, and what is their function?',
      'choices', jsonb_build_array('They are always green and function to activate the flower''s ribosomes.', 'They are often colorful and fragrant, attracting insects that contribute to pollination.', 'They represent the primary parts directly involved in sexual reproduction and seed formation.', 'They secrete a thick, mucous-like fluid that breaks down the outer ovary wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the two main components of the stamen, which represents the male reproductive organ of the flower?',
      'choices', jsonb_build_array('The stigma and the style.', 'The anther and the stalk or filament.', 'The ovary and the uterine wall.', 'The kinetosome and the sex pilus.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What constitutes the pistil, which represents the female reproductive organ of the flower?',
      'choices', jsonb_build_array('The anther, the filament, and the receptacle.', 'The ovary, the style, and the stigma.', 'The sepals, the petals, and the stamens.', 'The embryo sac and the first polar body.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the stigma, and what characterizes its surface to facilitate the pollination process?',
      'choices', jsonb_build_array('The swollen lower part of the pistil that contains the ovules.', 'The terminal apical part of the pistil; it is covered with hairs or is rough and secretes a sticky fluid to which pollen grains adhere.', 'Fine fibers protruding from the flower stalk to protect it from desiccation.', 'A hollow cylindrical tube connecting the ovary to the stamens.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the fundamental difference between the essential floral parts and the non-essential parts regarding reproduction?',
      'choices', jsonb_build_array('The calyx and corolla are essential parts, while the stamens and pistil are non-essential.', 'The stamens and pistil are essential parts because they participate directly in reproduction, whereas the calyx and corolla are non-essential because they do not participate directly.', 'All parts are non-essential, and the plant relies on vegetative or parthenogenic reproduction.', 'The receptacle is the only essential part because it bears the products of fertilization.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec14-exam'
    AND title = 'Lecture 14 — Reproduction in Flowering Plants — Part One'
);
