-- Nadia Al-Nuaimi · Distinguished curriculum · Chapter 3 · Lecture 11
-- Publish the supplied alternation of generations notes as a notes-only lesson.
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
  'nadia-en-ch3-lec11-study',
  '',
  NULL,
  'المحاضرة 11 — تعاقب الأجيال في النباتات',
  NULL,
  jsonb_build_array(
    jsonb_build_object(
      'title', 'تعاقب الأجيال في النباتات',
      'notes', $lecture_notes$
# المحاضرة الحادية عشرة – تعاقب الأجيال في النباتات (Alternation of Generations)

## 🧭 نظرة عامة سريعة

تبدأ المحاضرة بمقدمة عن النباتات (Plants) التي يدرسها الفصل الثالث، ثم توضّح أصل النباتات الأرضية (Land Plants) وانحدارها من الطحالب الخضراء (Green Algae) التي كانت تعيش في المياه العذبة (Fresh Water) قبل نحو 500 مليون سنة. بعد ذلك تشرح الظاهرة الأساسية في مملكة النباتات (Kingdom Plantae)، وهي تعاقب الأجيال (Alternation of Generations)، الذي يمثل دورة حياة النبات الكاملة (Complete Plant Life Cycle) ويتضمن تعاقب طور بوغي (Sporophyte) ثنائي المجموعة الكروموسومية (Diploid, 2n) مع طور مشيجي (Gametophyte) أحادي المجموعة الكروموسومية (Haploid, 1n).

> ⚠️ **مهم ووزاري:** احفظ صفات الطحالب الخضراء (Green Algae) والنباتات (Plants)، وتسلسل دورة تعاقب الأجيال (Alternation of Generations)، والفرق بين الطور البوغي (Sporophyte) والطور المشيجي (Gametophyte)، وموضع الانقسام الاختزالي (Meiosis) والإخصاب (Fertilization).

## 📚 المفاهيم والشرح التفصيلي

### 1. مقدمة عن النباتات (Plants)

النباتات التي يتناولها الفصل الثالث نباتات راقية (Higher Plants)، وتختلف في مستوى رقيها، إذ يوجد تدرج من النباتات الأقل رقياً إلى النباتات الأكثر رقياً، ومنها النباتات الزهرية (Flowering Plants) التي تمثل مستوى متقدماً في مملكة النباتات (Kingdom Plantae).

### 2. أصل النباتات الأرضية (Origin of Land Plants)

#### الفكرة الأساسية

- انحدرت النباتات الأرضية (Land Plants) من طحالب خضراء مبكرة (Early Green Algae).
- كانت هذه الطحالب الخضراء (Green Algae) تعيش في المياه العذبة (Fresh Water).
- حدث هذا الانحدار قبل نحو 500 مليون سنة (500 Million Years Ago)، كما ورد في المحاضرة.
- تُعد الطحالب الخضراء (Green Algae) التي دُرست في الفصل الثاني من النباتات الأولية (Early Plants) التي ارتبطت بأصل النباتات الحالية (Present-Day Plants).

> ⚠️ **سؤال أو تعليل مهم:** من أي سلف انحدرت النباتات التي ندرسها اليوم؟ الجواب: من الطحالب الخضراء (Green Algae) التي كانت تعيش في المياه العذبة (Fresh Water) قبل نحو 500 مليون سنة.

### 3. الأدلة التي تربط النباتات الحالية بالطحالب الخضراء (Green Algae)

ذكرت المحاضرة ثلاث صفات مهمة تثبت التشابه بين النباتات الحالية (Present-Day Plants) والطحالب الخضراء (Green Algae):

#### أ. الأصباغ (Pigments)

- يمتلك الطرفان الكلوروفيل (Chlorophyll)، إضافة إلى أنواع أخرى من الأصباغ (Other Pigments).
- وجود الكلوروفيل (Chlorophyll) يرتبط بقدرة النبات (Plant) والطحلب الأخضر (Green Alga) على إجراء البناء الضوئي (Photosynthesis).

#### ب. تخزين الكربوهيدرات (Carbohydrate Storage)

- ينتج الطرفان الكربوهيدرات (Carbohydrates) من عملية البناء الضوئي (Photosynthesis).
- تُخزّن الكربوهيدرات (Carbohydrates) على شكل نشا (Starch).
- يرتبط تكوين الكربوهيدرات (Carbohydrates) بالبناء الضوئي (Photosynthesis)، حيث ذُكر تكوين السكر السداسي (C₆H₁₂O₆) ثم خزن الناتج على شكل نشا (Starch).

#### ج. الجدار الخلوي (Cell Wall)

- تحاط خلايا النباتات (Plant Cells) والطحالب الخضراء (Green Algae Cells) بجدار خلوي (Cell Wall).
- يتكون الجدار الخلوي (Cell Wall) من السليلوز (Cellulose).
- يبقى السليلوز (Cellulose) صفة مشتركة حتى مع تطور النباتات (Plants) وظهور أشكال أكثر رقياً؛ فلا يتحول الطحلب (Alga) إلى خشب (Wood) لمجرد تطوره، بل تبقى صفة السليلوز (Cellulose) موجودة.

> ⚠️ **احفظ الصفات الثلاث:** الكلوروفيل (Chlorophyll) والأصباغ (Pigments)، خزن الكربوهيدرات (Carbohydrates) على شكل نشا (Starch)، والجدار الخلوي (Cell Wall) المكوّن من السليلوز (Cellulose).

## 4. ظاهرة تعاقب الأجيال (Alternation of Generations)

### تعريف الظاهرة

تعاقب الأجيال (Alternation of Generations) ظاهرة موجودة في مملكة النباتات (Kingdom Plantae)، وتعني تعاقب جيلين أو طورين ضمن دورة حياة النبات (Plant Life Cycle):

1. الطور البوغي (Sporophyte).
2. الطور المشيجي أو القميتي (Gametophyte).

وبذلك تمثل الظاهرة دورة الحياة الكاملة (Complete Life Cycle) للنبات، من دون حذف أي مرحلة أساسية.

### 5. الطور البوغي (Sporophyte)

- الطور البوغي (Sporophyte) ثنائي المجموعة الكروموسومية (Diploid)، ورمزه **2n**.
- يتكون الطور البوغي (Sporophyte) من خلايا (Cells) تحتوي نواتها (Nucleus) على مجموعتين كروموسوميتين (Two Chromosome Sets).
- توجد في الطور البوغي (Sporophyte) خلايا أم الأبواغ (Spore Mother Cells).
- تسمى الخلية التي تنتج الأبواغ (Spores) خلية أم الأبواغ (Spore Mother Cell).
- تدخل خلية أم الأبواغ (Spore Mother Cell) الانقسام الاختزالي (Meiosis).
- لأن الخلية الأم (Mother Cell) ثنائية المجموعة الكروموسومية (2n)، فإن ناتج الانقسام الاختزالي (Meiosis) يكون أحادي المجموعة الكروموسومية (Haploid, 1n).

#### الأبواغ (Spores)

- الأبواغ (Spores) ناتج الانقسام الاختزالي (Meiosis) في الطور البوغي (Sporophyte).
- تكون الأبواغ (Spores) أحادية المجموعة الكروموسومية (Haploid)، ورمزها **1n**.
- بمجرد ظهور الأبواغ (Spores) في دورة الحياة (Life Cycle)، تكون مؤشراً على انتهاء الطور البوغي (Sporophyte) وبدء الطور المشيجي (Gametophyte).
- لا تمثل الأبواغ (Spores) تكاثراً جنسياً (Sexual Reproduction) بحد ذاتها؛ تكوينها يكون لاجنسياً (Asexual) لأنه يتم بالانقسام الاختزالي (Meiosis) من خلية أم الأبواغ (Spore Mother Cell) من دون اتحاد أمشاج (Gamete Fusion).

### 6. الطور المشيجي (Gametophyte)

- الطور المشيجي (Gametophyte) أحادي المجموعة الكروموسومية (Haploid)، ورمزه **1n**.
- ينشأ الطور المشيجي (Gametophyte) من الأبواغ (Spores) بعد نموها.
- تنمو الأبواغ (Spores) بالانقسام الخيطي (Mitosis) لتكوين نسيج أو طور مشيجي (Gametophyte Tissue/Generation).
- لا تدخل الأبواغ (Spores) انقساماً اختزالياً جديداً لتكوين الطور المشيجي (Gametophyte)، بل تدخل الانقسام الخيطي (Mitosis) لأن عدد كروموسوماتها أصلاً **1n**.
- ينتج الطور المشيجي (Gametophyte) الأمشاج (Gametes).
- تكون الأمشاج (Gametes) أحادية المجموعة الكروموسومية (Haploid)، **1n**.
- يمكن أن ينتج الطور المشيجي (Gametophyte) مشيجاً ذكرياً (Male Gamete) ومشيجاً أنثوياً (Female Gamete)، بحسب نوع النبات والرسم المعتمد في المنهج.

### 7. الإخصاب (Fertilization) وتكوين اللاقحة (Zygote)

1. يلتقي المشيج الذكري (Male Gamete) مع المشيج الأنثوي (Female Gamete).
2. يحدث الاتحاد أو الإخصاب (Union/Fertilization).
3. ينتج عن اتحاد مشيجين (Two Gametes)، كل منهما **1n**، لاقحة (Zygote) ثنائية المجموعة الكروموسومية (Diploid, 2n).

\[
1n + 1n \xrightarrow{\text{Fertilization}} 2n\ \text{Zygote}
\]

4. تكون اللاقحة (Zygote) بداية طور بوغي جديد (New Sporophyte Generation).
5. لذلك فإن ظهور اللاقحة (Zygote) في دورة الحياة (Life Cycle) يدل على بدء الطور البوغي (Sporophyte).

> ⚠️ **مؤشر مهم في الرسم:** الأبواغ (Spores) مؤشر لبداية الطور المشيجي (Gametophyte)، واللاقحة (Zygote) مؤشر لبداية الطور البوغي (Sporophyte).

## 8. دورة الحياة الكاملة (Complete Life Cycle)

يكون التسلسل العام لتعاقب الأجيال (Alternation of Generations) كما يأتي:

1. الطور البوغي (Sporophyte) يكون **2n**.
2. تتكون خلية أم الأبواغ (Spore Mother Cell) داخل الطور البوغي (Sporophyte).
3. تدخل خلية أم الأبواغ (Spore Mother Cell) الانقسام الاختزالي (Meiosis).
4. تتكون الأبواغ (Spores)، وتكون **1n**.
5. تبدأ الأبواغ (Spores) الطور المشيجي (Gametophyte).
6. تنمو الأبواغ (Spores) بالانقسام الخيطي (Mitosis) إلى نسيج مشيجي (Gametophyte Tissue).
7. ينتج النسيج المشيجي (Gametophyte Tissue) الأمشاج (Gametes)، وتكون **1n**.
8. يحدث الإخصاب (Fertilization) باتحاد المشيج الذكري (Male Gamete) والمشيج الأنثوي (Female Gamete).
9. تتكون اللاقحة (Zygote)، وتكون **2n**.
10. تنمو اللاقحة (Zygote) لتكوين طور بوغي جديد (New Sporophyte).

### مخطط دورة الحياة (Life Cycle Scheme)

\[
\text{Sporophyte }(2n)
\xrightarrow{\text{Meiosis}}
\text{Spores }(1n)
\xrightarrow{\text{Mitosis and Growth}}
\text{Gametophyte }(1n)
\xrightarrow{\text{Gamete Formation}}
\text{Male and Female Gametes }(1n)
\xrightarrow{\text{Fertilization}}
\text{Zygote }(2n)
\rightarrow
\text{Sporophyte }(2n)
\]

## 9. التمييز بين الانقسام الاختزالي (Meiosis) والانقسام الخيطي (Mitosis)

### في الطور البوغي (Sporophyte)

- يبدأ العدد الكروموسومي بـ **2n**.
- تدخل خلية أم الأبواغ (Spore Mother Cell) الانقسام الاختزالي (Meiosis).
- ينخفض العدد الكروموسومي إلى **1n**.
- الناتج هو الأبواغ (Spores).

### في الطور المشيجي (Gametophyte)

- يبدأ العدد الكروموسومي بـ **1n**.
- تنمو الأبواغ (Spores) بالانقسام الخيطي (Mitosis).
- يبقى العدد الكروموسومي **1n**.
- الناتج هو نسيج مشيجي (Gametophyte Tissue) ينتج الأمشاج (Gametes).

### عند الإخصاب (Fertilization)

- يتحد مشيج ذكري (Male Gamete) **1n** مع مشيج أنثوي (Female Gamete) **1n**.
- يعود العدد الكروموسومي إلى **2n** في اللاقحة (Zygote).

## 10. الطور السائد في النباتات الراقية (Higher Plants)

- يكون الطور البوغي (Sporophyte) أكبر وأكثر وضوحاً في النباتات الراقية (Higher Plants).
- يكون الطور المشيجي (Gametophyte) مختزلاً أو أصغر (Reduced/Smaller) مقارنة بالطور البوغي (Sporophyte).
- يرتبط اختزال الطور المشيجي (Gametophyte Reduction) بتكيف النباتات (Plant Adaptation) مع الحياة الأرضية (Terrestrial Life).
- بعد انتقال النباتات (Plants) إلى اليابسة (Land) لم تعد تعتمد على الماء (Water) بالطريقة نفسها لإتمام الإخصاب (Fertilization)، ولذلك أصبح الطور المشيجي (Gametophyte) مختزلاً، بينما أصبح الطور البوغي (Sporophyte) هو الأكبر والأوضح.

> ⚠️ **تعليل مهم:** لماذا يكون الطور البوغي (Sporophyte) أكبر من الطور المشيجي (Gametophyte) في النباتات الراقية (Higher Plants)؟ بسبب تكيف النبات (Plant Adaptation) مع الحياة الأرضية (Terrestrial Life) واختزال الطور المشيجي (Gametophyte Reduction).

## 📖 التعريفات والمصطلحات

- **تعاقب الأجيال (Alternation of Generations):** ظاهرة في مملكة النباتات (Kingdom Plantae) تتعاقب فيها دورة الحياة بين طور بوغي (Sporophyte) وطور مشيجي (Gametophyte).
- **الطور البوغي (Sporophyte):** طور ثنائي المجموعة الكروموسومية (Diploid, 2n) ينتج خلايا أم الأبواغ (Spore Mother Cells)، وتنتج هذه الخلايا الأبواغ (Spores) بالانقسام الاختزالي (Meiosis).
- **الطور المشيجي (Gametophyte):** طور أحادي المجموعة الكروموسومية (Haploid, 1n) ينشأ من الأبواغ (Spores) وينتج الأمشاج (Gametes).
- **خلية أم الأبواغ (Spore Mother Cell):** خلية ثنائية المجموعة الكروموسومية (Diploid, 2n) تدخل الانقسام الاختزالي (Meiosis) لتكوين الأبواغ (Spores).
- **البوغ (Spore):** خلية أحادية المجموعة الكروموسومية (Haploid, 1n) ناتجة من الانقسام الاختزالي (Meiosis) في الطور البوغي (Sporophyte)، وتبدأ الطور المشيجي (Gametophyte).
- **المشيج (Gamete):** خلية تناسلية أحادية المجموعة الكروموسومية (Haploid, 1n) ينتجها الطور المشيجي (Gametophyte) وتشارك في الإخصاب (Fertilization).
- **الإخصاب (Fertilization):** اتحاد المشيج الذكري (Male Gamete) مع المشيج الأنثوي (Female Gamete) لتكوين اللاقحة (Zygote).
- **اللاقحة (Zygote):** خلية ثنائية المجموعة الكروموسومية (Diploid, 2n) ناتجة من الإخصاب (Fertilization)، وتبدأ الطور البوغي (Sporophyte).
- **الانقسام الاختزالي (Meiosis):** انقسام يخفض العدد الكروموسومي من **2n** إلى **1n**، ويحدث في خلية أم الأبواغ (Spore Mother Cell) لتكوين الأبواغ (Spores).
- **الانقسام الخيطي (Mitosis):** انقسام يحافظ على العدد الكروموسومي، وتنمو به الأبواغ (Spores) لتكوين الطور المشيجي (Gametophyte).
- **البناء الضوئي (Photosynthesis):** عملية ترتبط بوجود الكلوروفيل (Chlorophyll) والبلاستيدات (Plastids)، وينتج عنها كربوهيدرات (Carbohydrates) تُخزّن على شكل نشا (Starch).
- **الطحالب الخضراء (Green Algae):** كائنات مائية (Aquatic Organisms) تعيش في المياه العذبة (Fresh Water)، وتشترك مع النباتات (Plants) في الكلوروفيل (Chlorophyll)، وخزن النشا (Starch)، والجدار السليلوزي (Cellulose Cell Wall).

## 🔢 القوانين / الصيغ / القواعد

### القاعدة الكروموسومية الأساسية

\[
\text{Sporophyte}=2n
\]

\[
\text{Spore Mother Cell }(2n)\xrightarrow{\text{Meiosis}}\text{Spores }(1n)
\]

\[
\text{Gametophyte}=1n
\]

\[
1n\ \text{Male Gamete}+1n\ \text{Female Gamete}\xrightarrow{\text{Fertilization}}2n\ \text{Zygote}
\]

### قاعدة تحديد الطور من الرسم

- رؤية الأبواغ (Spores) = بداية الطور المشيجي (Gametophyte).
- رؤية اللاقحة (Zygote) = بداية الطور البوغي (Sporophyte).
- رؤية خلية أم الأبواغ (Spore Mother Cell) **2n** تدخل الانقسام الاختزالي (Meiosis) = مرحلة تكوين الأبواغ (Spore Formation).
- رؤية نمو الأبواغ (Spores) بالانقسام الخيطي (Mitosis) = تكوين الطور المشيجي (Gametophyte).

## 🧪 المسائل والأمثلة المحلولة

### مثال 1: تحديد أصل النباتات الأرضية (Land Plants)

- **السؤال:** من أي كائنات انحدرت النباتات التي ندرسها اليوم؟
- **القاعدة:** النباتات الأرضية (Land Plants) انحدرت من طحالب خضراء (Green Algae) كانت تعيش في المياه العذبة (Fresh Water) قبل نحو 500 مليون سنة.
- **الإجابة النهائية:** الطحالب الخضراء (Green Algae) التي كانت تعيش في المياه العذبة (Fresh Water).

### مثال 2: إثبات العلاقة بين النباتات (Plants) والطحالب الخضراء (Green Algae)

- **المطلوب:** ذكر الأدلة أو الصفات المشتركة.
- **الخطوات:**
  1. يمتلك الطرفان الكلوروفيل (Chlorophyll) وأصباغاً أخرى (Other Pigments).
  2. ينتجان الكربوهيدرات (Carbohydrates) ويخزنانها على شكل نشا (Starch).
  3. تحاط خلاياهما بجدار خلوي (Cell Wall) مكوّن من السليلوز (Cellulose).
- **الناتج:** ثلاث صفات مشتركة: الكلوروفيل (Chlorophyll)، النشا (Starch)، والسليلوز (Cellulose).

### مثال 3: تحديد ناتج خلية أم الأبواغ (Spore Mother Cell)

- **المعطيات:** خلية أم الأبواغ (Spore Mother Cell) ثنائية المجموعة الكروموسومية (2n).
- **القانون:** تدخل الخلية أم الأبواغ (Spore Mother Cell) الانقسام الاختزالي (Meiosis).
- **الخطوات:**
  1. البداية: **2n**.
  2. يحدث الانقسام الاختزالي (Meiosis).
  3. ينخفض العدد الكروموسومي إلى **1n**.
- **الناتج النهائي:** الأبواغ (Spores) أحادية المجموعة الكروموسومية (Haploid, 1n).

### مثال 4: تحديد بداية الطور البوغي (Sporophyte)

- **المعطيات:** مشيج ذكري (Male Gamete) **1n** ومشيج أنثوي (Female Gamete) **1n**.
- **القانون:** الإخصاب (Fertilization) هو اتحاد المشيجين (Two Gametes).
- **خطوات التعويض:**
  1. (1n + 1n).
  2. اتحاد المشيجين (Gamete Fusion).
  3. الناتج (2n).
- **الناتج النهائي:** لاقحة (Zygote) **2n**، وهي بداية الطور البوغي (Sporophyte).

### مثال 5: تحديد بداية الطور المشيجي (Gametophyte)

- **المعطى:** ظهرت الأبواغ (Spores) في دورة الحياة (Life Cycle).
- **القاعدة:** الأبواغ (Spores) تكون **1n** وتعد مؤشراً لبداية الطور المشيجي (Gametophyte).
- **الناتج النهائي:** يبدأ الطور المشيجي (Gametophyte)، وتنمو الأبواغ (Spores) بالانقسام الخيطي (Mitosis).

## ⚠️ تنبيهات وأخطاء شائعة (ملاحظات وزارية)

> ⚠️ **1.** النباتات الأرضية (Land Plants) انحدرت من الطحالب الخضراء (Green Algae) التي كانت تعيش في المياه العذبة (Fresh Water) قبل نحو 500 مليون سنة.

> ⚠️ **2.** احفظ الأدلة الثلاثة: الكلوروفيل (Chlorophyll) والأصباغ (Pigments)، خزن الكربوهيدرات (Carbohydrates) على شكل نشا (Starch)، والجدار الخلوي (Cell Wall) من السليلوز (Cellulose).

> ⚠️ **3.** تعاقب الأجيال (Alternation of Generations) يعني دورة الحياة الكاملة (Complete Life Cycle) التي تضم الطور البوغي (Sporophyte) والطور المشيجي (Gametophyte).

> ⚠️ **4.** الطور البوغي (Sporophyte) **2n**، والطور المشيجي (Gametophyte) **1n**.

> ⚠️ **5.** خلية أم الأبواغ (Spore Mother Cell) **2n** تدخل الانقسام الاختزالي (Meiosis) وتنتج أبواغاً (Spores) **1n**.

> ⚠️ **6.** لا تخلط بين الأبواغ (Spores) والأمشاج (Gametes): الأبواغ (Spores) تبدأ الطور المشيجي (Gametophyte)، أما الأمشاج (Gametes) فتتحد في الإخصاب (Fertilization).

> ⚠️ **7.** الأبواغ (Spores) دليل على بداية الطور المشيجي (Gametophyte)، واللاقحة (Zygote) دليل على بداية الطور البوغي (Sporophyte).

> ⚠️ **8.** الأبواغ (Spores) تتكون بالانقسام الاختزالي (Meiosis)، لكنها تنمو إلى الطور المشيجي (Gametophyte) بالانقسام الخيطي (Mitosis).

> ⚠️ **9.** عند الإخصاب (Fertilization) يعود العدد الكروموسومي من **1n** إلى **2n**.

> ⚠️ **10.** في النباتات الراقية (Higher Plants) يكون الطور البوغي (Sporophyte) أكبر وأكثر وضوحاً، بينما يكون الطور المشيجي (Gametophyte) مختزلاً.

> ⚠️ **11.** عند السؤال عن الخلايا المسؤولة عن تكوين الأبواغ (Spores)، الجواب هو خلايا أم الأبواغ (Spore Mother Cells) الموجودة في الطور البوغي (Sporophyte).

> ⚠️ **12.** ظهور اللاقحة (Zygote) في مخطط دورة الحياة (Life Cycle) يعني أنك بدأت من الطور البوغي (Sporophyte)، أما ظهور الأبواغ (Spores) فيعني أنك بدأت من الطور المشيجي (Gametophyte).

> ⚠️ **13.** احفظ سبب اختزال الطور المشيجي (Gametophyte) في النباتات الأرضية (Land Plants): التكيف مع الحياة الأرضية (Terrestrial Adaptation) وعدم الحاجة إلى الماء (Water) بالطريقة السابقة في عملية الإخصاب (Fertilization)، بحسب شرح المحاضرة.

## 🧠 الخلاصة

- انحدرت النباتات الأرضية (Land Plants) من الطحالب الخضراء (Green Algae) التي عاشت في المياه العذبة (Fresh Water) قبل نحو 500 مليون سنة.
- الدليل على العلاقة بين الطحالب الخضراء (Green Algae) والنباتات (Plants) هو اشتراكهما في الكلوروفيل (Chlorophyll)، وخزن النشا (Starch)، والجدار السليلوزي (Cellulose Cell Wall).
- تعاقب الأجيال (Alternation of Generations) هو دورة الحياة الكاملة (Complete Life Cycle) التي يتعاقب فيها الطور البوغي (Sporophyte) **2n** والطور المشيجي (Gametophyte) **1n**.
- الطور البوغي (Sporophyte) ينتج الأبواغ (Spores) بالانقسام الاختزالي (Meiosis)، والأبواغ (Spores) تنمو بالانقسام الخيطي (Mitosis) إلى الطور المشيجي (Gametophyte).
- الطور المشيجي (Gametophyte) ينتج الأمشاج (Gametes)، ويؤدي الإخصاب (Fertilization) إلى تكوين اللاقحة (Zygote) **2n** وبداية طور بوغي جديد (New Sporophyte).

## 📝 Review Questions

1. From which ancestral organisms did present-day land plants evolve?
2. What are the three similarities between green algae and plants mentioned in the lecture?
3. Define alternation of generations and identify the chromosome number of each generation.
4. What is the role of the spore mother cell in the plant life cycle?
5. Why are spores considered an indicator of the beginning of the gametophyte generation?
6. Explain how fertilization restores the diploid chromosome number and begins a new sporophyte generation.

---

$lecture_notes$
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_videos
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec11-study'
    AND title = 'المحاضرة 11 — تعاقب الأجيال في النباتات'
);
