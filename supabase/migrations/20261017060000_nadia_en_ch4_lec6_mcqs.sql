-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 4 · Lecture 6
-- Seed the supplied fraternal, identical, and Siamese twins MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch4-lec6-exam',
  'Lecture 6 — Fraternal, Identical, and Siamese Twins',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the primary biological cause for the formation of "fraternal" (non-identical) twins in humans?',
      'choices', jsonb_build_array('The mitotic division of a single fertilized egg into two separate parts.', 'The release of two or more eggs from the ovary simultaneously, with each egg fertilized by a separate sperm, resulting in separate embryos each with its own placenta and amniotic sac.', 'Parthenogenetic development of an embryo from an unfertilized egg without sperm involvement.', 'The fusion of two male nuclei with the polar nucleus inside the mature embryo sac.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'According to the biology textbook, what are the phenotypic and sexual characteristics of fraternal (non-identical) twins?',
      'choices', jsonb_build_array('They are completely identical in appearance and genetic traits and are always of the same sex.', 'They may be similar or different in appearance (like any siblings born at different times) and may be of the same sex or different sexes (male and female).', 'They are always sterile females with a diploid chromosome set (2n).', 'They exhibit both male and female characteristics in a single hermaphroditic individual.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How are "identical" twins formed in humans from a biological perspective?',
      'choices', jsonb_build_array('From the fertilization of two separate eggs by two different sperm simultaneously.', 'They originate from a single fertilized egg (zygote), where cells of the inner cell mass or blastomeres separate during early cleavage stages into two distinct parts, each developing into a complete embryo.', 'By spraying the female''s ovaries with plant hormones such as auxins and gibberellins.', 'From the hatching of unfertilized eggs in the uterus via parthenogenesis.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How are identical twins characterized—according to the text—regarding sex, as well as phenotypic and genetic traits?',
      'choices', jsonb_build_array('They are always different in sex and appearance due to the lack of exchange of chromosomal segments.', 'They are completely identical in their genetic and phenotypic traits and are always of the same sex (either two males or two females).', 'They are haploid (1n) and permanently sterile.', 'They possess unstable forms that change from time to time, like an amoeba.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are "Siamese twins," and how do they form according to the textbook?',
      'choices', jsonb_build_array('Fraternal twins resulting from distinct eggs that fused together due to external dehydration.', 'Identical twins in which the blastomeres or parts of the embryo did not separate completely; the twins are born joined at specific regions (such as the back, chest, or head), and some can be surgically separated.', 'Embryos resulting from direct amitotic divisions without the formation of spindle fibers.', 'Individuals cloned in the laboratory by transferring a somatic nucleus into sterilized cytoplasm.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Why are some twins called Siamese twins according to the textbook?',
      'choices', jsonb_build_array('They were named after strains of colon bacteria discovered in freshwater lakes.', 'They were named after the first twins of this type born in Siam (present-day Thailand).', 'They originated from a specialized floral bud containing four polar nuclei.', 'They secrete proteinaceous substances that protect the embryo from bacterial infections.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch4-lec6-exam'
    AND title = 'Lecture 6 — Fraternal, Identical, and Siamese Twins'
);
