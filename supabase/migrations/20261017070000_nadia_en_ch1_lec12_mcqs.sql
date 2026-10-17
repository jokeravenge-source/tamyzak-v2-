-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 12
-- Seed the supplied centrosome and kinetosome MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec12-exam',
  'Lecture 12 — Centrosome and Kinetosome',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Structurally, what does the centrosome consist of, according to the textbook?',
      'choices', jsonb_build_array('Two elongated lobes connected by connective tissue through which a vascular bundle extends.', 'It typically contains a pair of centrioles; each centriole is a cylinder composed of nine groups of microtubules, with each group containing three microtubules.', 'A single-layered membrane enclosing a number of hydrolytic enzymes.', 'Actin and myosin filaments arranged linearly within muscle cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the centrosome during cell division, and how does it move?',
      'choices', jsonb_build_array('It is completely broken down by enzymes, and a new nuclear region forms.', 'The centrosome duplicates during cell division; the two centrosomes move apart toward opposite poles of the cell and become connected by spindle fibers.', 'It migrates across the plasma membrane to transform into an external motile flagellum.', 'It fuses with the nucleolus to form genetic chromosomes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Although centrosomes are absent in plant cells, what exists in their place that plays a role in generating spindle fibers?',
      'choices', jsonb_build_array('Colorless, starch-filled plastids that store food.', 'A microtubule-organizing center (MTOC) exists, along with spindle fibers.', 'Lysosomes that secrete mucilaginous substances to form the cell plate.', 'The dictyosome that synthesizes cellulose for the cell wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the "kinetosome" (or basal body) in terms of its structure and location, as stated in the text?',
      'choices', jsonb_build_array('A green, heart-shaped structure located on the underside of plant leaves.', 'It resembles centrioles in structure and is located at the base of the cilium or flagellum in cells possessing cilia or flagella.', 'A double membrane surrounding the mitochondrion that contains respiratory cristae.', 'A small projection in the ovary connected to the body wall by the umbilical cord.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary and sole function of the kinetosome (basal body) in the cell, according to the textbook?',
      'choices', jsonb_build_array('It plays an important role in neutralizing the toxic effects of certain poisons and anesthetic drugs.', 'It plays a key role in the movement of cilia and flagella; it is also known as the basal body.', 'Generating high-energy ATP molecules required for contraction and relaxation.', 'Controlling sperm maturation and storage within the seminal vesicle.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec12-exam'
    AND title = 'Lecture 12 — Centrosome and Kinetosome'
);
