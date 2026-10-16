-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 5 · Lecture 9
-- Seed the supplied lethal alleles MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch5-lec9-exam',
  'المحاضرة 9 — الأليلات المميتة',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'ما هو التوصيف العلمي الدقيق للأليلات المميتة (Lethal Alleles) حسب نص كتاب الأحياء؟',
      'choices', jsonb_build_array('أليلات تؤدي إلى زيادة كفاءة المايتوكوندريا وإنتاج طاقة ATP.', 'هو الأليل الذي يؤدي تعبيره إلى هلاك الفرد الذي يرثه بصورة نقية، سواء كان سائداً أو متنحياً.', 'أليلات تنقل عامل الخصوبة البلازميدي عبر جسر الاقتران البكتيري.', 'جينات تفرز إنزيمات هيدروليكية تؤدي إلى التحلل الذاتي للنواة البينية.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الطراز الوراثي والمصير البيولوجي للفئران الصفراء التي تموت في مراحل جنينية مبكرة حسب المنهج؟',
      'choices', jsonb_build_array('Yy، وتعيش بصورة طبيعية.', 'YY، أي الفئران الصفراء نقية العامل، وتموت داخل الرحم.', 'yy، وتموت نتيجة نقص التغذية.', 'YᴿYᴿ، وتتحول إلى فئران رمادية.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'عند تضريب فئران صفراء هجينة (Yy) فيما بينها، ما النسبة المظهرية للأفراد الحية التي تولد وتنمو؟',
      'choices', jsonb_build_array('3 أصفر : 1 رمادي', '2 أصفر هجين (Yy) : 1 رمادي طبيعي (yy)، بنسبة 2:1 بسبب موت الطراز YY.', '1 أصفر نقي : 2 أصفر هجين : 1 رمادي', '100% فئران رمادية نقية'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما المرض البشري الوراثي الذي يمثل أوضح مثال على الأليلات المميتة المتنحية في الإنسان؟',
      'choices', jsonb_build_array('عمى الألوان وعيوب القلب الخلقية', 'فقر الدم المنجلي (Sickle-cell anemia)', 'مرض السكري المزمن', 'متلازمة داون الكروموسومية'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الطراز الوراثي للشخص الذي يموت عادة في عمر المراهقة نتيجة إصابته بفقر الدم المنجلي النقي حسب المنهج؟',
      'choices', jsonb_build_array('HbᴬHbᴬ', 'HbˢHbˢ، إذ يكون مصاباً بفقر دم منجلي شديد ويموت في سن مبكرة.', 'HbᴬHbˢ', 'ss'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما هو التوصيف الطبي والمظهري للشخص الذي يحمل الطراز الوراثي (HbᴬHbˢ)؟',
      'choices', jsonb_build_array('سليم تماماً ولا يحمل أي عوامل وراثية للمرض.', 'شخص سليم مظهرياً، لكنه حامل لمورث فقر الدم المنجلي، وتظهر خلاياه بشكل منجلي عند انخفاض تركيز الأكسجين.', 'يموت في مراحل جنينية مبكرة داخل الرحم.', 'يصاب بالعمى والصمم نتيجة عيوب خلقية وراثية.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'أعطِ مثالاً آخر من كتاب الأحياء على أليل مميت سائد يؤدي إلى موت الكلاب النقية الناتجة.',
      'choices', jsonb_build_array('أليل قصر الأطراف في دجاج الزينة', 'أليل انعدام الشعر في الكلاب المكسيكية الملساء (H)، إذ يموت الطراز النقي السائد (HH).', 'أليل شكل القرنة المتخصر في نبات البازلاء', 'أليل الفراشة الإسبانية ذات 380 كروموسوماً'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch5-lec9-exam'
    AND title = 'المحاضرة 9 — الأليلات المميتة'
);
