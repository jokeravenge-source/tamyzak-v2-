-- Nadia Al-Nuaimi · Distinguished curriculum · Chapter 3 · Lecture 14
-- Publish the supplied flower-structure notes as a notes-only lesson.
INSERT INTO public.teacher_topic_videos (
  teacher_id,
  topic_key,
  youtube_url,
  video_id,
  title,
  transcript,
  notes_parts,
  approved
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch3-lec14-study',
  '',
  NULL,
  'المحاضرة 14 — الزهرة: تعريفها وأجزاؤها ووظائفها',
  NULL,
  jsonb_build_array(
    jsonb_build_object(
      'title', 'الزهرة: تعريفها وأجزاؤها ووظائفها',
      'notes', $lecture_notes$
# المحاضرة الرابعة عشرة – الزهرة (Flower): تعريفها وأجزاؤها ووظائفها

## 🧭 نظرة عامة سريعة

تتناول هذه المحاضرة أعلى مستوى من تطور النباتات (Plant Evolution)، وهو النباتات الزهرية (Flowering Plants). تعتمد النباتات الزهرية (Flowering Plants) في التكاثر (Reproduction) على الزهرة (Flower)، ولذلك تُعد الزهرة (Flower) عضواً تكاثرياً (Reproductive Organ) متخصصاً في التكاثر الجنسي (Sexual Reproduction). تشرح المحاضرة أصل الزهرة (Flower Origin)، وتعريفها، وأجزاءها الأساسية، والفرق بين الأجزاء المرتبطة مباشرة بالتكاثر والأجزاء المساعدة، ثم تفصل تركيب الكأس (Calyx)، والتويج (Corolla)، والسداة (Stamen)، والمدقة (Pistil)، مع وظائف كل جزء وأمثلة عددية مهمة.

> ⚠️ **مهم وزارياً:** احفظ تعريف الزهرة (Flower)، أصلها من البرعم (Bud)، تقسيم أجزائها إلى أجزاء أساسية وأجزاء مساعدة، وظائف الكأس (Calyx) والتويج (Corolla)، وتركيب السداة (Stamen) والمدقة (Pistil) مع الرسوم.

## 📚 المفاهيم والشرح التفصيلي

### 1. النباتات الزهرية (Flowering Plants)

- النباتات الزهرية (Flowering Plants) هي أعلى مستوى من التطور (Highest Level of Evolution) في مملكة النباتات (Kingdom Plantae) بحسب تسلسل المحاضرات.
- وصلت النباتات الزهرية (Flowering Plants) إلى مرحلة لم تعد فيها بحاجة إلى الماء (Water) بالطريقة التي تحتاجها الحزازيات (Mosses) في وصول المشيج الذكري (Male Gamete) إلى المشيج الأنثوي (Female Gamete).
- تعتمد النباتات الزهرية (Flowering Plants) في التكاثر (Reproduction) على الزهرة (Flower).
- التكاثر الذي تقوم به الزهرة (Flower) هو التكاثر الجنسي (Sexual Reproduction).

### 2. تعريف الزهرة (Flower)

الزهرة (Flower) هي غصن متخصص (Specialized Branch) تحورت أوراقه (Modified Leaves) وتخصصت لأداء وظيفة التكاثر الجنسي (Sexual Reproduction).

ويتضمن التعريف النقاط الآتية:

1. الزهرة (Flower) غصن (Branch)، وليست مجموعة أوراق عادية (Ordinary Leaves).
2. هذا الغصن متخصص (Specialized) وليس كأي غصن آخر في النبات (Plant).
3. الأوراق الموجودة عليه متحورة (Modified) ومختلفة عن بقية أوراق النبات (Plant Leaves).
4. تحورت هذه الأوراق (Modified Leaves) لتؤدي وظيفة التكاثر الجنسي (Sexual Reproduction).
5. بعد حدوث التكاثر الجنسي (Sexual Reproduction) تتكون الثمار (Fruits) والبذور (Seeds).

> ⚠️ **فراغ مهم:** الزهرة (Flower) عبارة عن غصن متخصص (Specialized Branch) يحمل أوراقاً متحورة (Modified Leaves) لأداء التكاثر الجنسي (Sexual Reproduction).

### 3. أصل الزهرة (Flower Origin)

- تنشأ الزهرة (Flower) من البرعم (Bud).
- البرعم (Bud) الذي يعطي زهرة (Flower) ليس برعماً عادياً؛ بل هو برعم متخصص (Specialized Bud).
- الأوراق التي يكوّنها البرعم الزهري (Floral Bud) تختلف عن الأوراق الخضراء العادية (Ordinary Green Leaves).
- الأوراق العادية (Ordinary Leaves) تقوم بالبناء الضوئي (Photosynthesis)، أما الأوراق المتحورة (Modified Leaves) في الزهرة (Flower) فتؤدي وظيفة التكاثر الجنسي (Sexual Reproduction).

### 4. ترتيب أجزاء الزهرة (Flower Parts Arrangement)

تكون أجزاء الزهرة (Flower Parts) متقاربة ومجتمعة من نقطة واحدة أو منطقة قريبة، ولا تظهر على هيئة غصن طويل تتوزع عليه الأجزاء بمسافات كبيرة.

في الزهرة (Flower) نجد بصورة متتابعة ومتقاربة:

1. الأوراق الكأسية (Sepals).
2. الأوراق التويجية (Petals).
3. الأجزاء الذكرية (Male Parts).
4. الجزء الأنثوي (Female Part).

التقارب (Compact Arrangement) ضروري حتى تتم عملية التكاثر الجنسي (Sexual Reproduction) بصورة كاملة وتنتج الثمار (Fruits) والبذور (Seeds).

> ⚠️ **ملاحظة رسم:** لا تُرسم أجزاء الزهرة (Flower Parts) على مسافات كبيرة كأن كل جزء في غصن منفصل؛ الأجزاء متقاربة ومن نقطة واحدة أو منطقة قريبة.

## 5. أقسام أجزاء الزهرة (Flower Parts Categories)

تنقسم أجزاء الزهرة (Flower Parts) إلى مجموعتين رئيسيتين:

### أ. الأجزاء الأساسية أو المرتبطة مباشرة بالتكاثر (Essential/Directly Related Parts)

هذه الأجزاء لا بد من وجودها لإتمام التكاثر (Reproduction)، وهي:

1. السداة أو العضو الذكري (Stamen/Male Part).
2. المدقة أو العضو الأنثوي (Pistil/Female Part).

هذه الأجزاء مرتبطة مباشرة (Directly Related) بالتكاثر؛ لأن السداة (Stamen) تنتج حبوب اللقاح (Pollen Grains)، والمدقة (Pistil) تحتوي الجزء الأنثوي الذي يستقبل حبوب اللقاح (Pollen Grains) ويضم المبيض (Ovary).

### ب. الأجزاء المساعدة أو غير المرتبطة مباشرة (Accessory/Indirectly Related Parts)

هذه الأجزاء تساعد في عملية التكاثر (Reproduction) بصورة غير مباشرة، ووجودها أو عدم وجودها لا يؤثر بصورة أساسية على إنتاج الأمشاج (Gametes)، وهي:

1. الكأس (Calyx).
2. التويج (Corolla).

## 6. الكأس (Calyx)

### التركيب

- الكأس (Calyx) مجموعة من الأوراق الكأسية (Sepals).
- الأوراق الكأسية (Sepals) تكون عادة خضراء (Green).
- تكون الأوراق الكأسية (Sepals) في الجزء الخارجي أو السفلي (Outer/Lower Part) من الزهرة (Flower).

### الوظيفة

- وظيفة الكأس (Calyx) هي الحماية (Protection).
- يحمي البرعم (Bud) قبل أن يأخذ الشكل الكامل للزهرة (Flower).
- تكون الحماية قبل تفتح الزهرة (Flower) واكتمال شكلها.

> ⚠️ **تعليل مهم:** لماذا تكون الأوراق الكأسية (Sepals) خضراء؟ لأنها جزء خارجي واقٍ (Protective Outer Part) يحمي البرعم (Bud) قبل اكتمال الزهرة (Flower)، كما ورد في شرح المحاضرة.

### الموقع

- يقع الكأس (Calyx) في الجزء السفلي (Lower Part) من الزهرة (Flower).
- في بعض الكتب قد يرد وصف الموقع على أنه الجزء السفلي من الزهرة (Lower Part of Flower)، وهذا هو الوصف المطلوب اعتماده في هذا الجزء.

## 7. التويج (Corolla)

### التركيب

- التويج (Corolla) مجموعة من الأوراق التويجية (Petals).
- تختلف الأوراق التويجية (Petals) عن الأوراق الكأسية (Sepals) في اللون والشكل والحجم.
- تكون الأوراق التويجية (Petals) ملونة (Colored) غالباً، وقد تختلف ألوانها وأشكالها بين النباتات (Plants).

### الوظيفة

- تساعد الأوراق التويجية (Petals) في جذب الحشرات (Insect Attraction).
- تنجذب الحشرات (Insects) إلى الزهرة (Flower)، ثم تساعد في نقل حبوب اللقاح (Pollen Grains) من زهرة إلى أخرى أو من نبات إلى آخر.
- يؤدي ذلك إلى المساعدة في تلقيح النباتات (Plant Pollination) وإتمام التكاثر الجنسي (Sexual Reproduction).

> ⚠️ **تنبيه منهجي:** ذكرت المحاضرة وظيفة جذب الحشرات (Insect Attraction) بوصفها وظيفة مهمة للأوراق التويجية (Petals)، حتى مع وجود إشارة إلى أن هذه الوظيفة حُذفت من بعض نسخ المنهج؛ لذلك يجب حفظها كما شرحتها الأستاذة لاحتمال ورودها وزارياً.

### عدد الأوراق التويجية (Number of Petals) مقارنة بالأوراق الكأسية (Sepals)

قد يكون عدد الأوراق التويجية (Petals):

1. مساوياً لعدد الأوراق الكأسية (Sepals)؛ أي **Equal**.
2. مضاعفاً أو أكثر من عدد الأوراق الكأسية (Sepals)؛ أي **Multiple/More Than**.

#### أمثلة مهمة

- السوسن (Iris): عدد الأوراق التويجية (Petals) يساوي عدد الأوراق الكأسية (Sepals).
- الورد (Rose): عدد الأوراق التويجية (Petals) أكبر أو مضاعف لعدد الأوراق الكأسية (Sepals).

> ⚠️ **مهم وزارياً:** إذا سُئلت عن زهرة (Flower) عدد أوراقها التويجية (Petals) مساوٍ لعدد أوراقها الكأسية (Sepals)، فالجواب السوسن (Iris). وإذا سُئلت عن زهرة (Flower) أوراقها التويجية (Petals) أكثر أو مضاعفة للأوراق الكأسية (Sepals)، فالجواب الورد (Rose).

## 8. السداة (Stamen) – العضو الذكري (Male Part)

السداة (Stamen) هي الجزء الذكري (Male Part) في الزهرة (Flower)، وتتكون من جزأين أساسيين:

1. المتك (Anther).
2. الخيط أو الخويط (Filament).

### أ. المتك (Anther)

- المتك (Anther) تركيب أسطواني الشكل (Cylindrical Structure).
- المتك (Anther) يشبه كيساً أو كيسين يحتويان حبوب اللقاح (Pollen Grains).
- توجد حبوب اللقاح (Pollen Grains) داخل أكياس أو حجرات المتك (Anther Sacs/Chambers).
- حبوب اللقاح (Pollen Grains) تمثل المادة التناسلية الذكرية (Male Reproductive Material).

### ب. الخيط أو الخويط (Filament)

- الخيط (Filament) تركيب يحمل المتك (Anther).
- وظيفة الخيط (Filament) تثبيت المتك (Anther) ورفعه.
- قد تكون الخيوط (Filaments) منفصلة أو حرة (Free/Separate).
- وقد تكون متحدة أو ملتحمة (Fused/Bound) بحسب نوع الزهرة (Flower).

### ترتيب السداة (Stamen)

\[
\text{Filament} \rightarrow \text{يحمل} \rightarrow \text{Anther} \rightarrow \text{يحتوي} \rightarrow \text{Pollen Grains}
\]

> ⚠️ **فراغات مهمة:** السداة (Stamen) = المتك (Anther) + الخيط (Filament)، والمتك (Anther) يحتوي حبوب اللقاح (Pollen Grains)، والخيط (Filament) يحمل المتك (Anther).

## 9. المدقة (Pistil) – العضو الأنثوي (Female Part)

المدقة (Pistil) هي الجزء الأنثوي (Female Part) في الزهرة (Flower)، وتتكون من ثلاثة أجزاء:

1. المبيض (Ovary).
2. القلم أو القلم الواصل (Style).
3. الميسم (Stigma).

### أ. المبيض (Ovary)

- المبيض (Ovary) هو الجزء السفلي (Lower Part) من المدقة (Pistil).
- يحتوي المبيض (Ovary) البويضات (Ovules).
- ترتبط البويضات (Ovules) داخله بتركيب يشبه الحبل القصير يسمى الحبل السري أو السويقة (Funicle/Short Cord)، كما ورد في الرسم والشرح.
- يمثل المبيض (Ovary) الجزء الذي توجد فيه التراكيب الأنثوية (Female Structures) قبل تكوّن البذور (Seeds).

### ب. القلم (Style)

- القلم (Style) تركيب أسطواني (Cylindrical Structure).
- يكون رقيقاً (Thin) ومجوفاً (Hollow).
- يقع بين المبيض (Ovary) والميسم (Stigma).
- وظيفة القلم (Style) ربط المبيض (Ovary) بالميسم (Stigma).

### ج. الميسم (Stigma)

- الميسم (Stigma) هو الجزء العلوي (Upper Part) من المدقة (Pistil).
- يكون الميسم (Stigma) منتفخاً (Swollen).
- يكون مغطى بمادة لزجة (Sticky Substance).
- تساعد المادة اللزجة (Sticky Substance) على تثبيت حبوب اللقاح (Pollen Grains) عندما تصل إلى الميسم (Stigma).
- تمنع اللزوجة (Stickiness) حبوب اللقاح (Pollen Grains) من التطاير مع الهواء (Air) بعد وصولها.

### ترتيب المدقة (Pistil)

\[
\text{Ovary} \rightarrow \text{Style} \rightarrow \text{Stigma}
\]

أو من الأسفل إلى الأعلى:

1. المبيض (Ovary).
2. القلم (Style).
3. الميسم (Stigma).

> ⚠️ **فراغات مهمة:** القلم (Style) يربط المبيض (Ovary) بالميسم (Stigma)، والميسم (Stigma) منتفخ ولزج ويثبت حبوب اللقاح (Pollen Grains).

## 10. الرسم العام للزهرة (General Flower Diagram)

عند رسم الزهرة (Flower) يجب إظهار الأجزاء الآتية:

1. الساق أو الفرع (Stem/Branch).
2. التخت الزهري (Receptacle)، وهو الجزء المنتفخ الذي تحمل عليه أجزاء الزهرة (Flower Parts).
3. الأوراق الكأسية (Sepals) أو الكأس (Calyx).
4. الأوراق التويجية (Petals) أو التويج (Corolla).
5. السداة (Stamen)، وتتكون من المتك (Anther) والخيط (Filament).
6. المدقة (Pistil)، وتتكون من المبيض (Ovary)، والقلم (Style)، والميسم (Stigma).

## 11. ترتيب الأجزاء بحسب علاقتها بالتكاثر (Reproductive Relationship)

### الأجزاء الأساسية (Essential Parts)

- السداة (Stamen): تنتج حبوب اللقاح (Pollen Grains) التي تمثل الجزء الذكري (Male Part).
- المدقة (Pistil): تحتوي المبيض (Ovary) والبويضات (Ovules)، وتمثل الجزء الأنثوي (Female Part).

### الأجزاء المساعدة (Accessory Parts)

- الكأس (Calyx): يحمي البرعم (Bud) قبل اكتمال الزهرة (Flower).
- التويج (Corolla): يساعد على جذب الحشرات (Insects) لتسهيل التلقيح (Pollination)، بحسب شرح المحاضرة.

## 📖 التعريفات والمصطلحات

- **النباتات الزهرية (Flowering Plants):** نباتات متطورة تعتمد في التكاثر الجنسي (Sexual Reproduction) على الزهرة (Flower).
- **الزهرة (Flower):** غصن متخصص (Specialized Branch) تحورت أوراقه (Modified Leaves) لأداء وظيفة التكاثر الجنسي (Sexual Reproduction)، وينتج بعد ذلك الثمار (Fruits) والبذور (Seeds).
- **البرعم (Bud):** تركيب ينشأ منه الغصن أو الزهرة (Flower)، ويكون البرعم الزهري (Floral Bud) متخصصاً.
- **الأجزاء الأساسية (Essential Parts):** أجزاء الزهرة (Flower Parts) المرتبطة مباشرة بالتكاثر (Reproduction)، وهي السداة (Stamen) والمدقة (Pistil).
- **الأجزاء المساعدة (Accessory Parts):** أجزاء تساعد في التكاثر (Reproduction) بصورة غير مباشرة، وهي الكأس (Calyx) والتويج (Corolla).
- **الكأس (Calyx):** مجموعة الأوراق الكأسية (Sepals) الخضراء (Green) التي تحمي البرعم (Bud) قبل تفتح الزهرة (Flower).
- **الورقة الكأسية (Sepal):** ورقة متحورة (Modified Leaf) تكوّن الكأس (Calyx) وتؤدي وظيفة الحماية (Protection).
- **التويج (Corolla):** مجموعة الأوراق التويجية (Petals)، وتساعد ألوانها وأشكالها على جذب الحشرات (Insect Attraction).
- **الورقة التويجية (Petal):** ورقة متحورة (Modified Leaf) تكوّن التويج (Corolla) وتساعد في جذب الحشرات (Insects) للتلقيح (Pollination).
- **السداة (Stamen):** العضو الذكري (Male Part) في الزهرة (Flower)، وتتكون من المتك (Anther) والخيط (Filament).
- **المتك (Anther):** تركيب أسطواني أو كيسي (Cylindrical/Sac-Like Structure) يحتوي حبوب اللقاح (Pollen Grains).
- **الخيط أو الخويط (Filament):** تركيب يحمل المتك (Anther) ويثبته، وقد يكون حراً (Free) أو ملتحماً (Fused).
- **حبوب اللقاح (Pollen Grains):** تراكيب تناسلية ذكرية (Male Reproductive Structures) توجد داخل المتك (Anther).
- **المدقة (Pistil):** العضو الأنثوي (Female Part) في الزهرة (Flower)، وتتكون من المبيض (Ovary) والقلم (Style) والميسم (Stigma).
- **المبيض (Ovary):** الجزء السفلي (Lower Part) من المدقة (Pistil)، ويحتوي البويضات (Ovules).
- **البويضة (Ovule):** تركيب أنثوي (Female Structure) يوجد داخل المبيض (Ovary)، ويتطور لاحقاً ضمن عملية التكاثر (Reproduction).
- **الحبل السري أو السويقة (Funicle):** تركيب قصير يشبه الحبل (Short Cord-Like Structure) يربط البويضة (Ovule) داخل المبيض (Ovary) بحسب الرسم والشرح.
- **القلم (Style):** تركيب أسطواني رقيق مجوف (Thin Hollow Cylindrical Structure) يربط المبيض (Ovary) بالميسم (Stigma).
- **الميسم (Stigma):** الجزء العلوي (Upper Part) من المدقة (Pistil)، يكون منتفخاً (Swollen) ولزجاً (Sticky) ليثبت حبوب اللقاح (Pollen Grains).
- **التخت الزهري (Receptacle):** الجزء المنتفخ (Swollen Part) الذي تحمل عليه أجزاء الزهرة (Flower Parts).
- **التلقيح (Pollination):** انتقال حبوب اللقاح (Pollen Grains) من زهرة (Flower) إلى أخرى أو من نبات (Plant) إلى آخر، وتساعد الحشرات (Insects) في إتمامه بحسب المحاضرة.

## 🔢 القوانين / الصيغ / القواعد

لا تتضمن المحاضرة قوانين حسابية، لكنها تتضمن القواعد الآتية:

### قاعدة أجزاء الزهرة (Flower Parts Rule)

\[
\text{Flower} = \text{Calyx} + \text{Corolla} + \text{Stamen} + \text{Pistil}
\]

### قاعدة السداة (Stamen)

\[
\text{Stamen} = \text{Anther} + \text{Filament}
\]

### قاعدة المدقة (Pistil)

\[
\text{Pistil} = \text{Ovary} + \text{Style} + \text{Stigma}
\]

### قاعدة عدد الأوراق التويجية (Petals)

- قد يكون عدد الأوراق التويجية (Petals) مساوياً لعدد الأوراق الكأسية (Sepals): السوسن (Iris).
- وقد يكون عدد الأوراق التويجية (Petals) مضاعفاً أو أكبر من عدد الأوراق الكأسية (Sepals): الورد (Rose).

## 🧪 المسائل والأمثلة المحلولة

### مثال 1: تعريف الزهرة (Flower)

- **المعطى:** طُلب تعريف الزهرة (Flower).
- **الإجابة:** الزهرة (Flower) غصن متخصص (Specialized Branch) تحورت أوراقه (Modified Leaves) لأداء التكاثر الجنسي (Sexual Reproduction)، وبعده تتكون الثمار (Fruits) والبذور (Seeds).

### مثال 2: تحديد أصل الزهرة (Flower Origin)

- **المعطى:** طُلب تحديد التركيب الذي تنشأ منه الزهرة (Flower).
- **القاعدة:** الزهرة (Flower) تنشأ من برعم متخصص (Specialized Bud).
- **الناتج:** البرعم (Bud).

### مثال 3: تحديد أجزاء السداة (Stamen)

- **المعطى:** سُئل عن العضو الذكري (Male Part) في الزهرة (Flower).
- **الخطوات:**
  1. العضو الذكري (Male Part) هو السداة (Stamen).
  2. تتكون السداة (Stamen) من المتك (Anther) والخيط (Filament).
  3. يحتوي المتك (Anther) حبوب اللقاح (Pollen Grains).
  4. يحمل الخيط (Filament) المتك (Anther).
- **الناتج:** السداة (Stamen) = المتك (Anther) + الخيط (Filament).

### مثال 4: تحديد أجزاء المدقة (Pistil)

- **المعطى:** سُئل عن العضو الأنثوي (Female Part) في الزهرة (Flower).
- **الخطوات:**
  1. العضو الأنثوي (Female Part) هو المدقة (Pistil).
  2. تتكون المدقة (Pistil) من المبيض (Ovary)، والقلم (Style)، والميسم (Stigma).
  3. يوجد المبيض (Ovary) في الأسفل، والقلم (Style) في الوسط، والميسم (Stigma) في الأعلى.
- **الناتج:** المدقة (Pistil) = المبيض (Ovary) + القلم (Style) + الميسم (Stigma).

### مثال 5: اختيار الزهرة بحسب عدد الأوراق (Leaves)

- **المعطى:** زهرة (Flower) عدد أوراقها التويجية (Petals) يساوي عدد أوراقها الكأسية (Sepals).
- **الناتج:** السوسن (Iris).

- **المعطى:** زهرة (Flower) عدد أوراقها التويجية (Petals) مضاعف أو أكبر من عدد أوراقها الكأسية (Sepals).
- **الناتج:** الورد (Rose).

## ⚠️ تنبيهات وأخطاء شائعة (ملاحظات وزارية)

> ⚠️ **1.** الزهرة (Flower) عضو تكاثري (Reproductive Organ) يقوم بالتكاثر الجنسي (Sexual Reproduction)، وليست مجرد مجموعة أوراق (Leaves).

> ⚠️ **2.** تعريف الزهرة (Flower): غصن متخصص (Specialized Branch) تحورت أوراقه (Modified Leaves) لأداء وظيفة التكاثر الجنسي (Sexual Reproduction).

> ⚠️ **3.** أصل الزهرة (Flower Origin) هو البرعم المتخصص (Specialized Bud).

> ⚠️ **4.** السداة (Stamen) والمدقة (Pistil) أجزاء أساسية مرتبطة مباشرة (Directly Related) بالتكاثر (Reproduction).

> ⚠️ **5.** الكأس (Calyx) والتويج (Corolla) أجزاء مساعدة (Accessory Parts) تساعد بصورة غير مباشرة (Indirectly) في التكاثر (Reproduction).

> ⚠️ **6.** الأوراق الكأسية (Sepals) غالباً خضراء (Green)، ووظيفتها حماية البرعم (Bud) قبل اكتمال الزهرة (Flower).

> ⚠️ **7.** الأوراق التويجية (Petals) تساعد على جذب الحشرات (Insects) لتسهيل التلقيح (Pollination)، واحفظ هذه الوظيفة حتى مع حذفها من بعض نسخ المنهج.

> ⚠️ **8.** السداة (Stamen) = المتك (Anther) + الخيط (Filament).

> ⚠️ **9.** المتك (Anther) يحتوي حبوب اللقاح (Pollen Grains)، والخيط (Filament) يحمل المتك (Anther).

> ⚠️ **10.** المدقة (Pistil) = المبيض (Ovary) + القلم (Style) + الميسم (Stigma).

> ⚠️ **11.** القلم (Style) أسطواني رقيق مجوف (Thin Hollow Cylindrical)، ووظيفته ربط المبيض (Ovary) بالميسم (Stigma).

> ⚠️ **12.** الميسم (Stigma) منتفخ ولزج (Swollen and Sticky)، ووظيفته تثبيت حبوب اللقاح (Pollen Grains) ومنعها من التطاير.

> ⚠️ **13.** السوسن (Iris) مثال على زهرة عدد أوراقها التويجية (Petals) مساوٍ لعدد أوراقها الكأسية (Sepals)، والورد (Rose) مثال على زهرة أوراقها التويجية (Petals) مضاعفة أو أكثر.

> ⚠️ **14.** احفظ الرسم العام للزهرة (General Flower Diagram) ورسم السداة (Stamen) والمدقة (Pistil) مع جميع التأشيرات.

## 🧠 الخلاصة

- النباتات الزهرية (Flowering Plants) أعلى تطوراً، وتعتمد في التكاثر (Reproduction) على الزهرة (Flower).
- الزهرة (Flower) غصن متخصص (Specialized Branch) تحورت أوراقه (Modified Leaves) للتكاثر الجنسي (Sexual Reproduction)، وتنشأ من برعم (Bud).
- الأجزاء الأساسية (Essential Parts) هي السداة (Stamen) والمدقة (Pistil)، والأجزاء المساعدة (Accessory Parts) هي الكأس (Calyx) والتويج (Corolla).
- السداة (Stamen) تتكون من المتك (Anther) والخيط (Filament)، والمتك (Anther) يحتوي حبوب اللقاح (Pollen Grains).
- المدقة (Pistil) تتكون من المبيض (Ovary) والقلم (Style) والميسم (Stigma)، والميسم (Stigma) لزج لتثبيت حبوب اللقاح (Pollen Grains).

## 📝 Review Questions

1. Define a flower and explain why it is considered a specialized branch.
2. What is the origin of a flower, and how are its leaves different from ordinary leaves?
3. Classify the flower parts into essential and accessory parts.
4. Describe the structure and functions of the stamen.
5. Describe the structure and functions of the pistil.
6. Compare the number of petals and sepals in iris and rose flowers.

---
$lecture_notes$
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_videos
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec14-study'
    AND title = 'المحاضرة 14 — الزهرة: تعريفها وأجزاؤها ووظائفها'
);
