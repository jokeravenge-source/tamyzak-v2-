-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 2 · Lecture 1
-- Seed the supplied introductory tissue MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch2-lec1-exam',
  'المحاضرة 1 — مقدمة الأنسجة',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'النسيج: «هو مجموعة من _______ بالإضافة إلى نواتج خلوية معينة تخصصت لأداء وظيفة معينة».',
      'choices', jsonb_build_array('الخلايا المتخصصة', 'الخلايا المتماثلة', 'خلايا النسيج', 'الكائنات وحيدة الخلية'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', '«هو مجموعة من الخلايا المتماثلة بالإضافة إلى _______ تخصصت لأداء وظيفة معينة».',
      'choices', jsonb_build_array('أعضاء مختلفة', 'أنسجة وظيفية', 'المواد بين الخلوية', 'نواتج خلوية معينة'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'تتكون الكائنات المعقدة «من خلايا تترتب بشكل _______ ضمن أعضاء مختلفة».',
      'choices', jsonb_build_array('أنسجة وظيفية', 'نواتج خلوية معينة', 'المواد بين الخلوية', 'الكائنات وحيدة الخلية'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', '«وتعمل هذه الأنسجة بعضها مع بعض _______ على بناء الكائن الحي».',
      'choices', jsonb_build_array('في بعض الأحيان', 'ضمن أعضاء مختلفة', 'في تناسق تام', 'بشكل أنسجة وظيفية'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', '«وقد يتم تنوع _______ في بعض الأحيان».',
      'choices', jsonb_build_array('أنواع الأنسجة', 'المواد بين الخلوية', 'نواتج خلوية معينة', 'خلايا النسيج'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', '«كما أنه قد تتكون في الأنسجة كميات كبيرة من _______».',
      'choices', jsonb_build_array('الخلايا المتخصصة', 'المواد بين الخلية', 'الخلايا المتماثلة', 'أعضاء مختلفة'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', '«تتكون في بعض الأنسجة كميات كبيرة من المواد بين الخلوية كما تتنوع في _______».',
      'choices', jsonb_build_array('تركيبها', 'تكوينها', 'أنواعها', 'صفاتها'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', '«تسمى الكائنات التي تتكون من خلية واحدة» بـ:',
      'choices', jsonb_build_array('الخلايا المتماثلة', 'الخلايا المتخصصة', 'الكائنات وحيدة الخلية', 'الكائنات المعقدة'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'علم الأنسجة: «هو العلم الذي يهتم بدراسة تركيب النسيج وتمايزه بين _______ في الكائنات الحية».',
      'choices', jsonb_build_array('الأعضاء', 'الخلايا المتخصصة', 'الأنسجة', 'الكائنات وحيدة الخلية'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', '«كما توجد كائنات حية تتركب أجسامها من العديد من _______ التي تعمل متصلة بشكل أنسجة وظيفية ضمن الأعضاء».',
      'choices', jsonb_build_array('الخلايا المتماثلة', 'الخلايا المتخصصة', 'خلايا النسيج', 'نواتج خلوية معينة'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch2-lec1-exam'
    AND title = 'المحاضرة 1 — مقدمة الأنسجة'
);
