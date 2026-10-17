-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 33
-- Seed the supplied parthenogenesis and hermaphroditism MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec33-exam',
  'Lecture 33 — Parthenogenesis and Hermaphroditism',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the standard definition of parthenogenesis?',
      'choices', jsonb_build_array('A type of reproduction in which the embryo develops from a fertilized egg following fertilization.', 'A type of reproduction in which the embryo develops from an unfertilized egg without the involvement of sperm.', 'A type of asexual reproduction occurring via spores or external budding.', 'Reproduction resulting from the fusion of two male nuclei within the embryo sac.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'In which of the following organisms does parthenogenesis occur as a common natural phenomenon?',
      'choices', jsonb_build_array('Rotifers, some nematodes, crustaceans, insects, some fish, amphibians, and whiptail lizards.', 'Hydra, tapeworms, earthworms, and sponges only.', 'Mammals, birds, large reptiles, and amphibians (permanently).', 'Insects, annelids, and flowering plants only.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What results from the hatching of unfertilized eggs in honeybees?',
      'choices', jsonb_build_array('Diploid (2n) females (workers).', 'New sterile queens.', 'Haploid (1n) males.', 'Males and females in equal numbers, depending on temperature.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What results from the hatching of fertilized eggs in honeybees?',
      'choices', jsonb_build_array('Haploid (1n) males only.', 'Diploid (2n) females (workers or queens).', 'Sterile hermaphroditic individuals lacking reproductive organs.', 'Diploid males resulting from fertilization.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain (based on the study guide): Why are male honeybees haploid (1n)?',
      'choices', jsonb_build_array('Because they are produced via meiosis immediately following cross-fertilization.', 'Because they result from unfertilized eggs developing parthenogenetically.', 'Because chromosomes reduce themselves prior to the pollination process.', 'Due to the closing of the muscular valve as sperm exit the queen.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the sole method of reproduction for populations of whiptail lizards found in the Southwestern United States?',
      'choices', jsonb_build_array('Conventional sexual reproduction involving both males and females.', 'Parthenogenesis only (all individuals are female; populations lack males).', 'Hermaphroditic reproduction via self-fertilization.', 'Asexual reproduction via longitudinal binary fission.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal status of whiptail lizard eggs before undergoing meiosis?',
      'choices', jsonb_build_array('Haploid (1n).', 'Diploid (2n).', 'Tetraploid (4n).', 'Triploid (3n).'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'Exam Question (Reasoning): Why are whiptail lizard individuals diploid (2n) even though they develop from unfertilized eggs?',
      'choices', jsonb_build_array('Because the eggs are fertilized by sperm from other closely related species.', 'Because chromosomes duplicate themselves before meiosis to become (4n), and after division, they become (2n).', 'Because the eggs do not undergo any meiotic division and remain unchanged.', 'Due to the fusion of unfertilized eggs with each other inside the ovary.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the precise biological definition of hermaphroditism?',
      'choices', jsonb_build_array('Organisms that reproduce asexually by detaching body parts to form new individuals.', 'Animal species that possess both male and female reproductive organs in the same individual and produce both eggs and sperm.', 'Organisms that change their sex from male to female depending on environmental seasons.', 'Individuals resulting from unfertilized eggs that exhibit both male and female characteristics.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which of the following represents hermaphroditic animals that avoid self-fertilization by undergoing cross-fertilization?',
      'choices', jsonb_build_array('Earthworms, sponges, and annelids.', 'Tapeworms only.', 'Male honeybees and whiptail lizards.', 'Euglena, Amoeba, and Paramecium.'),
      'answer_index', 0
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec33-exam'
    AND title = 'Lecture 33 — Parthenogenesis and Hermaphroditism'
);
