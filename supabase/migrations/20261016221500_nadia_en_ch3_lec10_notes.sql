-- Nadia Al-Nuaimi · Distinguished curriculum · Chapter 3 · Lecture 10
-- Publish the supplied Euglena and Kingdom Fungi notes as a notes-only lesson.
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
  'nadia-en-ch3-lec10-study',
  '',
  NULL,
  'المحاضرة 10 — اليوجلينا ومملكة الفطريات',
  NULL,
  jsonb_build_array(
    jsonb_build_object(
      'title', 'اليوجلينا ومملكة الفطريات',
      'notes', $lecture_notes$
# المحاضرة العاشرة – اليوجلينا (Euglena) ومملكة الفطريات (Kingdom Fungi)

## 🧭 نظرة عامة سريعة

تتناول المحاضرة موضوعين من الفصل الثالث: اليوجلينا (Euglena) بوصفها من الطليعيات السوطية (Flagellated Protists)، ومملكة الفطريات (Kingdom Fungi) مع التركيز على الفطر الأسود لعفن الخبز (Black Bread Mold)، ولا سيما شعبة الزيجية (Zygomycota). تشرح المحاضرة معيشة اليوجلينا (Euglena)، حالتيها الحرة والمتكيسة (Free and Encysted Forms)، وتكاثرها اللاجنسي (Asexual Reproduction) بالانشطار الثنائي المتطاول (Elongated Binary Fission). ثم تنتقل إلى خصائص الفطريات (Fungi)، أوجه اختلافها عن النباتات (Plants)، وتصنيف الزيجية (Zygomycota) وتركيب فطر عفن الخبز الأسود (Black Bread Mold) وتكاثره اللاجنسي والجنسي (Asexual and Sexual Reproduction).

> ⚠️ **مهم وزارياً:** ركزت الأستاذة على رسم مراحل تكاثر اليوجلينا (Euglena)، وعلى أعداد الأنواع والمصطلحات الخاصة بفطر عفن الخبز الأسود (Black Bread Mold)، وعلى رسم التكاثر الجنسي (Sexual Reproduction) في الزيجية (Zygomycota).

## 📚 المفاهيم والشرح التفصيلي

## أولاً: اليوجلينا (Euglena)

### 1. تصنيف اليوجلينا (Euglena)

- تنتمي اليوجلينا (Euglena) إلى مملكة الطليعيات (Kingdom Protista).
- اليوجلينا (Euglena) من الطليعيات السوطية (Flagellated Protists)، أي إن الحركة تكون بوساطة السوط (Flagellum).
- بخلاف البراميسيوم (Paramecium)، الذي يمثل الطليعيات الهدبية (Ciliated Protists)، تمثل اليوجلينا (Euglena) الطليعيات السوطية (Flagellated Protists).

> ⚠️ **فراغ مهم:** البراميسيوم (Paramecium) مثال على الطليعيات الهدبية (Ciliated Protists)، أما اليوجلينا (Euglena) فمثال على الطليعيات السوطية (Flagellated Protists).

### 2. معيشة اليوجلينا (Euglena)

تعيش اليوجلينا (Euglena) في:

- المياه الجارية (Running Water).
- المياه التي تحتوي على النباتات المائية (Water Plants).

> ⚠️ **تنبيه:** احفظ أن بيئة اليوجلينا (Euglena) هي المياه الجارية (Running Water) المحتوية على النباتات المائية (Water Plants)، كما ورد في المحاضرة.

### 3. حالتا اليوجلينا (Euglena)

لليوجلينا (Euglena) حالتان أو شكلان:

#### أ. الحالة الحرة (Free Form)

- تكون اليوجلينا (Euglena) حرة في الماء.
- يكون جسمها في حالته الطبيعية.
- تقوم بالتغذية (Nutrition) والتكاثر (Reproduction) وهي في الحالة الحرة (Free Form).

#### ب. الحالة المتكيسة (Encysted Form)

- عندما تصبح الظروف البيئية غير ملائمة (Unfavorable Conditions)، تحيط اليوجلينا (Euglena) نفسها بغلاف أو كيس (Cyst).
- يحمي الكيس (Cyst) اليوجلينا (Euglena) من الظروف السيئة (Bad Conditions).
- يمكن أن تتكاثر اليوجلينا (Euglena) في الحالة الحرة (Free Form) والحالة المتكيسة (Encysted Form)، وكلتا الحالتين تتكاثران لاجنسياً (Asexually).

### 4. تكاثر اليوجلينا (Euglena)

#### نوع التكاثر

- التكاثر في اليوجلينا (Euglena) لاجنسي (Asexual Reproduction).
- يحدث التكاثر بالانشطار الثنائي المتطاول (Elongated Binary Fission).
- في المنهج العربي وردت تسمية الانشطار الثنائي المتطاول (Elongated Binary Fission)، ويجب الالتزام بالتسمية الموجودة في منهج الطالب.
- لا يتناول هذا الجزء التكاثر الجنسي (Sexual Reproduction) في اليوجلينا (Euglena)، إذ ذُكر أنه غير معروف أو لم يُشرح ضمن المحاضرة.

> ⚠️ **مهم جداً:** لا تكتب للوجيلينا (Euglena) الانشطار الثنائي المستعرض (Transverse Binary Fission) الخاص بالبراميسيوم (Paramecium). اليوجلينا (Euglena) تتكاثر بالانشطار الثنائي المتطاول (Elongated Binary Fission).

### 5. مراحل الانشطار الثنائي المتطاول (Elongated Binary Fission) في اليوجلينا (Euglena)

أكدت المحاضرة وجود نقطتين أساسيتين في بداية العملية، ثم تكتمل العملية بثلاث مراحل مرسومة.

#### المرحلة الأولى: انقسام النواة (Nuclear Division) وتكوّن السوط الجديد (New Flagellum)

1. تدخل النواة (Nucleus) في الانقسام الخيطي أو الطبيعي (Mitosis/Normal Division).
2. تنقسم النواة الأصلية (Original Nucleus) إلى نواتين متطابقتين (Two Identical Nuclei).
3. بالتزامن مع انقسام النواة (Nuclear Division)، يتكوّن سوط إضافي جديد (New Additional Flagellum).
4. يجب إظهار النواة الأصلية (Original Nucleus) والنواتين الناتجتين (Two Resulting Nuclei) والسوط الأصلي (Original Flagellum) والسوط الجديد (New Flagellum) في الرسم.

#### المرحلة الثانية: الانشطار الطولي التدريجي (Gradual Longitudinal Fission)

1. يبدأ جسم اليوجلينا (Euglena) بالانقسام بصورة تدريجية.
2. يكون الانقسام طولياً (Longitudinal)، أي من أعلى الجسم إلى أسفله.
3. تتباعد الأسواط (Flagella) ويصبح بين السوطين (Two Flagella) مسافة واضحة.
4. تستعد النواتان (Two Nuclei) للانفصال، وتبقى البلاستيدات (Plastids) ظاهرة في الجسم.

> ⚠️ **ملاحظة الرسم:** ورد في الرسم شكل عرضي تدريجي في بعض الترقيم، لكن شددت الأستاذة على حفظ الانشطار المتطاول (Elongated Fission) كما هو موجود في منهج الطالب.

#### المرحلة الثالثة: انقسام السيتوبلازم (Cytoplasmic Division) وتكوّن فردين

1. بعد اكتمال انقسام النواة (Nuclear Division) وتباعد الأسواط (Flagella)، يبدأ السيتوبلازم (Cytoplasm) بالانقسام.
2. يمتد الانقسام من أعلى جسم اليوجلينا (Euglena) إلى أسفله.
3. ينتهي الانقسام بتكوين كائنين جديدين كاملين (Two Complete New Organisms).
4. يمتلك كل فرد جديد (New Individual):
   - نواة (Nucleus).
   - سوطاً (Flagellum).
   - بلاستيدات (Plastids).
5. الناتج النهائي هو فردان جديدان من اليوجلينا (Two New Euglena Individuals).

### 6. خلاصة رسم تكاثر اليوجلينا (Euglena)

في الرسم يجب متابعة التسلسل الآتي:

1. نواة أصلية (Original Nucleus) وسوط أصلي (Original Flagellum) وبلاستيدات (Plastids).
2. انقسام النواة (Nuclear Division) إلى نواتين (Two Nuclei) وتكوّن سوط جديد (New Flagellum).
3. تباعد السوطين (Two Flagella) وبدء الانشطار الطولي (Longitudinal Fission).
4. انقسام السيتوبلازم (Cytoplasmic Division) وتكوّن فردين كاملين (Two Complete Individuals).

## ثانياً: مملكة الفطريات (Kingdom Fungi)

### 1. عدد أفراد مملكة الفطريات (Kingdom Fungi)

- تضم مملكة الفطريات (Kingdom Fungi) أكثر من مئة ألف كائن (More Than 100,000 Organisms)، بحسب الرقم المذكور في المحاضرة.
- لم تُشخّص جميع الفطريات (Fungi) حتى الآن.
- لذلك لا تزال بعض الفطريات (Fungi) غير مدرجة في تصنيف كامل إلى صف (Class) أو رتبة (Order) أو عائلة (Family)، لكنها مدرجة ضمن مملكة الفطريات (Kingdom Fungi).

> ⚠️ **مهم:** عدد أفراد مملكة الفطريات (Kingdom Fungi) المذكور في المحاضرة هو أكثر من 100,000 نوع (More Than 100,000 Species/Organisms).

### 2. علاقة الفطريات (Fungi) بالنباتات (Plants)

ناقشت المحاضرة سبب إرجاع بعض العلماء الفطريات (Fungi) إلى أسلاف النباتات (Plant Ancestors)، ثم ذكرت صفات الاختلاف بين الفطريات (Fungi) والنباتات (Plants).

#### أوجه التشابه المذكورة

- توجد نقاط تشابه (Similarities) بين الفطريات (Fungi) والنباتات (Plants)، وقد أشارت المحاضرة إلى وجود ثلاث نقاط تشابه وثلاث نقاط اختلاف ضمن المقارنة.
- تُراجع هذه النقاط بحسب الجدول أو النص الموجود في ملزمة الطالب، مع التركيز على نقاط الاختلاف التي شرحتها الأستاذة تفصيلاً.

#### أوجه الاختلاف الأساسية

##### أ. الأصباغ (Pigments)

- لا تمتلك الفطريات (Fungi) صبغات البناء الضوئي (Photosynthetic Pigments) الموجودة في النباتات (Plants)، ولا تمتلك الكلوروفيل (Chlorophyll) أو الكاروتين (Carotene) كما ورد في المحاضرة.
- بسبب غياب هذه الأصباغ (Pigments)، لا تستطيع الفطريات (Fungi) إجراء البناء الضوئي (Photosynthesis).

##### ب. استراتيجية التغذية (Nutritional Strategy)

- النباتات (Plants) ذاتية التغذية (Autotrophic)، إذ تصنع غذاءها بنفسها بوجود الكلوروفيل (Chlorophyll) والبلاستيدات (Plastids).
- الفطريات (Fungi) غير ذاتية التغذية (Heterotrophic)، ولا تصنع غذاءها بنفسها.
- تحصل الفطريات (Fungi) على الغذاء الجاهز (Ready-Made Food) وتمتصه (Absorb It)، ولذلك تختلف استراتيجية تغذيتها (Nutritional Strategy) عن استراتيجية تغذية النباتات (Plants).

> ⚠️ **تعليل مهم:** لا تستطيع الفطريات (Fungi) إجراء البناء الضوئي (Photosynthesis) لأنها لا تمتلك الكلوروفيل (Chlorophyll) والصبغات اللازمة لذلك.

### 3. شعبة الزيجية (Zygomycota)

- يُدرَس في هذه المحاضرة الفطر الأسود لعفن الخبز (Black Bread Mold).
- ينتمي الفطر الأسود لعفن الخبز (Black Bread Mold) إلى شعبة الزيجية (Zygomycota).
- تضم شعبة الزيجية (Zygomycota) نحو 1050 نوعاً (Approximately 1050 Species)، وهو عدد مهم للحفظ.
- من أمثلتها فطريات عفن الخبز (Bread Molds).

> ⚠️ **مهم وزارياً:** احفظ العدد التقريبي لأنواع شعبة الزيجية (Zygomycota): **1050 نوعاً (1050 Species)**.

### 4. تركيب فطر عفن الخبز الأسود (Black Bread Mold)

#### أ. قطعة الخبز (Bread Piece)

ينمو فطر عفن الخبز الأسود (Black Bread Mold) على قطعة الخبز (Bread Piece)، وتظهر تراكيبه فوقها أو مثبتة فيها.

#### ب. أشباه الجذور (Rhizoids)

- تشبه أشباه الجذور (Rhizoids) الجذور (Roots) في الشكل.
- تثبّت الفطر (Fungus) على قطعة الخبز (Bread Piece).
- تظهر عند قاعدة الفطر (Fungus Base).

#### ج. الخيط الفطري أو الهيفا (Hypha)

- الهيفا (Hypha) هي الخيط الفطري (Fungal Filament).
- تمثل الهيفات (Hyphae) الخيوط التي تكوّن جسم الفطر (Fungal Body).

#### د. حامل الكيس البوغي (Sporangiophore)

- يخرج حامل الكيس البوغي (Sporangiophore) من منطقة أشباه الجذور (Rhizoids) أو الخيط الفطري (Hypha).
- يحمل حامل الكيس البوغي (Sporangiophore) الكيس البوغي (Sporangium).

#### هـ. الكيس البوغي (Sporangium)

- الكيس البوغي (Sporangium) يشبه العلبة الكروية أو العلبة البوغية (Spore Case).
- توجد الأبواغ (Spores) داخل الكيس البوغي (Sporangium).
- الأبواغ (Spores) أحادية المجموعة الكروموسومية (Haploid)، ويرمز لها بـ **1n**.

### 5. التكاثر اللاجنسي (Asexual Reproduction) في فطر عفن الخبز الأسود (Black Bread Mold)

1. في الظروف الملائمة (Favorable Conditions)، ينمو الفطر (Fungus) على الخبز (Bread).
2. يتكوّن حامل الكيس البوغي (Sporangiophore).
3. يتكوّن الكيس البوغي (Sporangium) في نهاية حامل الكيس البوغي (Sporangiophore).
4. تتكون داخل الكيس البوغي (Sporangium) أبواغ (Spores) أحادية المجموعة الكروموسومية (Haploid)، **1n**.
5. تنضج الأبواغ (Spores) ثم تخرج من الكيس البوغي (Sporangium) وتسقط على الخبز (Bread).
6. تنمو الأبواغ (Spores) من جديد، ويتكوّن فطر جديد (New Fungus).
7. هذا التكاثر تكاثر لاجنسي (Asexual Reproduction) بوساطة الأبواغ (Spores).

### 6. متى يبدأ التكاثر الجنسي (Sexual Reproduction) في الزيجية (Zygomycota)؟

- عندما تصبح الظروف غير ملائمة (Unfavorable Conditions)، يتجه الفطر (Fungus) إلى التكاثر الجنسي (Sexual Reproduction).
- التكاثر الجنسي (Sexual Reproduction) يحتاج إلى خيطين فطريين (Two Hyphae) من سلالتين مختلفتين (Different Strains).
- يمثل الخيطان الفطريان (Two Hyphae) سلالة موجبة (+) وسلالة سالبة (−).

### 7. مراحل التكاثر الجنسي (Sexual Reproduction) في الزيجية (Zygomycota)

#### المرحلة الأولى: تقابل الخيطين الفطريين (Meeting of Two Hyphae)

1. يتقابل خيطان فطريان (Two Hyphae).
2. يكون أحدهما موجباً (+) والآخر سالباً (−).
3. ينتميان إلى سلالتين مختلفتين (Different Strains).
4. يبدأ التلامس (Contact) بين الخيطين الفطريين (Two Hyphae).

#### المرحلة الثانية: تكوّن النتوءين والاندماج السيتوبلازمي (Plasmogamy)

1. يتكون نتوء أو فرع صغير (Small Projection) من الخيط الفطري الموجب (+).
2. يتكون نتوء أو فرع صغير (Small Projection) من الخيط الفطري السالب (−).
3. تتجه النواة الموجبة (Positive Nucleus) والنواة السالبة (Negative Nucleus) إلى منطقة التلامس (Contact Region).
4. يحدث اندماج سيتوبلازمي (Cytoplasmic Fusion/Plasmogamy) بين الخيطين الفطريين (Two Hyphae).
5. لا يحدث الاندماج النووي (Nuclear Fusion) في هذه المرحلة؛ تبقى النواة الموجبة (Positive Nucleus) والنواة السالبة (Negative Nucleus) كل واحدة في موضعها.

#### المرحلة الثالثة: تكوّن الخلية المشيجية (Gametangium)

1. بعد الاندماج السيتوبلازمي (Cytoplasmic Fusion)، تُغلق جدران الهيفات (Hyphal Walls) من الجانبين.
2. تتكوّن خلية مشيجية (Gametangium) أو قميت (Gamete Cell) تحتوي على نواة موجبة (Positive Nucleus) ونواة سالبة (Negative Nucleus).
3. يبقى التركيب موجباً وسالباً (Positive and Negative) في هذه المرحلة.
4. يحدث لاحقاً اتحاد نووي (Nuclear Fusion) بين النواة الموجبة (Positive Nucleus) والنواة السالبة (Negative Nucleus).

#### المرحلة الرابعة: تكوّن اللاقحة (Zygote)

1. تتحد النواة الموجبة (Positive Nucleus) مع النواة السالبة (Negative Nucleus).
2. ينتج عن الاتحاد النووي (Nuclear Fusion) نواة واحدة (One Nucleus).
3. تتكوّن اللاقحة (Zygote).
4. تكون اللاقحة (Zygote) ثنائية المجموعة الكروموسومية (Diploid)، بينما كانت الأبواغ (Spores) أحادية المجموعة الكروموسومية (Haploid)، **1n**.

#### المرحلة الخامسة: تكوّن الغلاف (Coat Formation)

1. لأن الظروف غير ملائمة (Unfavorable Conditions)، تحيط اللاقحة (Zygote) نفسها بغلاف (Coat/Cyst Wall).
2. وظيفة الغلاف (Coat) هي حماية اللاقحة (Zygote) ومقاومة الظروف غير الملائمة (Unfavorable Conditions).
3. تنتظر اللاقحة (Zygote) داخل الغلاف (Coat) حتى تتحسن الظروف.

#### المرحلة السادسة: الانقسام الاختزالي (Meiosis) وتكوين الأبواغ (Spores)

1. عند تحسن الظروف وعودتها إلى الحالة الملائمة (Favorable Conditions)، تدخل اللاقحة (Zygote) في الانقسام الاختزالي (Meiosis).
2. ينتج من الانقسام الاختزالي (Meiosis) أربع أبواغ (Four Spores).
3. تكون الأبواغ الأربع (Four Spores) أحادية المجموعة الكروموسومية (Haploid)، **1n**.
4. يتكوّن حامل كيس بوغي (Sporangiophore) يحمل كيساً بوغياً (Sporangium).
5. توجد الأبواغ الأربع (Four Spores) داخل الكيس البوغي (Sporangium).
6. تبقى الأبواغ (Spores) داخله حتى تنضج (Maturation).
7. بعد النضوج (Maturation) يتمزق الكيس البوغي (Sporangium)، وتخرج الأبواغ (Spores).
8. تسقط الأبواغ (Spores) على قطعة خبز (Bread Piece) جديدة، وتنمو إلى فطر جديد (New Fungus).

## 📖 التعريفات والمصطلحات

- **اليوجلينا (Euglena):** كائن من مملكة الطليعيات (Kingdom Protista) ومن الطليعيات السوطية (Flagellated Protists)، يعيش في المياه الجارية (Running Water) المحتوية على النباتات المائية (Water Plants).
- **السوط (Flagellum):** تركيب تستخدمه اليوجلينا (Euglena) في الحركة، وتتميز بوجوده الطليعيات السوطية (Flagellated Protists).
- **الحالة الحرة (Free Form):** حالة اليوجلينا (Euglena) عندما تكون حرة في الماء وتقوم بالتغذية (Nutrition) والتكاثر (Reproduction).
- **الحالة المتكيسة (Encysted Form):** حالة تحيط فيها اليوجلينا (Euglena) نفسها بكيس (Cyst) عند الظروف غير الملائمة (Unfavorable Conditions).
- **الانشطار الثنائي المتطاول (Elongated Binary Fission):** طريقة التكاثر اللاجنسي (Asexual Reproduction) في اليوجلينا (Euglena)، وينقسم فيها الجسم طولياً إلى فردين جديدين (Two New Individuals).
- **مملكة الفطريات (Kingdom Fungi):** مملكة تضم أكثر من مئة ألف كائن (More Than 100,000 Organisms)، ولا تزال بعض أفرادها غير مشخصة تصنيفياً بصورة كاملة.
- **شعبة الزيجية (Zygomycota):** شعبة من الفطريات (Fungi) يدرس منها فطر عفن الخبز الأسود (Black Bread Mold)، وتضم نحو 1050 نوعاً (1050 Species).
- **عفن الخبز الأسود (Black Bread Mold):** فطر ينمو على الخبز (Bread)، ومن أمثلة الفطريات التابعة لشعبة الزيجية (Zygomycota).
- **أشباه الجذور (Rhizoids):** تراكيب تشبه الجذور (Roots)، وتثبت الفطر (Fungus) على قطعة الخبز (Bread Piece).
- **الهيفا أو الخيط الفطري (Hypha):** خيط فطري (Fungal Filament) يكوّن جسم الفطر (Fungal Body).
- **حامل الكيس البوغي (Sporangiophore):** تركيب يحمل الكيس البوغي (Sporangium) ويخرج من منطقة أشباه الجذور (Rhizoids) أو الهيفا (Hypha).
- **الكيس البوغي (Sporangium):** علبة بوغية (Spore Case) تحتوي على الأبواغ (Spores).
- **البوغ (Spore):** تركيب تكاثري يوجد داخل الكيس البوغي (Sporangium)، ويكون أحادي المجموعة الكروموسومية (Haploid)، **1n**.
- **الاندماج السيتوبلازمي (Cytoplasmic Fusion/Plasmogamy):** اتحاد سيتوبلازم الخيطين الفطريين (Two Hyphae) بعد تلامسهما، قبل الاندماج النووي (Nuclear Fusion).
- **الاندماج النووي (Nuclear Fusion/Karyogamy):** اتحاد النواة الموجبة (Positive Nucleus) مع النواة السالبة (Negative Nucleus) وتكوّن نواة واحدة (One Nucleus).
- **الخلية المشيجية (Gametangium):** خلية تتكون بعد الاندماج السيتوبلازمي (Cytoplasmic Fusion) وتحتوي على نواة موجبة (Positive Nucleus) ونواة سالبة (Negative Nucleus).
- **اللاقحة (Zygote):** ناتج الاندماج النووي (Nuclear Fusion) بين النواة الموجبة (Positive Nucleus) والنواة السالبة (Negative Nucleus)، وتكون ثنائية المجموعة الكروموسومية (Diploid).

## 🔢 القوانين / الصيغ / القواعد

### القاعدة الكروموسومية في التكاثر اللاجنسي (Asexual Reproduction)

الأبواغ (Spores) في التكاثر اللاجنسي (Asexual Reproduction) أحادية المجموعة الكروموسومية (Haploid):

\[
\text{Spore}=1n
\]

### القاعدة الكروموسومية في التكاثر الجنسي (Sexual Reproduction)

اندماج النواة الموجبة (Positive Nucleus) والسالبة (Negative Nucleus) يؤدي إلى اللاقحة (Zygote):

\[
1n+1n\rightarrow 2n
\]

ثم عند تحسن الظروف:

\[
\text{Zygote }(2n)\xrightarrow{\text{Meiosis}}4\text{ Haploid Spores }(1n)
\]

### قاعدة التكاثر في اليوجلينا (Euglena)

\[
\text{One Euglena}\xrightarrow{\text{Elongated Binary Fission}}2\text{ New Euglena}
\]

## 🧪 المسائل والأمثلة المحلولة

### مثال 1: تحديد طريقة تكاثر اليوجلينا (Euglena)

- **المعطى:** كائن من الطليعيات السوطية (Flagellated Protists) يعيش في المياه الجارية (Running Water) وله سوط (Flagellum).
- **القاعدة:** اليوجلينا (Euglena) تتكاثر لاجنسياً (Asexually) بالانشطار الثنائي المتطاول (Elongated Binary Fission).
- **الناتج:** فردان جديدان من اليوجلينا (Two New Euglena Individuals).

### مثال 2: تحديد مصير اليوجلينا (Euglena) في الظروف غير الملائمة

- **المعطى:** أصبحت الظروف البيئية غير ملائمة (Unfavorable Conditions).
- **الخطوات:**
  1. تحيط اليوجلينا (Euglena) نفسها بكيس (Cyst).
  2. تدخل الحالة المتكيسة (Encysted Form).
  3. تستمر في التكاثر اللاجنسي (Asexual Reproduction) بحسب ما ورد في المحاضرة.
- **الناتج:** يكوّن الكائن كيساً واقياً (Protective Cyst) ويكون في الحالة المتكيسة (Encysted Form).

### مثال 3: عدد الأفراد الناتجين من فطرين في التكاثر الجنسي (Sexual Reproduction)

- **المعطى:** تتقابل هيفا موجبة (Positive Hypha) وهيفا سالبة (Negative Hypha).
- **الخطوات:**
  1. يحدث الاندماج السيتوبلازمي (Cytoplasmic Fusion/Plasmogamy).
  2. يحدث الاندماج النووي (Nuclear Fusion/Karyogamy).
  3. تتكون اللاقحة (Zygote).
  4. تدخل اللاقحة (Zygote) الانقسام الاختزالي (Meiosis) عند تحسن الظروف.
- **الناتج النهائي:** أربع أبواغ أحادية المجموعة الكروموسومية (Four Haploid Spores)، وكل بوغ (Spore) يرمز له بـ **1n**.

## ⚠️ تنبيهات وأخطاء شائعة (ملاحظات وزارية)

> ⚠️ **1.** اليوجلينا (Euglena) من الطليعيات السوطية (Flagellated Protists)، وليست من الطليعيات الهدبية (Ciliated Protists).

> ⚠️ **2.** معيشة اليوجلينا (Euglena) في المياه الجارية (Running Water) المحتوية على النباتات المائية (Water Plants).

> ⚠️ **3.** لليوجلينا (Euglena) حالتان: حرة (Free) ومتكيسة (Encysted)، وكلتاهما تتكاثران لاجنسياً (Asexually) حسب المحاضرة.

> ⚠️ **4.** اكتب تكاثر اليوجلينا (Euglena): الانشطار الثنائي المتطاول (Elongated Binary Fission)، ولا تستعمل الانشطار الثنائي المستعرض (Transverse Binary Fission) الخاص بالبراميسيوم (Paramecium).

> ⚠️ **5.** من نقطتي المرحلة الأولى في رسم اليوجلينا (Euglena): انقسام النواة (Nuclear Division) وتكوّن السوط الإضافي (Additional Flagellum).

> ⚠️ **6.** في المرحلة النهائية من تكاثر اليوجلينا (Euglena) ينقسم السيتوبلازم (Cytoplasm) من الأعلى إلى الأسفل، وينتج فردان كاملان (Two Complete Individuals).

> ⚠️ **7.** عدد أفراد مملكة الفطريات (Kingdom Fungi) المذكور هو أكثر من 100,000 كائن (More Than 100,000 Organisms).

> ⚠️ **8.** عدد أنواع شعبة الزيجية (Zygomycota) هو نحو 1050 نوعاً (Approximately 1050 Species).

> ⚠️ **9.** لا تمتلك الفطريات (Fungi) الكلوروفيل (Chlorophyll) والكاروتين (Carotene) اللازمين للبناء الضوئي (Photosynthesis)، لذلك تكون غير ذاتية التغذية (Heterotrophic).

> ⚠️ **10.** احفظ تراكيب عفن الخبز الأسود (Black Bread Mold): أشباه الجذور (Rhizoids)، والهيفا (Hypha)، وحامل الكيس البوغي (Sporangiophore)، والكيس البوغي (Sporangium)، والأبواغ (Spores).

> ⚠️ **11.** الأبواغ (Spores) داخل الكيس البوغي (Sporangium) أحادية المجموعة الكروموسومية (Haploid)، **1n**.

> ⚠️ **12.** عند الظروف الملائمة (Favorable Conditions) يكون التكاثر اللاجنسي (Asexual Reproduction) بوساطة الأبواغ (Spores)، أما عند الظروف غير الملائمة (Unfavorable Conditions) فيبدأ التكاثر الجنسي (Sexual Reproduction).

> ⚠️ **13.** التكاثر الجنسي (Sexual Reproduction) في الزيجية (Zygomycota) يحتاج إلى هيفتين (Two Hyphae) مختلفتي السلالة (Different Strains)، موجبة (+) وسالبة (−).

> ⚠️ **14.** الاندماج السيتوبلازمي (Cytoplasmic Fusion/Plasmogamy) يسبق الاندماج النووي (Nuclear Fusion/Karyogamy)، ولا يحدث الاندماجان في اللحظة نفسها بحسب تسلسل الرسم.

> ⚠️ **15.** تتكوّن اللاقحة (Zygote) بعد اتحاد النواة الموجبة (Positive Nucleus) مع النواة السالبة (Negative Nucleus)، ثم تحيط نفسها بغلاف (Coat) لمقاومة الظروف غير الملائمة (Unfavorable Conditions).

> ⚠️ **16.** عند تحسن الظروف (Favorable Conditions)، تدخل اللاقحة (Zygote) الانقسام الاختزالي (Meiosis) وتكوّن أربع أبواغ (Four Spores)، ثم تنضج الأبواغ (Spores) ويتمزق الكيس البوغي (Sporangium) لتخرج.

> ⚠️ **17.** رسم تكاثر الفطريات (Fungal Reproduction) المطلوب في هذه المحاضرة هو الرسم الخاص بالزيجية (Zygomycota) وعفن الخبز الأسود (Black Bread Mold)، مع تأشيراته ومراحله.

## 🧠 الخلاصة

- اليوجلينا (Euglena) من الطليعيات السوطية (Flagellated Protists)، وتعيش في المياه الجارية (Running Water) المحتوية على النباتات المائية (Water Plants).
- لليوجلينا (Euglena) حالة حرة (Free Form) وحالة متكيسة (Encysted Form)، وتتكاثر لاجنسياً (Asexually) بالانشطار الثنائي المتطاول (Elongated Binary Fission).
- مملكة الفطريات (Kingdom Fungi) تضم أكثر من 100,000 كائن (More Than 100,000 Organisms)، وشعبة الزيجية (Zygomycota) تضم نحو 1050 نوعاً (1050 Species).
- فطر عفن الخبز الأسود (Black Bread Mold) يمتلك أشباه جذور (Rhizoids)، وهيفا (Hypha)، وحامل كيس بوغي (Sporangiophore)، وكيساً بوغياً (Sporangium) يحوي أبواغاً (Spores) أحادية المجموعة الكروموسومية (Haploid)، **1n**.
- في التكاثر اللاجنسي (Asexual Reproduction) تتكون الأبواغ (Spores) وتنمو مباشرة، أما في التكاثر الجنسي (Sexual Reproduction) فتتحد هيفا موجبة (Positive Hypha) مع هيفا سالبة (Negative Hypha)، وتتكون لاقحة (Zygote) ثم أربع أبواغ (Four Spores) بعد الانقسام الاختزالي (Meiosis).

## 📝 Review Questions

1. What kingdom and type of protist does Euglena belong to?
2. What are the two forms of Euglena, and how does it reproduce in each form?
3. Describe the three stages of elongated binary fission in Euglena.
4. Why are fungi unable to perform photosynthesis according to the lecture?
5. Name the main structures of black bread mold and state the chromosome condition of its spores.
6. Describe the sequence of sexual reproduction in Zygomycota from hyphal contact to spore formation.

---

$lecture_notes$
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_videos
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec10-study'
    AND title = 'المحاضرة 10 — اليوجلينا ومملكة الفطريات'
);
