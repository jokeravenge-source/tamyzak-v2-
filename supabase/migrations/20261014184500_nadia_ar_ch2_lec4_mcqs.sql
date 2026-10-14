-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 2 · Lecture 4
-- Seed the supplied sclerenchyma tissue MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch2-lec4-exam',
  'المحاضرة 4 — النسيج السكلرنكيمي',
  jsonb_build_array(
    jsonb_build_object(
      'question', '«تكون خلاياه ميتة ذات جدران متغلظة لاحتوائها على الخشبين أو اللكنين» هي صفة:',
      'choices', jsonb_build_array('النسيج البرنكيمي.', 'النسيج الكولنكيمي.', 'النسيج السكلرنكيمي.', 'النسيج المرستيمي.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'تتغلظ جدران خلايا النسيج السكلرنكيمي لاحتوائها على:',
      'choices', jsonb_build_array('الخشبين أو اللكنين.', 'صبغة الكلوروفيل.', 'البلاستيدات الخضر.', 'المواد بين الخلوية.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'تتلخص وظيفة النسيج السكلرنكيمي الأساسية بـ:',
      'choices', jsonb_build_array('التهوية وخزن الغذاء وتوصيله.', 'النمو الثانوي والتثخن في النباتات.', 'استطالة السلاميات في النبات.', 'الدعم والتقوية.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'ما أنواع الخلايا السكلرنكيمية؟',
      'choices', jsonb_build_array('الكامبيوم الوعائي والكامبيوم الفليني.', 'الألياف والخلايا الصخرية.', 'الخشب واللحاء الثانويان.', 'الخلايا البرنكيمية والخلايا الكولنكيمية.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما ميزة الألياف؟',
      'choices', jsonb_build_array('تكون كروية الشكل أو مضلعة.', 'تكون بشكل خلايا قصيرة توجد في بعض الثمار.', 'تكون طويلة ومدببة النهايات.', 'خلايا حية متطاولة وجدرانها متغلظة بشكل غير منتظم.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'توجد الألياف منفردة أو بشكل حزم في:',
      'choices', jsonb_build_array('أجزاء النبات التي تحتاج إلى تقوية.', 'قمم الجذور والسيقان.', 'سلاميات الكثير من النباتات ذوات الفلقة الواحدة.', 'بين أنسجة النبات المستديمة وبعيدًا عن القمم النامية.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'ما ميزة الخلايا الصخرية؟',
      'choices', jsonb_build_array('خلايا حية رقيقة الجدران.', 'تكون طويلة ومدببة النهايات.', 'خلايا حية متطاولة وجدرانها متغلظة بشكل غير منتظم.', 'تكون بشكل خلايا قصيرة توجد في بعض الثمار مثل الكمثرى «الجوافة».'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'علّل: تكون الكمثرى من الثمار الصلبة.',
      'choices', jsonb_build_array('نتيجة للضغط الواقع عليها من الخلايا المجاورة.', 'لاحتوائها على خلايا صخرية التي هي من النسيج السكلرنكيمي.', 'بسبب وجود فجوات عصارية كبيرة تعمل على خزن الغذاء وتوصيله.', 'لاحتوائها على بلاستيدات خضر.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'بحسب جدول المقارنة في الملزمة، تتمايز الخلايا السكلرنكيمية المكوِّنة للألياف والخلايا الصخرية من:',
      'choices', jsonb_build_array('النسيج المرستيمي القمي.', 'الكامبيوم الفليني.', 'النسيج الأساسي.', 'النسيج المرستيمي البيني.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'ما صفة النسيج السكلرنكيمي من حيث المسافات البينية والفجوة العصارية، بحسب جدول المقارنة؟',
      'choices', jsonb_build_array('لا توجد فيه مسافات بينية ولا فجوة عصارية.', 'توجد فيه مسافات بينية وفجوة عصارية.', 'توجد فيه مسافات بينية ولا فجوة عصارية.', 'لا توجد فيه مسافات بينية وتوجد فجوة عصارية.'),
      'answer_index', 0
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch2-lec4-exam'
    AND title = 'المحاضرة 4 — النسيج السكلرنكيمي'
);
