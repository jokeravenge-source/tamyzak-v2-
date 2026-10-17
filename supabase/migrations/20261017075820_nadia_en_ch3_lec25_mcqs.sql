-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 25
-- Seed the supplied insect fertilization and metamorphosis MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec25-exam',
  'Lecture 25 — Fertilization and Metamorphosis in Insects',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Where do sperm meet the egg to complete the fertilization process in insects?',
      'choices', jsonb_build_array('Outside the female''s body in the surrounding environment.', 'Inside the seminal receptacle immediately before egg maturation.', 'As mature eggs pass through the vagina, where sperm exit the seminal receptacle to fertilize them through an opening in the eggshell.', 'Inside the upper ovarian tubules.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What is the correct description of most insects regarding their mode of reproduction and offspring production?',
      'choices', jsonb_build_array('Viviparous animals that always give birth to fully developed young.', 'Oviparous animals, which lay their fertilized eggs in specific locations using an ovipositor.', 'Animals that reproduce asexually via transverse binary fission.', 'Organisms that rely entirely on hermaphroditic reproduction via self-fertilization.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are insects called that retain fertilized eggs inside their bodies (in the vagina) until the embryo develops and hatches internally, resulting in the birth of live young?',
      'choices', jsonb_build_array('Typical oviparous insects.', 'Ovoviviparous insects.', 'Permanently parthenogenetic insects.', 'Sterile insects.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Give an example from the curriculum of insects described as ovoviviparous.',
      'choices', jsonb_build_array('Field crickets and desert locusts.', 'Flesh flies and some species of aphids.', 'Honeybees and termites.', 'Colorful butterflies and mosquitoes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the scientific term for the morphological and structural changes an insect undergoes after hatching until it reaches the adult stage?',
      'choices', jsonb_build_array('Repeated parthenogenesis.', 'Metamorphosis.', 'Genetic recombination.', 'Indirect (mitotic) division.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the stages of gradual or incomplete metamorphosis in insects?',
      'choices', jsonb_build_array('Egg ➔ Nymph ➔ Adult insect (the nymph lacks wings and is sexually immature).', 'Egg ➔ Pupa inside a cocoon ➔ Adult insect.', 'Spermatogonium ➔ Spermatid ➔ Mature sperm.', 'Fertilized egg ➔ Binary fission ➔ Complete individual.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'Give an example from the curriculum of insects that undergo gradual or incomplete metamorphosis.',
      'choices', jsonb_build_array('Butterflies, mosquitoes, and houseflies.', 'Grasshoppers, cockroaches, true bugs, and dragonflies.', 'Honeybees, ants, and Anopheles mosquitoes.', 'Carpet beetles and clothes moths.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the stages of complete metamorphosis in insects?',
      'choices', jsonb_build_array('Egg ➔ Larva ➔ Pupa inside a cocoon ➔ Adult insect (Imago).', 'Egg ➔ Nymph ➔ Adult insect directly, without a cocoon.', 'Primordial germ cell ➔ Ovarian follicle ➔ Mature egg.', 'Syncytium ➔ Sporangium ➔ Developing spore.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'Give an example from the curriculum of insects that undergo complete metamorphosis.',
      'choices', jsonb_build_array('Locusts, cockroaches, and termites.', 'Butterflies, beetles, houseflies, and mosquitoes.', 'Head lice and jumping fleas.', 'Woodlice and bedbugs.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec25-exam'
    AND title = 'Lecture 25 — Fertilization and Metamorphosis in Insects'
);
