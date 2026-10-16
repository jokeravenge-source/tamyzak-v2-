-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 2 · Lecture 26
-- White blood cell MCQs supplied as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch2-lec26-exam',
  'المحاضرة 26 — خلايا الدم البيضاء',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'تُعد خلايا الدم البيضاء خلايا حقيقية لأنها:',
      'choices', jsonb_build_array('خالية من النواة', 'تحتوي على نواة ومحتويات الخلية الحية', 'تحتوي على الهيموغلوبين', 'تتحول إلى ألياف عند التخثر'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما نوع الحركة التي تستطيع خلايا الدم البيضاء القيام بها؟',
      'choices', jsonb_build_array('الحركة الهدبية', 'الحركة السوطية', 'الحركة الأميبية', 'الحركة العضلية'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'يتراوح العدد الطبيعي لخلايا الدم البيضاء عند الإنسان البالغ بين:',
      'choices', jsonb_build_array('500–1,100 خلية/مايكرولتر', '5,000–11,000 خلية/مايكرولتر', '15,000–20,000 خلية/مايكرولتر', '40,000–70,000 خلية/مايكرولتر'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'تبلغ نسبة خلايا الدم البيضاء إلى خلايا الدم الحمر تقريباً:',
      'choices', jsonb_build_array('1:70', '1:700', '1:7,000', '1:70,000'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'يصل عدد خلايا الدم البيضاء عند الطفل حديث الولادة إلى حوالي:',
      'choices', jsonb_build_array('6,000 خلية/مايكرولتر', '11,000 خلية/مايكرولتر', '16,000 خلية/مايكرولتر', '25,000 خلية/مايكرولتر'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'لماذا يكون عدد خلايا الدم البيضاء عند الأطفال أعلى منه عند البالغين؟',
      'choices', jsonb_build_array('لأن كريات الدم الحمر لديهم عديمة النواة', 'لأن جهازهم المناعي غير متطور وغير مؤهل لمكافحة جميع الأمراض', 'لأن حجم الدم لديهم أكبر من البالغين', 'لأن خلايا الدم البيضاء تحتوي على الهيموغلوبين'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'على أي أساس تُصنّف خلايا الدم البيضاء إلى حبيبية ولاحبيبية؟',
      'choices', jsonb_build_array('شكل الخلية الخارجي', 'وجود الحبيبات في السايتوبلازم', 'عدد الخلايا في الدم', 'حجم النواة فقط'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الصفة المميزة لخلايا الدم البيضاء الحبيبية؟',
      'choices', jsonb_build_array('لا تحتوي على حبيبات ونواتها غير مفصصة', 'تحتوي على حبيبات نوعية ونواتها غالباً مفصصة', 'خالية من النواة والسايتوبلازم', 'تحتوي على صبغة الهيموغلوبين'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أيّ مجموعة تمثل أنواع خلايا الدم البيضاء الحبيبية؟',
      'choices', jsonb_build_array('الخلايا اللمفية والخلايا الوحيدة', 'الخلايا العدلة والحمضة والقعدة', 'الخلايا العدلة واللمفية والوحيدة', 'الخلايا الحمضة واللمفية والوحيدة'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'تشكّل خلايا الدم البيضاء العدلة من العدد الكلي لخلايا الدم البيضاء نسبة:',
      'choices', jsonb_build_array('0.5–1%', '1–4%', '4–8%', '40–70%'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'تشكّل خلايا الدم البيضاء الحمضة من العدد الكلي لخلايا الدم البيضاء نسبة:',
      'choices', jsonb_build_array('0.5–1%', '1–4%', '20–45%', '40–70%'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'تشكّل خلايا الدم البيضاء القعدة من العدد الكلي لخلايا الدم البيضاء نسبة تقارب:',
      'choices', jsonb_build_array('0.5–1%', '4–8%', '20–45%', '40–70%'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'ما الصفة المميزة لخلايا الدم البيضاء اللاحبيبية؟',
      'choices', jsonb_build_array('تحتوي على حبيبات ونواتها مفصصة', 'لا تحتوي على حبيبات ونواتها غير مفصصة', 'خالية من النواة', 'قرصية الشكل ومقعرة الوجهين'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أيّ زوج يمثل خلايا الدم البيضاء اللاحبيبية؟',
      'choices', jsonb_build_array('الخلايا العدلة والحمضة', 'الخلايا الحمضة والقعدة', 'الخلايا اللمفية والخلايا الوحيدة', 'الخلايا العدلة والقعدة'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'أين تنجز خلايا الدم البيضاء وظيفتها الأساسية؟',
      'choices', jsonb_build_array('داخل مجرى الدم فقط', 'داخل نخاع العظم فقط', 'خارج مجرى الدم بعد دخولها إلى النسيج الضام المفكك', 'داخل القلب والرئتين فقط'),
      'answer_index', 2
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch2-lec26-exam'
    AND title = 'المحاضرة 26 — خلايا الدم البيضاء'
);
