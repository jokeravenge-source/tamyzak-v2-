-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 4 · Lecture 2
-- Seed the supplied early embryonic development stages MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch4-lec2-exam',
  'Lecture 2 — Cleavage and Early Embryonic Development',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are the first processes and stages that occur in the fertilized egg (zygote) immediately after fertilization?',
      'choices', jsonb_build_array('The process of final cellular differentiation', 'The process of cleavage', 'The process of organogenesis and system formation', 'The process of cellular waste excretion'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the precise scientific description of the "cleavage" process according to the biology textbook?',
      'choices', jsonb_build_array('Repeated meiotic division that reduces the number of genetic chromosomes by half.', 'A series of repeated, standard mitotic divisions of the fertilized egg, resulting in small cells called blastomeres, without an increase in the overall size of the embryo during its early stages.', 'The fusion of primordial germ cells with food-storing fat bodies.', 'The separation of the plasma membrane from the cell wall due to water loss.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the mass of small cells (blastomeres) resulting from cleavage called when it forms a solid ball resembling a mulberry fruit?',
      'choices', jsonb_build_array('Blastula', 'Morula', 'Gastrula', 'Prothallus'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How is the "blastula" formed, and what develops in its center according to the textbook?',
      'choices', jsonb_build_array('The morula transforms into a heart-shaped structure bearing archegonia and antheridia.', 'The morula cells arrange themselves into a single layer or multiple layers to form a hollow sphere, and the cavity is called the blastocoel.', 'The embryo implants into the lining of the cervix, and the developing placenta appears.', 'Glands lining the uterine wall secrete a thick, gelatinous albuminous coating.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the biological process following the blastula stage, during which the embryo transforms from a single-layered structure into a two- or three-layered structure?',
      'choices', jsonb_build_array('Organogenesis', 'Gastrulation', 'Continuous longitudinal cleavage', 'Animal cloning'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the cellular layers formed during the "gastrula" stage—from which all body organs and tissues subsequently arise—called?',
      'choices', jsonb_build_array('Smooth secretory cisternae', 'Germ layers (ectoderm, mesoderm, and endoderm)', 'Endosperm tissue and the hard embryonic seed coat', 'Antipodal cells, synergid cells, and the egg cell'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the process following gastrulation in which cells differentiate into specialized tissues to form the specific organs of the embryo?',
      'choices', jsonb_build_array('Third transverse cleavage', 'Organogenesis', 'Artificial parthenocarpy', 'Autolysis (cell death)'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal complement of all the cells (blastomeres) produced during the stages of cleavage, blastula formation, and gastrulation?',
      'choices', jsonb_build_array('Haploid (1n)', 'Diploid (2n), resulting from mitotic divisions of the original zygote (2n)', 'Triploid (3n)', 'Tetraploid (4n)'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch4-lec2-exam'
    AND title = 'Lecture 2 — Cleavage and Early Embryonic Development'
);
