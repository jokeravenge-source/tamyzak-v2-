-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 5 · Lecture 18
-- Seed the supplied RNA structure, types, and functions MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch5-lec18-exam',
  'المحاضرة 18 — تركيب RNA وأنواعه ووظائفه',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'ما الوحدة البنائية الأساسية التي يتألف منها شريط الحامض النووي الرايبوزي (RNA)؟',
      'choices', jsonb_build_array('الأحماض الأمينية المعقدة', 'النيوكليوتيدات الرايبوزية', 'الأحماض الشحمية الفوسفاتية', 'جزيئات السليلوز المتصلبة'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'بم يختلف السكر خماسي الكربون في نيوكليوتيدة RNA عن السكر الموجود في نيوكليوتيدة DNA نصاً؟',
      'choices', jsonb_build_array('يحتوي على سكر الجلوكوز عالي الطاقة.', 'يحتوي RNA على سكر الرايبوز كامل الأكسجين، بينما يحتوي DNA على سكر الرايبوز ناقص الأكسجين.', 'يتكون من سكر معقد عديد التحلل الذاتي.', 'يفتقد تماماً مجموعة الفوسفات الناقلة.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما القاعدة النتروجينية التي توجد في RNA بديلاً عن قاعدة الثايمين (T) الموجودة في DNA؟',
      'choices', jsonb_build_array('الأدنين (A)', 'اليوراسيل (U)', 'السايتوسين (C)', 'الغوانين (G)'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'كيف يكون المظهر الهيكلي العام لجزيء RNA مقارنة بجزيء DNA في الخلية؟',
      'choices', jsonb_build_array('يكون بشكل حلزون مزدوج ملتف دائماً.', 'يتكون غالباً من شريط مفرد واحد، وليس من شريطين ملتفين بهيئة حلزون مزدوج كما في DNA.', 'يتصل مباشرة بالجسيم الحركي الخارجي للحركة.', 'يظهر بشكل أكياس مسطحة تسمى الصهاريج الإفرازية.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الأنواع الرئيسية الثلاثة للحامض النووي الرايبوزي (RNA) المشتركة في عملية بناء البروتين حسب نص الكتاب؟',
      'choices', jsonb_build_array('البدائي والحقيقي والوعائي.', 'الحامض النووي الرايبوزي الرسول (mRNA)، والحامض النووي الرايبوزي الناقل (tRNA)، والحامض النووي الرايبوزي الرايبوسومي (rRNA).', 'أحادي وثنائي وثلاثي الكروموسومات.', 'الهرموني والإنزيمي والستيرويدي المتفرع.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الوظيفة الأساسية والبيولوجية للحامض النووي الرايبوزي الناقل (tRNA) في الخلية؟',
      'choices', jsonb_build_array('خزن طاقة ATP العالية داخل المايتوكوندريا.', 'نقل الأحماض الأمينية من السايتوبلازم إلى الرايبوسومات أثناء بناء البروتين.', 'نقل عامل الخصوبة عبر جسر الاقتران البكتيري.', 'تشكيل الغشاء شبه النافذ المحيط بالمنطقة النووية.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch5-lec18-exam'
    AND title = 'المحاضرة 18 — تركيب RNA وأنواعه ووظائفه'
);
