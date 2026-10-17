-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 30
-- Seed the supplied human fertilization, implantation, and pregnancy MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec30-exam',
  'Lecture 30 — Human Fertilization, Implantation and Pregnancy',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Where exactly does fertilization (the union of the sperm and the egg) occur in the female human reproductive system?',
      'choices', jsonb_build_array('Inside the uterine cavity after the egg attaches to the wall.', 'In the upper third of the oviduct (Fallopian tube).', 'Inside the ovary immediately after the rupture of the Graafian follicle.', 'In the vagina around the cervix.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the egg immediately after a single sperm penetrates its membrane and fertilization is completed?',
      'choices', jsonb_build_array('It undergoes a second meiotic division to produce three polar bodies.', 'A membrane forms around it, preventing the entry of any other sperm.', 'The female nucleus immediately disintegrates and is replaced by the acrosome nucleus.', 'The cilia lining the Fallopian tube are immediately shed.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where does the fertilized egg (zygote) implant after descending into the uterus, and on which day does this occur?',
      'choices', jsonb_build_array('It implants in the thickened uterine wall; this occurs approximately on the sixth (6th) day after fertilization, following the cleavage stages.', 'It implants in the narrow cervix on the first day.', 'It remains floating in the uterine cavity throughout the pregnancy without implanting.', 'It attaches to the urinary bladder on the fourteenth day.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the structural and glandular formation that connects the fetus to the uterine wall and provides it with nutrients and oxygen throughout the pregnancy?',
      'choices', jsonb_build_array('The umbilical cord and the common epididymis.', 'The placenta and the umbilical cord.', 'The thick albuminous egg sac.', 'The degenerated corpus luteum.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which of the following structures continues to secrete progesterone to maintain pregnancy during the first three months?',
      'choices', jsonb_build_array('The anterior pituitary gland.', 'The corpus luteum in the ovary.', 'The developing placenta.', 'The thyroid gland.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'When does the corpus luteum fail to secrete sufficient amounts of progesterone, and what takes over its function to maintain pregnancy until birth?',
      'choices', jsonb_build_array('After the first month; the Graafian follicle takes over.', 'After the third month of pregnancy; the corpus luteum degenerates, and the placenta takes over to secrete progesterone directly.', 'During the last week of pregnancy, driven by stigma hormones.', 'It does not degenerate and continues secretion automatically throughout the nine months.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the normal, full duration of the gestation period in human females until birth?',
      'choices', jsonb_build_array('About 180 days (6 months).', 'Approximately 270 days (9 months / 38 weeks).', 'A full 365 days (one year).', 'It varies randomly between 3 and 5 months depending on diet.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec30-exam'
    AND title = 'Lecture 30 — Human Fertilization, Implantation and Pregnancy'
);
