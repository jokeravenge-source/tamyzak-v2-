-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 2 · Lecture 25
-- Blood and red blood cell MCQs supplied as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch2-lec25-exam',
  'المحاضرة 25 — الدم وكريات الدم الحمر',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'يُصنّف الدم نسيجياً على أنه:',
      'choices', jsonb_build_array('نسيج طلائي متخصص', 'نسيج ضام متخصص', 'نسيج عضلي أملس', 'نسيج عصبي متخصص'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ينشأ الدم من خلايا:',
      'choices', jsonb_build_array('طلائية متخصصة', 'عضلية ملساء', 'جنينية متوسطة', 'عصبية حسية'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'ممَّ يتكوّن الدم بصورة أساسية؟',
      'choices', jsonb_build_array('خلايا ومادة بينية تُسمّى البلازما', 'ألياف وخلايا غضروفية', 'خلايا عظمية ومادة صلبة', 'ألياف عضلية ومادة مخاطية'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'تتحول المواد البروتينية الموجودة في الدم إلى ألياف عند حدوث:',
      'choices', jsonb_build_array('التنفس', 'الهضم', 'التخثر', 'الإخراج'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'تبلغ نسبة الدم من وزن جسم الإنسان البالغ الصحي تقريباً:',
      'choices', jsonb_build_array('1–2%', '3–4%', '7–8%', '12–15%'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'يبلغ حجم الدم في جسم شخص بالغ صحي وزنه 70 كغم تقريباً:',
      'choices', jsonb_build_array('1–2 لتر', '3–4 لترات', '5–6 لترات', '9–10 لترات'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'ما الشكل الطبيعي لكريات الدم الحمر عند الإنسان؟',
      'choices', jsonb_build_array('كروية محدبة الوجهين', 'قرصية مقعرة الوجهين', 'بيضوية محدبة الوجهين', 'مغزلية مسطحة'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'تمتاز كريات الدم الحمر الناضجة عند الإنسان بأنها:',
      'choices', jsonb_build_array('تحتوي على نواة كبيرة', 'تحتوي على نواتين', 'عديمة النواة', 'متعددة النوى'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'تختلف كريات الدم الحمر في الجمال عن الإنسان في كونها:',
      'choices', jsonb_build_array('كروية الشكل وذات نواة', 'قرصية مقعرة الوجهين', 'بيضوية محدبة الوجهين', 'مغزلية وعديمة السايتوبلازم'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'يتراوح قطر كرية الدم الحمراء في الإنسان بين:',
      'choices', jsonb_build_array('1–2 مايكرومتر', '3–5 مايكرومتر', '6.5–8 مايكرومتر', '10–15 مايكرومتر'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'يتراوح العدد الطبيعي لكريات الدم الحمر في ذكر الإنسان البالغ بين:',
      'choices', jsonb_build_array('1–2 مليون خلية/مايكرولتر', '2–3 ملايين خلية/مايكرولتر', '4–6 ملايين خلية/مايكرولتر', '7–9 ملايين خلية/مايكرولتر'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'يتراوح العدد الطبيعي لكريات الدم الحمر في أنثى الإنسان البالغة بين:',
      'choices', jsonb_build_array('1.5–2.5 مليون خلية/مايكرولتر', '3.9–5.5 مليون خلية/مايكرولتر', '6–7 ملايين خلية/مايكرولتر', '8–9 ملايين خلية/مايكرولتر'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'تزداد أعداد كريات الدم الحمر عند سكان المرتفعات بهدف:',
      'choices', jsonb_build_array('زيادة كفاءة التنفس ونقل الأوكسجين', 'تقليل كمية الهيموغلوبين', 'تقليل حجم الدم', 'زيادة عملية تخثر الدم'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'الصبغة الموجودة في سايتوبلازم كرية الدم الحمراء والمسؤولة عن لونها ووظيفتها التنفسية هي:',
      'choices', jsonb_build_array('الميلانين', 'الهيموغلوبين', 'الكيراتين', 'الثرومبوبلاستين'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أيّ العبارات الآتية صحيحة بشأن دورة حياة كريات الدم الحمر؟',
      'choices', jsonb_build_array('تعيش حوالي 30 يوماً وتتحلل في القلب', 'تعيش حوالي 60 يوماً وتتحلل في الرئتين', 'تعيش حوالي 120 يوماً وتلتهمها الخلايا البلعمية الكبيرة', 'تعيش حوالي 200 يوم وتتحلل داخل الأوعية الدموية'),
      'answer_index', 2
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch2-lec25-exam'
    AND title = 'المحاضرة 25 — الدم وكريات الدم الحمر'
);
