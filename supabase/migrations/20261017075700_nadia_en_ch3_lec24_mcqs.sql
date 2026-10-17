-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 24
-- Seed the supplied insect reproductive system MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec24-exam',
  'Lecture 24 — Reproductive Systems in Insects',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the general sexual condition in insects (i.e., the nature of the reproductive organs)?',
      'choices', jsonb_build_array('All insects are hermaphroditic animals possessing both male and female organs.', 'Insects are dioecious (sexes are separate); males are distinct from females, and there is sexual dimorphism in external appearance.', 'Insects reproduce via transverse binary fission and do not possess reproductive organs.', 'The insect''s sex changes from male to female depending on the environmental season.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What constitutes the primary male reproductive system in insects?',
      'choices', jsonb_build_array('Two ovaries, a main oviduct, and a seminal receptacle.', 'Two testes, two sperm ducts (vasa deferentia), two ejaculatory ducts, and the aedeagus (penis), in addition to accessory glands.', 'A genital chamber and contractile vacuoles for expelling sperm.', 'A single elongated lobe ending in a sticky stigma.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where are the testes located in insects, and what does each testis consist of?',
      'choices', jsonb_build_array('They are located in the head region and consist of fine vascular ducts.', 'They are located dorsal to the digestive tract (in the abdomen), and each testis consists of a group of testicular tubules (sperm tubes).', 'They are located directly beneath the accessory glands and open into the anus.', 'They are located in the thoracic region next to the reproductive wings.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the function of the seminal vesicle in the male reproductive system of insects?',
      'choices', jsonb_build_array('Secretion of the viscous fluid that nourishes unfertilized eggs.', 'Storage of spermatozoa (sperm) after their maturation in the testicular tubules.', 'Formation of sperm starting from primordial germ cells.', 'Forcibly expelling sperm out of the penis during copulation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the primary female reproductive system in insects consist of?',
      'choices', jsonb_build_array('Two testes, two ejaculatory ducts, and accessory glands.', 'Two ovaries, two oviducts, a common oviduct, a vagina, a spermatheca, and accessory glands.', 'A free-floating protoplasmic sac within the abdominal cytoplasm.', 'Three circular lobes distributed at the top of the head.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is each ovary in a female insect composed of?',
      'choices', jsonb_build_array('A group of egg tubules (ovarioles) containing oocytes, nurse cells, and interstitial tissue cells.', 'A single swollen chamber that stores spermatozoa.', 'Two elongated lobes connected by tough, fibrous visceral tissue.', 'Dead, vestigial somatic cells.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the function of the spermatheca in female insects?',
      'choices', jsonb_build_array('Production of diploid (2n) eggs.', 'Receiving sperm during copulation and storing them for later fertilization of the eggs.', 'Secreting the hard outer shell of the fertilized egg.', 'Expelling excess sperm outside the vagina immediately after insemination.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary function of collaterial glands in female insects?',
      'choices', jsonb_build_array('Storing sperm and nourishing them with complex proteins.', 'Their function varies; they may secrete a substance to build an egg sac (in cockroaches), glue eggs together (in ants), or be used for defense (in wasps).', 'Stimulating the female''s ovary to produce new egg tubules immediately.', 'Destroying blood vessels in the testis in the absence of males.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec24-exam'
    AND title = 'Lecture 24 — Reproductive Systems in Insects'
);
