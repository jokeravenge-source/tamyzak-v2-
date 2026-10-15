-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 3 · Lecture 12
-- Seed the supplied plant reproduction (mosses / Polytrichum) MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch3-lec12-exam',
  'المحاضرة 12 — التكاثر في النباتات - الجزء الثاني (الحزازيات)',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'إلى أي مجموعة نباتية ينتمي نبات البوليتراكم (Polytrichum)؟',
      'choices', jsonb_build_array('النباتات الوعائية السرخسية', 'الحزازيات وهي من النباتات اللاوعائية', 'النباتات الزهرية مغطاة البذور', 'الطحالب الخضر وحيدة الخلية'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما هي المجموعة الكروموسومية للطور (الجيل) السائد في نبات البوليتراكم؟',
      'choices', jsonb_build_array('ثنائية المجموعة الكروموسومية (2س) لأنه جيل بوغي.', 'أحادية المجموعة الكروموسومية (1س) لأنه جيل مشيجي.', 'ثلاثية المجموعة الكروموسومية (3س) نتيجة اندماج الأبواغ.', 'رباعية المجموعة الكروموسومية (4س).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الاسم العلمي للمظلة أو الحافظة المشيجية الذكرية في الحزازيات؟',
      'choices', jsonb_build_array('الأنثريديا (Antheridia)', 'الأركيجونيا (Archegonia)', 'الحافظة البوغية (Sporangium)', 'البروتونيما (Protonema)'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'ما الاسم العلمي للمظلة أو الحافظة المشيجية الأنثوية في الحزازيات؟',
      'choices', jsonb_build_array('الأنثريديا (Antheridia)', 'الأركيجونيا (Archegonia)', 'الصفيحة الخلوية', 'الثالوس الأولي'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'كيف تصل الأمشاج الذكرية (الأنتروزويدات) إلى الحافظة الأنثوية لإتمام عملية الإخصاب؟',
      'choices', jsonb_build_array('تنتقل بواسطة الرياح القوية في مواسم الجفاف.', 'تسبح في الماء (الرطوبة) لتصل إلى الأركيجونيا وتخصب البيضة بداخلها.', 'تنقلها الحشرات الطائرة من نبات إلى آخر.', 'تنزلق بفعل الجاذبية الأرضية دون الحاجة لوسيط مائي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أين تحدث عملية الإخصاب وتكوين الزيجة (الزايجوت) في نبات البوليتراكم؟',
      'choices', jsonb_build_array('داخل الأنثريديا الذكرية.', 'داخل الأركيجونيا (الحافظة الأنثوية).', 'في التربة الرطبة خارج جسم النبات.', 'داخل الحافظة البوغية العليا.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'مما يتكون الجيل البوغي (2س) في الحزازيات بعد نموه، وأين يستقر؟',
      'choices', jsonb_build_array('يتكون من ساق طافية وأوراق عريضة ويستقر في التربة بشكل مستقل.', 'يتكون من حامل وحافظة أبواغ (علبة)، ويكون مستقراً وفوق الجيل المشيجي ومعتمداً عليه.', 'يتكون من خيوط فطرية سالبة وموجبة مندمجة.', 'يتكون من ثالوس أولي يحتوي على أشباه جذور.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ماذا ينتج عن الانقسام الاختزالي الذي يحدث داخل حافظة الأبواغ (العلبة) للبوليتراكم؟',
      'choices', jsonb_build_array('أمشاج ذكرية وأنثوية متشابهة (2س).', 'أبواغ أحادية المجموعة الكروموسومية (1س) تتحرر بعد سقوط غطاء العلبة.', 'زيجة جديدة تبدأ جيلاً بوغياً فوراً.', 'خلايا معطية تحتوي على بلازميد وراثي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ماذا يتكون عندما تنبت الأبواغ (1س) لنبات البوليتراكم في التربة؟',
      'choices', jsonb_build_array('خيوط أولية ذكرية أو أنثوية (بروتونيما) تمثل بدء الجيل المشيجي الجديد.', 'حافظة بوغية ذات جدار سميك.', 'نبات سرخسي وعائي كامل.', 'كيس جنيني يحتوي على 8 نويات.'),
      'answer_index', 0
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch3-lec12-exam'
    AND title = 'المحاضرة 12 — التكاثر في النباتات - الجزء الثاني (الحزازيات)'
);
