-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 32
-- Seed the supplied uterine cycle MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec32-exam',
  'Lecture 32 — Uterine Cycle',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Which direct ovarian hormones control the sequence of changes occurring during the uterine cycle?',
      'choices', jsonb_build_array('Follicle-Stimulating Hormone (FSH) and Luteinizing Hormone (LH).', 'Estrogen and Progesterone.', 'Oxytocin and Prolactin.', 'Insulin and Glucagon.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the uterine lining and walls during days 1–5 of the uterine cycle when ovarian hormone levels drop?',
      'choices', jsonb_build_array('The lining regenerates, thickens, and becomes highly vascularized.', 'The uterine lining and blood vessels break down and slough off, resulting in bleeding known as menstruation.', 'Uterine glands secrete a thick mucus to protect the fetus.', 'The fertilized egg immediately implants in the cervical wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the uterine lining during the proliferative phase (days 6–14), and under the influence of which hormone?',
      'choices', jsonb_build_array('The lining completely breaks down due to pituitary LH.', 'The uterine lining is repaired and grows, becoming thick and vascularized under the influence of estrogen.', 'Glandular secretions cease, and accessory cells degenerate.', 'The lining transforms into a hard shell surrounding the ovum.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are days 15–28 of the uterine cycle called, and which hormone secreted by the corpus luteum is responsible for this phase?',
      'choices', jsonb_build_array('Menstrual phase; controlled by estrogen.', 'Secretory phase; controlled by progesterone.', 'Proliferative phase; controlled by follicle-stimulating hormone (FSH).', 'Ovulatory phase; controlled by testosterone.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the uterine lining and glands during the secretory phase (days 15–28) to prepare the uterus to receive the embryo?',
      'choices', jsonb_build_array('The lining''s vascularity decreases, the glands atrophy, and secretion stops completely.', 'The uterine lining thickens, uterine glands become coiled and secrete mucus, and blood vessels become more branched.', 'Lining cells migrate toward the stigma to facilitate external fertilization.', 'Cells divide via longitudinal binary fission from front to back.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain (based on Ms. Nadia''s study guide): Why does the uterine lining break down and menstruation occur on day 28 if pregnancy does not take place?',
      'choices', jsonb_build_array('Due to a sudden rise in FSH and oxytocin levels.', 'As a result of declining progesterone and estrogen levels in the body due to the degeneration of the corpus luteum.', 'Due to the movement of the unfertilized egg, which mechanically severs blood vessels.', 'Because uterine glands secrete hydrolytic enzymes that autodigest the uterine wall.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec32-exam'
    AND title = 'Lecture 32 — Uterine Cycle'
);
