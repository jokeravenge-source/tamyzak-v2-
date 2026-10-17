-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 27
-- Seed the supplied meiosis MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec27-exam',
  'Lecture 27 — Meiosis',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the primary purpose and goal of meiosis according to the textbook?',
      'choices', jsonb_build_array('Doubling the number of somatic chromosomes in the daughter cells resulting from the division.', 'Maintaining a constant chromosome number for individuals of various species across generations during gamete formation.', 'Producing hydrolytic enzymes to catalyze the process of autolysis.', 'Converting glucose molecules into lactic acid in muscles during anaerobic conditions.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where and when does meiosis occur in an organism''s body, according to the text?',
      'choices', jsonb_build_array('It occurs in somatic cells throughout the organism''s growth period.', 'It occurs during the formation of gametes—such as sperm and eggs in animals, and spores and pollen grains in plants.', 'It occurs in nervous tissue cells immediately after puberty to accelerate growth.', 'Inside the colorless plastids (leucoplasts) of potato tubers during starch storage.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the main successive stages that constitute meiosis?',
      'choices', jsonb_build_array('One nuclear division and two separate cytoplasmic divisions.', 'Two consecutive divisions: Meiosis I and Meiosis II.', 'Five identical mitotic phases that produce diploid (2n) cells.', 'A process of repeated plasmolysis followed by hydrostatic deplasmolysis.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does Meiosis I entail, and what characterizes it from genetic and chromosomal perspectives?',
      'choices', jsonb_build_array('Separation of sister chromatids from each other and their movement toward the cell poles.', 'Separation of homologous chromosomes from each other; this division consists of four stages.', 'Replication of DNA molecules, resulting in a tetraploid (4n) chromosomal set.', 'Formation of a cell plate secreted by the plant cell protoplast.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the five successive stages that Prophase I of meiosis undergoes—given that it is a slow and complex phase?',
      'choices', jsonb_build_array('Prophase, Metaphase, Anaphase, Telophase, and Interphase.', 'Leptotene, Zygotene, Pachytene, Diplotene, and Diakinesis.', 'Proliferative phase, reproductive phase, secretory phase, menstrual phase, and ovulatory phase.', 'Division phase, constriction phase, replication phase, lysis phase, and germination phase.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What characterizes the chromosomes during the Leptotene stage, according to the biology textbook?',
      'choices', jsonb_build_array('They appear scattered, short, and consist of paired chromatids forming distinct tetrads.', 'In this stage, chromosomes appear as long, thin, single threads characterized by bead-like or lobed thickenings that give the chromosome a necklace-like appearance; the DNA within each chromosome has already replicated.', 'They separate from each other and begin migrating toward opposite poles of the cell, facilitated by the spindle apparatus.', 'They attach to the membrane of the contractile vacuole to regulate osmotic pressure.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the unique genetic events that characterize the Zygotene stage, and what are the two names given to these phenomena?',
      'choices', jsonb_build_array('Duplication of the centrosome and formation of astral rays around the nucleus.', 'Homologous chromosomes align and pair up, twisting around one another; this process is called synapsis, and the paired chromosomes are referred to as a bivalent.', 'Exchange of non-sister chromatid segments at sites of genetic chiasmata.', 'Complete disappearance of the nuclear envelope and nucleolus, and the release of RNA molecules.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'In which stage do chromosomes condense and the replication of each chromosome into two chromatids becomes clearly visible, and what is the name given to the group of four chromatids?',
      'choices', jsonb_build_array('The leptotene stage; they are called bivalents.', 'The pachytene stage, where chromosomes shorten and thicken, and the duplication of each chromosome into two distinct chromatids joined at their centromeres becomes visible; this group of four chromatids is called a tetrad.', 'The diplotene stage; this involves genetic chiasmata.', 'Metaphase I; this involves branched chromosomal appendages.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the process of crossing over, and in exactly which stage of Prophase I does it occur?',
      'choices', jsonb_build_array('The sliding of chromosomes along spindle fibers; it occurs in Metaphase II.', 'An exchange of gene loci between homologous chromosomes; it occurs in the Pachytene stage.', 'The integration of the fertility factor into the donor cell''s chromosome during bacterial conjugation.', 'The movement of water molecules across a selectively permeable membrane in osmotic solutions.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to homologous chromosomes during the Diplotene stage, and what exactly are chiasmata?',
      'choices', jsonb_build_array('They pair up and twist around each other, and the points of contact between the chromatids disappear.', 'Each pair of homologous chromosomes begins to separate; non-sister chromatids remain attached at one or more points called chiasmata, and segments of non-sister chromatids are exchanged at each chiasma.', 'They constrict in the middle and divide directly without the expenditure of ATP energy.', 'They migrate toward the plasma membrane to form sexual conjugation pili.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the chromosomes and chiasmata during Diakinesis, the final stage of Prophase I?',
      'choices', jsonb_build_array('Chromosome threads become longer and thinner, appearing like a string of beads.', 'Chromosomes become shorter and thicker; the nucleolus and nuclear envelope begin to disintegrate gradually; chiasmata move toward the ends of the chromosomes, resulting in a decrease in the number of chiasmata.', 'Sister chromatids separate and move toward the cell poles due to spindle contraction.', 'Chromosomes fuse completely to form a genetic syncytium with a tetraploid (4n) set.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to homologous chromosomes during Metaphase I of meiosis?',
      'choices', jsonb_build_array('Sister chromatids separate and move randomly toward opposite ends of the cell.', 'Homologous chromosomes arrange themselves in pairs (bivalents) at the cell''s equator, and spindle fibers become clearly visible, with each chromosome attached to a spindle fiber at its centromere.', 'They revert to their fine, thread-like form, and the chromatin network reforms.', 'They exit the cell membrane via smooth exocytotic vesicles.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What separates and moves toward the cell poles during Anaphase I of Meiosis I?',
      'choices', jsonb_build_array('Sister chromatids separate from each other and move independently toward the poles.', 'Homologous chromosomes separate from each other and move toward opposite poles of the cell, while the two chromatids of each chromosome remain attached at their centromere.', 'The centrosome separates and migrates toward the cell membrane to form motile cilia.', 'Spindle fibers completely disassemble, and the chromosomes gather exactly at the center of the cell.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the final outcome of Meiosis I following Telophase I and cytokinesis?',
      'choices', jsonb_build_array('Production of two identical cells, each containing the full diploid number of chromosomes (2n).', 'Production of two cells, each containing half the full number of chromosomes (haploid; 1n).', 'Production of four distinct cells containing double the original number of chromosomes (4n).', 'Disintegration and death of the mother cell without producing new daughter cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the fundamental difference between Meiosis II and mitosis (ordinary division) regarding the chromosome number in the cell initiating the division?',
      'choices', jsonb_build_array('Mitosis begins with (1n) cells, whereas Meiosis II begins with (2n) cells.', 'Mitosis begins with cells containing the full chromosome complement (2n), whereas Meiosis II begins with cells containing half the chromosome number (1n) resulting from the first division.', 'Both begin with haploid cells that are genetically stable.', 'Meiosis II does not undergo a distinct metaphase or anaphase stage.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What separates and moves toward opposite cell poles during Anaphase II of Meiosis II?',
      'choices', jsonb_build_array('Homologous chromosomes separate from each other and move toward the cell poles.', 'The chromatids of each chromosome separate from one another through the division of their centromere, and each chromatid (now a daughter chromosome) moves toward one of the cell poles.', 'The circular fertility factor separates and transfers across the external bacterial conjugation bridge.', 'The cell plate dissolves, and large sap vacuoles fuse.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the overall final outcome of meiosis (comprising both the first and second stages) as stated in the biology textbook?',
      'choices', jsonb_build_array('Formation of two genetically identical cells, each containing the full chromosome complement (2n).', 'Formation of four non-identical cells, each containing half the full chromosome complement (n).', 'Production of a single zygospore enclosed within a thick cellulose wall reinforced with lignin.', 'Formation of one male donor cell and three sterile female recipient cells.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec27-exam'
);
