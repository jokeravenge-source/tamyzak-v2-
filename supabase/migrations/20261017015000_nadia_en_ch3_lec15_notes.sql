-- Nadia Al-Nuaimi · Distinguished curriculum · Chapter 3 · Lecture 15
-- Publish the supplied anther and pollen-formation notes as a notes-only lesson.
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
  'nadia-en-ch3-lec15-study',
  '',
  NULL,
  'المحاضرة 15 — تشريح المتك وتكوين حبوب اللقاح',
  NULL,
  jsonb_build_array(
    jsonb_build_object(
      'title', 'تشريح المتك وتكوين حبوب اللقاح',
      'notes', $lecture_notes$
# المحاضرة الخامسة عشرة – تشريح المتك (Anther) وتكوين حبوب اللقاح (Pollen Grains)

## 🧭 نظرة عامة سريعة

تتناول هذه المحاضرة المتك (Anther)، وهو الجزء الذي يحتوي حبوب اللقاح (Pollen Grains) داخل السداة (Stamen). تبدأ المحاضرة بوصف المتك (Anther) من الداخل، ثم توضّح عدد فصوصه وأكياسه اللقاحية، والأنسجة التي تحيط بالحزمة الوعائية (Vascular Bundle)، وطريقة انفتاح الأكياس اللقاحية (Pollen Sacs) وخروج حبوب اللقاح (Pollen Grains). بعد ذلك تشرح تكوين حبوب اللقاح (Microsporogenesis)، بدءاً من الخلية الأم للبوغ الصغير (Microspore Mother Cell) ثنائية المجموعة الكروموسومية (2n)، مروراً بالانقسام الاختزالي (Meiosis) وتكوين أربعة أبواغ صغيرة (Four Microspores)، ثم الانقسام الخيطي (Mitosis) وتكوين النواة الأنبوبية (Tube Nucleus) والنواة التوليدية (Generative Nucleus) داخل حبة اللقاح (Pollen Grain).

> ⚠️ **مهم وزارياً:** احفظ تركيب المتك (Anther)، وعدد الأكياس اللقاحية (Pollen Sacs)، وتسلسل تكوين حبوب اللقاح (Pollen Grains)، والفرق بين النواة الأنبوبية (Tube Nucleus) والنواة التوليدية (Generative Nucleus)، وسبب كون حبة اللقاح (Pollen Grain) غير ناضجة في البداية.

## 📚 المفاهيم والشرح التفصيلي

## أولاً: المتك (Anther)

### 1. موقع المتك (Anther)

- المتك (Anther) جزء من السداة (Stamen)، والسداة (Stamen) هي العضو الذكري (Male Part) في الزهرة (Flower).
- تتكون السداة (Stamen) من:
  1. المتك (Anther).
  2. الخيط أو الخويط (Filament).
- يحمل الخيط (Filament) المتك (Anther).
- يحتوي المتك (Anther) حبوب اللقاح (Pollen Grains)، لذلك تركز المحاضرة على تشريحه الداخلي (Internal Anatomy) وتكوين حبوب اللقاح (Pollen Formation).

### 2. الشكل العام للمتك (Anther)

- المتك (Anther) مكوّن من فصّين (Two Lobes).
- الفصان (Two Lobes) متطاولان (Elongated) أو ممتدان طولياً.
- يتصل الفصان (Two Lobes) معاً بواسطة نسيج رابط يسمى النسيج الرابط (Connective Tissue).
- يكون المتك (Anther) محمولاً على الخيط (Filament).

### 3. النسيج الرابط (Connective Tissue)

- النسيج الرابط (Connective Tissue) يربط الفصين (Two Lobes) المتطاولين في المتك (Anther).
- يحيط النسيج الرابط (Connective Tissue) بالحزمة الوعائية (Vascular Bundle).
- تحتوي الحزمة الوعائية (Vascular Bundle) على الخشب (Xylem) واللحاء (Phloem).
- تصل التغذية (Nutrients) والماء (Water) إلى المتك (Anther) عبر الحزمة الوعائية (Vascular Bundle)، لأن المتك (Anther) يحتاج إلى التغذية حتى تتكون حبوب اللقاح (Pollen Grains) وتنضج.

### 4. الأكياس اللقاحية (Pollen Sacs) أو الأكياس البوغية الصغيرة (Microsporangia)

- يحتوي كل فص (Lobe) من فصي المتك (Anther) على حجرتين أو مقصورتين (Two Compartments).
- تسمى كل حجرة كيساً لقاحياً (Pollen Sac) أو كيساً بوغياً صغيراً (Microsporangium).
- لأن المتك (Anther) يتكون من فصين (Two Lobes)، ولكل فص (Lobe) حجرتان (Two Compartments)، يكون العدد الكلي أربعة أكياس لقاحية (Four Pollen Sacs) أو أربعة أكياس بوغية صغيرة (Four Microsporangia).

\[
2\ \text{Lobes}\times 2\ \text{Compartments per Lobe}=4\ \text{Pollen Sacs}
\]

- تحتوي الأكياس اللقاحية (Pollen Sacs) أو الأكياس البوغية الصغيرة (Microsporangia) على الخلايا الأم للأبواغ الصغيرة (Microspore Mother Cells).
- ستدخل الخلايا الأم للأبواغ الصغيرة (Microspore Mother Cells) الانقسام الاختزالي (Meiosis) لتكوين الأبواغ الصغيرة (Microspores).

> ⚠️ **مهم جداً:** المتك (Anther) = فصّان (Two Lobes)، وكل فص (Lobe) يحتوي كيسين لقاحيين (Two Pollen Sacs)، لذلك المجموع أربعة أكياس لقاحية (Four Pollen Sacs).

## ثانياً: انفتاح المتك (Anther Dehiscence)

### 1. حالة المتك (Anther) قبل النضوج

- تكون الأكياس اللقاحية (Pollen Sacs) مغلقة قبل النضوج (Before Maturity).
- توجد الخلايا الأم للأبواغ الصغيرة (Microspore Mother Cells) داخل الأكياس البوغية الصغيرة (Microsporangia).
- لم تخرج حبوب اللقاح (Pollen Grains) بعد؛ لأنها ما زالت في مرحلة التكوين والنضوج.

### 2. التغيرات عند النضوج (Maturity)

عند نضوج الأكياس اللقاحية (Pollen Sacs):

1. تكبر الأبواغ الصغيرة (Microspores) أو المواد الموجودة داخل الكيس (Sac).
2. يحدث ضغط باتجاه الخارج (Outward Pressure) على جدران الأكياس اللقاحية (Pollen Sacs).
3. يتحلل أو يختفي النسيج الرابط (Connective Tissue) الموجود بين الحجرتين (Two Compartments) في الفص (Lobe).
4. يتكون شق عمودي خارجي (Vertical External Slit) في جدار المتك (Anther Wall).
5. تنفتح الأكياس اللقاحية (Pollen Sacs) من خلال الشق العمودي (Vertical Slit).
6. تخرج حبوب اللقاح (Pollen Grains) إلى البيئة (Environment) لتنتشر.

> ⚠️ **وصف مهم:** خروج حبوب اللقاح (Pollen Grains) يكون عبر شق عمودي خارجي (Vertical External Slit) في المتك (Anther) بعد النضوج (Maturity).

## ثالثاً: تكوين حبوب اللقاح (Pollen Formation)

### 1. الخلية الأم للبوغ الصغير (Microspore Mother Cell)

- توجد الخلية الأم للبوغ الصغير (Microspore Mother Cell) داخل الكيس البوغي الصغير (Microsporangium).
- تكون نواة الخلية الأم للبوغ الصغير (Microspore Mother Cell) ثنائية المجموعة الكروموسومية (Diploid)، ورمزها **2n**.
- تمثل هذه الخلية البداية الحقيقية لتكوين حبوب اللقاح (Pollen Grains).

### 2. الانقسام الاختزالي (Meiosis)

1. تدخل الخلية الأم للبوغ الصغير (Microspore Mother Cell) الانقسام الاختزالي (Meiosis).
2. تنخفض المجموعة الكروموسومية من **2n** إلى **1n**.
3. تنتج من الخلية الأم أربع خلايا أو أربعة أبواغ صغيرة (Four Microspores).
4. تكون كل الأبواغ الصغيرة (Microspores) أحادية المجموعة الكروموسومية (Haploid)، ورمزها **1n**.

\[
\text{Microspore Mother Cell }(2n)\xrightarrow{\text{Meiosis}}4\ \text{Microspores }(1n)
\]

### 3. الانقسام الخيطي (Mitosis) للبوغ الصغير (Microspore)

1. يأخذ كل بوغ صغير (Microspore) نواة واحدة (One Nucleus) ويبدأ الانقسام الخيطي (Mitosis).
2. تنقسم النواة (Nucleus) إلى نواتين (Two Nuclei).
3. تكون كل نواة (Nucleus) أحادية المجموعة الكروموسومية (Haploid)، **1n**؛ لأن الانقسام الخيطي (Mitosis) يحافظ على العدد الكروموسومي.
4. تتحول الخلية أو البوغ الصغير (Microspore) إلى حبة لقاح (Pollen Grain) تحتوي على نواتين (Two Nuclei).

## رابعاً: مكونات حبة اللقاح (Pollen Grain)

### 1. النواة الأنبوبية (Tube Nucleus)

- إحدى نواتي حبة اللقاح (Pollen Grain) تسمى النواة الأنبوبية (Tube Nucleus).
- ترتبط النواة الأنبوبية (Tube Nucleus) بتكوين أنبوب اللقاح (Pollen Tube) عند وصول حبة اللقاح (Pollen Grain) إلى الميسم (Stigma).

### 2. النواة التوليدية (Generative Nucleus)

- النواة الثانية تسمى النواة التوليدية (Generative Nucleus).
- تمثل النواة التوليدية (Generative Nucleus) الجزء الذي سيعطي الأمشاج الذكرية (Male Gametes) لاحقاً.
- تكون النواة التوليدية (Generative Nucleus) في بداية تكوين حبة اللقاح (Pollen Grain) غير منقسمة بعد إلى الأمشاج الذكرية (Male Gametes).

### 3. سبب عدم نضج حبة اللقاح (Pollen Grain)

- تكون حبة اللقاح (Pollen Grain) غير ناضجة (Immature) في المرحلة الأولى.
- السبب هو أن النواة التوليدية (Generative Nucleus) ما زالت نواة واحدة (One Nucleus)، ولم تنقسم بعد إلى أمشاج ذكرية (Male Gametes).
- تصبح حبة اللقاح (Pollen Grain) مستعدة للإخصاب (Fertilization) بعد أن تتحول النواة التوليدية (Generative Nucleus) إلى الأمشاج الذكرية (Male Gametes).

> ⚠️ **تعليل مهم:** لماذا تكون حبة اللقاح (Pollen Grain) غير ناضجة في البداية؟ لأن النواة التوليدية (Generative Nucleus) لم تنتج الأمشاج الذكرية (Male Gametes) بعد.

### 4. جدار حبة اللقاح (Pollen Grain Wall) وثقوب الإنبات (Germ Pores)

- تكون حبة اللقاح (Pollen Grain) محاطة بغلاف أو جدار (Wall/Coat).
- قد يختلف سطح حبة اللقاح (Pollen Grain) بين خشن (Rough Surface) وناعم (Smooth Surface) بحسب الشكل المذكور في المحاضرة.
- تحتوي حبة اللقاح (Pollen Grain) على مناطق أو نقاط تسمى ثقوب الإنبات (Germ Pores).
- من ثقوب الإنبات (Germ Pores) يبدأ تكوّن أنبوب اللقاح (Pollen Tube) عند الإنبات (Germination).

## خامساً: الخلايا الأم للأبواغ الصغيرة (Microspore Mother Cells) والأبواغ الصغيرة (Microspores)

### التسلسل الكامل

1. توجد الخلايا الأم للأبواغ الصغيرة (Microspore Mother Cells) داخل الأكياس البوغية الصغيرة (Microsporangia).
2. تكون الخلايا الأم للأبواغ الصغيرة (Microspore Mother Cells) **2n**.
3. تدخل كل خلية أم (Mother Cell) الانقسام الاختزالي (Meiosis).
4. تنتج كل خلية أم (Mother Cell) أربعة أبواغ صغيرة (Four Microspores).
5. يكون كل بوغ صغير (Microspore) **1n**.
6. تدخل نواة البوغ الصغير (Microspore Nucleus) الانقسام الخيطي (Mitosis).
7. تتكون نواة أنبوبية (Tube Nucleus) ونواة توليدية (Generative Nucleus).
8. تصبح حبة اللقاح (Pollen Grain) ثنائية النوى (Binucleate)، وكل نواة (Nucleus) **1n**.
9. عند الإنبات (Germination)، تتكون أنبوبة اللقاح (Pollen Tube) من ثقوب الإنبات (Germ Pores)، وتتحول النواة التوليدية (Generative Nucleus) لاحقاً إلى أمشاج ذكرية (Male Gametes).

## سادساً: العلاقة بين المتك (Anther) وتكوين حبوب اللقاح (Pollen Grains)

يمكن ربط التشريح (Anatomy) بالتكوين (Formation) كما يأتي:

- المتك (Anther) هو الجزء الذي يحمل الأكياس البوغية الصغيرة (Microsporangia).
- الأكياس البوغية الصغيرة (Microsporangia) تحتوي الخلايا الأم للأبواغ الصغيرة (Microspore Mother Cells).
- الخلايا الأم (Mother Cells) تدخل الانقسام الاختزالي (Meiosis).
- تنتج الأبواغ الصغيرة (Microspores).
- تدخل الأبواغ الصغيرة (Microspores) الانقسام الخيطي (Mitosis).
- تتكون حبوب اللقاح (Pollen Grains) ذات النواة الأنبوبية (Tube Nucleus) والنواة التوليدية (Generative Nucleus).

## 📖 التعريفات والمصطلحات

- **المتك (Anther):** جزء من السداة (Stamen) يتكون من فصّين (Two Lobes) ويحتوي الأكياس اللقاحية (Pollen Sacs) التي تتكون فيها حبوب اللقاح (Pollen Grains).
- **الفص (Lobe):** أحد الجزأين المتطاولين (Elongated Parts) اللذين يكوّنان المتك (Anther).
- **النسيج الرابط (Connective Tissue):** نسيج يربط فصي المتك (Anther Lobes) ويحيط بالحزمة الوعائية (Vascular Bundle).
- **الحزمة الوعائية (Vascular Bundle):** حزمة تحتوي الخشب (Xylem) واللحاء (Phloem)، وتزوّد المتك (Anther) بالماء (Water) والمواد الغذائية (Nutrients).
- **الكيس اللقاحي (Pollen Sac):** حجرة داخل فص المتك (Anther Lobe) تحتوي الخلايا الأم للأبواغ الصغيرة (Microspore Mother Cells)، ويسمى أيضاً الكيس البوغي الصغير (Microsporangium).
- **الكيس البوغي الصغير (Microsporangium):** تركيب داخل المتك (Anther) تتكون داخله الأبواغ الصغيرة (Microspores) وحبوب اللقاح (Pollen Grains).
- **الخلية الأم للبوغ الصغير (Microspore Mother Cell):** خلية ثنائية المجموعة الكروموسومية (Diploid, 2n) تدخل الانقسام الاختزالي (Meiosis) لتنتج أربعة أبواغ صغيرة (Four Microspores).
- **البوغ الصغير (Microspore):** خلية أحادية المجموعة الكروموسومية (Haploid, 1n) ناتجة من الانقسام الاختزالي (Meiosis)، وتتطور إلى حبة لقاح (Pollen Grain).
- **حبة اللقاح (Pollen Grain):** تركيب تناسلي ذكري (Male Reproductive Structure) يتكون من بوغ صغير (Microspore) بعد انقسام نواته (Nuclear Division)، ويحتوي نواة أنبوبية (Tube Nucleus) ونواة توليدية (Generative Nucleus).
- **النواة الأنبوبية (Tube Nucleus):** نواة في حبة اللقاح (Pollen Grain) ترتبط بتكوين أنبوب اللقاح (Pollen Tube).
- **النواة التوليدية (Generative Nucleus):** نواة في حبة اللقاح (Pollen Grain) تنقسم لاحقاً لتكوين الأمشاج الذكرية (Male Gametes).
- **أنبوب اللقاح (Pollen Tube):** أنبوب ينشأ من حبة اللقاح (Pollen Grain) عبر ثقوب الإنبات (Germ Pores) عند الإنبات (Germination).
- **ثقوب الإنبات (Germ Pores):** مناطق أو فتحات في جدار حبة اللقاح (Pollen Grain Wall) يبدأ منها نمو أنبوب اللقاح (Pollen Tube).
- **انفتاح المتك (Anther Dehiscence):** انشقاق المتك (Anther) عند النضج (Maturity) بوساطة شق عمودي خارجي (Vertical External Slit) لخروج حبوب اللقاح (Pollen Grains).
- **حبوب اللقاح (Pollen Grains):** تراكيب تتكون داخل الأكياس البوغية الصغيرة (Microsporangia) وتنتشر بعد انفتاح المتك (Anther Dehiscence).

## 🔢 القوانين / الصيغ / القواعد

### قاعدة عدد فصوص وأكياس المتك (Anther)

\[
2\ \text{Lobes}\times 2\ \text{Pollen Sacs per Lobe}=4\ \text{Pollen Sacs}
\]

### قاعدة تكوين الأبواغ الصغيرة (Microspores)

\[
\text{Microspore Mother Cell }(2n)\xrightarrow{\text{Meiosis}}4\ \text{Microspores }(1n)
\]

### قاعدة تكوين حبة اللقاح (Pollen Grain)

\[
\text{Microspore }(1n)\xrightarrow{\text{Mitosis}}\text{Tube Nucleus }(1n)+\text{Generative Nucleus }(1n)
\]

### قاعدة التركيب

\[
\text{Anther}=2\ \text{Lobes}=4\ \text{Microsporangia/Pollen Sacs}
\]

## 🧪 المسائل والأمثلة المحلولة

### مثال 1: حساب عدد الأكياس اللقاحية (Pollen Sacs)

- **المعطيات:** المتك (Anther) يتكون من فصين (Two Lobes)، وكل فص (Lobe) يحتوي حجرتين أو كيسين لقاحيين (Two Pollen Sacs).
- **القانون:** عدد الفصوص (Lobes) × عدد الأكياس في كل فص (Pollen Sacs per Lobe).
- **التعويض:** (2 \times 2=4).
- **الناتج النهائي:** أربعة أكياس لقاحية (Four Pollen Sacs) أو أربعة أكياس بوغية صغيرة (Four Microsporangia).

### مثال 2: تكوين الأبواغ الصغيرة (Microspores)

- **المعطى:** خلية أم للبوغ الصغير (Microspore Mother Cell) ثنائية المجموعة الكروموسومية (2n).
- **القانون:** الانقسام الاختزالي (Meiosis).
- **الخطوات:**
  1. تبدأ الخلية الأم (Mother Cell) بـ **2n**.
  2. تدخل الانقسام الاختزالي (Meiosis).
  3. تنخفض المجموعة الكروموسومية إلى **1n**.
  4. تتكون أربعة أبواغ صغيرة (Four Microspores).
- **الناتج النهائي:** أربعة أبواغ صغيرة (Four Microspores)، كل واحد منها **1n**.

### مثال 3: تكوين نواتي حبة اللقاح (Pollen Grain Nuclei)

- **المعطى:** بوغ صغير (Microspore) أحادي المجموعة الكروموسومية (1n).
- **القانون:** الانقسام الخيطي (Mitosis).
- **الخطوات:**
  1. تدخل نواة البوغ الصغير (Microspore Nucleus) الانقسام الخيطي (Mitosis).
  2. تتكون نواتان (Two Nuclei).
  3. تسمى إحداهما النواة الأنبوبية (Tube Nucleus).
  4. تسمى الثانية النواة التوليدية (Generative Nucleus).
- **الناتج النهائي:** حبة لقاح (Pollen Grain) ثنائية النوى (Binucleate)، وكل نواة (Nucleus) **1n**.

### مثال 4: تفسير خروج حبوب اللقاح (Pollen Grains)

- **المعطى:** نضجت الأكياس اللقاحية (Pollen Sacs) داخل المتك (Anther).
- **الخطوات:**
  1. يزداد الضغط داخل الأكياس اللقاحية (Pollen Sacs).
  2. يتحلل النسيج الرابط (Connective Tissue) بين الحجرتين (Two Compartments).
  3. يتكون شق عمودي خارجي (Vertical External Slit).
  4. تخرج حبوب اللقاح (Pollen Grains) عبر الشق (Slit).
- **الناتج النهائي:** انفتاح المتك (Anther Dehiscence) وانتشار حبوب اللقاح (Pollen Grains).

## ⚠️ تنبيهات وأخطاء شائعة (ملاحظات وزارية)

> ⚠️ **1.** المتك (Anther) جزء من السداة (Stamen)، والسداة (Stamen) تتكون من المتك (Anther) والخيط (Filament).

> ⚠️ **2.** المتك (Anther) يتكون من فصين (Two Lobes)، وليس من فص واحد (One Lobe).

> ⚠️ **3.** كل فص (Lobe) يحتوي كيسين لقاحيين (Two Pollen Sacs)، لذلك يحتوي المتك (Anther) أربعة أكياس لقاحية (Four Pollen Sacs) بالمجموع.

> ⚠️ **4.** النسيج الرابط (Connective Tissue) يربط الفصين (Two Lobes) ويحيط بالحزمة الوعائية (Vascular Bundle) التي تحتوي الخشب (Xylem) واللحاء (Phloem).

> ⚠️ **5.** الخلية الأم للبوغ الصغير (Microspore Mother Cell) **2n**، وتدخل الانقسام الاختزالي (Meiosis) لتكوين أربعة أبواغ صغيرة (Four Microspores) **1n**.

> ⚠️ **6.** لا تخلط بين البوغ الصغير (Microspore) وحبة اللقاح (Pollen Grain): البوغ الصغير (Microspore) يتكون أولاً، ثم ينقسم بالانقسام الخيطي (Mitosis) ويصبح حبة لقاح (Pollen Grain) ذات نواتين (Two Nuclei).

> ⚠️ **7.** النواة الأنبوبية (Tube Nucleus) ترتبط بتكوين أنبوب اللقاح (Pollen Tube)، بينما النواة التوليدية (Generative Nucleus) تعطي الأمشاج الذكرية (Male Gametes) لاحقاً.

> ⚠️ **8.** حبة اللقاح (Pollen Grain) غير ناضجة (Immature) في البداية لأن النواة التوليدية (Generative Nucleus) لم تنقسم بعد إلى أمشاج ذكرية (Male Gametes).

> ⚠️ **9.** توجد ثقوب الإنبات (Germ Pores) في جدار حبة اللقاح (Pollen Grain Wall)، ومنها يبدأ تكوين أنبوب اللقاح (Pollen Tube).

> ⚠️ **10.** عند نضوج المتك (Anther)، يتحلل النسيج الرابط (Connective Tissue) بين الحجرتين (Two Compartments)، ثم ينفتح المتك (Anther) بشق عمودي خارجي (Vertical External Slit).

> ⚠️ **11.** لا تخلط بين انقسام الخلية الأم (Mother Cell) والانقسام الخيطي للبوغ الصغير (Microspore): الأول اختزالي (Meiosis) وينتج أربعة أبواغ (Four Microspores)، والثاني خيطي (Mitosis) وينتج نواتين (Two Nuclei) داخل حبة اللقاح (Pollen Grain).

## 🧠 الخلاصة

- المتك (Anther) جزء من السداة (Stamen)، ويتكون من فصين (Two Lobes)، وكل فص (Lobe) يحتوي كيسين لقاحيين (Two Pollen Sacs)، أي أربعة أكياس لقاحية (Four Pollen Sacs) بالمجموع.
- تحتوي الأكياس اللقاحية (Pollen Sacs) الخلايا الأم للأبواغ الصغيرة (Microspore Mother Cells) التي تكون **2n**.
- تدخل الخلية الأم (Mother Cell) الانقسام الاختزالي (Meiosis) وتنتج أربعة أبواغ صغيرة (Four Microspores)، كل منها **1n**.
- يدخل كل بوغ صغير (Microspore) الانقسام الخيطي (Mitosis) فتتكون حبة لقاح (Pollen Grain) تحتوي نواة أنبوبية (Tube Nucleus) ونواة توليدية (Generative Nucleus).
- عند النضوج (Maturity) ينفتح المتك (Anther) بشق عمودي خارجي (Vertical External Slit) وتخرج حبوب اللقاح (Pollen Grains)، ثم تبدأ النواة التوليدية (Generative Nucleus) بإنتاج الأمشاج الذكرية (Male Gametes) لاحقاً.

## 📝 Review Questions

1. Describe the internal structure of the anther and state the total number of pollen sacs.
2. What is the function of the connective tissue and vascular bundle in the anther?
3. Describe the formation of four haploid microspores from a diploid microspore mother cell.
4. How does a microspore develop into a binucleate pollen grain?
5. Compare the tube nucleus and the generative nucleus in a pollen grain.
6. Explain how anther dehiscence releases mature pollen grains.

---
$lecture_notes$
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_videos
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec15-study'
    AND title = 'المحاضرة 15 — تشريح المتك وتكوين حبوب اللقاح'
);
