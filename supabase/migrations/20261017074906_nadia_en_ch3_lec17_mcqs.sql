-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 17
-- Seed the supplied ovule and embryo sac formation MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec17-exam',
  'Lecture 17 — Ovule and Embryo Sac Formation',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'How does the formation of the ovule begin inside the ovary, and what is the name of the stalk connecting them?',
      'choices', jsonb_build_array('It begins as a small oral bud and is connected by sexual cilia.', 'It begins as a small protrusion called the nucellus, connected to the ovary wall by the funiculus.', 'It originates as a free-floating protoplasmic sac within the ovarian cytoplasm.', 'It forms from the fusion of small vesicular cells with the receptacle.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the nucellus in terms of structure and chromosomal set?',
      'choices', jsonb_build_array('The mature female gametophyte stage; it is haploid (1n).', 'It represents the megasporangia; it is the tissue mass forming the bulk of the ovule and is diploid (2n).', 'The thick outer coat of the developing seed; it is triploid (3n).', 'The degenerating antipodal cells at the apex of the embryo sac.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What develops inside the nucellus and undergoes meiotic division to produce megaspores?',
      'choices', jsonb_build_array('A haploid egg precursor.', 'A complex cell called the megaspore mother cell (2n).', 'The microspore primordium.', 'The nectar-secreting tube nucleus.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What results from the meiotic division of the megaspore mother cell inside the nucellus?',
      'choices', jsonb_build_array('Four megaspores (n) arranged in a vertical row; three degenerate, and one remains functional.', 'Four ootids of equal size, all developing into mature ova.', 'Two secondary oocytes and two degenerating polar bodies.', 'A mature embryo sac containing 8 free nuclei.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the scientific name given to the remaining functional megaspore in angiosperms, and what does it represent?',
      'choices', jsonb_build_array('Mature pollen grain (n).', 'Embryo sac; it represents the immature female gametophyte.', 'Drought-resistant zygospore (2n).', 'Invasive endosperm (3n).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How many mitotic divisions does the functional embryo sac nucleus undergo, and how many nuclei result from them?',
      'choices', jsonb_build_array('Two mitotic divisions resulting in 4 nuclei.', 'Three successive mitotic divisions resulting in 8 nuclei within the embryo sac.', 'One meiotic division resulting in two polar nuclei.', 'Five direct divisions resulting in a circular genetic array.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How are the eight nuclei distributed within the mature embryo sac after becoming surrounded by cytoplasm and membranes?',
      'choices', jsonb_build_array('They all congregate at the center of the embryo sac to form the fused nucleus.', 'Three at the end opposite the opening (antipodal cells), three at the end near the micropyle (an egg cell and two synergid cells), and two nuclei in the center (polar nuclei).', 'Four migrating male nuclei and four stationary nuclei.', 'Six nuclei disappear, and only two remain at the micropylar end.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the micropyle opening found in the ovule?',
      'choices', jsonb_build_array('An opening in the outer ovary wall from which viscous fluid exudes.', 'A small opening left by the ovule integuments at its apex, through which the pollen tube subsequently passes.', 'The area where the funiculus connects to the inner ovule wall.', 'The cellular pore from which the synergid cells are formed.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal set for each of the following: the antipodal cells and the nucellus?',
      'choices', jsonb_build_array('Antipodal cells (2n), nucellus (1n).', 'Antipodal cells (1n), nucellus (2n).', 'Antipodal cells (2n), nucellus (2n).', 'Antipodal cells (1n), nucellus (1n).'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec17-exam'
    AND title = 'Lecture 17 — Ovule and Embryo Sac Formation'
);
