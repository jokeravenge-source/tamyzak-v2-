-- Nadia Al-Nuaimi · English curriculum · Chapter 1 · Lecture 26
-- Seed the supplied mitosis and cytokinesis MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec26-exam',
  'Lecture 26 — Mitosis and Cytokinesis',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are the four consecutive stages of nuclear division during mitosis?',
      'choices', jsonb_build_array('Interphase, prophase, metaphase, and anaphase.', 'Prophase, metaphase, anaphase, and telophase.', 'Proliferative phase, secretory phase, menstrual phase, and follicular phase.', 'Leptotene, zygotene, pachytene, and diplotene stages.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What structural events characterize prophase in mitosis?',
      'choices', jsonb_build_array('Alignment of chromosomes at the spindle equator and separation of chromatids.', 'Chromatin threads differentiate into distinct chromosomes consisting of two sister chromatids joined at their centromeres; centrosomes move apart toward the cell poles; astral rays and spindle fibers form; and the nucleolus and nuclear membrane disappear.', 'Arrival of chromosomes at the cell poles and their return to their previous thread-like form.', 'Constriction of the plasma membrane in the middle to form two identical cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where do the sister chromatids of a chromosome attach during prophase?',
      'choices', jsonb_build_array('At the base of cilia and flagella via the kinetosome.', 'At their centromeres.', 'At the micropyle opening connected to the nucellus.', 'Attached to the wall of the temporary food vacuole.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the nucleolus and the nuclear membrane at the end of the prophase stage of mitosis?',
      'choices', jsonb_build_array('They double in size and transform into secretory cisternae.', 'They disintegrate and disappear during the late stage of this phase.', 'They fuse with the centrosome to form spindle fibers.', 'They secrete a viscous fluid that fills the cytoplasm as cell sap.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the chromosomes during the metaphase stage of mitosis?',
      'choices', jsonb_build_array('Sister chromatids separate and move toward the poles of the cell.', 'Chromosomes contract and thicken, align at the spindle equator, and attach to spindle fibers, with each chromosome attaching to a fiber via its centromere.', 'They secrete a thick cellulose wall that protects the genetic material.', 'They undergo autolysis and revert to the form of an intertwined chromatin network.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the prominent genetic and kinetic event that characterizes the anaphase stage of mitosis?',
      'choices', jsonb_build_array('Replication of DNA molecules and synthesis of large nucleic acids.', 'Sister chromatids separate from each other and move toward the opposite poles of the cell.', 'Appearance of the cell plate at the equator of the plant cell.', 'Reformation of the nuclear membrane and nucleolus around the chromosomes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'According to the textbook, what are the proposed theories explaining the mechanism of chromosome movement toward the poles during anaphase?',
      'choices', jsonb_build_array('1. Movement of contractile vacuoles. 2. Contraction of actin and myosin filaments in the cytoplasm.', '1. It is believed that spindle fibers contract in the presence of ATP, pulling chromosomes toward the poles. 2. It is believed that spindle fibers act as a track along which chromosomes slide toward the poles.', '1. Dissolution of chemical crystals. 2. Effect of osmotic hydrostatic pressure.', '1. Secretion of auxins. 2. Movement of internal cellular flagella and cilia.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'When does Telophase of mitosis begin, and what are the events occurring in it that are the reverse of prophase?',
      'choices', jsonb_build_array('It begins immediately when chromosomes align at the spindle equator.', 'It begins when chromosomes have fully reached the opposite poles of the cell; chromosomes revert to their previous thread-like form (chromatin network), the new nucleolus or nucleoli form, the nuclear envelope reforms, and the spindle disappears.', 'It begins with the separation of sister chromatids driven by ATP energy.', 'It begins with the gradual constriction of the cytoplasm from the outside inward.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does cytokinesis begin and end in an animal cell, according to the text?',
      'choices', jsonb_build_array('It begins with the formation of the cell plate from the inside out.', 'It begins with the constriction of the cell membrane at the cell''s equator; over time, this constriction deepens gradually until the cell divides into two new cells, each containing a nucleus.', 'The cell divides without membrane constriction; instead, the outer capsule increases in thickness.', 'The nucleus migrates to the side, and the cytoplasm spontaneously disintegrates due to the action of lysosomes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does cytoplasmic division begin and end in a plant cell, and what structure is responsible for this?',
      'choices', jsonb_build_array('It begins with the constriction of the plasma membrane from the outside in at the equator.', 'It begins with the formation of the cell plate at the cell''s equatorial region—secreted by the cell''s protoplast—after which each new cell begins to form its own cell wall.', 'It occurs via longitudinal binary fission, starting at the anterior end and ending at the posterior end.', 'Large sap vacuoles fuse to form a secondary fibrous wall.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How long does cell division generally take, and what specifically determines this duration?',
      'choices', jsonb_build_array('It always takes 24 hours and depends on the salt concentration in osmotic solutions.', 'The duration of division varies depending on the cell or tissue type and the organism''s age; furthermore, each phase of division has its own specific duration.', 'It takes only 5 to 10 minutes in mature nervous tissue.', 'It depends entirely on the number of genes carried on the chromosomes.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which are the longest and shortest phases of mitosis in terms of duration (ranging between 30–60 minutes and 3–15 minutes)?',
      'choices', jsonb_build_array('The longest is metaphase, and the shortest is telophase.', 'The longest is prophase (taking 30–60 minutes), and the shortest is anaphase (taking 3–15 minutes).', 'The longest is telophase, and the shortest is the preparatory interphase.', 'All phases take an equal amount of time—25 minutes—with no variation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'According to the textbook, what is the state of cell division in nervous tissue (neurons) at adulthood?',
      'choices', jsonb_build_array('They divide extremely rapidly to replace damaged cells, taking 30 minutes.', 'Division becomes rare at adulthood due to the terminal specialization of neurons.', 'Neurons transform into prokaryotic cells that reproduce via binary fission.', 'They rely entirely on parthenogenesis to produce new daughter cells.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec26-exam'
    AND title = 'Lecture 26 — Mitosis and Cytokinesis'
);
