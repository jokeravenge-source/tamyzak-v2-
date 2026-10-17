-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 19
-- Seed the supplied pollen tube formation MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec19-exam',
  'Lecture 19 — Pollination — Part Two: Pollen Tube Formation',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What happens to the pollen grain immediately after landing on the appropriate flower stigma?',
      'choices', jsonb_build_array('Its outer and inner walls disintegrate, and it dies immediately.', 'It germinates and forms a narrow tube called the pollen tube.', 'The generative cell undergoes meiotic division inside the stigma.', 'It secretes proteinaceous substances that transform the stigma into a mature fruit.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'From which region of the pollen grain wall does the growing pollen tube emerge?',
      'choices', jsonb_build_array('From the degenerating antipodal cells.', 'From one of the germ pores.', 'From the point of attachment of the funiculus.', 'From the external cilia of the tube cell.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What anatomical path does the pollen tube follow to reach the ovary?',
      'choices', jsonb_build_array('It passes through the stamen filaments connected to the anther.', 'It penetrates the stigma, then the style, and enters the ovary where the ovules are located.', 'It grows externally around the pistil wall and then enters through the receptacle.', 'It travels through the flower''s lymphatic vessels.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the generative cell inside the pollen tube during its growth?',
      'choices', jsonb_build_array('It undergoes meiotic division to form four male cells.', 'It undergoes mitotic division to form two male cells.', 'It fuses with the tube cell to form the fused nucleus.', 'It degenerates and disappears, leaving only the tube cell.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the mature pollen tube (mature male gametophyte) consist of?',
      'choices', jsonb_build_array('A generative cell, a tube cell, and a spiny wall.', 'Two male cells (1n) and degenerating tube cells.', 'Two male cells and one tube cell (or tube nucleus).', 'A polar nucleus and an antipodal nucleus.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'What stage does the pollen grain represent after the formation of the pollen tube containing the male and tube cells?',
      'choices', jsonb_build_array('Mature male gametophyte.', 'Immature male gametophyte.', 'Advanced vascular sporophyte generation.', 'Diploid zygote.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'How many pollen tubes germinate from pollen grains landing on the stigma, and how many enter a single ovule?',
      'choices', jsonb_build_array('Only one grain germinates, and they enter all ovules equally.', 'Multiple pollen grains germinate and many pollen tubes form, but only one tube enters a single ovule.', 'One tube containing 8 nuclei germinates and enters all the ovules.', 'No tubes germinate, and fertilization occurs directly through the stigma.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the chromosomal set for each of the following: the male cells in the pollen tube and the original generative cell?',
      'choices', jsonb_build_array('Male cells (2n), generative cell (n).', 'Male cells (n), generative cell (2n).', 'Male cells (2n), generative cell (2n).', 'Male cells (n), generative cell (n).'),
      'answer_index', 3
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec19-exam'
    AND title = 'Lecture 19 — Pollination — Part Two: Pollen Tube Formation'
);
