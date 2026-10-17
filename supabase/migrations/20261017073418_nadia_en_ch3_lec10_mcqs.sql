-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 10
-- Seed the supplied Euglena and fungi MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec10-exam',
  'Lecture 10 — Reproduction in Euglena and Fungi',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'To which group of organisms does Euglena belong, and where does it live?',
      'choices', jsonb_build_array('Ciliate protists; lives in open seas.', 'Flagellate protists; lives in ponds and freshwater streams where plants are present.', 'Zygomycete fungi; lives in dry soil.', 'Brown algae; lives only in saltwater.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'By what method does Euglena reproduce asexually, and under what conditions does this occur?',
      'choices', jsonb_build_array('Transverse binary fission; occurs only during cell death.', 'Longitudinal binary fission; occurs in both the free-swimming stage and the encysted stage.', 'External budding and spore formation; occurs under favorable conditions.', 'Parthenogenesis via unfertilized eggs.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do the nucleus and cytoplasm divide in Euglena during longitudinal binary fission?',
      'choices', jsonb_build_array('The nucleus undergoes meiotic division, and the cytoplasm divides transversely.', 'The nucleus undergoes ordinary mitotic division, and the cytoplasm separates longitudinally and gradually from anterior to posterior.', 'The original nucleus disintegrates, and the cytoplasm divides via lateral budding.', 'The nucleus undergoes direct division without the disappearance of the nuclear membrane.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the status of sexual reproduction in the Euglena organism according to the official curriculum?',
      'choices', jsonb_build_array('Sexual reproduction via conjugation and nuclear exchange.', 'Sexual reproduction via self-fertilization and zygote formation.', 'Sexual reproduction in Euglena is not yet known.', 'Sexual reproduction via anisogametes (gametes of different sizes).'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'To which kingdom do fungi, such as black bread mold, belong, and in what ways do they resemble plants?',
      'choices', jsonb_build_array('They belong to the Kingdom Protista and resemble plants in possessing plastids.', 'They belong to the Kingdom Fungi and resemble plants in their reproductive features, growth patterns, and biochemistry.', 'They belong to the Kingdom Monera (Prokaryotae) and resemble plants in possessing a cellulose cell wall.', 'They belong to the Kingdom Animalia and resemble animals in movement and locomotion.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain—based on the study guide—in what ways fungi differ from plants.',
      'choices', jsonb_build_array('Fungi reproduce only asexually, whereas plants reproduce sexually.', 'Fungi lack photosynthetic pigments (chlorophyll) and are not autotrophic.', 'Fungi do not contain genetic material (DNA) within the nucleus.', 'Fungi do not possess fungal filaments or hyphae.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Approximately how many fungal species have been identified in nature?',
      'choices', jsonb_build_array('About 10,000 species.', 'More than 100,000 species.', 'Only about 5,000 species.', 'One million different species.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens when fungal filaments (hyphae) containing negative and positive nuclei meet in bread mold?',
      'choices', jsonb_build_array('The fungal filaments immediately decompose and die.', 'The nuclei undergo meiotic division before meeting.', 'The gametic cells containing the nuclei fuse to form fused gametic cells.', 'Biflagellated motile vegetative spores are formed.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What is the thick-walled structure—resistant to harsh environmental conditions—that forms after the fusion of positive and negative nuclei in bread mold?',
      'choices', jsonb_build_array('Sporangium.', 'Zygote.', 'Embryo sac.', 'Fungal plasmid.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal ploidy of the spores released from the bread mold sporangium following meiosis?',
      'choices', jsonb_build_array('Diploid (2n).', 'Haploid (n).', 'Triploid (3n).', 'Tetraploid (4n).'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec10-exam'
    AND title = 'Lecture 10 — Reproduction in Euglena and Fungi'
);
