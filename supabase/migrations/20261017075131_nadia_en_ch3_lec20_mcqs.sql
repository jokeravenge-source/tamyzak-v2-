-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 20
-- Seed the supplied double fertilization and embryo formation MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec20-exam',
  'Lecture 20 — Double Fertilization and Embryo Formation',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the name of the fertilization process characteristic of flowering plants that involves the union of male cells with components of the embryo sac?',
      'choices', jsonb_build_array('Self-fertilization.', 'Cross-fertilization.', 'Double fertilization.', 'Parthenogenesis.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What exactly happens during the process of double fertilization inside the embryo sac?',
      'choices', jsonb_build_array('The tube nucleus unites with the egg cell, and the antipodal cells degenerate.', 'One of the two male cells unites with the egg nucleus to form the zygote (2n), and the second male cell unites with the two polar nuclei to form the endosperm nucleus (3n).', 'The two male cells fuse together to form a tetraploid male nucleus (4n).', 'The egg unites with the two synergid cells to form the embryo.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal set of the endosperm nucleus?',
      'choices', jsonb_build_array('Haploid (1n).', 'Diploid (2n).', 'Triploid (3n).', 'Tetraploid (4n).'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'Explain—based on Ms. Nadia''s study guide—why the endosperm nucleus is triploid (3n).',
      'choices', jsonb_build_array('Because it results from repeated meiotic division inside the embryo sac.', 'Because it is produced by the union of a male cell (1n) with the two polar nuclei (1n + 1n).', 'Due to the doubling of the tube cell''s genetic material immediately after fertilization.', 'As a result of the fusion of the three antipodal cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What forms after the repeated divisions of the endosperm nucleus, and what is its function?',
      'choices', jsonb_build_array('Endosperm tissue forms; it is a nutrient-storage tissue upon which the embryo relies during its growth.', 'A new micropyle opening forms to protect the seed.', 'The hard outer coat of the fruit forms.', 'Embryonic cotyledons form directly.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the first stage of embryo formation in dicotyledonous plants following the zygote stage?',
      'choices', jsonb_build_array('Globular embryo stage.', 'Proembryo stage.', 'Keratinization stage.', 'Growth gene stage.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'At which stage of embryo formation does the suspensor appear, with its cells becoming elongated?',
      'choices', jsonb_build_array('Zygote stage.', 'Proembryo stage.', 'Globular embryo stage.', 'Growth gene stage.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the shape of the embryo during the heart-shaped stage in dicotyledonous plants?',
      'choices', jsonb_build_array('It is shaped like a long, cylindrical tube.', 'It is spherical with a single, vestigial cotyledon.', 'It is heart-shaped, with the two cotyledons becoming visible.', 'It transforms into the shape of a vascular fern leaf.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What is the correct sequence of stages for embryo formation in dicotyledons, starting from the beginning?',
      'choices', jsonb_build_array('Zygote stage ➔ Pro-embryo stage ➔ Globular embryo stage ➔ Heart stage ➔ Torpedo stage ➔ Mature embryo stage.', 'Heart stage ➔ Torpedo stage ➔ Zygote stage ➔ Globular embryo stage.', 'Mature embryo stage ➔ Torpedo stage ➔ Heart stage ➔ Zygote stage.', 'Zygote stage ➔ Torpedo stage ➔ Heart stage ➔ Mature embryo stage.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'At which embryonic stage does the embryonic axis clearly appear, consisting of the plumule, radicle, and embryonic axis (hypocotyl/epicotyl)?',
      'choices', jsonb_build_array('Pro-embryo stage.', 'Globular embryo stage.', 'Mature embryo stage.', 'Rapid keratinization stage.'),
      'answer_index', 2
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec20-exam'
    AND title = 'Lecture 20 — Double Fertilization and Embryo Formation'
);
