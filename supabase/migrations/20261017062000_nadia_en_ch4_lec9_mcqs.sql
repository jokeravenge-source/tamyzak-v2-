-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 4 · Lecture 9
-- Seed the supplied assisted reproductive technologies MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch4-lec9-exam',
  'Lecture 9 — Assisted Reproductive Technologies',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the primary and most common technique for treating infertility known as "test-tube babies" (IVF), according to the textbook?',
      'choices', jsonb_build_array('Animal cloning via somatic cell nuclear transfer.', 'In Vitro Fertilization (IVF) technique, where the egg is fertilized by the sperm inside a laboratory test tube, and the resulting zygote is then returned to the mother''s uterus.', 'Double embryonic induction technique using plant auxins.', 'Autolysis technique involving germ cell death through interaction.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the main medical reasons necessitating the use of In Vitro Fertilization (IVF)?',
      'choices', jsonb_build_array('Severe anemia affecting red blood cells and bone marrow damage.', 'Blockage of the Fallopian tubes, low sperm count or motility in the male, or unexplained infertility.', 'Elevated levels of progesterone and estrogen during the secretory phase.', 'Uncontrolled, random division of mature nerve cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the "Intracytoplasmic Sperm Injection" (ICSI) technique, and how is it performed according to the textbook?',
      'choices', jsonb_build_array('Injecting sperm into the contractile vacuole of an amoeba to stimulate its movement.', 'Injecting a single sperm directly into the egg''s cytoplasm using a fine microneedle under a microscope to achieve fertilization.', 'Spraying the cervical lining with steroidal hormonal substances secreted by the kidney.', 'Transferring the nucleus of a somatic cell into an enucleated egg using electric shock.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the "embryo cryopreservation" technique, and what are its biological and medical benefits?',
      'choices', jsonb_build_array('Freezing embryos for the purpose of producing artificially conjoined (Siamese) twins on demand.', 'Freezing and storing surplus embryos resulting from an in vitro fertilization (IVF) cycle in liquid nitrogen for future pregnancy attempts, avoiding the need for repeated egg retrieval.', 'Increasing the size of the nucellus within the developing plant ovule at night.', 'Completely halting the division of ectoderm and mesoderm cells to protect the embryo.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is meant by the "assisted hatching" technique according to the curriculum?',
      'choices', jsonb_build_array('Removing the nuclear membrane and nucleolus from thickened blastomere cells.', 'Creating a small hole in the embryo''s wall (the zona pellucida) before transferring it to the uterus, to facilitate the embryo''s hatching and implantation into the uterine lining, thereby increasing success rates.', 'Injecting the embryo with hydrolytic enzymes from lysosomes to digest impurities.', 'Opening the ovule coverings via the umbilical cord connected to the floral receptacle.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch4-lec9-exam'
    AND title = 'Lecture 9 — Assisted Reproductive Technologies'
);
