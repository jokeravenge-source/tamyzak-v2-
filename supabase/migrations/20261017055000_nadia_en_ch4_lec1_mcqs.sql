-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 4 · Lecture 1
-- Seed the supplied introduction to embryonic development MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch4-lec1-exam',
  'Lecture 1 — Introduction to Embryonic Development',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'According to the biology textbook, what biological process is referred to as "embryonic development"?',
      'choices', jsonb_build_array('The process of cell division via longitudinal binary fission to produce new bacterial strains.', 'The process of growth and development in organisms, wherein a new individual forms from a single cell—the fertilized egg—and evolves into a complete organism resembling its parents.', 'The conversion of inorganic chemicals into complex sugars within the endosperm tissue.', 'The phenomenon of alternation of generations, in which the plant passes through both a sexual generation and an independent asexual generation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which branch of science studies the stages of embryonic development and their structural changes?',
      'choices', jsonb_build_array('Histology.', 'Embryology.', 'Human Genetics.', 'Ecology and Cellular Metabolism.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Why is the process of embryonic development not limited to the stages spent inside the egg or the uterus?',
      'choices', jsonb_build_array('Because the number of genetic chromosomes doubles immediately after birth to become (4n).', 'Because the individual''s growth continues after hatching or birth, passing through successive stages of growth and maturation until becoming an adult and eventually an elderly organism.', 'Because lysosomes immediately begin the process of autolysis (self-digestion) of embryonic tissues.', 'Due to the embryo''s inability to perform aerobic cellular respiration until after reaching puberty.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the initial, fundamental, and common stage from which embryonic development begins in multicellular organisms?',
      'choices', jsonb_build_array('Formation of the ootid and disintegration of the polar bodies.', 'Production of gametes (sperm and ova) and their union via fertilization to form the zygote.', 'Amitotic division of germ cells without the expenditure of ATP energy.', 'Formation of the green prothallus bearing the antheridia.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the "zygote" (fertilized egg) represent—genetically and developmentally—at the onset of embryonic development?',
      'choices', jsonb_build_array('The immature haploid (1n) gametophyte stage.', 'The beginning of the new organism, representing the starting point for the formation of the millions of specialized cells that constitute tissues and organs.', 'The vestigial, drought-resistant structure surrounded by woody lignin.', 'The male donor cell containing the fertility plasmid factor.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch4-lec1-exam'
    AND title = 'Lecture 1 — Introduction to Embryonic Development'
);
