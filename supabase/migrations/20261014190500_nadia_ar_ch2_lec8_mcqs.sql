-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 2 · Lecture 8
-- Seed the supplied animal and epithelial tissue MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch2-lec8-exam',
  'المحاضرة 8 — الأنسجة الحيوانية والنسيج الظهاري',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'تتكون الأنسجة الحيوانية من مجموعة من _______ تتخصص لإنجاز وظيفة معينة.',
      'choices', jsonb_build_array('الخلايا غير المتمايزة.', 'الخلايا الحارسة.', 'الخلايا المتماثلة.', 'الخلايا المرستيمية المستطيلة.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'بِمَ تختلف الأنسجة الحيوانية بعضها عن بعض؟',
      'choices', jsonb_build_array('كمية المادة بين الخلوية والتباين التركيبي من حيث محتواها الكيميائي.', 'الشكل والأصل والتركيب وطريقة التكوين.', 'طريقة التغلظ فيها.', 'الموقع والوظيفة.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'يُسمّى النسيج الضام أيضًا بالنسيج:',
      'choices', jsonb_build_array('الطلائي.', 'العضلي.', 'العصبي.', 'الرابط.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'ما النسيج الذي يُسمّى بالنسيج الطلائي؟',
      'choices', jsonb_build_array('النسيج الضام.', 'النسيج الظهاري.', 'النسيج العضلي.', 'النسيج العصبي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أي اختيار يجمع وظائف النسيج الظهاري؟',
      'choices', jsonb_build_array('التهوية وخزن الغذاء وتوصيله.', 'نقل الماء والغذاء داخل جسم النبات فضلًا عن الإسناد والدعم.', 'الحماية والسيطرة على تبادل الغازات وامتصاص الماء.', 'يغطي سطح الجسم، ويبطن التجاويف الجسمية، ويكوّن الغدد.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'بِمَ يتمثل النسيج الظهاري؟',
      'choices', jsonb_build_array('صفائح مستمرة من الخلايا مكوّنة من صف واحد أو عدة صفوف.', 'صف واحد من الخلايا المتثخنة التي تغطي جسم النبات.', 'كتل نسيجية داخلية في الجذور والسيقان والأوراق.', 'خلايا طويلة ومدببة النهايات توجد منفردة أو بشكل حزم.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'تستقر خلايا النسيج الظهاري على:',
      'choices', jsonb_build_array('المادة بين الخلوية.', 'الروابط البلازمية.', 'غشاء قاعدي.', 'حافات الخلايا.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'أكمل: «المادة بين الخلايا للنسيج الظهاري _______».',
      'choices', jsonb_build_array('تتكون بكميات كبيرة.', 'تكاد تكون معدومة.', 'تتنوع في تركيبها.', 'تتباين من حيث محتواها الكيميائي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ترتبط حافات خلايا النسيج الظهاري بعضها مع بعض بواسطة:',
      'choices', jsonb_build_array('روابط خلوية «روابط بلازمية».', 'غشاء قاعدي.', 'المادة بين الخلوية.', 'نواتج خلوية معينة.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'ما وظيفة الروابط البلازمية؟',
      'choices', jsonb_build_array('تغطية سطح الجسم وتبطين التجاويف الجسمية وتكوين الغدد.', 'الحماية والسيطرة على تبادل الغازات.', 'نقل المواد الغذائية المنتجة في الورقة.', 'ربط حافات خلايا النسيج الظهاري بعضها مع بعض.'),
      'answer_index', 3
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch2-lec8-exam'
    AND title = 'المحاضرة 8 — الأنسجة الحيوانية والنسيج الظهاري'
);
