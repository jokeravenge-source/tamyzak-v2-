-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 4 · Lecture 7
-- Seed the supplied stem cells MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch4-lec7-exam',
  'Lecture 7 — Stem Cells',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the precise scientific definition of stem cells according to the biology textbook?',
      'choices', jsonb_build_array('They are terminally specialized cells that lack the ability to undergo mitosis or meiosis.', 'They are unspecialized cells capable of division and self-renewal, and have the ability to differentiate into various types of specialized cells in the presence of appropriate stimuli.', 'Prokaryotic cells that lack a nuclear membrane and are found in bacteria and mycoplasma.', 'Sex cells resulting from the second meiotic division, containing half the chromosome number (1n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the two main characteristics that make stem cells unique and important in medical studies?',
      'choices', jsonb_build_array('1. Absence of genetic material 2. Ability to undergo immediate autolysis.', '1. Ability to divide indefinitely and self-renew 2. Ability to differentiate into specialized functional cells.', '1. Large size visible to the naked eye 2. Presence of photosynthetic pigments.', '1. Secretion of steroid hormones 2. Synthesis of cellulose and rigid lignin.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How are stem cells classified based on their source and the organism''s developmental stage, according to the textbook?',
      'choices', jsonb_build_array('Plant stem cells and animal stem cells only.', 'Embryonic stem cells and adult stem cells, in addition to umbilical cord cells.', 'Haploid and diploid stem cells.', 'Vascular stem cells and sterile non-phospholipid stem cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What distinguishes "embryonic stem cells" in terms of their differentiation capacity compared to adult stem cells?',
      'choices', jsonb_build_array('Their differentiation capacity is very limited and restricted to a single type of tissue.', 'They possess a superior capacity for differentiation and are termed totipotent or pluripotent cells, as they can give rise to almost any type of cell in the human body.', 'They completely lack the ability to divide and undergo autolysis in osmotic solutions.', 'They form centers for the conversion of glucose into solid animal starch (glycogen).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where are "adult stem cells" found in the human body, and what is their primary function?',
      'choices', jsonb_build_array('They are found only within the contractile vacuole of lower organisms.', 'They are found in various body tissues such as bone marrow, the brain, and the skin; their primary function is to repair and replace damaged or dead cells within that tissue.', 'They are concentrated exclusively within the mature ovarian Graafian follicle.', 'They are located at the base of cilia and flagella to activate the kinetosome.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the key current and future medical applications and prospects for the use of stem cells (stem cell therapy)?',
      'choices', jsonb_build_array('Using them to induce artificial parthenocarpy in flowering plants.', 'Cultivating them to replace damaged tissues and organs, and to treat blood diseases, leukemia, spinal cord injuries, diabetes, and Alzheimer''s disease.', 'Using them to destroy the tail fibers of bacteriophages.', 'Injecting them into lymphatic vessels to inhibit the division of embryonic gastrula cells.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch4-lec7-exam'
    AND title = 'Lecture 7 — Stem Cells'
);
