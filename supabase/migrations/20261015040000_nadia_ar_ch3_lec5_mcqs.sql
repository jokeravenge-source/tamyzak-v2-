-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 3 · Lecture 5
-- Seed the supplied bacterial asexual reproduction MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch3-lec5-exam',
  'المحاضرة 5 — التكاثر اللاجنسي في البكتيريا',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'ما الطريقة الأساسية التي تتكاثر بها البكتيريا لاجنسياً؟',
      'choices', jsonb_build_array('التبرعم', 'الانشطار الثنائي', 'تكوين الأبواغ', 'التفتت أو التجزؤ'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ماذا يحدث للكروموسوم البكتيري بعد اتصاله بالغلاف الخلوي في مناطق معينة بوصفه خطوة أولى للانقسام؟',
      'choices', jsonb_build_array('يتحلل بالكامل بواسطة الإنزيمات.', 'يتضاعف لإنتاج كروموسومين متماثلين.', 'ينتقل إلى منطقة السوط الخارجي.', 'ينقسم انقساماً اختزالياً إلى نصفين.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الذي يدل على أن الخلية البكتيرية تهيأت للانقسام الثنائي في مراحله الأولى؟',
      'choices', jsonb_build_array('انكماش الغشاء البلازمي نحو الداخل.', 'توسع الجدار الخلوي والخلية بأكملها.', 'اختفاء منطقة النواة، أو النيوكليوئيد.', 'سقوط الأهداب الجنسية من السطح.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'كيف يتحرك كروموسوما الخلية البكتيرية بعد تضاعفهما أثناء عملية الانشطار؟',
      'choices', jsonb_build_array('يتجمعان في مركز الخلية تماماً.', 'يتحركان في اتجاهين متعاكسين نحو طرفي الخلية.', 'يندمجان لتكوين كروموسوم رباعي (4س).', 'يخرج أحدهما خارج الخلية كجسم قطبي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما التغير الهيكلي الذي يطرأ على الخلية البكتيرية ويؤدي في النهاية إلى انقسامها إلى خليتين؟',
      'choices', jsonb_build_array('زيادة سمك المحفظة الخارجية، أو الكبسولة.', 'تخصر جدار الخلية وغشائها البلازمي من المنتصف.', 'استطالة السوط البكتيري حتى ينقطع.', 'نمو جدار عرضي من الداخل إلى الخارج من دون تخصر.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما النتيجة النهائية لعملية الانشطار الثنائي في البكتيريا؟',
      'choices', jsonb_build_array('إنتاج أربع خلايا بكتيرية متباينة وراثياً.', 'إنتاج خليتين بكتيريتين متماثلتين تماماً.', 'تكوين بوغ بكتيري مقاوم للظروف البيئية.', 'إنتاج خلية ذكرية وأخرى أنثوية.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch3-lec5-exam'
    AND title = 'المحاضرة 5 — التكاثر اللاجنسي في البكتيريا'
);
