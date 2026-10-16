-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 5 · Lecture 12
-- Seed the supplied multiple alleles and ABO blood groups MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch5-lec12-exam',
  'المحاضرة 12 — الأليلات المتعددة ونظام فصائل الدم ABO',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'ما هو التوصيف العلمي الدقيق لمفهوم الأليلات المتعددة (Multiple Alleles) حسب نص كتاب الأحياء؟',
      'choices', jsonb_build_array('وجود أليل واحد ثابت لا يتغير في جميع أفراد النوع الواحد.', 'وجود بدائل أو أليلات مختلفة للجين نفسه تنشأ نتيجة طفرات مختلفة في جزيء DNA، ويحتل كل أليل الموقع الكروموسومي نفسه، لكن الفرد لا يحمل منها سوى أليلين.', 'عملية تبادل قطع الكروماتيدات غير الشقيقة في مناطق التصالبات.', 'زيادة عدد الكروموسومات الجسمية نتيجة الانقسام الاختزالي الأول.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما النظام البشري الوراثي الذي يُعد أشهر وأوضح مثال على الأليلات المتعددة في الإنسان؟',
      'choices', jsonb_build_array('نظام مجاميع الدم MN', 'نظام فصائل الدم ABO، الذي تتحكم في وراثته ثلاثة أليلات مختلفة للجين I.', 'مرض فقر الدم المنجلي الشديد', 'متلازمة داون الكروموسومية'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الأليلات الثلاثة المختلفة المسؤولة عن تحديد فصائل الدم A وB وAB وO في الإنسان نصاً؟',
      'choices', jsonb_build_array('Lᴹ وLᴺ وLᴹᴺ', 'الأليل السائد Iᴬ، والأليل السائد Iᴮ، والأليل المتنحي i.', 'Cᴿ وCᵂ وCᴳ', 'T وt وTᵗ'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما طبيعة العلاقة الوراثية بين الأليلين Iᴬ وIᴮ عندما يجتمعان في فرد واحد لتكوين فصيلة الدم AB؟',
      'choices', jsonb_build_array('سيادة تامة لمندل', 'سيادة مشاركة أو مواكبة، إذ يُعبّر كلاهما عن نفسه من دون اختلاط وتظهر الفصيلة AB.', 'سيادة غير تامة تنتج صفة وسطية', 'أليلات مميتة تؤدي إلى هلاك الجنين'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الطراز الوراثي للشخص الذي يحمل فصيلة الدم O النقية والمتنحية دائماً؟',
      'choices', jsonb_build_array('IᴬIᴬ', 'ii', 'IᴬIᴮ', 'Iᴮi'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'كم عدد الطرز الوراثية المحتملة لكل من فصيلة الدم A وفصيلة الدم B تبعاً لنقاوة الصفة؟',
      'choices', jsonb_build_array('طراز واحد نقي دائماً', 'طرازان لكل منهما: أحدهما نقي (IᴬIᴬ أو IᴮIᴮ)، والآخر هجين (Iᴬi أو Iᴮi).', 'ثلاثة طرز متباينة التفوق', 'تختفي الطرز الهجينة تماماً بفعل النفاذ الجيني'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch5-lec12-exam'
    AND title = 'المحاضرة 12 — الأليلات المتعددة ونظام فصائل الدم ABO'
);
