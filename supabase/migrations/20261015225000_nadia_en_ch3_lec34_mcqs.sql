-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 34
-- Seed the English translation of the supplied parthenogenesis and hermaphroditism MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec34-exam',
  'Lecture 34 — Parthenogenesis and Hermaphroditism',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the standard definition of parthenogenesis?',
      'choices', jsonb_build_array('A type of reproduction in which an embryo develops from a fertilized egg after fertilization.', 'A type of reproduction in which an embryo develops from an unfertilized egg without the participation of sperm.', 'A type of asexual reproduction that occurs through spores or external budding.', 'Reproduction that results from the fusion of two male nuclei inside the embryo sac.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'In which of the following organisms does parthenogenesis occur as a familiar natural phenomenon?',
      'choices', jsonb_build_array('Rotifers, some nematodes, crustaceans, insects, some fish, amphibians, and whiptail lizards.', 'Hydra, tapeworms, earthworms, and sponges only.', 'Mammals, birds, large reptiles, and amphibians permanently.', 'Insects, annelids, and flowering plants only.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What results from the hatching of unfertilized eggs in honeybees?',
      'choices', jsonb_build_array('Diploid (2n) females (workers).', 'New sterile queens.', 'Haploid (n) males.', 'Equal numbers of males and females depending on temperature.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What results from the hatching of fertilized eggs in honeybees?',
      'choices', jsonb_build_array('Only haploid (n) males.', 'Diploid (2n) females (workers or queens).', 'Sterile hermaphroditic individuals without reproductive organs.', 'Diploid males produced as a result of fertilization.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Why are male honeybees haploid (n)?',
      'choices', jsonb_build_array('Because they result from meiosis immediately after cross-fertilization.', 'Because they develop parthenogenetically from unfertilized eggs.', 'Because their chromosomes reduce themselves before pollination.', 'Because a muscular valve closes while sperm leave the queen.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the only method of reproduction in whiptail lizard populations living in the southwestern United States?',
      'choices', jsonb_build_array('Ordinary sexual reproduction involving males and females.', 'Parthenogenesis only; all individuals are female and the populations contain no males.', 'Hermaphroditic reproduction through self-fertilization.', 'Asexual reproduction through longitudinal binary fission.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosome number of whiptail lizard eggs before they undergo meiosis?',
      'choices', jsonb_build_array('Haploid (n).', 'Diploid (2n).', 'Tetraploid (4n).', 'Triploid (3n).'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'Why are whiptail lizard individuals diploid (2n) even though they develop from unfertilized eggs?',
      'choices', jsonb_build_array('Because their eggs are fertilized by sperm from closely related species.', 'Because the chromosomes duplicate before meiosis to become tetraploid (4n), then become diploid (2n) after division.', 'Because the eggs do not undergo meiosis and remain unchanged.', 'Because unfertilized eggs fuse with one another inside the ovary.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the precise biological definition of hermaphroditism?',
      'choices', jsonb_build_array('Organisms that reproduce asexually by separating parts of their bodies to form new individuals.', 'Animal species in which the same individual possesses male and female reproductive organs and produces both eggs and sperm.', 'Organisms that change sex from male to female according to environmental seasons.', 'Individuals that develop from unfertilized eggs and display male and female characteristics together.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which of the following are hermaphroditic animals that avoid self-fertilization by undergoing cross-fertilization?',
      'choices', jsonb_build_array('Earthworms, sponges, and annelids.', 'Tapeworms only.', 'Male honeybees and whiptail lizards.', 'Euglena, Amoeba, and Paramecium.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What type of fertilization occurs in the tapeworm as an exception to the general rule?',
      'choices', jsonb_build_array('Cross-fertilization between two different individuals.', 'Parthenogenetic fertilization without sperm.', 'Self-fertilization, in which an individual fertilizes its own eggs with its own sperm.', 'External fertilization in the water surrounding the worm.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'Why do most hermaphroditic animals, such as the earthworm, avoid self-fertilization?',
      'choices', jsonb_build_array('Because their male and female reproductive organs mature at different times.', 'Because sperm and eggs are sterile within the same individual.', 'Because anatomical barriers prevent sperm from reaching eggs in the same body.', 'Because self-fertilization immediately causes the embryo to die.'),
      'answer_index', 0
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec34-exam'
    AND title = 'Lecture 34 — Parthenogenesis and Hermaphroditism'
);
