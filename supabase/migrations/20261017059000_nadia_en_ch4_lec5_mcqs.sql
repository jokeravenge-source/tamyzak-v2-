-- Nadia Al-Nuaimi · Distinguished English curriculum · Chapter 4 · Lecture 5
-- Seed the supplied congenital anomalies MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch4-lec5-exam',
  'Lecture 5 — Congenital Anomalies',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the scientific definition of congenital anomalies in humans according to the text?',
      'choices', jsonb_build_array('Temporary phenotypic changes that disappear immediately after sexual maturity.', 'Structural or functional defects occurring in the fetus before birth and manifesting at or after birth.', 'Breakdown of muscle tissues by hydrolytic enzymes resulting from cellular ingestion (phagocytosis).', 'Genetic mutations affecting male honeybees, rendering them diploid.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What are the primary factors causing congenital anomalies in human fetuses?',
      'choices', jsonb_build_array('Nutritional factors related to monocotyledonous systems and bacterial factors only.', 'Genetic factors (such as chromosomal abnormalities) and environmental or external factors (such as drugs, radiation, and viral infections).', 'Changes in osmotic hydrostatic pressure within the temporary food vacuole.', 'Decreased levels of progesterone and estrogen during the proliferative phase.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the effect of a pregnant mother taking the drug "Thalidomide" on the fetus, according to the text?',
      'choices', jsonb_build_array('It causes the genetic material to duplicate, resulting in a tetraploid state.', 'It causes severe congenital anomalies, such as joint deformities or limb deficiencies (shortened or absent limbs).', 'It leads to the swelling and bursting of gastrula cells due to high osmotic pressure.', 'It stimulates precocious embryonic development within the mature pollen grain.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'How does a pregnant mother contracting "German measles" (rubella) affect the fetus?',
      'choices', jsonb_build_array('It leads to the formation of multi-lobed identical twins.', 'It causes serious fetal abnormalities such as deafness, blindness (cataracts), congenital heart defects, and intellectual disability.', 'It transforms the nucellus tissue into a hard seed coat surrounding the developing ovule.', 'It increases the efficiency of the placenta and umbilical cord in absorbing nutrients.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the effect of a pregnant mother''s exposure to "X-rays" or ionizing radiation on the fetus?',
      'choices', jsonb_build_array('It increases the size of the fat bodies used during hibernation.', 'It causes congenital nervous system abnormalities (such as microcephaly) or genetic defects and infertility in adulthood.', 'It activates cell wall ribosomes to synthesize lipids and steroid fats.', 'It prevents plasmolysis when cells are placed in a highly concentrated solution.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'What is the recommended biological and medical procedure for diagnosing certain congenital abnormalities before birth?',
      'choices', jsonb_build_array('Examining the osmotic fluid surrounding Paramecium cells.', 'Examining fetal cells found in the amniotic fluid or using ultrasound technology.', 'Spraying the uterine lining with complex plant auxins and gibberellins.', 'Examining the tail fibers of a mature bacteriophage.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch4-lec5-exam'
    AND title = 'Lecture 5 — Congenital Anomalies'
);
