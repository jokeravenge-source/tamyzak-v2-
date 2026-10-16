-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 3 · Lecture 8
-- Seed the supplied Paramecium asexual reproduction MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch3-lec8-exam',
  'المحاضرة 8 — التكاثر اللاجنسي في الباراميسيوم',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'إلى أي مجموعة من الكائنات الحية ينتمي الباراميسيوم (Paramecium)؟',
      'choices', jsonb_build_array('الطليعيات السوطية', 'الطليعيات الهدبية', 'الفطريات الاقترانية', 'الطحالب الخضراء وحيدة الخلية'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الطريقة التي يتكاثر بها الباراميسيوم لاجنسياً؟',
      'choices', jsonb_build_array('الانشطار الثنائي الطولي', 'الانشطار الثنائي المستعرض', 'التبرعم الخارجي', 'التفتت وتكوين الأبواغ'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما أول حدث يطرأ على الباراميسيوم عند بدء عملية الانقسام اللاجنسي؟',
      'choices', jsonb_build_array('اختفاء الأهداب الخارجية تماماً.', 'انقسام النواة الصغيرة انقساماً اعتيادياً خيطياً.', 'تخصر السايتوبلازم من المنتصف فوراً.', 'اضمحلال الفجوات المتقلصة.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'كيف تنقسم النواة الكبيرة في الباراميسيوم أثناء الانشطار الثنائي المستعرض؟',
      'choices', jsonb_build_array('تنقسم انقساماً خيطياً غير مباشر بتكوين مغزل.', 'تنقسم انقساماً مباشراً عن طريق الاستطالة من دون تغيرات كروموسومية.', 'تنقسم انقساماً اختزالياً لتقليل عدد الكروموسومات إلى النصف.', 'تتحلل، وتتكون نواة كبيرة جديدة من السايتوبلازم.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ماذا يحدث للنواة الصغيرة بعد انقسامها وتضاعفها أثناء عملية الانقسام؟',
      'choices', jsonb_build_array('تهاجر النواتان الصغيرتان إلى طرفي الخلية المتقابلين.', 'تندمجان لتكوين نواة واحدة (2س) في المركز.', 'تخرج إحداهما خارج الخلية كجسم قطبي.', 'تتحللان بواسطة الإنزيمات الهاضمة.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'ما التراكيب الخلوية الجديدة التي تظهر وتتكون في الباراميسيوم أثناء استطالة الجسم والانقسام؟',
      'choices', jsonb_build_array('سوطان جديدان ومحفظة حماية سميكة.', 'برعم فمي جديد وفجوتان متقلصتان جديدتان.', 'بلاستيدة خضراء كأسية الشكل وجدار خلوي.', 'جسيم حركي وجسر اقتران متطور.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما النتيجة النهائية لعملية الانشطار الثنائي المستعرض في الباراميسيوم؟',
      'choices', jsonb_build_array('إنتاج أربعة أفراد من الباراميسيوم صغيرة ومتباينة وراثياً.', 'إنتاج فردين جديدين من الباراميسيوم متماثلين تماماً.', 'تكوين بوغ ساكن يحمل نواة واحدة فقط.', 'تحول الكائن إلى فرد خنثى جاهز للإخصاب الذاتي.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch3-lec8-exam'
    AND title = 'المحاضرة 8 — التكاثر اللاجنسي في الباراميسيوم'
);
