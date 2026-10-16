-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 5 · Lecture 5
-- Seed the supplied dihybrid cross and independent assortment MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch5-lec5-exam',
  'المحاضرة 5 — التهجين الثنائي وقانون التوزيع المستقل',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'ما هو التوصيف العلمي الدقيق لعملية التهجين الثنائي (Dihybrid Cross) حسب نص كتاب الأحياء؟',
      'choices', jsonb_build_array('تضريب يتضمن دراسة زوج واحد من الصفات المتضادة للفرد نفسه.', 'تضريب وراثي يتضمن دراسة زوجين من الصفات المتضادة والمستقلة في الوقت نفسه، مثل لون البذور وشكلها معاً.', 'اندماج نواتين ذكريتين مع نواتين قطبيتين داخل الكيس الجنيني.', 'انتقال عامل الخصوبة البلازميدي عبر جسر الاقتران البكتيري.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الاسم العلمي الذي يُطلق على قانون مندل الثاني في الوراثة؟',
      'choices', jsonb_build_array('قانون الانعزال', 'قانون التوزيع المستقل (Law of Independent Assortment)', 'قانون النفاذ الجيني', 'قانون السيادة غير التامة'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الذي ينص عليه قانون التوزيع المستقل، قانون مندل الثاني، نصاً في كتاب الأحياء؟',
      'choices', jsonb_build_array('تنعزل العوامل الوراثية الزوجية عند تكوين الأمشاج ثم تعود لتندمج عشوائياً.', 'إن أزواج العوامل الوراثية المنعزلة تتوزع بصورة مستقلة عن بعضها بعضاً خلال عملية تكوين الأمشاج.', 'تندمج الصفات المتباينة لإنتاج طراز مظهري وسطي جديد دائماً.', 'تختفي الصفات المتنحية تماماً من أفراد الجيل الثاني بفعل الأيض الخلوي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'عند تضريب نبات بازلاء أصفر البذور مستديرها نقي (GGWW) مع نبات أخضر البذور مجعدها (ggww)، ما الطراز المظهري لجميع أفراد الجيل الأول (F₁)؟',
      'choices', jsonb_build_array('100% أخضر مجعد البذور.', '100% أصفر مستدير البذور، هجين لكلا الصفتين (GgWw).', '50% أصفر مستدير و50% أخضر مجعد.', 'ثمار كاذبة عديمة البذور بفعل الإثمار العذري.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما هي النسبة المظهرية الشهيرة الناتجة في الجيل الثاني (F₂) عند ترك نباتات التهجين الثنائي الهجينة (GgWw) تلقح نفسها ذاتياً حسب قانون التوزيع المستقل؟',
      'choices', jsonb_build_array('3 : 1', '9 : 3 : 3 : 1', '1 : 2 : 1', '1 : 1 : 1 : 1'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الأداة أو الشبكة الهندسية المستخدمة لتوضيح احتمالات الطرز الوراثية والمظهرية وتسهيل معرفتها في التضريبات المعقدة كالتهجين الثنائي؟',
      'choices', jsonb_build_array('الصفيحة الخلوية', 'مربع بانيت (Punnett Square)', 'الثالوس الأولي', 'جسر الاقتران البروتوبلازمي'),
      'answer_index', 1
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch5-lec5-exam'
    AND title = 'المحاضرة 5 — التهجين الثنائي وقانون التوزيع المستقل'
);
