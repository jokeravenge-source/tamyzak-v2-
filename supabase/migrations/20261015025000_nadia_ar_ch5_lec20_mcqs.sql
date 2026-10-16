-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 5 · Lecture 20
-- Seed the supplied translation and protein synthesis MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch5-lec20-exam',
  'المحاضرة 20 — الترجمة وبناء البروتين',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'ما المقصود بعملية الترجمة (Translation) داخل الخلية حسب نص كتاب الأحياء؟',
      'choices', jsonb_build_array('عملية تحويل الحامض البايروفي إلى كحول إثيلي وغاز ثنائي أكسيد الكربون.', 'تحويل تتابع النيوكليوتيدات، أي الشفرات الوراثية، الموجودة على جزيء mRNA إلى تتابع من الأحماض الأمينية لتكوين سلسلة ببتيدية وبناء بروتين محدد.', 'إعادة إصلاح بطانة الرحم ونموها وتثخينها بفعل هرمون الإستروجين.', 'تخصر الغشاء البلازمي للخلية الحيوانية من الخارج نحو الداخل تدريجياً.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أين تحدث عملية الترجمة، أي بناء البروتين، داخل السايتوبلازم، وما العضيات المسؤولة عنها؟',
      'choices', jsonb_build_array('تحدث في أجسام جولجي داخل الصهاريج الإفرازية.', 'تحدث في السايتوبلازم على سطوح الرايبوسومات (Ribosomes).', 'تحدث داخل الفجوة الغذائية المؤقتة بفعل الإنزيمات الحرة.', 'تحدث ملتصقة بالجدار الخلوي الصلب للخلية النباتية الفتية.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما التركيب الجزيئي الذي يتكون من ثلاثة نيوكليوتيدات متتالية على جزيء tRNA ويطابق شفرة mRNA؟',
      'choices', jsonb_build_array('الكودون العام', 'مضاد الكودون (Anticodon)', 'ثقوب الإنبات', 'الجسيم الطرفي'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'كيف يعمل جزيء tRNA الناقل أثناء عملية الترجمة نصاً في الكتاب؟',
      'choices', jsonb_build_array('يفرز إنزيمات هيدروليكية تحلل الأواصر الهيدروجينية للشريط القالب.', 'يتعرف على كودون mRNA بواسطة مضاد الكودون الخاص به، ويجلب الحمض الأميني المحدد ويضيفه إلى سلسلة الببتيد النامية في الرايبوسوم.', 'يهاجر نحو النواة لتضاعف جزيئات DNA بالفسفرة التنازلية.', 'يلتصق بقطبي الخلية المتقابلين لتوجيه حركة الكروموسومات البنوية.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الذي يحدد نهاية عملية الترجمة وإيقاف بناء سلسلة البروتين في الرايبوسوم حسب متن المنهج؟',
      'choices', jsonb_build_array('نفاد كمية الماء والأملاح الذائبة داخل العصير الخلوي.', 'وصول الرايبوسوم إلى إحدى شفرات الإنهاء أو التوقف (Stop Codons) على شريط mRNA.', 'تحلل النواة والغلاف النووي واختفاء النوية تماماً.', 'انخفاض مستوى هرمون البروجسترون بسبب اضمحلال الجسم الأصفر.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch5-lec20-exam'
    AND title = 'المحاضرة 20 — الترجمة وبناء البروتين'
);
