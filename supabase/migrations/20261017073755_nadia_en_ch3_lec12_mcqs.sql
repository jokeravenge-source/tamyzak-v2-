-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 12
-- Seed the supplied Polytrichum reproduction MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec12-exam',
  'Lecture 12 — Reproduction in Polytrichum (Mosses)',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'To which plant group does Polytrichum belong?',
      'choices', jsonb_build_array('Vascular ferns.', 'Mosses (non-vascular plants).', 'Flowering plants (angiosperms).', 'Unicellular green algae.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal status of the dominant phase (generation) in Polytrichum?',
      'choices', jsonb_build_array('Diploid (2n) because it is a sporophyte generation.', 'Haploid (n) because it is a gametophyte generation.', 'Triploid (3n) resulting from spore fusion.', 'Tetraploid (4n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the scientific name for the male gametangium in mosses?',
      'choices', jsonb_build_array('Antheridia.', 'Archegonia.', 'Sporangium.', 'Protonema.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the scientific name for the female gametangium in mosses?',
      'choices', jsonb_build_array('Antheridia.', 'Archegonia.', 'Cell plate.', 'Prothallus.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do male gametes (antherozoids) reach the female gametangium to complete fertilization?',
      'choices', jsonb_build_array('They are transported by strong winds during dry seasons.', 'They swim through water (moisture) to reach the archegonia and fertilize the egg inside.', 'They are transported by flying insects from one plant to another.', 'They slide down due to gravity without the need for an aqueous medium.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where do fertilization and zygote formation occur in the Polytrichum plant?',
      'choices', jsonb_build_array('Inside the male antheridia.', 'Inside the archegonia (female reproductive organ).', 'In moist soil outside the plant body.', 'Inside the upper spore capsule.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the sporophyte generation (2n) in mosses consist of after growth, and where is it situated?',
      'choices', jsonb_build_array('It consists of a floating stem and broad leaves, and it sits independently in the soil.', 'It consists of a stalk and a spore capsule; it sits atop the gametophyte generation and depends on it.', 'It consists of fused positive and negative fungal hyphae.', 'It consists of a protonema (initial thallus) containing rhizoids.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is produced by the meiotic division occurring inside the spore capsule of Polytrichum?',
      'choices', jsonb_build_array('Similar male and female gametes (2n).', 'Haploid spores (1n) that are released after the capsule lid falls off.', 'A new zygote that immediately initiates a sporophyte generation.', 'Donor cells containing a genetic plasmid.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What forms when the spores (1n) of the Polytrichum plant germinate in the soil?',
      'choices', jsonb_build_array('Male or female primary filaments (protonema) representing the start of the new gametophyte generation.', 'Thick-walled spore capsule.', 'Complete vascular fern plant.', 'Embryo sac containing 8 nuclei.'),
      'answer_index', 0
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec12-exam'
    AND title = 'Lecture 12 — Reproduction in Polytrichum (Mosses)'
);
