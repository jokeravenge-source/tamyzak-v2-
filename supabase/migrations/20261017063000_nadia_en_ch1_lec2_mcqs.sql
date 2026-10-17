-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 2
-- Seed the supplied prokaryotic cells MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec2-exam',
  'Lecture 2 — Cell Size and Prokaryotic Cells',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Why are prokaryotic cells considered the least evolved cells according to the textbook?',
      'choices', jsonb_build_array('Because they decompose rapidly outside the organism''s body.', 'Because they are the most primitive in terms of shape and structure.', 'Because they completely lack genetic material (DNA).', 'Due to their inability to move in liquid media.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the nuclear region in a prokaryotic cell represent, given that it lacks a nuclear membrane?',
      'choices', jsonb_build_array('It represents a free nucleolus.', 'It lacks a nuclear membrane and nucleolus; it is called the nuclear area or nuclear region.', 'It represents an integrated reproductive plasmid.', 'It represents an internal kinetosome.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the cytoplasm of a prokaryotic cell contain, and what are its appearance and function?',
      'choices', jsonb_build_array('It contains mitochondria for ATP energy production.', 'It contains ribosomes that appear as numerous small granules and synthesize proteins.', 'It contains the Golgi apparatus for secreting complex sugars.', 'It contains large contractile vacuoles for water regulation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which organisms comprise the group of prokaryotic cells?',
      'choices', jsonb_build_array('Kingdom Fungi (e.g., black bread mold).', 'Kingdom Monera (Prokaryotes), such as bacteria, blue-green algae, and mycoplasma.', 'Kingdom Protista (e.g., Paramecium and Euglena).', 'Viruses or bacteriophages.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the rigid cell wall surrounding the bacterial (prokaryotic) cell chemically composed of?',
      'choices', jsonb_build_array('Cellulose and lignin.', 'Chemical compounds (proteins, lipids, and polysaccharides).', 'Pure amino acids and phospholipids only.', 'Chitin and animal glycogen.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What structure lies internal to the rigid bacterial cell wall, and what is its function?',
      'choices', jsonb_build_array('The thick outer capsule.', 'The plasma membrane, a semi-permeable membrane surrounding the cytoplasm.', 'The nuclear envelope that secretes ribosomes.', 'The hardened fibrous middle layer.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the cytoplasm of a prokaryotic bacterial cell contain?',
      'choices', jsonb_build_array('A true nucleus and chloroplasts.', 'The nucleoid region (where the nuclear membrane and nucleolus are absent) and ribosomes.', 'Microfilaments and microtubules of the cytoskeleton.', 'Hundreds of food and contractile vacuoles.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What external appendages or features may be found on some prokaryotic cells (bacteria) and are used for movement or conjugation?',
      'choices', jsonb_build_array('Cilia, hooks, and a reproductive pad.', 'Flagella, cilia, or sex pili (conjugation pili).', 'Sensory receptors and thick cellulose spines.', 'Delicate, mucus-secreting vascular wings.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec2-exam'
    AND title = 'Lecture 2 — Cell Size and Prokaryotic Cells'
);
