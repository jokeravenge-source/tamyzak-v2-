-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 5 · Lecture 14
-- Seed the supplied rabbit coat color multiple-allele MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch5-lec14-exam',
  'المحاضرة 14 — الأليلات المتعددة ولون الفراء في الأرانب',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'ما الظاهرة الوراثية التي يمثلها موضوع لون الفراء في الأرانب حسب نص كتاب الأحياء؟',
      'choices', jsonb_build_array('السيادة غير التامة', 'الأليلات المتعددة (Multiple Alleles)', 'تداخل الفعل الجيني المتفوق', 'النفاذ الجيني الناقص'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'كم عدد الأليلات المختلفة التي تتحكم في وراثة لون الفراء في الأرانب، وما ترتيبها التنازلي في السيادة نصاً؟',
      'choices', jsonb_build_array('أليلان فقط، أحدهما سائد والآخر متنحٍ.', 'أربعة أليلات، تترتب سيادتها تنازلياً كالآتي: الرمادي، وهو السائد التام، ثم الشنشلا، ثم الهيمالايا، ثم الأمهق، وهو المتنحي التام.', 'ثلاثة أليلات متساوية السيادة بظاهرة المواكبة.', 'ثمانية أليلات تُظهر طرزاً مظهرية مبعثرة في السايتوبلازم.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الرموز الوراثية المعتمدة في المنهج للأليلات الأربعة المتحكمة في لون فراء الأرانب بالترتيب؟',
      'choices', jsonb_build_array('T وt وTᶜ وtʰ', 'الرمادي (C)، والشنشلا (cᶜʰ)، والهيمالايا (cʰ)، والأمهق (c).', 'Iᴬ وIᴮ وIᴬᴮ وi', 'Lᴹ وLᴺ وLᴹᴺ وL'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'كم عدد الطرز الوراثية المحتملة للأرنب ذي الفراء الرمادي (C) تبعاً لسيادته التامة على بقية الأليلات؟',
      'choices', jsonb_build_array('طراز وراثي واحد نقي دائماً', 'أربعة طرز وراثية: طراز نقي واحد (CC)، وثلاثة طرز هجينة هي (Ccᶜʰ) و(Ccʰ) و(Cc).', 'طرازان فقط', 'يختفي الطراز النقي تماماً بفعل الأليلات المميتة'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الطراز الوراثي للأرنب الأمهق (Albino)، وبماذا يتميز وراثياً؟',
      'choices', jsonb_build_array('CC، وهو سائد نقي.', 'cc، وهو متنحٍ نقي دائماً وأقل الأليلات سيادة.', 'cʰcʰ', 'cᶜʰc'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'كم عدد الطرز الوراثية للأرنب ذي اللون الشنشلا (cᶜʰ)، ومع أي الأليلات يكون هجيناً؟',
      'choices', jsonb_build_array('طراز واحد فقط', 'ثلاثة طرز وراثية: طراز نقي (cᶜʰcᶜʰ)، وطرازان هجينان (cᶜʰcʰ) و(cᶜʰc).', 'أربعة طرز وعائية مبعثرة', 'طراز هجين مع الرمادي السائد التام فقط'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الطراز الوراثي للأرنب الهيمالايا الهجين بالأمهق حسب قواعد ترتيب السيادة في المنهج؟',
      'choices', jsonb_build_array('cʰcʰ', 'cʰc', 'cᶜʰcʰ', 'Ccʰ'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch5-lec14-exam'
    AND title = 'المحاضرة 14 — الأليلات المتعددة ولون الفراء في الأرانب'
);
