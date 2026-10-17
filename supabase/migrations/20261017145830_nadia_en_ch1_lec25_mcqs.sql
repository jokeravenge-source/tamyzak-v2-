-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 25
-- Seed the supplied cell division and interphase MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec25-exam',
  'Lecture 25 — Cell Division and Interphase',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the primary goal and purpose of the cell division process according to the textbook?',
      'choices', jsonb_build_array('Producing hydrolytic enzymes within lysosomes to facilitate cellular digestion.', 'Quantitatively duplicating genetic material while ensuring its even distribution between the two resulting daughter cells.', 'Increasing cell wall thickness by adding the woody substance lignin.', 'Converting glucose molecules into ethyl alcohol and CO₂ gas.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How many main types of cell division are outlined in the textbook?',
      'choices', jsonb_build_array('A single type common to all living organisms.', 'Three types: direct (amitosis) division, indirect (mitosis) division, and meiotic division.', 'Only two types: plant division and vascular animal division.', 'Five types, based on genetic chromosomal phases.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is direct or amitotic division (Amitosis), and how do cells divide according to the text?',
      'choices', jsonb_build_array('Division involving distinct nuclear and cytoplasmic changes and the formation of a chromosomal spindle.', 'Cells divide in this manner without distinct nuclear or cytoplasmic changes; the nucleus (or nuclear region) and cytoplasm constrict and divide, forming two cells, each containing a portion of the original nucleus (or nuclear region) and a portion of the original cytoplasm.', 'Reducing the chromosome count to half the original number in sex cells.', 'Fusion of two male nuclei with two polar nuclei inside the embryo sac.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Give an example from the textbook of organisms in which direct (amitotic) division occurs.',
      'choices', jsonb_build_array('Human cartilage, liver, and muscle tissue cells.', 'Bacteria and blue-green algae.', 'Cells of potato tubers and the broad bean plant.', 'The Spanish butterfly and the Ascaris worm.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the standard definition of indirect or mitotic division (Mitosis) according to the textbook?',
      'choices', jsonb_build_array('Cell division without distinct nuclear or cytoplasmic changes and without a spindle.', 'The process of nuclear division that ensures each of the two new daughter cells receives the same number and type of chromosomes originally present in the mother cell.', 'The process of reducing the number of somatic chromosomes by half to form gametes.', 'The expulsion of waste and undigested material via smooth secretory vesicles.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What preparatory phase precedes mitotic (ordinary) cell division, and what characterizes the cell nucleus during it?',
      'choices', jsonb_build_array('It is preceded by prophase, and the nucleus is very small or absent.', 'It is preceded by an interphase, and the cell nucleus during this phase is characterized by being large compared to the nuclei in dividing cells.', 'It is preceded by telophase, during which spindle fibers completely disintegrate.', 'It is preceded by the reproductive ovulation phase driven by LH hormone.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the notable metabolic and genetic events that occur within the cell during Interphase (verbatim)?',
      'choices', jsonb_build_array('Breakdown of the nuclear membrane, disappearance of the nucleolus, and condensation of chromosomes.', 'Synthesis of large molecules of nucleic acids and proteins, replication of DNA molecules, and duplication of the centrosome.', 'Increase in the surface area of the inner mitochondrial membrane and formation of cristae.', 'Cleavage of fructose bisphosphate into two molecules of glyceraldehyde.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain (verbatim): Why is DNA replication during Interphase considered an essential step before the onset of mitosis?',
      'choices', jsonb_build_array('Because it secretes hydrolytic enzymes that autolyze cytoplasmic impurities.', 'As a crucial step to ensure that each new cell receives a complete and identical copy of the genes present in the parent cell following division.', 'To allow DNA to transform into a circular genetic plasmid floating within prokaryotes.', 'To prevent the phenomena of plasmolysis and deplasmolysis in osmotic solutions.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec25-exam'
    AND title = 'Lecture 25 — Cell Division and Interphase'
);
