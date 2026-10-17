-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 9
-- Seed the supplied Paramecium sexual reproduction MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec9-exam',
  'Lecture 9 — Sexual Reproduction in Paramecium',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the first step that occurs when the process of "conjugation" begins between two Paramecium individuals?',
      'choices', jsonb_build_array('The two individuals fuse completely along their dorsal sides.', 'The two individuals adhere at the oral groove and remain together briefly, forming a protoplasmic bridge between them.', 'The macronucleus undergoes meiotic division immediately upon adhesion.', 'The two individuals exchange contractile vacuoles across the outer membrane.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the fate of the "macronucleus" in each of the conjugating individuals during sexual reproduction?',
      'choices', jsonb_build_array('It replicates to produce four macronuclei.', 'It begins to disintegrate and disappear (degenerate).', 'It undergoes indirect (mitotic) division.', 'It migrates across the protoplasmic bridge to the other individual.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What results from the meiotic division of the micronucleus (2n) in the conjugating Paramecium?',
      'choices', jsonb_build_array('Two nuclei of equal size (n).', 'Four haploid nuclei (n).', 'One large nucleus and three polar bodies.', 'A genetic plasmid containing the fertility factor.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Of the four nuclei resulting from the meiotic division of the micronucleus, how many nuclei disappear and degenerate?',
      'choices', jsonb_build_array('Only one nucleus.', 'Two nuclei.', 'Three nuclei.', 'No nucleus disappears.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'The remaining fourth nucleus in Paramecium undergoes an unequal ordinary division; what does this produce?',
      'choices', jsonb_build_array('Two completely identical male nuclei.', 'Two migratory nuclei and two stationary nuclei.', 'Two pronuclei: a male pronucleus (small and migratory) and a female pronucleus (large and stationary).', 'A vegetative nucleus and a reproductive nucleus.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What happens after the exchange of male (migratory) pronuclei across the protoplasmic bridge?',
      'choices', jsonb_build_array('The migratory male nucleus fuses with the stationary female nucleus of the same individual.', 'The migratory male nucleus fuses with the stationary female nucleus of the other individual to form the synkaryon (2n).', 'The exchanged nuclei immediately disintegrate within the new cytoplasm.', 'Each migratory nucleus divides by longitudinal binary fission.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the final outcome for the two conjugating individuals after they separate and each undergoes division?',
      'choices', jsonb_build_array('Each individual divides twice to produce 4 daughter Paramecia (a total of 8 Paramecia).', 'Only one new individual is produced, and the other dies.', 'A dormant zygospore surrounded by a thick cellulose wall is formed.', 'The two organisms transform into bacterial cells that reproduce by fission.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'How does the process of "autogamy" in Paramecium differ from conjugation?',
      'choices', jsonb_build_array('No adhesion occurs between two Paramecium individuals.', 'An exchange of migratory male nuclei occurs twice in succession.', 'The male and female pronuclei derived from the same individual fuse to form a homozygous nucleus.', 'It produces haploid (1n) individuals that are always sterile.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal set of the "fused nucleus" in Paramecium following conjugation or autogamy?',
      'choices', jsonb_build_array('Haploid (1n).', 'Diploid (2n).', 'Triploid (3n).', 'Tetraploid (4n).'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec9-exam'
    AND title = 'Lecture 9 — Sexual Reproduction in Paramecium'
);
