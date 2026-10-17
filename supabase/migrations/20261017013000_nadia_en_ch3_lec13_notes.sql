-- Nadia Al-Nuaimi · Distinguished curriculum · Chapter 3 · Lecture 13
-- Publish the supplied fern life-cycle notes as a notes-only lesson.
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
  'nadia-en-ch3-lec13-study',
  '',
  NULL,
  'المحاضرة 13 — تكاثر السرخسيات ودورة حياتها',
  NULL,
  jsonb_build_array(
    jsonb_build_object(
      'title', 'تكاثر السرخسيات ودورة حياتها',
      'notes', $lecture_notes$
# المحاضرة الثالثة عشرة – تكاثر السرخسيات (Ferns) ودورة حياتها

## 🧭 نظرة عامة سريعة

تتناول هذه المحاضرة السرخسيات (Ferns) بوصفها مرحلة أكثر تطوراً من الحزازيات (Mosses) وأقل تطوراً من النباتات الزهرية (Flowering Plants). تشرح المحاضرة صفات السرخسيات (Ferns)، وعدد أنواعها، وكونها نباتات وعائية عديمة البذور (Vascular Seedless Plants)، ثم توضّح تعاقب الأجيال (Alternation of Generations) فيها. يتميز الطور البوغي (Sporophyte) في السرخسيات (Ferns) بأنه الطور السائد والأكبر، بينما يكون الطور المشيجي (Gametophyte) صغيراً ومختزلاً على هيئة تركيب قلبي أخضر (Heart-Shaped Green Structure). وتكتمل دورة الحياة (Life Cycle) بتكوين الأبواغ (Spores)، ونمو البروثالوس (Prothallus)، وتكوين الأمشاج (Gametes)، ثم الإخصاب (Fertilization) وتكوين اللاقحة (Zygote).

> ⚠️ **مهم وزارياً:** احفظ عدد الأنواع المعتمد في المنهج، وصف السرخسيات (Ferns) بأنها نباتات وعائية عديمة البذور، والفرق بين الطور البوغي (Sporophyte) والطور المشيجي (Gametophyte)، ومراحل الرسم الخمس بترتيبها.

## 📚 المفاهيم والشرح التفصيلي

### 1. موقع السرخسيات (Ferns) في تطور النباتات (Plant Evolution)

يمثل تسلسل التطور النباتي (Plant Evolution) الآتي:

1. الحزازيات (Mosses)، وهي نباتات أولية (Primitive Plants).
2. السرخسيات (Ferns)، وهي أكثر تطوراً من الحزازيات (Mosses).
3. النباتات الزهرية (Flowering Plants)، وهي أكثر رقيّاً في التسلسل.

كلما تقدمنا في التطور (Evolution):

- يقل اعتماد النبات (Plant) على الماء (Water) في التكاثر (Reproduction).
- يزداد بروز الطور البوغي (Sporophyte).
- يقل حجم الطور المشيجي (Gametophyte) ويصبح مختزلاً.

### 2. عدد أنواع السرخسيات (Ferns)

- ورد في بعض مصادر المنهج رقم **1150 نوعاً (1150 Species)**.
- ورد في نسخة أخرى رقم **12,000 نوع (12,000 Species)**.
- أوضحت الأستاذة أن الرقم المعتمد حالياً في منهج الطالب هو **12,000 نوع (12,000 Species)**، مع التنبيه إلى أن الرقم قد يكون خطأً في النسخة، لكن يجب اعتماده كما هو مكتوب حالياً إلى حين صدور التصويبات.

> ⚠️ **تنبيه وزاري:** اكتب في الإجابة الحالية: 12,000 نوع (12,000 Species)، كما شددت الأستاذة على اعتماد الرقم الموجود في المنهج الحالي.

### 3. صفات السرخسيات (Ferns)

#### أ. نباتات وعائية (Vascular Plants)

- السرخسيات (Ferns) نباتات وعائية (Vascular Plants).
- تمتلك تراكيب تساعد على نقل الماء (Water) والمواد داخل النبات (Plant).
- تختلف بذلك عن الحزازيات (Mosses)، التي وصفتها المحاضرة بأنها غير وعائية (Non-Vascular Plants).
- تحتاج السرخسيات (Ferns) إلى تراكيب نقل بسبب كبر حجمها ووجود الأوراق (Leaves)، خلافاً للحزازيات (Mosses) الصغيرة.

#### ب. عديمة البذور (Seedless Plants)

- السرخسيات (Ferns) نباتات عديمة البذور (Seedless Plants).
- لا تنتج بذوراً (Seeds)، بل تتكاثر بالأبواغ (Spores).
- لا تُعد نباتات زهرية (Flowering Plants)، ولذلك لا تتكون فيها البذور (Seeds) بالطريقة الموجودة في النباتات الزهرية (Flowering Plants).

#### ج. الطور البوغي (Sporophyte) السائد

- الطور البوغي (Sporophyte) هو الأكبر والأوضح (Largest and Most Visible) في السرخسيات (Ferns).
- يكون الطور البوغي (Sporophyte) سائداً (Dominant).
- يكون الطور المشيجي (Gametophyte) صغيراً ومختزلاً (Small and Reduced).

#### د. المعيشة (Habitat)

- تعيش السرخسيات (Ferns) في تربة رطبة (Moist Soil)، وليست مغمورة تماماً في الماء (Water).
- تحتاج إلى وجود الرطوبة (Moisture)، لكن النبات الكامل (Adult Plant) يعيش في وسط أرضي (Terrestrial Medium).

## 4. الطور البوغي (Sporophyte) في السرخسيات (Ferns)

### صفات الطور البوغي (Sporophyte)

- الطور البوغي (Sporophyte) ثنائي المجموعة الكروموسومية (Diploid)، ورمزه **2n**.
- يمثل النبات السرخسي الكامل (Complete Fern Plant) الذي نراه.
- يمتلك جذوراً (Roots) وأوراقاً (Leaves) وتراكيب وعائية (Vascular Structures).
- تثبت الجذور (Roots) النبات في التربة الرطبة (Moist Soil) وتمتص الماء (Water).
- تقوم الأوراق (Leaves) بالبناء الضوئي (Photosynthesis).
- توجد الأكياس البوغية (Sporangia) على السطح السفلي للأوراق (Lower Surface of Leaves).

### الأكياس البوغية (Sporangia)

- الأكياس البوغية (Sporangia) تراكيب تنتج الأبواغ (Spores).
- توجد على السطح السفلي للأوراق (Lower Surface of Leaves) التابعة للطور البوغي (Sporophyte).
- تحتوي الأكياس البوغية (Sporangia) خلايا أم الأبواغ (Spore Mother Cells).
- تكون خلايا أم الأبواغ (Spore Mother Cells) ثنائية المجموعة الكروموسومية (Diploid, 2n).
- تدخل خلايا أم الأبواغ (Spore Mother Cells) الانقسام الاختزالي (Meiosis).
- ينتج عن الانقسام الاختزالي (Meiosis) أبواغ (Spores) أحادية المجموعة الكروموسومية (Haploid, 1n).

> ⚠️ **مهم:** عند رؤية الأكياس البوغية (Sporangia) على السطح السفلي للورقة (Lower Leaf Surface)، فهذا جزء من الطور البوغي (Sporophyte)، وتكون داخله خلايا أم الأبواغ (Spore Mother Cells) التي تدخل الانقسام الاختزالي (Meiosis).

## 5. تكوين الأبواغ (Spore Formation)

1. تبدأ العملية في الطور البوغي (Sporophyte) ثنائي المجموعة الكروموسومية (2n).
2. توجد الأكياس البوغية (Sporangia) في السطح السفلي للأوراق (Lower Surface of Leaves).
3. تحتوي الأكياس البوغية (Sporangia) خلايا أم الأبواغ (Spore Mother Cells).
4. تدخل خلايا أم الأبواغ (Spore Mother Cells) الانقسام الاختزالي (Meiosis).
5. تنخفض المجموعة الكروموسومية من **2n** إلى **1n**.
6. تتكون الأبواغ (Spores) أحادية المجموعة الكروموسومية (Haploid, 1n).
7. يبدأ التكاثر اللاجنسي (Asexual Reproduction) بتكوين الأبواغ (Spores)؛ لأن الأبواغ (Spores) تكونت من دون اتحاد أمشاج (Gametes).

## 6. الطور المشيجي (Gametophyte) والبروثالوس (Prothallus)

### نشوء الطور المشيجي (Gametophyte)

- تنمو الأبواغ (Spores) بعد تحررها وسقوطها في وسط مناسب.
- ينمو البوغ (Spore) بالانقسام الخيطي (Mitosis).
- يتكون تركيب صغير أخضر (Small Green Structure) على هيئة قلب (Heart-Shaped).
- يسمى هذا التركيب البروثالوس (Prothallus).
- يمثل البروثالوس (Prothallus) الطور المشيجي (Gametophyte).
- يكون البروثالوس (Prothallus) أحادي المجموعة الكروموسومية (Haploid, 1n).

### صفات البروثالوس (Prothallus)

- يكون أخضر اللون (Green) بسبب احتوائه على تراكيب تساعد في البناء الضوئي (Photosynthesis).
- يكون على شكل قلب (Heart-Shaped).
- يكون صغير الحجم مقارنة بالطور البوغي (Sporophyte).
- يثبت نفسه بأشباه الجذور (Rhizoids).
- يحمل الأعضاء الجنسية (Sexual Organs): الأنثريديا (Antheridia) والأرشيغونة (Archegonium).

### الأعضاء الجنسية (Sexual Organs)

#### الأنثريديا (Antheridia)

- الأنثريديا (Antheridia) عضو جنسي ذكري (Male Sexual Organ).
- تكون على البروثالوس (Prothallus).
- تنتج الأمشاج الذكرية (Male Gametes) أو الحيوانات المنوية (Sperms).
- تكون الأمشاج الذكرية (Male Gametes) أحادية المجموعة الكروموسومية (Haploid, 1n).

#### الأرشيغونة (Archegonium)

- الأرشيغونة (Archegonium) عضو جنسي أنثوي (Female Sexual Organ).
- تكون على البروثالوس (Prothallus).
- تحتوي على البيضة (Egg) التي تمثل المشيج الأنثوي (Female Gamete).
- تكون البيضة (Egg) أحادية المجموعة الكروموسومية (Haploid, 1n).

## 7. التكاثر الجنسي (Sexual Reproduction) في السرخسيات (Ferns)

### المرحلة الأولى: تكوين الأمشاج (Gamete Formation)

1. ينمو البوغ (Spore) إلى البروثالوس (Prothallus) بالانقسام الخيطي (Mitosis).
2. يحمل البروثالوس (Prothallus) الأنثريديا (Antheridia) والأرشيغونة (Archegonium).
3. تنتج الأنثريديا (Antheridia) الأمشاج الذكرية (Male Gametes).
4. تحتوي الأرشيغونة (Archegonium) البيضة (Egg)، وهي المشيج الأنثوي (Female Gamete).
5. تكون الأمشاج (Gametes) **1n**.

### المرحلة الثانية: الإخصاب (Fertilization)

1. تتحد النواة الذكرية (Male Nucleus) مع النواة الأنثوية (Female Nucleus).
2. يحدث الإخصاب (Fertilization) داخل الأرشيغونة (Archegonium).
3. تتكون اللاقحة (Zygote).
4. تكون اللاقحة (Zygote) ثنائية المجموعة الكروموسومية (Diploid, 2n)، لأنها ناتجة من اتحاد مشيجين (Two Gametes) أحاديين (Haploid, 1n).

\[
1n\ \text{Male Gamete}+1n\ \text{Female Gamete}\xrightarrow{\text{Fertilization}}2n\ \text{Zygote}
\]

### المرحلة الثالثة: نمو اللاقحة (Zygote Growth)

1. تبدأ اللاقحة (Zygote) بالانقسام الخيطي (Mitosis).
2. تنمو اللاقحة (Zygote) إلى نسيج بوغي (Sporophyte Tissue).
3. يبدأ من اللاقحة (Zygote) تكوّن الطور البوغي (Sporophyte) الجديد.
4. يكون الطور البوغي (Sporophyte) ثنائي المجموعة الكروموسومية (2n).

### المرحلة الرابعة: ظهور السرخس الكامل (Adult Fern)

1. ينمو الطور البوغي (Sporophyte) إلى نبات سرخسي (Fern Plant) كامل.
2. تظهر الأوراق (Leaves) والجذور (Roots).
3. تثبت الجذور (Roots) النبات في التربة (Soil).
4. تنمو الأوراق (Leaves) وتقوم بالبناء الضوئي (Photosynthesis).
5. تبدأ الأكياس البوغية (Sporangia) بالظهور على السطح السفلي للأوراق (Lower Leaf Surface).
6. تعود الدورة إلى تكوين الأبواغ (Spores) من خلايا أم الأبواغ (Spore Mother Cells).

## 8. دورة الحياة الكاملة للسرخسيات (Complete Fern Life Cycle)

1. الطور البوغي (Sporophyte) السائد والكبير (Dominant and Large) يكون **2n**.
2. يحتوي الطور البوغي (Sporophyte) على الأكياس البوغية (Sporangia) على السطح السفلي للأوراق (Lower Leaf Surface).
3. تدخل خلايا أم الأبواغ (Spore Mother Cells) الانقسام الاختزالي (Meiosis).
4. تتكون الأبواغ (Spores) **1n**.
5. تنمو الأبواغ (Spores) بالانقسام الخيطي (Mitosis) إلى البروثالوس (Prothallus).
6. يمثل البروثالوس (Prothallus) الطور المشيجي (Gametophyte) الصغير **1n**.
7. يحمل البروثالوس (Prothallus) الأنثريديا (Antheridia) والأرشيغونة (Archegonium).
8. تتكون الأمشاج (Gametes) وتحدث عملية الإخصاب (Fertilization).
9. تتكون اللاقحة (Zygote) **2n** داخل الأرشيغونة (Archegonium).
10. تنمو اللاقحة (Zygote) بالانقسام الخيطي (Mitosis) إلى طور بوغي جديد (New Sporophyte).
11. يكبر الطور البوغي (Sporophyte) ويصبح سرخساً كاملاً (Adult Fern)، ثم يعيد تكوين الأكياس البوغية (Sporangia).

### مخطط دورة الحياة (Life Cycle Scheme)

\[
\text{Sporophyte }(2n)
\xrightarrow{\text{Sporangia and Meiosis}}
\text{Spores }(1n)
\xrightarrow{\text{Mitosis}}
\text{Prothallus/Gametophyte }(1n)
\xrightarrow{\text{Antheridia and Archegonium}}
\text{Gametes }(1n)
\xrightarrow{\text{Fertilization}}
\text{Zygote }(2n)
\xrightarrow{\text{Mitosis and Growth}}
\text{Adult Sporophyte }(2n)
\]

## 9. مقارنة السرخسيات (Ferns) بالحزازيات (Mosses)

| وجه المقارنة | الحزازيات (Mosses) | السرخسيات (Ferns) |
|---|---|---|
| الأوعية الناقلة | غير وعائية (Non-Vascular) | وعائية (Vascular) |
| البذور | عديمة البذور (Seedless) | عديمة البذور (Seedless) |
| الطور السائد | الطور المشيجي (Gametophyte) | الطور البوغي (Sporophyte) |
| الطور المختزل | الطور البوغي (Sporophyte) | الطور المشيجي (Gametophyte) |
| التركيب المشيجي | تركيب مشيجي أكبر نسبياً | بروثالوس قلبي صغير (Small Heart-Shaped Prothallus) |
| الحاجة إلى الماء | ضرورية للتكاثر (Reproduction) | ما زالت مطلوبة لوصول الأمشاج الذكرية (Male Gametes) بحسب شرح المحاضرة |
| الأبواغ | تتكون في الكيس البوغي (Sporangium) | تتكون في الأكياس البوغية (Sporangia) على السطح السفلي للأوراق (Lower Leaf Surface) |

## 📖 التعريفات والمصطلحات

- **السرخسيات (Ferns):** نباتات وعائية عديمة البذور (Vascular Seedless Plants) يكون فيها الطور البوغي (Sporophyte) هو السائد والأكبر.
- **النباتات الوعائية (Vascular Plants):** نباتات تمتلك تراكيب لنقل الماء (Water) والمواد داخل الجسم النباتي (Plant Body).
- **النباتات عديمة البذور (Seedless Plants):** نباتات لا تنتج بذوراً (Seeds)، وتتكاثر بالأبواغ (Spores).
- **الطور البوغي (Sporophyte):** الطور ثنائي المجموعة الكروموسومية (Diploid, 2n) الذي يمثل السرخس الكامل (Adult Fern) وينتج الأبواغ (Spores).
- **الطور المشيجي (Gametophyte):** الطور أحادي المجموعة الكروموسومية (Haploid, 1n) الذي ينشأ من البوغ (Spore) ويحمل الأعضاء الجنسية (Sexual Organs).
- **الكيس البوغي (Sporangium):** تركيب ينتج الأبواغ (Spores)، وجمعه الأكياس البوغية (Sporangia).
- **خلية أم الأبواغ (Spore Mother Cell):** خلية ثنائية المجموعة الكروموسومية (Diploid, 2n) تدخل الانقسام الاختزالي (Meiosis) لتكوين الأبواغ (Spores).
- **البوغ (Spore):** خلية أحادية المجموعة الكروموسومية (Haploid, 1n) ناتجة من الانقسام الاختزالي (Meiosis)، وتنمو إلى الطور المشيجي (Gametophyte).
- **البروثالوس (Prothallus):** تركيب أخضر صغير قلبي الشكل (Small Heart-Shaped Green Structure) يمثل الطور المشيجي (Gametophyte) في السرخسيات (Ferns).
- **الأنثريديا (Antheridia):** عضو جنسي ذكري (Male Sexual Organ) على البروثالوس (Prothallus)، ينتج الأمشاج الذكرية (Male Gametes).
- **الأرشيغونة (Archegonium):** عضو جنسي أنثوي (Female Sexual Organ) على البروثالوس (Prothallus)، يحتوي على البيضة (Egg).
- **الجذور (Roots):** تراكيب تثبت السرخس (Fern) في التربة (Soil) وتمتص الماء (Water).
- **الأوراق (Leaves):** تراكيب تقوم بالبناء الضوئي (Photosynthesis) وتحمل الأكياس البوغية (Sporangia) على سطحها السفلي (Lower Surface).
- **الإخصاب (Fertilization):** اتحاد المشيج الذكري (Male Gamete) مع المشيج الأنثوي (Female Gamete) لتكوين اللاقحة (Zygote).
- **اللاقحة (Zygote):** خلية ثنائية المجموعة الكروموسومية (Diploid, 2n) تنشأ بعد الإخصاب (Fertilization)، وتبدأ الطور البوغي (Sporophyte).

## 🔢 القوانين / الصيغ / القواعد

### القاعدة الكروموسومية

\[
\text{Spore Mother Cell }(2n)\xrightarrow{\text{Meiosis}}\text{Spore }(1n)
\]

\[
1n\ \text{Male Gamete}+1n\ \text{Female Gamete}\xrightarrow{\text{Fertilization}}2n\ \text{Zygote}
\]

### قاعدة تحديد الطور من الرسم

- رؤية الأكياس البوغية (Sporangia) على السطح السفلي للأوراق (Lower Leaf Surface) = الطور البوغي (Sporophyte).
- رؤية الأبواغ (Spores) = بداية الطور المشيجي (Gametophyte).
- رؤية البروثالوس (Prothallus) الأخضر القلبي = الطور المشيجي (Gametophyte).
- رؤية الأنثريديا (Antheridia) والأرشيغونة (Archegonium) = أعضاء جنسية على الطور المشيجي (Gametophyte).
- رؤية اللاقحة (Zygote) = بداية الطور البوغي (Sporophyte).

## 🧪 المسائل والأمثلة المحلولة

### مثال 1: تحديد صفة السرخسيات (Ferns)

- **المعطى:** نبات ينتج الأبواغ (Spores)، وله أوراق (Leaves) وجذور (Roots)، ولا ينتج بذوراً (Seeds).
- **القاعدة:** السرخسيات (Ferns) نباتات وعائية عديمة البذور (Vascular Seedless Plants).
- **الناتج:** النبات سرخسي (Fern)، وطورُه البوغي (Sporophyte) هو الطور السائد (Dominant).

### مثال 2: تحديد ناتج خلية أم الأبواغ (Spore Mother Cell)

- **المعطى:** خلية أم الأبواغ (Spore Mother Cell) داخل الكيس البوغي (Sporangium)، وهي **2n**.
- **القانون:** تدخل الانقسام الاختزالي (Meiosis).
- **الخطوات:**
  1. تبدأ الخلية بـ **2n**.
  2. يحدث الانقسام الاختزالي (Meiosis).
  3. ينخفض العدد الكروموسومي إلى **1n**.
- **الناتج النهائي:** أبواغ (Spores) أحادية المجموعة الكروموسومية (Haploid, 1n).

### مثال 3: تحديد الطور من تركيب قلبي أخضر (Heart-Shaped Green Structure)

- **المعطى:** تركيب صغير أخضر قلبي الشكل (Small Heart-Shaped Green Structure) يحمل الأنثريديا (Antheridia) والأرشيغونة (Archegonium).
- **القاعدة:** هذا التركيب هو البروثالوس (Prothallus)، ويمثل الطور المشيجي (Gametophyte).
- **الناتج:** طور مشيجي (Gametophyte) أحادي المجموعة الكروموسومية (Haploid, 1n).

### مثال 4: ترتيب دورة حياة السرخسيات (Fern Life Cycle)

- **المطلوب:** ترتيب المراحل.
- **الخطوات:**
  1. سرخس كامل (Adult Fern) ثنائي (2n).
  2. أكياس بوغية (Sporangia) على السطح السفلي للأوراق (Lower Leaf Surface).
  3. انقسام اختزالي (Meiosis) وتكوّن أبواغ (Spores) **1n**.
  4. نمو البوغ (Spore) بالانقسام الخيطي (Mitosis) إلى بروثالوس (Prothallus).
  5. تكوّن الأنثريديا (Antheridia) والأرشيغونة (Archegonium).
  6. إخصاب (Fertilization) وتكوّن لاقحة (Zygote) **2n**.
  7. نمو اللاقحة (Zygote) إلى طور بوغي جديد (New Sporophyte).

## ⚠️ تنبيهات وأخطاء شائعة (ملاحظات وزارية)

> ⚠️ **1.** السرخسيات (Ferns) نباتات وعائية عديمة البذور (Vascular Seedless Plants)، أما الحزازيات (Mosses) فهي غير وعائية (Non-Vascular Plants).

> ⚠️ **2.** العدد المعتمد حالياً في المنهج للسرخسيات (Ferns) هو 12,000 نوع (12,000 Species)، رغم وجود رقم 1150 في مصادر أخرى.

> ⚠️ **3.** الطور البوغي (Sporophyte) هو السائد والأكبر (Dominant and Larger) في السرخسيات (Ferns)، بعكس الحزازيات (Mosses) التي يكون فيها الطور المشيجي (Gametophyte) هو السائد.

> ⚠️ **4.** السرخسيات (Ferns) لا تنتج بذوراً (Seeds)، بل تتكاثر بالأبواغ (Spores).

> ⚠️ **5.** توجد الأكياس البوغية (Sporangia) على السطح السفلي للأوراق (Lower Surface of Leaves) التابعة للطور البوغي (Sporophyte).

> ⚠️ **6.** الأكياس البوغية (Sporangia) تحتوي خلايا أم الأبواغ (Spore Mother Cells) **2n**، وهذه الخلايا تدخل الانقسام الاختزالي (Meiosis) لتكوين الأبواغ (Spores) **1n**.

> ⚠️ **7.** البروثالوس (Prothallus) تركيب أخضر صغير قلبي الشكل (Small Heart-Shaped Green Structure)، ويمثل الطور المشيجي (Gametophyte)، وليس الطور البوغي (Sporophyte).

> ⚠️ **8.** الأنثريديا (Antheridia) تنتج الأمشاج الذكرية (Male Gametes)، والأرشيغونة (Archegonium) تحتوي البيضة (Egg).

> ⚠️ **9.** اللاقحة (Zygote) ناتجة من الإخصاب (Fertilization)، وهي **2n**، ومنها يبدأ الطور البوغي (Sporophyte).

> ⚠️ **10.** احفظ الفرق بين الجذر (Root) وأشباه الجذور (Rhizoids): الجذور (Roots) تخص السرخس الكامل (Adult Fern)، وأشباه الجذور (Rhizoids) تثبت البروثالوس (Prothallus).

> ⚠️ **11.** رسم دورة الحياة (Life Cycle) مطلوب بالتسلسل، وقد أكدت الأستاذة حفظ الرسم والشرح وكتابة الأسئلة الوزارية المتعلقة به.

> ⚠️ **12.** لا تخلط بين الأبواغ (Spores) والأمشاج (Gametes): الأبواغ (Spores) تنتج من خلايا أم الأبواغ (Spore Mother Cells) بالانقسام الاختزالي (Meiosis)، بينما الأمشاج (Gametes) تنتج من البروثالوس (Prothallus).

## 🧠 الخلاصة

- السرخسيات (Ferns) نباتات وعائية عديمة البذور (Vascular Seedless Plants)، وتُعد أكثر تطوراً من الحزازيات (Mosses).
- الطور البوغي (Sporophyte) هو الطور السائد والكبير (Dominant and Large) ورمزه **2n**، ويحمل الأكياس البوغية (Sporangia) على السطح السفلي للأوراق (Lower Leaf Surface).
- تدخل خلايا أم الأبواغ (Spore Mother Cells) الانقسام الاختزالي (Meiosis) وتنتج أبواغاً (Spores) **1n**.
- تنمو الأبواغ (Spores) إلى البروثالوس (Prothallus)، وهو الطور المشيجي (Gametophyte) الأخضر الصغير القلبي، ويحمل الأنثريديا (Antheridia) والأرشيغونة (Archegonium).
- يحدث الإخصاب (Fertilization) فتتكون اللاقحة (Zygote) **2n**، وتنمو إلى سرخس كامل (Adult Fern)، وبذلك تكتمل دورة الحياة (Life Cycle).

## 📝 Review Questions

1. Why are ferns classified as vascular seedless plants?
2. Which generation is dominant in ferns, and what is its chromosome number?
3. Where are the sporangia located, and what do they contain?
4. Describe the structure and function of the prothallus.
5. What are the functions of antheridia and archegonium in ferns?
6. Explain the complete life cycle of a fern from spore formation to the adult sporophyte.

---
$lecture_notes$
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_videos
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec13-study'
    AND title = 'المحاضرة 13 — تكاثر السرخسيات ودورة حياتها'
);
