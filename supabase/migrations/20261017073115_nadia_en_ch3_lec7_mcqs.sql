-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 7
-- Seed the supplied bacterial conjugation MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec7-exam',
  'Lecture 7 — Bacterial Conjugation',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the scientific name for the process of sexual reproduction in E. coli bacteria?',
      'choices', jsonb_build_array('Binary fission.', 'Conjugation.', 'Cellular budding.', 'Lysis and production.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'When two different strains of E. coli are combined in a single culture medium, a new strain appears that is genetically distinct from the original two; what is this phenomenon called?',
      'choices', jsonb_build_array('Sudden genetic mutation.', 'Recombination.', 'Bacterial parthenogenesis.', 'Direct division.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the "donor cell" represent in the process of bacterial conjugation?',
      'choices', jsonb_build_array('A female cell lacking the fertility factor.', 'A male cell containing the fertility factor (plasmid) and conjugation pili.', 'A recipient cell that acquires a portion of the chromosome.', 'A dormant bacterial spore resistant to environmental conditions.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where is the "fertility factor" located in the donor cell?',
      'choices', jsonb_build_array('Inside the cell envelope, connected to the flagellum.', 'In the cytoplasm as a small circular DNA molecule (plasmid).', 'Bound to the ribosomes responsible for protein synthesis.', 'Attached to the exterior of the recipient cell''s wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What structure forms when the conjugation (sex) pilus of the donor cell makes contact with the surface of the recipient cell?',
      'choices', jsonb_build_array('Hybrid plasma membrane.', 'Conjugation bridge.', 'Thick protective capsule.', 'Secondary cell wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the donor cell''s chromosome after one of its DNA strands breaks at a specific site?',
      'choices', jsonb_build_array('It completely degrades, and the organism dies.', 'One strand transfers across the conjugation bridge to the recipient cell, while the remaining strand synthesizes a complementary strand within the donor.', 'The entire chromosome transfers, and the donor cell transforms into a female cell.', 'It fuses with the fertility factor and exits the cell.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain—based on the study guide—why the chromosome segment transferred to the recipient cell does not increase the total amount of its genetic material.',
      'choices', jsonb_build_array('Because the recipient cell immediately expels the excess chromosome through the plasma membrane.', 'Because the transferred segment replaces an equivalent part of the recipient cell''s chromosome.', 'Due to the degradation of the transferred segment by the recipient bacterium''s digestive enzymes.', 'Because the recipient cell divides immediately before fusion.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Why does the genetic material in the donor cell not decrease after the conjugation process?',
      'choices', jsonb_build_array('Because it acquires a replacement chromosome segment from the recipient cell.', 'Because the strand remaining in the donor cell synthesizes a complementary strand.', 'Due to the donor cell immediately undergoing binary fission.', 'Because the transfer is temporary, and the chromosome returns to its original position.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the other method of bacterial conjugation in which the fertility factor is transferred without the transfer of the cell''s chromosome?',
      'choices', jsonb_build_array('When the fertility factor is integrated into the donor cell''s chromosome.', 'When the fertility factor floats in the donor cell''s cytoplasm and transfers via the conjugation bridge, causing the recipient to become a donor as well.', 'When the donor cell dies and lyses in the culture medium.', 'By injecting the plasmid via a viral filtrate.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Sexual reproduction in bacteria is unusual because the new individual:',
      'choices', jsonb_build_array('Results from the fusion of a true egg and sperm.', 'Does not receive a complete genetic set from the two parent cells.', 'Forms entirely within the donor cell alone.', 'Is always haploid (1n) and sterile.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec7-exam'
    AND title = 'Lecture 7 — Bacterial Conjugation'
);
