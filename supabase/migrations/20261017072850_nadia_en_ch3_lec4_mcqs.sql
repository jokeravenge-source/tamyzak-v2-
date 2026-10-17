-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 4
-- Seed the supplied viral reproduction MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec4-exam',
  'Lecture 4 — Viral Reproduction',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are viruses based on their structural and biological description?',
      'choices', jsonb_build_array('Prokaryotic organisms containing cytoplasm and minute membrane-bound organelles.', 'Complex cellular organisms that reproduce via direct division outside the host organism.', 'Acellular structures representing a link between living and non-living entities; they do not move except inside living cells.', 'Microscopic plants that lack chlorophyll and reproduce by forming spores.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'Explain—based on the study material—why viruses lose the ability to reproduce and grow outside the living cells of other organisms.',
      'choices', jsonb_build_array('Because they lack genetic material (DNA or RNA) in their external structure.', 'Because they lack cellular organelles, including the enzymatic systems necessary for respiration, protein synthesis, or energy production.', 'Due to the degradation of their protein coat immediately upon release into the dry external environment.', 'Because their cell wall freezes and hardens outside the host body.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the typical type of virus used to study the mechanism of viral replication?',
      'choices', jsonb_build_array('Novel Coronavirus.', 'Human Immunodeficiency Virus (HIV/AIDS).', 'Bacteriophage.', 'Tobacco mosaic virus.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What exactly happens during the "attachment phase" between the virus and the bacterium?',
      'choices', jsonb_build_array('The virus tail secretes an enzyme that completely degrades the bacterial cell wall.', 'The virus approaches the bacterial cell, and the fibers on its tail come into contact with the bacterial cell wall.', 'The virus injects its DNA into the bacterial cytoplasm.', 'The viral DNA replicates immediately and degrades the bacterial DNA.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the function of the enzyme secreted by the viral tail fibers during the "penetration stage"?',
      'choices', jsonb_build_array('Building a new protein coat to protect the virus from bacterial defenses.', 'Weakening the chemical bonds in the bacterial cell wall at the attachment site to create a hole.', 'Destroying the bacterial nuclear membrane to prevent it from dividing.', 'Activating bacterial ribosomes to produce viral RNA.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the bacterial cell DNA immediately after the viral DNA enters it during the "synthesis or construction stage"?',
      'choices', jsonb_build_array('It combines with the viral DNA to form a new hybrid chromosome.', 'It begins directing ribosomes to produce enzymes that degrade the virus.', 'It becomes inactive, as viral mRNA is transcribed to produce enzymes that degrade bacterial DNA and mRNA.', 'It moves to the external viral tail and disappears.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What happens during the "maturation stage" inside the bacterial cell?',
      'choices', jsonb_build_array('Protein molecules organize to form protein coats around the viral DNA molecules, and 100–200 new viruses are formed.', 'Viruses exit individually through the plasma membrane without destroying the bacterium.', 'The bacterial cell doubles in size and transforms into a hermaphroditic cell.', 'Energy produced from anaerobic respiration is consumed to integrate the nucleus.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'How long does the complete viral lytic cycle take, from initial contact to the release stage?',
      'choices', jsonb_build_array('Only about 5 minutes.', 'Approximately 25 minutes.', 'A full 24 hours.', 'One week, depending on the type of bacteria.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is viral DNA called when it integrates with bacterial DNA without destroying it during the "lysogenic cycle"?',
      'choices', jsonb_build_array('Prophage.', 'Hybrid chromosome.', 'Cellular plasmid.', 'Viral primordium.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What distinguishes the "lysogenic cycle" from the "lytic cycle"?',
      'choices', jsonb_build_array('The bacterial cell is destroyed and lysed immediately upon injection of the viral DNA.', 'Viral DNA integrates with bacterial DNA without causing destruction, and the viral DNA replicates alongside the bacterial DNA.', 'It requires the presence of male and female reproductive cells to complete reproduction.', 'It occurs only outside the organism''s body and in aquatic environments.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec4-exam'
    AND title = 'Lecture 4 — Viral Reproduction'
);
