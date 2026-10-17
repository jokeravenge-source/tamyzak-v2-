-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 1 · Lecture 9
-- Seed the supplied plastids MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec9-exam',
  'Lecture 9 — Plastids',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What are plastids, and exactly where are they found?',
      'choices', jsonb_build_array('Cellular structures found only in the cytoplasm of animal cells that secrete hormones.', 'Cellular organelles found in the cytoplasm of plant cells; they appear in various shapes, sizes, and colors—such as oval, cup-shaped, ribbon-like, star-shaped, and others.', 'Interconnected network systems of tubules and rough vesicles found in prokaryotes.', 'Microscopic structures located inside the nucleus, composed of RNA and proteins.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the three main types of plastids in plants, according to the textbook?',
      'choices', jsonb_build_array('Primitive plastids, true plastids, and vascular plastids.', 'Chromoplasts, leucoplasts, and chloroplasts.', 'Spherical plastids, filamentous plastids, and membranous plastids.', 'Male plastids, female plastids, and hermaphroditic plastids.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the function of "chromoplasts" in the plant?',
      'choices', jsonb_build_array('They contain respiratory enzymes for producing most ATP molecules.', 'They contain various pigments that provide color to flowers and fruits.', 'Converting carbon dioxide gas into complex carbohydrates.', 'Converting glucose sugar into starch for the purpose of storing fats.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the primary function of "leucoplasts"?',
      'choices', jsonb_build_array('Secreting steroid hormones such as auxins and gibberellins.', 'They serve as sites for converting glucose into polysaccharides (such as starch) or into lipids and proteins.', 'Absorbing solar energy and releasing oxygen gas.', 'Protecting the flower bud before it opens and repairing damaged cells.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'Give an example from the textbook of a plant tissue whose cells contain large quantities of colorless plastids filled with starch.',
      'choices', jsonb_build_array('Banana and navel orange fruits.', 'Potato tubers (where their white color is attributed to the presence of large quantities of colorless plastids filled with starch).', 'Leaves and flowers of fava bean and common bean plants.', 'The lower surface of fern leaves (Polypodium).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the composition of the chloroplast regarding its surrounding membranes?',
      'choices', jsonb_build_array('Surrounded by a single, thin membrane completely lacking pores.', 'Surrounded by a double membrane (bilayer).', 'Surrounded by a rigid chemical wall composed of polysaccharides and lipids.', 'Lacks membranes and connects directly to the fine filaments of the cytoskeleton.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the two important structures found inside the double membrane of the chloroplast, as stated in the text?',
      'choices', jsonb_build_array('Cristae and respiratory enzymes.', 'The granum (plural: grana) and the stroma.', 'The nucleoid region and free ribosomes.', 'The cell plate and the sphincter muscle.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the definition of "stroma" according to the biology textbook?',
      'choices', jsonb_build_array('The smooth outer layer of the chloroplast envelope.', 'The transparent fluid substance filling the internal space of the plastid, containing the grana (which hold chlorophyll).', 'The disc-like structure resembling secondary spermatocytes.', 'The connective tissue linking the lobes of the floral anther.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What do the "grana" contain, and what is their significance for photosynthesis?',
      'choices', jsonb_build_array('They contain enzymes that break down the bacterial cell wall.', 'They contain chlorophyll (pigments) and enzymes that contribute to the process of photosynthesis.', 'They contain steroid hormones and nocturnal fat stores.', 'They house the genetic chromosomes carrying hereditary traits.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the "thylakoid membrane," and what are its shape and function as defined in the text?',
      'choices', jsonb_build_array('A fold in the inner mitochondrial membrane that increases surface area.', 'A disc-shaped, sac-like structure formed from the inner membrane of the plastid; it contains chlorophyll and enzymes that contribute to photosynthesis.', 'A semi-permeable membrane surrounding the cytoplasm in prokaryotes.', 'A gelatinous, albuminous covering secreted around mature eggs.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec9-exam'
    AND title = 'Lecture 9 — Plastids'
);
