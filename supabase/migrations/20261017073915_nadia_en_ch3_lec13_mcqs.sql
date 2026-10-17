-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 13
-- Seed the supplied Polypodium reproduction MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec13-exam',
  'Lecture 13 — Reproduction in Polypodium (Ferns)',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'To which plant group does the Polypodium plant belong?',
      'choices', jsonb_build_array('Bryophytes (non-vascular plants).', 'Pteridophytes (seedless vascular plants).', 'Angiosperms (flowering plants).', 'Ascomycetes (sac fungi).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the dominant phase (generation) in ferns (Polypodium), and what is its chromosomal set?',
      'choices', jsonb_build_array('Gametophyte phase (1n).', 'Sporophyte phase (2n).', 'Hermaphroditic phase (3n).', 'Protonema phase (1n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where are the sporangia located in the fern plant?',
      'choices', jsonb_build_array('At the base of the creeping stem (rhizome).', 'On the underside of the fern fronds (leaves).', 'Inside the female reproductive organ (archegonium).', 'At the tip of the green leaf stalk.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is produced by the meiotic division of spore mother cells within the fern''s sporangia?',
      'choices', jsonb_build_array('Motile male gametes (2n).', 'Haploid spores (1n).', 'A diploid zygote (2n).', 'Small vesicular cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What forms when fern spores (1n) germinate in moist soil?',
      'choices', jsonb_build_array('A new sporophyte plant (2n).', 'A green, heart-shaped structure called the prothallus.', 'Primary filaments called the protonema.', 'A capsule covered by a thick lid.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the precise definition of the "prothallus" in ferns?',
      'choices', jsonb_build_array('A vascular sporophyte generation containing leaves and a creeping rhizome stem.', 'A green, heart-shaped structure representing the gametophyte generation, bearing archegonia, antheridia, and rhizoids at its pointed end.', 'A chemical sheath that secretes enzymes to weaken the sporangium wall.', 'A protoplasmic sac containing fused negative and positive nuclei.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where are the female gametangia (archegonia) and male gametangia (antheridia) located on the prothallus?',
      'choices', jsonb_build_array('Antheridia at the top of the heart shape and archegonia at the pointed end.', 'They are located together on the prothallus (a hermaphroditic structure), with archegonia found near the heart-shaped notch, and antheridia distributed across the rest of the prothallus and alongside the rhizoids.', 'Antheridia are located on one independent thallus, and archegonia on another.', 'They are located within the tissues of the creeping rhizome stem.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do fertilization and zygote formation occur in ferns?',
      'choices', jsonb_build_array('Male gametes are transported by the wind to fertilize the archegonia in a dry environment.', 'Male gametes released from the antheridia swim through the aqueous medium (moisture) to reach the egg inside the archegonia.', 'Internal self-fertilization occurs without the need for water, due to the presence of a muscular valve.', 'Spores fuse directly into the soil without germinating.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What forms after fertilization within the archegonia, and how does the new sporophyte emerge?',
      'choices', jsonb_build_array('A zygote (2n) forms and divides to produce a new sporophyte; it grows upon the prothallus, deriving nutrients from it until it develops its own roots and leaves, at which point the prothallus withers away.', 'A zygospore forms, enclosed in a thick wall, and remains dormant throughout the winter.', 'An oral bud and new contractile vacuoles form, immediately expelling the prothallus.', 'Four independent primary germ cells are formed.'),
      'answer_index', 0
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec13-exam'
    AND title = 'Lecture 13 — Reproduction in Polypodium (Ferns)'
);
