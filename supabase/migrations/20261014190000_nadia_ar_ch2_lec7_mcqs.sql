-- Nadia Al-Nuaimi · Arabic curriculum · Chapter 2 · Lecture 7
-- Seed the supplied phloem tissue MCQs as a dedicated practice set.
INSERT INTO public.teacher_topic_mcqs (
  teacher_id,
  topic_key,
  title,
  questions
)
SELECT
  'nadia-al-nuaimy',
  'nadia-ar-ch2-lec7-exam',
  'المحاضرة 7 — نسيج اللحاء',
  jsonb_build_array(
    jsonb_build_object(
      'question', 'يُعد نسيج اللحاء أحد أقسام:',
      'choices', jsonb_build_array('النسيج الأساس.', 'النسيج الوعائي.', 'نسيج البشرة.', 'النسيج المرستيمي.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'ما الخلايا التي تكوّن نسيج اللحاء؟',
      'choices', jsonb_build_array('الأوعية الخشبية والقصيبات وألياف الخشب وبرنكيما الخشب.', 'الأنابيب المنخلية والقصيبات وألياف اللحاء وبرنكيما الخشب.', 'الأوعية الخشبية والخلايا المرافقة وألياف الخشب وبرنكيما اللحاء.', 'الأنابيب المنخلية والخلايا المرافقة وألياف اللحاء وبرنكيما اللحاء.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'ما وظيفة خلايا نسيج اللحاء باستثناء الألياف؟',
      'choices', jsonb_build_array('نقل المواد الغذائية المنتجة في الورقة.', 'نقل الماء والمواد المذابة «المعادن».', 'الحماية والسيطرة على تبادل الغازات.', 'إنتاج خلايا جديدة تضيف للنبات طولًا وسمكًا.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'تتخصص خلايا نسيج اللحاء بنقل المواد الغذائية المنتجة في الورقة، باستثناء:',
      'choices', jsonb_build_array('الأنابيب المنخلية.', 'الخلايا المرافقة.', 'ألياف اللحاء.', 'برنكيما اللحاء.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'ما وظيفة ألياف اللحاء؟',
      'choices', jsonb_build_array('الإسناد والتقوية.', 'نقل المواد الغذائية المنتجة في الورقة.', 'نقل الماء والمواد المذابة.', 'الحماية والسيطرة على تبادل الغازات.'),
      'answer_index', 0
    ),
    jsonb_build_object(
      'question', 'تتخصص خلايا نسيج اللحاء بنقل المواد الغذائية المنتجة في _______ باستثناء الألياف.',
      'choices', jsonb_build_array('الجذور.', 'الساق.', 'الأشعة اللبية.', 'الورقة.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'أي زوج من الآتي يدخل ضمن تركيب نسيج اللحاء؟',
      'choices', jsonb_build_array('الأوعية الخشبية والقصيبات.', 'الأنابيب المنخلية والخلايا المرافقة.', 'ألياف الخشب وبرنكيما الخشب.', 'الكامبيوم الوعائي والكامبيوم الفليني.'),
      'answer_index', 1
    ),
    jsonb_build_object(
      'question', 'يتضمن عمل نسيج اللحاء نقل الكربوهيدرات من وإلى:',
      'choices', jsonb_build_array('الأوعية الخشبية.', 'القصيبات.', 'الأنابيب المنخلية.', 'ألياف الخشب.'),
      'answer_index', 2
    ),
    jsonb_build_object(
      'question', 'أي مجموعة تمثل وظائف نسيج اللحاء؟',
      'choices', jsonb_build_array('نقل الماء والمعادن، والخزن، والإسناد والتقوية.', 'البناء الضوئي، والخزن والتنفس، والإسناد.', 'الحماية، وتنظيم تبادل الغازات، وامتصاص الماء والأملاح المذابة.', 'نقل الجزيئات العضوية داخل جسم النبات، ونقل الكربوهيدرات من وإلى الأنابيب المنخلية، والإسناد والخزن.'),
      'answer_index', 3
    ),
    jsonb_build_object(
      'question', 'ما الذي تنقله الأوعية والقصيبات في الخشب، وما الذي تنقله خلايا اللحاء باستثناء الألياف، على الترتيب؟',
      'choices', jsonb_build_array('الماء والمواد المذابة — المواد الغذائية المنتجة في الورقة.', 'المواد الغذائية المنتجة في الورقة — الماء والمواد المذابة.', 'الماء والمواد المذابة — الماء والمواد المذابة.', 'المواد الغذائية المنتجة في الورقة — المواد الغذائية المنتجة في الورقة.'),
      'answer_index', 0
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_mcqs
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-ar-ch2-lec7-exam'
    AND title = 'المحاضرة 7 — نسيج اللحاء'
);
