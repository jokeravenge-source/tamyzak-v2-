-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 26
-- Seed the supplied frog reproductive system MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec26-exam',
  'Lecture 26 — Reproductive System of the Frog',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Where are the testes located in the male frog, and what are their shape and color?',
      'choices', jsonb_build_array('They are located at the top of the thoracic cavity; they are circular and deep red in color.', 'They are located near the kidneys and attached to the inner body wall; they are elongated, oval-shaped, and light yellow in color.', 'They are located inside the urinary bladder; they are tubular and translucent white in color.', 'They are located adjacent to the posterior side of the stomach; they are brown in color.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the fat bodies found in the frog, and what is their function?',
      'choices', jsonb_build_array('Secretory glands that secrete plant auxins to stimulate sperm motility.', 'Finger-like projections located near the anterior end of the testes and ovaries; they serve as food stores used by the animal for gamete development during hibernation.', 'Solid fatty structures that protect the kidney from dehydration during the summer.', 'Tiny vascular sacs that store sperm after they mature in the seminiferous tubules.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How many vasa efferentia (efferent ducts) are there in the male frog, and where do they open?',
      'choices', jsonb_build_array('There are between 10 and 12 efferent ducts; they connect the seminiferous tubules in the testes to the kidney tubules, opening into the renal ducts that transport both sperm and urine.', 'A single main duct that opens directly into the rectum.', 'There are between 2 and 4 ducts; they open into the female vagina during mating.', 'About 50 minute canals distributed throughout the ventral cytoplasm.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'Explain (based on Ms. Nadia''s study guide): Why are the sperm-transporting ducts in the male frog called urogenital ducts?',
      'choices', jsonb_build_array('Because they transport nutrients and water to the primordial germ cells.', 'Because they transport both urine and spermatozoa (sperm) simultaneously to the cloaca.', 'Because they originate from a single genital bud shared with the embryonic kidney.', 'Because the ducts lack a seminal vesicle for urine storage.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where are the ovaries located in the female frog, and what is their appearance during the breeding season?',
      'choices', jsonb_build_array('They are located in the thoracic region and appear very small and pale.', 'They are located near the kidneys and attached to the inner body wall by the mesovarium; they appear as irregular, multi-lobed, sac-like structures that expand and enlarge during the breeding season, becoming laden with black and white eggs.', 'They are located within the permanently thickened uterine wall.', 'They are cylindrical structures that open directly into the urinary bladder.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the correct anatomical description of the oviducts in the female frog?',
      'choices', jsonb_build_array('Two short, straight ducts completely lacking secretory glands.', 'Two long, white, coiled, glandular ducts that do not connect directly to the ovary and begin with a ciliated, funnel-shaped opening.', 'A hollow tube directly connecting the ovary to the testis in hermaphroditic organisms.', 'A network of lymphatic vessels that transports eggs for parthenogenesis.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the function of the glands lining the walls of the oviducts in the female frog?',
      'choices', jsonb_build_array('Secreting estrogen and progesterone hormones to stabilize the eggs.', 'Secreting an albuminous coating (gelatinous substance) around the eggs as they pass through the duct.', 'Secreting digestive enzymes that break down excess chromosomes to achieve the haploid state (1n).', 'Forcefully propelling the eggs toward the sticky external stigma.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the ovisac in the female frog, and what is its function?',
      'choices', jsonb_build_array('The swollen anterior section of the oviduct where sperm fertilization occurs.', 'The expanded posterior section of the oviduct, where eggs accumulate and are stored prior to being expelled from the body.', 'A thick chemical sheath that secretes adhesive substances for the funnel-like opening.', 'The common opening through which menstrual blood is discharged monthly.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec26-exam'
    AND title = 'Lecture 26 — Reproductive System of the Frog'
);
