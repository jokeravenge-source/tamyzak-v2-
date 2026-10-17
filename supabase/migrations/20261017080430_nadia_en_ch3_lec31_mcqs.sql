-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 31
-- Seed the supplied menstrual and ovarian cycle MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec31-exam',
  'Lecture 31 — Menstrual and Ovarian Cycle',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are the two series of overlapping changes involved in the menstrual (sexual) cycle of the mature human female?',
      'choices', jsonb_build_array('The circulatory cycle and the reproductive lymphatic cycle.', 'Changes occurring in the ovary (ovarian cycle) and changes occurring in the uterus (uterine cycle).', 'The pituitary hormonal cycle and the thyroid glandular cycle.', 'The germ cell cycle and the sporophytic cycle.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which hormone is secreted by the anterior lobe of the pituitary gland and stimulates the onset of the ovarian cycle and follicle growth?',
      'choices', jsonb_build_array('Luteinizing hormone (LH).', 'Follicle-stimulating hormone (FSH).', 'Progesterone (storage hormone).', 'Oxytocin (milk-secreting hormone).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What forms in the ovary during days 1–13 of the ovarian cycle in response to FSH?',
      'choices', jsonb_build_array('The corpus luteum degenerates and transforms into the corpus albicans.', 'A mature ovarian follicle (Graafian follicle) grows and produces estrogen.', 'Ovulation occurs, and the secondary oocyte is released.', 'The uterine wall thickens and transforms into a viscous mucous membrane.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is caused by the sudden surge and increased secretion of luteinizing hormone (LH) on day 14 of the cycle?',
      'choices', jsonb_build_array('The onset of menstrual bleeding and the rupture of blood vessels.', 'The occurrence of ovulation, during which the Graafian follicle ruptures and releases the egg.', 'The transformation of the ovary into a hermaphroditic state via parthenogenesis.', 'The growth of fat bodies around the mesovarium.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the corpus luteum in the ovary composed of, and during which days of the cycle does it secrete its hormones?',
      'choices', jsonb_build_array('It consists of dead follicular cells and secretes estrogen during days 1–5.', 'It consists of the remnants of the ruptured ovarian follicle and secretes progesterone during days 15–28.', 'It arises from the implantation of the fertilized egg into the uterine wall.', 'It forms from the fusion of the two polar nuclei with the migrating male nucleus.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the name of the degenerated structure that forms in the ovary when pregnancy does not occur and the corpus luteum regresses at the end of the cycle?',
      'choices', jsonb_build_array('The first polar body.', 'The corpus albicans.', 'The primordial follicle.', 'The dormant zygospore.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec31-exam'
    AND title = 'Lecture 31 — Menstrual and Ovarian Cycle'
);
