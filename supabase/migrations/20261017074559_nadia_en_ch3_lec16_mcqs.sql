-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 16
-- Seed the supplied anther and pollen grain formation MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec16-exam',
  'Lecture 16 — Anther and Pollen Grain Formation',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the structural and anatomical composition of the anther?',
      'choices', jsonb_build_array('A single rectangular lobe containing one pollen sac.', 'Two elongated lobes connected by a connective tissue containing a vascular bundle; each lobe consists of two chambers, each known as a pollen sac.', 'Three circular lobes distributed at the apex of the style.', 'A hollow cylindrical tube ending in a sticky stigma.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What do pollen sacs (anther sacs) represent in flowering plants?',
      'choices', jsonb_build_array('Microsporangia.', 'Megasporangia.', 'The reproductive prothallus.', 'The mature embryo sac.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What happens to the microspore mother cells (2n) located inside the pollen sacs to form spores?',
      'choices', jsonb_build_array('They undergo ordinary mitosis to produce (2n) cells.', 'They undergo meiosis, resulting in four haploid (1n) microspores.', 'Their original nucleus disintegrates, transforming into a mucilaginous sac.', 'Their chromosomes replicate, becoming tetraploid (4n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How is the pollen grain formed from the microspore (1n)?',
      'choices', jsonb_build_array('The microspore nucleus undergoes meiosis to produce four nuclei.', 'The microspore nucleus undergoes mitosis, and the two resulting nuclei become surrounded by cytoplasm to form the tube nucleus and the generative nucleus; the grain secretes a thick wall featuring spines or cilia and containing germ pores.', 'Two male nuclei fuse with the polar nucleus inside the spore.', 'The outer cilia of the spore are shed, and it transforms directly into a swimming sperm.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the two nuclei or cells found inside the mature pollen grain prior to pollination?',
      'choices', jsonb_build_array('The positive nucleus and the negative nucleus.', 'The tube cell and the generative cell.', 'The antipodal nucleus and the reproductive nucleus.', 'The egg cell and the two synergid cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the mature pollen grain represent biologically?',
      'choices', jsonb_build_array('The mature male gametophyte.', 'The immature male gametophyte.', 'The advanced vascular sporophyte generation.', 'The diploid zygote.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the scientific name for the thin areas in the outer wall of the pollen grain from which the pollen tube subsequently emerges?',
      'choices', jsonb_build_array('Germ pores.', 'Chiasmata.', 'The transverse cell plate.', 'The vascular channels of the anther.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal complement of each of the following: the generative cell and the microspore mother cell?',
      'choices', jsonb_build_array('Generative cell (2n), microspore mother cell (n).', 'Generative cell (n), microspore mother cell (2n).', 'Generative cell (2n), microspore mother cell (2n).', 'Generative cell (n), microspore mother cell (n).'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec16-exam'
    AND title = 'Lecture 16 — Anther and Pollen Grain Formation'
);
