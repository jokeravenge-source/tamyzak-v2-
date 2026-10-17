-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 4 · Lecture 3
-- Seed the supplied history and theories of embryology MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch4-lec3-exam',
  'Lecture 3 — History and Theories of Embryology',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the fundamental idea of the Greek philosopher Aristotle (384–322 BC) regarding embryonic development?',
      'choices', jsonb_build_array('He declared that the embryo forms entirely within the bacterial nucleus via binary fission.', 'He found that the parts of the embryo form gradually from the egg''s materials, and he was the first to describe embryonic changes in chicken eggs.', 'He claimed that the embryo exists in miniature, with all its organs, inside the head of the sperm.', 'He proved that viruses are primarily responsible for stimulating the growth of gastrula cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the "Preformation Theory" that emerged in the 17th century?',
      'choices', jsonb_build_array('It hypothesized that the embryo forms gradually from undifferentiated materials within the uterus.', 'It hypothesized that all parts of the embryo pre-exist in the egg or sperm in a miniature form, growing and enlarging after fertilization.', 'It claimed that the gametophyte generation arises from the germination of haploid (1n) spores.', 'It hypothesized that plant hormones, such as auxins, are responsible for forming the embryo''s organs.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How were proponents of the "Preformation Theory" divided regarding the location of the miniature embryo (embryonic homunculus)?',
      'choices', jsonb_build_array('They were divided into scientists who believed the embryo existed in the cytoplasm and others who believed it was in the contractile vacuole.', 'They were divided into two groups: the "ovists" (who believed the embryo existed in miniature form within the egg) and the "spermists" (who believed it existed in the head of the sperm).', 'They were divided into botanists studying monocotyledons and those studying dicotyledons.', 'They were divided into proponents of mitosis and proponents of meiosis.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the "Epigenesis Theory" proposed by the researcher Wolff state?',
      'choices', jsonb_build_array('It states that the embryo exists with all its details and organs pre-formed within the gametes.', 'It states that the embryo does not pre-exist in the egg but rather forms gradually from a simple structure (embryonic material) into a complex structure, consisting of germ layers that accumulate and differentiate to form organs.', 'It states that endosperm tissue accumulates around the embryo to supply it with high-energy ATP.', 'It states that embryonic development relies entirely on natural parthenocarpy.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What significant scientific achievement did the Czech scientist Von Baer make in the early 19th century?',
      'choices', jsonb_build_array('He discovered the nucleus and reported on it in 1831.', 'He discovered the mammalian egg and demonstrated that general animal characteristics appear before specific ones (such as the appearance of the notochord before bird feathers).', 'He described the Golgi apparatus for the first time in nerve cells.', 'He proved that whiptail lizards reproduce parthenogenetically 100% of the time.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the essence of the "experimental theory" in embryology that developed later?',
      'choices', jsonb_build_array('Relying on the external phenotypic description of embryos without interfering with their environment.', 'Attempting to study and examine embryos through experiments (such as excising parts of the embryo or transplanting cells from one location to another) to determine the cells'' capacity for differentiation and growth, as well as their influence on one another.', 'Studying the effect of applying antiviral antibiotics on gastrulation.', 'Conducting osmosis and plasmolysis experiments on the blastomeres resulting from the first cleavage.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch4-lec3-exam'
    AND title = 'Lecture 3 — History and Theories of Embryology'
);
