-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 2 · Lecture 2
-- Seed the supplied meristematic tissue MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch2-lec2-exam',
  'المحاضرة 2 — النسيج المرستيمي',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'النسيج المرستيمي: «هو النسيج الذي يتميز بقدرة خلاياه على _______ ويوجد في أجزاء النبات التي تظهر نشاطًا انقساميًا».',
      'choices', jsonb_build_array('النمو الثانوي', 'استطالة السلاميات', 'الانقسام المستمر', 'إعادة النمو السريع'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'موقع النسيج المرستيمي القمي هو:',
      'choices', jsonb_build_array('قمم الجذور والسيقان.', 'بين أنسجة النبات المستديمة وبعيدًا عن القمم النامية.', 'أجزاء النبات البعيدة عن القمم النامية.', 'في سلاميات الكثير من النباتات ذوات الفلقة الواحدة.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', '«أجزاء النبات البعيدة عن القمم النامية أي على الجانب وبموازاة السطح الخارجي للنبات» هي موقع:',
      'choices', jsonb_build_array('النسيج المرستيمي القمي.', 'النسيج المرستيمي البيني.', 'نسيج الخشب الثانوي.', 'النسيج المرستيمي الجانبي.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'ما وظيفة النسيج المرستيمي الجانبي؟',
      'choices', jsonb_build_array('النمو في قمم الجذور والسيقان.', 'النمو الثانوي والتثخن في النباتات.', 'استطالة السلاميات في النبات.', 'إعادة النمو السريع في الأوراق الناضجة.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', '«بين أنسجة النبات المستديمة وبعيدًا عن القمم النامية كما في سلاميات الكثير من النباتات ذوات الفلقة الواحدة» هو موقع:',
      'choices', jsonb_build_array('النسيج المرستيمي الجانبي.', 'النسيج المرستيمي القمي.', 'النسيج المرستيمي البيني.', 'الكامبيوم الفليني.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'حدّد المسؤول عن استطالة السلاميات:',
      'choices', jsonb_build_array('النسيج المرستيمي البيني.', 'النسيج المرستيمي القمي.', 'الكامبيوم الوعائي.', 'الكامبيوم الفليني.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'حدّد المسؤول عن إعادة النمو السريع للأوراق الناضجة:',
      'choices', jsonb_build_array('الكامبيوم الفليني.', 'النسيج المرستيمي القمي.', 'الكامبيوم الوعائي.', 'النسيج المرستيمي البيني.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'ما منشأ الخشب واللحاء الثانويين؟',
      'choices', jsonb_build_array('الكامبيوم الفليني.', 'الكامبيوم الوعائي.', 'النسيج المرستيمي القمي.', 'النسيج المرستيمي البيني.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما منشأ البشرة المحيطة؟',
      'choices', jsonb_build_array('النسيج المرستيمي القمي.', 'النسيج المرستيمي البيني.', 'الكامبيوم الفليني.', 'الكامبيوم الوعائي.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'ما نوع نسيج الكامبيوم الفليني؟',
      'choices', jsonb_build_array('النسيج المرستيمي الجانبي.', 'النسيج المرستيمي البيني.', 'النسيج المرستيمي القمي.', 'نسيج الخشب الثانوي.'),
      'answer_index', 0
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch2-lec2-exam'
    AND title = 'المحاضرة 2 — النسيج المرستيمي'
);
