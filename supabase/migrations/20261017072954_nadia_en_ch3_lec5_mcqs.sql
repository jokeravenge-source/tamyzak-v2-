-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 5
-- Seed the supplied bacterial binary fission MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec5-exam',
  'Lecture 5 — Asexual Reproduction in Bacteria',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the primary and sole method by which bacteria reproduce asexually?',
      'choices', jsonb_build_array('Budding.', 'Binary fission.', 'Spore formation.', 'Fragmentation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the bacterial chromosome as a result of the cell envelope attaching at specific regions during the initial step of division?',
      'choices', jsonb_build_array('It is completely degraded by enzymes.', 'It replicates to produce two identical chromosomes.', 'It moves to the region of the external flagellum.', 'It undergoes meiotic division into two halves.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What indicates that the bacterial cell has prepared for binary fission during the early stages?',
      'choices', jsonb_build_array('Inward contraction of the plasma membrane.', 'Expansion of the cell wall and the entire cell.', 'Disappearance of the nucleoid region.', 'Detachment of sex pili from the surface.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do the bacterial cell''s chromosomes move after replicating during the fission process?',
      'choices', jsonb_build_array('They congregate exactly at the center of the cell.', 'They move in opposite directions toward the cell poles.', 'They fuse to form a tetraploid chromosome (4n).', 'One of them is expelled from the cell as a polar body.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What structural change occurs in the bacterial cell that ultimately leads to its division into two cells?',
      'choices', jsonb_build_array('Increase in the thickness of the outer sheath (capsule).', 'Constriction of the cell wall and plasma membrane from the middle.', 'Elongation of the bacterial flagellum until it snaps.', 'Growth of a transverse wall from the inside out without constriction.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the final outcome of the binary fission process in bacteria?',
      'choices', jsonb_build_array('Production of four genetically distinct bacterial cells.', 'Production of two completely identical bacterial cells.', 'Formation of a bacterial spore resistant to environmental conditions.', 'Production of a male cell and a female cell.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec5-exam'
    AND title = 'Lecture 5 — Asexual Reproduction in Bacteria'
);
