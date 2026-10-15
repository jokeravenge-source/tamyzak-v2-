-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 3 · Lecture 25
-- Seed the supplied insect reproduction (part two) and metamorphosis MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch3-lec25-exam',
  'المحاضرة 25 — التكاثر في الحشرات - الجزء الثاني',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'أين تلتقي الحيوانات المنوية بالبيضة لإتمام عملية الإخصاب في الحشرات؟',
      'choices', jsonb_build_array('خارج جسم الأنثى في الوسط البيئي المحيط.', 'داخل المستودع المنوي مباشرة قبل نضج البيوض.', 'أثناء مرور البيوض الناضجة في المهبل، حيث تخرج النطف من المستودع المنوي لتخصيبها عبر فتحة قشرة البيضة.', 'داخل نبيبات المبيض العليا.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'ما الوصف الصحيح لمعظم الحشرات من حيث طريقة تكاثرها وإنتاجها للأفراد؟',
      'choices', jsonb_build_array('حيوانات ولودة تلد صغاراً مكتملي النمو دائماً.', 'حيوانات بيوضة (Oviparous)، حيث تضع بيوضها المخصبة في أماكن محددة بفضل آلة وضع البيض.', 'حيوانات تتكاثر لاجنسياً بالانشطار الثنائي المستعرض.', 'كائنات تعتمد بالكامل على التكاثر الخنثي بالإخصاب الذاتي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ماذا تسمى الحشرات التي تحتفظ بالبيوض المخصبة داخل جسمها (في المهبل) حتى يتطور الجنين ويتفقس داخلها لتلد صغاراً؟',
      'choices', jsonb_build_array('حشرات بيوضة اعتيادية.', 'حشرات بيوضة ولودة (Ovoviviparous).', 'حشرات عذرية دائمة.', 'حشرات عقيمة.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'اعطِ مثالاً من المنهج على حشرات توصف بأنها "بيوضة ولودة"؟',
      'choices', jsonb_build_array('صرصر الحقل والجراد الصحراوي.', 'ذبابة اللحم وبعض أنواع المن.', 'نحل العسل والنمل الأبيض.', 'الفراشات الملونة والبعوض.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الاسم العلمي للتغيرات المظهرية والتركيبية التي تمر بها الحشرة بعد التفقس حتى تصل إلى الطور البالغ؟',
      'choices', jsonb_build_array('التكاثر العذري المتكرر.', 'التحول (Metamorphosis).', 'إعادة الخلط الوراثي.', 'الانقسام غير المباشر (الخيطي).'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'مما تتألف مراحل "التحول التدريجي أو الناقص" (Incomplete metamorphosis) في الحشرات؟',
      'choices', jsonb_build_array('بيضة ➔ يرقنة (حورية / Nymph) ➔ حشرة بالغة (تفتقد الحورية للأجنحة وتكون غير ناضجة جنسياً).', 'بيضة ➔ عذراء داخل شرنقة ➔ حشرة بالغة.', 'سليفة نطفة ➔ أرومة نطفة ➔ نطفة ناضجة.', 'بيضة مخصبة ➔ انشطار ثنائي ➔ فرد كامل.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'اعطِ مثالاً من المنهج على حشرات تمر بـ "التحول التدريجي أو الناقص"؟',
      'choices', jsonb_build_array('الفراشات والبعوض والذباب المنزلي.', 'الجراد والصرصر والبق واليعسوب.', 'نحل العسل والنمل والأنافيليس.', 'خنافس السجاد وعثة الملابس.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'مما تتألف مراحل "التحول الكامل" (Complete metamorphosis) في الحشرات؟',
      'choices', jsonb_build_array('بيضة ➔ يرقانة (Larva) ➔ عذراء (Pupa) داخل شرنقة ➔ حشرة بالغة (Imago).', 'بيضة ➔ حورية ➔ حشرة بالغة مباشرة دون شرنقة.', 'خلية جرثومية أولية ➔ حويصلة مبيضية ➔ بيضة ناضجة.', 'مدمج خلوي ➔ حافظة أبواغ ➔ بوغ نامٍ.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'اعطِ مثالاً من المنهج على حشرات تمر بـ "التحول الكامل"؟',
      'choices', jsonb_build_array('الجراد والصرصر والنمل الأبيض.', 'الفراش، الخنافس، الذباب المنزلي، والبعوض.', 'قمل الرأس والبراغيث القافزة.', 'سوس الخشب وبق الفراش.'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch3-lec25-exam'
    AND title = 'المحاضرة 25 — التكاثر في الحشرات - الجزء الثاني'
);
