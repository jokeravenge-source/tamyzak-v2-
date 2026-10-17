-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 11
-- Seed the supplied land plants and alternation of generations MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec11-exam',
  'Lecture 11 — Origin of Land Plants and Alternation of Generations',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'From which lineage do scientists believe land plants descended and evolved?',
      'choices', jsonb_build_array('From zygomycete fungi that live in moist soil.', 'From free-swimming, unicellular green algae.', 'From a lineage of green algae that lived in freshwater 500 million years ago.', 'From brown and scaly algae that live in open seas.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What biological and chemical evidence supports the descent of land plants from green algae?',
      'choices', jsonb_build_array('Both possess hermaphroditic reproductive organs containing both sperm and eggs within the same individual.', 'Both possess various types of chlorophyll pigments, store excess carbohydrates as starch, and have cell walls containing cellulose.', 'Both reproduce via longitudinal and transverse binary fission under harsh conditions.', 'Both rely exclusively on self-fertilization without the need for water.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the scientific definition of the phenomenon known as "alternation of generations"?',
      'choices', jsonb_build_array('A phenomenon in which the plant''s sex changes from male to female depending on the seasons.', 'A phenomenon evident in plant reproduction, meaning the plant''s complete life cycle passes through two generations: a sexual generation and an asexual generation.', 'A phenomenon in which the embryo develops parthenogenetically from an unfertilized egg without the involvement of sperm.', 'The division of a plant cell via binary fission to produce new germ cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What characterizes the "sporophyte generation" in plants?',
      'choices', jsonb_build_array('It is a sexual generation that produces gametes, and its cells are haploid (1n).', 'It is an asexual generation that produces spores, and its cells are diploid (2n).', 'It is a transitional generation occurring only in algae and aquatic fungi.', 'It is a vestigial generation that disappears completely in seed-bearing and advanced plants.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What type of division do spore mother cells undergo within the sporangium, and what is the result?',
      'choices', jsonb_build_array('Ordinary mitosis resulting in diploid (2n) spores.', 'Meiosis resulting in haploid (1n) spores.', 'Direct division resulting in a thick-walled coenocyte (multinucleate mass).', 'Chromosome doubling resulting in (4n) spores.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the "gametophyte generation" represent in plants, and what is its chromosomal status?',
      'choices', jsonb_build_array('An asexual generation that produces spores, with diploid (2n) cells.', 'A sexual generation that produces gametes (sex cells), with haploid (1n) cells.', 'A drought-resistant structure surrounded by a thick cellulose wall reinforced with lignin.', 'The zygospore resulting from the fusion of two male nuclei.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What process initiates the new "sporophyte generation" in the plant life cycle?',
      'choices', jsonb_build_array('The process of meiotic spore division.', 'The process of fertilization (fusion of male and female gametes to form the zygote, 2n).', 'The process of growth and leaf development of the vegetative sporangium.', 'The process of shedding sexual cilia from the outer surface.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does the size ratio of the gametophyte generation change relative to the sporophyte generation as we ascend the evolutionary scale of land plants?',
      'choices', jsonb_build_array('The size of the gametophyte generation increases, while the sporophyte generation is reduced until it disappears.', 'The sizes remain exactly equal in all types of fern and seed plants.', 'The size of the gametophyte generation is reduced (shrinks)—reaching its greatest reduction in flowering plants—while the sporophyte generation increases.', 'The sporophyte generation disappears completely, and plants rely solely on parthenogenesis.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'Explain—based on Ms. Nadia''s study guide—why the gametophyte generation is reduced in advanced land plants.',
      'choices', jsonb_build_array('Due to the absence of photosynthetic pigments (chlorophyll) in modern reproductive cells.', 'Because land plants have adapted to life on land; the greater the adaptation to land, the more the gametophyte generation is reduced to protect gametes from desiccation.', 'As a result of a scarcity of inorganic nutrients and salts in dry growing environments.', 'Due to the lack of local dispersal and pollination mechanisms, such as insects and wind.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal set for each of the following: the spore mother cell and the developing vegetative spore?',
      'choices', jsonb_build_array('Spore mother cells (1n), developing spore (2n).', 'Spore mother cells (2n), developing spore (1n).', 'Spore mother cells (2n), developing spore (2n).', 'Spore mother cells (1n), developing spore (1n).'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec11-exam'
    AND title = 'Lecture 11 — Origin of Land Plants and Alternation of Generations'
);
