-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 1
-- Seed the supplied introduction to reproduction MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec1-exam',
  'Lecture 1 — Introduction to Reproduction',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the fundamental value of reproduction for survival compared to other vital functions such as respiration and digestion?',
      'choices', jsonb_build_array('Reproduction is essential for the survival of the individual itself; if it ceases, the individual dies immediately.', 'Reproduction ensures the survival of the species, whereas other functions ensure the survival of the individual; its cessation does not lead to the individual''s death but rather to the extinction of the species.', 'Reproduction consumes far less energy than processes like digestion and filtration.', 'Reproduction is limited to specific individuals within the species from birth until death, without requiring energy.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain—based on the study material—why the burden of reproduction in some animal species falls upon only a few individuals of a single generation?',
      'choices', jsonb_build_array('Because most individuals suffer from genetic infertility due to environmental conditions.', 'As seen in honeybees, where the overwhelming majority are sterile females (workers), while fertility is limited to a single queen and a small number of males.', 'Because males always die before their reproductive organs mature during the winter season.', 'Due to the lack of sufficient food for all individuals within a single colony.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the fundamental patterns embodied by reproduction in both its sexual and asexual forms?',
      'choices', jsonb_build_array('Converting inorganic chemical substances into organic substances within cells.', 'Converting raw materials from the surrounding environment into offspring or reproductive cells, and transmitting genetic information (DNA) from parents to offspring.', 'Controlling the processes of direct and indirect cell division within the body''s cells.', 'Production of growth hormones and stimulation of endocrine glands in the organism.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which of the following represents a method of asexual reproduction?',
      'choices', jsonb_build_array('Fusion of sperm and egg nuclei to form a zygote.', 'Binary fission, budding, spore formation, and vegetative reproduction.', 'Cross-fertilization and self-fertilization in hermaphroditic organisms.', 'Meiotic divisions I and II to form gametes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What characterizes sexual reproduction from a genetic perspective?',
      'choices', jsonb_build_array('It produces individuals that are genetically identical to a single parent, without any variation.', 'It involves fertilization processes and results in genetic variations that are significant for evolution and adaptation to the environment.', 'It occurs without the need for meiosis or the formation of male and female gametes.', 'It is limited only to prokaryotic organisms such as bacteria and algae.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec1-exam'
    AND title = 'Lecture 1 — Introduction to Reproduction'
);
