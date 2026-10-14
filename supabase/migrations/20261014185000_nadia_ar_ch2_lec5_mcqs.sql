-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 2 · Lecture 5
-- Seed the supplied epidermal tissue MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch2-lec5-exam',
  'المحاضرة 5 — نسيج البشرة',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'ما هو النسيج الذي يغطي النبات؟',
      'choices', jsonb_build_array('النسيج الأساس.', 'نسيج البشرة.', 'النسيج الوعائي.', 'النسيج المرستيمي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ممَّ تتكون طبقة البشرة؟',
      'choices', jsonb_build_array('خلايا حية رقيقة الجدران.', 'خلايا ميتة ذات جدران متغلظة لاحتوائها على الخشبين أو اللكنين.', 'خلايا حية متطاولة وجدرانها متغلظة بشكل غير منتظم.', 'صف واحد من الخلايا المتثخنة التي تغطي جسم النبات.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'ما ميزة خلايا نسيج البشرة من حيث الشكل والتراص؟',
      'choices', jsonb_build_array('مسطحة ومتراصة.', 'كروية الشكل أو مضلعة.', 'طويلة ومدببة النهايات.', 'متطاولة وجدرانها متغلظة بشكل غير منتظم.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'ما حالة المسافات البينية في نسيج البشرة ثم النسيج البرنكيمي، على الترتيب؟',
      'choices', jsonb_build_array('توجد مسافات بينية — توجد مسافات بينية.', 'توجد مسافات بينية — تنعدم المسافات البينية.', 'تنعدم المسافات البينية — توجد مسافات بينية.', 'تنعدم المسافات البينية — تنعدم المسافات البينية.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'ما وظيفة نسيج البشرة؟',
      'choices', jsonb_build_array('التهوية وخزن الغذاء وتوصيله.', 'الحماية والسيطرة على تبادل الغازات وامتصاص الماء.', 'نقل الماء والغذاء داخل جسم النبات فضلًا عن الإسناد والدعم.', 'إنتاج خلايا جديدة تضيف للنبات طولًا وسمكًا.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'تتم السيطرة على تبادل الغازات في نسيج البشرة من خلال:',
      'choices', jsonb_build_array('الخلايا المرافقة.', 'الخلايا الكلورنكيمية.', 'الخلايا الصخرية.', 'أزواج من الخلايا الحارسة.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'بحسب جدول ملخص وظائف الأنسجة النباتية، ينظّم نسيج البشرة تبادل الغازات في:',
      'choices', jsonb_build_array('الساق والأوراق.', 'قمم الجذور والسيقان.', 'القشرة واللب والأشعة اللبية.', 'سلاميات الكثير من النباتات ذوات الفلقة الواحدة.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'بحسب جدول الملزمة، يمتص نسيج البشرة في الجذور:',
      'choices', jsonb_build_array('المواد الغذائية المنتجة في الورقة.', 'الجزيئات العضوية.', 'الماء والأملاح المذابة.', 'الكربوهيدرات.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'أين يقوم نسيج البشرة بامتصاص الماء والأملاح المذابة، بحسب جدول الملزمة؟',
      'choices', jsonb_build_array('الأوراق.', 'الجذور.', 'الساق.', 'الأشعة اللبية.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أي اختيار يطابق موقع النسيج الأساس ثم نسيج البشرة، على الترتيب؟',
      'choices', jsonb_build_array('الطبقة الخارجية لأجزاء النبات — كتل نسيجية داخلية.', 'كتل نسيجية داخلية — كتل نسيجية داخلية.', 'الطبقة الخارجية لأجزاء النبات — الطبقة الخارجية لأجزاء النبات.', 'كتل نسيجية داخلية — الطبقة الخارجية لأجزاء النبات.'),
      'answer_index', 3
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch2-lec5-exam'
    AND title = 'المحاضرة 5 — نسيج البشرة'
);
