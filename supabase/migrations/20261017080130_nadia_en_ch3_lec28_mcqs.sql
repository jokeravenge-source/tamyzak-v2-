-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 28
-- Seed the supplied human male reproductive system MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec28-exam',
  'Lecture 28 — Human Male Reproductive System',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are the primary components of the human male reproductive system?',
      'choices', jsonb_build_array('Two ovaries, two oviducts, a genital atrium, and a seminal receptacle.', 'Two testes, sperm-transporting ducts (efferent ductules, epididymis, vas deferens, ejaculatory duct), the penis, and accessory glands.', 'An external scrotal sac containing minute egg tubules and floating fertility factors.', 'A single elongated lobe ending in a stigma that secretes albuminous fluid.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Where are the testes located in humans, and what is the biological significance of this location?',
      'choices', jsonb_build_array('They are located inside the abdominal cavity at all times to protect them from external trauma.', 'They are located outside the abdominal cavity within the scrotum to maintain a temperature suitable for sperm formation (lower than body temperature).', 'They are located directly beneath the kidneys and are attached to the testicular-ovarian mesentery.', 'They are located in the chest region alongside the major lymphatic vessels.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What does the testis contain internally to produce spermatozoa, and what is their approximate total length?',
      'choices', jsonb_build_array('It contains a single swollen chamber that permanently stores spermatozoa.', 'It contains coiled seminiferous tubules with a combined length of approximately 250 meters, where sperm are formed within their walls.', 'It contains 40 hydrolytic enzymes that break down excess chromosomes.', 'It consists of numerous separate carpels containing the active nucellus.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the reproductive and anatomical function of the epididymis in the human male reproductive system?',
      'choices', jsonb_build_array('Secreting the viscous fluid that nourishes fertilized eggs.', 'Serving as a site for sperm maturation and storage, and connecting the efferent ducts to the vas deferens.', 'Producing sperm starting from primordial germ cells (2n).', 'Forcibly expelling urine from the urinary bladder during sexual intercourse.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the function of the vas deferens in humans?',
      'choices', jsonb_build_array('Rapidly transporting and storing sperm, and opening into the ejaculatory duct.', 'Secreting the hormone testosterone directly into the bloodstream.', 'Penetrating the uterine wall to deliver migrating male cells.', 'Filtering urine and separating it from seminal fluid within the kidney.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What are the accessory glands of the human male reproductive system?',
      'choices', jsonb_build_array('The pituitary gland, the thyroid gland, and the pancreas.', 'The seminal vesicles, the prostate gland, and the bulbourethral glands (Cowper''s glands).', 'Accessory glands that secrete the gelatinous egg sac.', 'Fat bodies that store food during hibernation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the secretory function of the seminal vesicles in humans?',
      'choices', jsonb_build_array('They secrete a fluid in which sperm swim, and their secretions constitute a large part of the seminal fluid.', 'They secrete mucous substances that weaken the lining of the female uterus.', 'Storing urine and expelling it from the body via the shared urethra.', 'Producing a plant-based progesterone hormone to activate auxins.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'What is the function of the bulbourethral glands (Cowper''s glands) in humans?',
      'choices', jsonb_build_array('They secrete follicle-stimulating hormone (FSH) to stimulate the testes.', 'They secrete a mucous fluid that aids sperm motility and also secretes a substance to neutralize the acidity of urine-containing fluid in the urethra.', 'Storing sperm after they have fully matured in the epididymis.', 'Destroying excess blood vessels around the scrotum.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec28-exam'
    AND title = 'Lecture 28 — Human Male Reproductive System'
);
