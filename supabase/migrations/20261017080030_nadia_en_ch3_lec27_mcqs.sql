-- Nadia Al-Nuaimi · English curriculum · Chapter 3 · Lecture 27
-- Seed the supplied frog mating, fertilization, and metamorphosis MCQs.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec27-exam',
  'Lecture 27 — Mating, Fertilization and Metamorphosis in Frogs',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'When do frogs typically mate, and where do they gather for the process?',
      'choices', jsonb_build_array('During the dry summer season; they gather on farms and in desert fields.', 'During the spring (breeding season); they gather in ponds, swamps, and shallow waters.', 'In the deep sea and saltwater during winter.', 'On dry rocks during hibernation.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What structural adaptation appears on the male frog''s forelimb, aiding him in grasping the female during mating?',
      'choices', jsonb_build_array('The growth of strong, sharp claws on all digits.', 'Enlargement of the first digit of the forelimbs, forming what is known as the copulatory pad.', 'Increased length of the hind limbs to help him jump onto the female.', 'Secretion of a sticky, glue-like substance from the skin to help him adhere to the female''s body.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How do gamete release and fertilization occur in frogs?',
      'choices', jsonb_build_array('The male injects sperm into the female''s vagina, and fertilization occurs internally.', 'The male presses against the female''s body using the copulatory pad; the female releases her eggs into the water while the male simultaneously releases sperm over them, resulting in external fertilization in the water.', 'Accessory glands secrete sperm that fertilize the eggs inside the egg sac.', 'The eggs slide to the bottom of the pond, and sperm are transported to them by the wind.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Explain (based on Ms. Nadia''s study guide): Why is fertilization in frogs considered external, despite mating occurring between the male and female?',
      'choices', jsonb_build_array('Because sperm and reproductive cells are formed outside the seminiferous tubules.', 'Because the union of the male nucleus with the egg nucleus occurs in the water, outside the female''s body.', 'Because the egg is surrounded by a gelatinous albuminous coating immediately after fertilization.', 'Because the male frog lacks efferent ducts connecting the testis to the kidney.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What happens to the fertilized egg (zygote) in frogs immediately after fertilization is complete?',
      'choices', jsonb_build_array('It becomes surrounded by a thick cellulose wall and remains dormant for a full year.', 'It undergoes successive divisions (cleavage) to form the embryo inside the gelatinous coating.', 'It immediately leaves the water and transforms into an adult insect via complete metamorphosis.', 'It atrophies, disappears, and transforms into food-storing fat bodies.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the developmental stage that hatches from the frog''s egg, and how does it breathe during its early stages?',
      'choices', jsonb_build_array('Nymph; it breathes using air-breathing lungs.', 'Tadpole; it is aquatic in appearance, possesses a tail, and breathes using external gills followed by internal gills.', 'Pupa inside a cocoon; it breathes via membrane diffusion.', 'Adult frog directly; it breathes only through the skin.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What changes (metamorphosis) does a tadpole undergo to transform into an adult frog capable of living on land?',
      'choices', jsonb_build_array('The tail lengthens, and the gills transform into delicate vascular fins.', 'The tail gradually disappears, the gills vanish as lungs form for terrestrial respiration, and forelimbs and hindlimbs appear for movement.', 'The outer body wall transforms into a hard shell containing germination pores.', 'Its cells divide via transverse binary fission to produce new individuals.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Which cellular organelle is responsible for the disappearance and reduction of the frog tadpole''s tail during metamorphosis (as discussed in Chapter One)?',
      'choices', jsonb_build_array('Mitochondria (by producing kinetic energy for the tail).', 'Lysosomes (through the process of autolysis).', 'Golgi apparatus (by secreting cellulose that dissolves the tail).', 'Microtubules (which pull the tail inward).'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec27-exam'
    AND title = 'Lecture 27 — Mating, Fertilization and Metamorphosis in Frogs'
);
