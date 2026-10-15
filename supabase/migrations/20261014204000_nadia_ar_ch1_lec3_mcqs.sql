-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 1 · Lecture 3
-- Seed the supplied bacterial cell structure MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch1-lec3-exam',
  'المحاضرة 3 — تركيب الخلية البكتيرية',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'ماذا تمثل كل خلية بكتيرية حسب نص كتاب الأحياء؟',
      'choices', jsonb_build_array('كائناً بدائياً متعدد الخلايا يمتلك غشاءً نووياً.', 'كائناً بدائي النواة يتألف من خلية واحدة.', 'تركيباً لا خلوياً يتكاثر داخل المضيف فقط.', 'كائناً فطرياً يفتقد للمادة الوراثية تماماً.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الذي يحيط بالخلية البكتيرية ويحمي مكوناتها الداخلية نصاً؟',
      'choices', jsonb_build_array('غلاف بروتيني خارجي يفرز إنزيمات محللة.', 'جدار صلب يحيط به غشاء بلازمي إلى الداخل منه.', 'غشاء واقٍ رقيق يفتقد للمركبات الكيميائية المعقدة.', 'طبقة لزجة من السليلوز واللغنين المتصلب.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الوصف المعتمد في الكتاب للغشاء البلازمي الذي يقع إلى الداخل من جدار الخلية البكتيرية؟',
      'choices', jsonb_build_array('غشاء صلب غير منفذ يمنع مرور جزيئات الماء.', 'غشاء نصف ناضح يحيط بالسايتوبلازم.', 'غلاف مزدوج يحتوي على ثقوب إنبات دقيقة.', 'نسيج حشوي ليفي غني بجزيئات الكولاجين.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أي مما يلي يمثل المظهر العام للخلية البكتيرية من حيث "الغلاف الخلوي" حسب تصنيف جدول الكتاب؟',
      'choices', jsonb_build_array('الغلاف النووي والشبكة الكروماتينية.', 'جدار الخلية والغشاء البلازمي.', 'المحفظة الصلبة والأهداب الجنسية فقط.', 'الغشاء الخارجي المفرز للألبومين.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أي مما يلي يمثل المظهر العام للخلية البكتيرية من حيث محتويات "السايتوبلازم" نصاً؟',
      'choices', jsonb_build_array('الميتوكوندريا والشبكة البلازمية الداخلية.', 'منطقة نووية وريبوسومات.', 'جهاز جولجي والفجوات المتقلصة.', 'النوية الواضحة والغلاف النووي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أي مما يلي يمثل "اللواحق" التي قد تمتلكها الخلية البكتيرية للمساعدة في الحركة أو الاقتران؟',
      'choices', jsonb_build_array('مجسات وأشواك ووسادة تناسلية.', 'أصواط وأهداب وأهلاب جنسية.', 'خيوط دقيقة ونبيبات دقيقة ليفية.', 'أجنحة وعائية وصمام عضلي غالق.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch1-lec3-exam'
    AND title = 'المحاضرة 3 — تركيب الخلية البكتيرية'
);
