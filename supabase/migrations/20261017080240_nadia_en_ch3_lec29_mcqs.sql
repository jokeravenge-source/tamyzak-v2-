-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 29
-- Seed the supplied human sperm structure and transport MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec29-exam',
  'Lecture 29 — Human Sperm Structure and Transport',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Structurally, what does a mature human sperm consist of?',
      'choices', jsonb_build_array('A head and neck only; it lacks other segments.', 'Three main parts: the head (containing the nucleus and the acrosome), the middle piece, and the tail.', 'A cellular syncytium containing 40 hydrolytic enzymes.', 'Two flagella and a developed basal body.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the acrosome located at the front of the human sperm head, and what is its function?',
      'choices', jsonb_build_array('A membranous structure that secretes testosterone to activate the sperm.', 'A structure located at the anterior edge of the sperm nucleus; it secretes enzymatic substances that break down the egg membranes at the point of contact, facilitating sperm penetration into the egg.', 'A tiny vascular sac that stores energy produced by the mitochondria.', 'A finger-like projection connecting the nucleus to the middle piece of the sperm.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the middle piece of the human sperm contain, and what is its significance?',
      'choices', jsonb_build_array('It contains the nucleus, which carries the genetic chromosomes (1n).', 'It contains an axis of microtubules that secrete a viscous fluid.', 'It contains mitochondria that generate the energy required for tail movement and sperm propulsion.', 'It includes the centriole, which disappears completely after maturation.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'How does the tail of the human sperm move to propel it forward?',
      'choices', jsonb_build_array('It moves through the random cytoplasmic contraction of microfilaments.', 'It consists of a central axis of microtubules and moves in a wave-like motion to propel the sperm within the seminal fluid.', 'It slides due to gravity without consuming ATP energy.', 'It relies on the movement of external sexual cilia surrounding it.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where are spermatozoa (sperm) deposited in the female reproductive system during sexual intercourse?',
      'choices', jsonb_build_array('Directly inside the cervix.', 'In the vagina, around the cervix.', 'Inside the Fallopian tube (in its upper third).', 'On the outer wall of the ovary.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do sperm swim and travel from the vagina to reach the fertilization site in the oviduct?',
      'choices', jsonb_build_array('Sperm swim upwards from the vagina through the cervix and then the uterine cavity to reach the Fallopian tubes, driven by tail movement and contractions of the uterine wall.', 'They are transported passively by the female''s lymphatic vessels without self-propulsion.', 'They move via the flow of fluids secreted from the external sticky stigma.', 'They move through rapid longitudinal binary fission from front to back.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the approximate number of sperm released in a single ejaculation by a mature human male?',
      'choices', jsonb_build_array('About 100 to 200 sperm only.', 'Between 10,000 and 50,000 sperm.', 'It ranges from 200 to 300 million sperm, and only a few hundred of them reach the egg.', 'One billion sperm that remain constant and are unaffected by health conditions.'),
      'answer_index', 2
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec29-exam'
    AND title = 'Lecture 29 — Human Sperm Structure and Transport'
);
