-- Nadia Al-Nuaimi · Distinguished curriculum · Chapter 3 · Lecture 9
-- Publish the supplied Paramecium sexual reproduction notes as a notes-only lesson.
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
  'nadia-en-ch3-lec9-study',
  '',
  NULL,
  'المحاضرة 9 — التكاثر الجنسي في البراميسيوم',
  NULL,
  jsonb_build_array(
    jsonb_build_object(
      'title', 'التكاثر الجنسي في البراميسيوم',
      'notes', $lecture_notes$
# المحاضرة التاسعة – التكاثر الجنسي في البراميسيوم (Paramecium)

## 🧭 نظرة عامة سريعة

تتناول هذه المحاضرة التكاثر الجنسي (Sexual Reproduction) في البراميسيوم (Paramecium)، بعد دراسة التكاثر اللاجنسي (Asexual Reproduction) بالانشطار الثنائي المستعرض (Transverse Binary Fission) في المحاضرة السابقة. يلجأ البراميسيوم (Paramecium) إلى التكاثر الجنسي (Sexual Reproduction) عندما تكون الظروف غير ملائمة (Bad Conditions)، وذلك للمحافظة على النوع (Species) واستمراريته عبر الأجيال (Continuity of Generations) وزيادة عدد الأفراد (Number of Individuals). وتشرح المحاضرة طريقتين: الاقتران (Conjugation)، الذي يغيّر المادة الوراثية (Genetic Material)، والتوالد الذاتي (Autogamy)، الذي لا يغيّر المادة الوراثية (Genetic Material) لأنه يحدث داخل الفرد نفسه.

> ⚠️ **مهم وزارياً:** احفظ الرسم والتسلسل الخاصين بالاقتران (Conjugation) والتوالد الذاتي (Autogamy)؛ فقد أكدت الأستاذة ضرورة رسم كل عملية ثلاث مرات ومراجعة أسئلتها الوزارية.

## 📚 المفاهيم والشرح التفصيلي

### 1. متى يلجأ البراميسيوم (Paramecium) إلى التكاثر الجنسي (Sexual Reproduction)؟

عندما تصبح الظروف البيئية غير ملائمة (Bad Conditions)، لا يكتفي البراميسيوم (Paramecium) بالانشطار الثنائي المستعرض (Transverse Binary Fission)؛ لأن هذه الطريقة تعطي فردين جديدين فقط من كل فرد. في الظروف غير الملائمة (Bad Conditions) يحتاج البراميسيوم (Paramecium) إلى زيادة عدد الأفراد (Number of Individuals) والمحافظة على النوع (Species) واستمرارية الأجيال (Continuity of Generations)، لذلك ينتقل إلى التكاثر الجنسي (Sexual Reproduction).

### 2. طريقتا التكاثر الجنسي (Sexual Reproduction)

يمتلك البراميسيوم (Paramecium) طريقين للتكاثر الجنسي (Sexual Reproduction):

1. الاقتران (Conjugation).
2. التوالد الذاتي أو الإخصاب الذاتي (Autogamy/Self-Fertilization).

#### الفرق العام بين الطريقتين

| الطريقة | عدد البراميسيا (Paramecia) المشاركة | المادة الوراثية (Genetic Material) |
|---|---:|---|
| الاقتران (Conjugation) | براميسيومان (Two Paramecia) يتلامسان | تتغير المادة الوراثية (Genetic Material) نتيجة تبادلها |
| التوالد الذاتي (Autogamy) | فرد واحد من البراميسيوم (One Paramecium) | لا تتغير المادة الوراثية (Genetic Material) لأنها تعود إلى الفرد نفسه |

### 3. الاقتران (Conjugation)

الاقتران (Conjugation) هو تكاثر جنسي (Sexual Reproduction) يحدث بين براميسيين (Two Paramecia) متوافقين من سلالتين مختلفتين (Different Strains). يغيّر الاقتران (Conjugation) المادة الوراثية (Genetic Material) للبراميسيوم (Paramecium) نتيجة تبادل النوى الوراثية (Genetic Nuclei) بين الفردين.

#### الخطوة الأولى: تقابل البراميسيين (Two Paramecia)

1. يتقابل براميسيومان (Two Paramecia).
2. يكون الفردان من سلالتين مختلفتين (Different Strains)، لأن الغرض هو تغيير المادة الوراثية (Genetic Material).
3. يحدث التلامس (Contact) بين الفردين من منطقة التجويف الفمي (Cytostome)، أي منطقة الفم (Mouth).
4. لا ننسى في الرسم الأهداب (Cilia) والنواة الصغيرة (Micronucleus) والنواة الكبيرة (Macronucleus) لكل براميسيوم (Paramecium).

#### الخطوة الثانية: تكوّن الجسر السيتوبلازمي (Cytoplasmic Bridge)

بعد تلامس البراميسيين (Two Paramecia) من منطقة التجويف الفمي (Cytostome):

1. يتكوّن جسر سيتوبلازمي (Cytoplasmic Bridge) أو جسر بروتوبلازمي (Protoplasmic Bridge) بين الفردين.
2. يقع الجسر السيتوبلازمي (Cytoplasmic Bridge) بين براميسيومين (Two Paramecia).
3. وظيفة الجسر السيتوبلازمي (Cytoplasmic Bridge) هي السماح بعبور أو تبادل المادة الوراثية (Genetic Material)، والمادة الكروموسومية (Chromosomal Material)، والعوامل الجينية (Genetic Factors) بين البراميسيومين (Two Paramecia).

> ⚠️ **مهم:** يجب أن تُظهر في الرسم موقع الجسر السيتوبلازمي (Cytoplasmic Bridge) بين البراميسيومين (Two Paramecia)، وأن تذكر وظيفته في تبادل المادة الوراثية (Genetic Material).

#### الخطوة الثالثة: دخول النواة الصغيرة (Micronucleus) في الانقسام الاختزالي (Meiosis)

1. النواة الكبيرة (Macronucleus) لا تشارك في خطوات التكاثر الجنسي (Sexual Reproduction) الجارية، وتبقى على جهة من جسم البراميسيوم (Paramecium).
2. النواة الصغيرة (Micronucleus) هي النواة المختصة بالتكاثر (Reproduction).
3. تدخل النواة الصغيرة (Micronucleus) في الانقسام الاختزالي (Meiosis).
4. نتيجة الانقسام الاختزالي (Meiosis) تتكوّن أربع نوى (Four Nuclei).

في أثناء الانقسام الاختزالي (Meiosis):

- يبدأ كل كروموسوم (Chromosome) بالتضاعف، فيتكون من كروماتيدين شقيقين (Two Sister Chromatids).
- في الانقسام الاختزالي الأول (First Meiotic Division) تنفصل الكروموسومات المتماثلة (Homologous Chromosomes)، فتتكون نواتان (Two Nuclei).
- تدخل كل نواة من النواتين (Each of the Two Nuclei) في الانقسام الاختزالي الثاني (Second Meiotic Division)، فتنتج أربع نوى (Four Nuclei).
- تحتوي كل واحدة من النوى الأربع (Four Nuclei) على مجموعة كروموسومية واحدة (One Chromosome Set)، كما ورد في الشرح.

#### الخطوة الرابعة: بقاء النواة الفعالة (Active Nucleus)

1. من النوى الأربع (Four Nuclei)، تضمر ثلاث نوى (Three Nuclei) وتتحول إلى مادة نووية (Nucleic Material) غير فعالة.
2. تبقى نواة واحدة فقط (One Nucleus).
3. تسمى النوى الأربع الناتجة أولاً النوى الرابعة (Four Nuclei)، ولا تسمى كلها نوى صغيرة (Micronuclei) فعالة.
4. النواة التي تبقى هي النواة الفعالة (Active Nucleus)، وأصلها النواة الصغيرة (Micronucleus) التي دخلت الانقسام الاختزالي (Meiosis).

#### الخطوة الخامسة: الانقسام الخيطي للنواة الفعالة (Mitosis of Active Nucleus)

1. تدخل النواة الفعالة (Active Nucleus) في الانقسام الخيطي (Mitosis).
2. تنتج نواتان غير متساويتين في الحجم (Two Unequal Nuclei).
3. النواة الكبيرة تسمى النواة الأولية الأنثوية (Primary Female Nucleus).
4. النواة الصغيرة تسمى النواة الأولية الذكرية (Primary Male Nucleus).

> ⚠️ **ملاحظة للحفظ:** النواة الأولية الأنثوية (Primary Female Nucleus) كبيرة، والنواة الأولية الذكرية (Primary Male Nucleus) صغيرة. النواة الصغيرة (Micronucleus) هي التي تصبح متحركة، أما النواة الكبيرة (Macronucleus) فلا تتحرك في هذه الخطوة.

#### الخطوة السادسة: تبادل النواتين الأوليتين (Exchange of Pronuclei)

1. تتحرك النواة الأولية الذكرية الصغيرة (Small Primary Male Nucleus)؛ لأنها أسهل حركة من النواة الكبيرة (Large Nucleus).
2. تعبر النواة الأولية الذكرية (Primary Male Nucleus) الجسر السيتوبلازمي (Cytoplasmic Bridge) إلى البراميسيوم الآخر (Other Paramecium).
3. يحدث التبادل باتجاهين متعاكسين (Opposite Directions):
   - تنتقل النواة الأولية الذكرية (Primary Male Nucleus) من البراميسيوم الأول (First Paramecium) إلى النواة الأولية الأنثوية (Primary Female Nucleus) في البراميسيوم الثاني (Second Paramecium).
   - تنتقل النواة الأولية الذكرية (Primary Male Nucleus) من البراميسيوم الثاني (Second Paramecium) إلى النواة الأولية الأنثوية (Primary Female Nucleus) في البراميسيوم الأول (First Paramecium).
4. تتحد النواة الأولية الذكرية (Primary Male Nucleus) مع النواة الأولية الأنثوية (Primary Female Nucleus) في كل براميسيوم (Paramecium).

#### الخطوة السابعة: تكوّن النواة المندمجة (Synkaryon/Compact Nucleus)

1. بعد اتحاد النواة الأولية الذكرية (Primary Male Nucleus) مع النواة الأولية الأنثوية (Primary Female Nucleus)، تتكوّن نواة واحدة مندمجة (Fused Nucleus).
2. تسمى النواة المندمجة النواة المشتركة (Synkaryon/Compact Nucleus)، كما ورد في المحاضرة.
3. تكون النواة المندمجة (Synkaryon/Compact Nucleus) ناتجة من اتحاد (Union) نواتين أوليتين (Two Pronuclei)، ولذلك تتغير المادة الوراثية (Genetic Material).
4. لا تكون النواة الكبيرة (Macronucleus) ذات علاقة مباشرة بهذه العملية.
5. بعد انتهاء الاقتران (Conjugation)، ينفصل البراميسيومان (Two Paramecia)، ولا تبقى حاجة إلى الجسر السيتوبلازمي (Cytoplasmic Bridge).
6. يعود التجويف الفمي (Cytostome) إلى شكله المعتاد.

#### الخطوة الثامنة: الانشطار الثنائي بعد الاقتران (Binary Fission After Conjugation)

1. يصبح كل براميسيوم (Paramecium) ناضجاً وجاهزاً للانشطار الثنائي (Binary Fission).
2. يدخل كل براميسيوم (Paramecium) في الانشطار الثنائي (Binary Fission) بصورة متتابعة.
3. يعطي كل براميسيوم (Paramecium) فردين جديدين (Two New Paramecia).
4. لأن عدد البراميسيا (Paramecia) في الاقتران (Conjugation) كان اثنين، ويعطي كل واحد منهما فردين، تصبح النتيجة الكلية أربعة براميسيا (Four Paramecia).

### 4. التوالد الذاتي (Autogamy)

التوالد الذاتي (Autogamy) هو تكاثر جنسي (Sexual Reproduction) يحدث داخل براميسيوم واحد (One Paramecium) عندما لا يريد البراميسيوم (Paramecium) تغيير مادته الوراثية (Genetic Material) أو سلالته (Strain)، لكنه يحتاج إلى تجديد النواة (Nucleus) والاستمرار بالتكاثر (Reproduction).

#### خطوات التوالد الذاتي (Autogamy)

1. يوجد براميسيوم واحد (One Paramecium)، لذلك لا يتكوّن جسر سيتوبلازمي (Cytoplasmic Bridge) بين فردين.
2. تدخل النواة الصغيرة (Micronucleus) في الانقسام الاختزالي (Meiosis).
3. تتكوّن أربع نوى (Four Nuclei).
4. تضمر ثلاث نوى (Three Nuclei)، وتبقى نواة واحدة فعالة (One Active Nucleus).
5. تدخل النواة الفعالة (Active Nucleus) في الانقسام الخيطي (Mitosis).
6. تنتج نواتان أوليتان (Two Pronuclei)، إحداهما كبيرة تمثل النواة الأولية الأنثوية (Primary Female Nucleus)، والأخرى صغيرة تمثل النواة الأولية الذكرية (Primary Male Nucleus).
7. تتحرك النواة الأولية الذكرية الصغيرة (Small Primary Male Nucleus) داخل البراميسيوم (Paramecium) نحو النواة الأولية الأنثوية (Primary Female Nucleus) الخاصة بالفرد نفسه.
8. يحدث اتحاد (Union) بين النواة الأولية الذكرية (Primary Male Nucleus) والنواة الأولية الأنثوية (Primary Female Nucleus) داخل البراميسيوم (Paramecium) نفسه.
9. تتكوّن النواة المندمجة (Synkaryon/Compact Nucleus).
10. لا يحدث تبادل للمادة الوراثية (Genetic Material) بين فردين، ولا تعبر نواة خلال جسر سيتوبلازمي (Cytoplasmic Bridge).
11. بعد الاتحاد (Union)، يصبح البراميسيوم (Paramecium) مستعداً للانشطار الثنائي (Binary Fission)، فيعطي فردين ثم تستمر الانقسامات المتتابعة.

#### لماذا لا يغيّر التوالد الذاتي (Autogamy) المادة الوراثية (Genetic Material)؟

تكون النواة الأولية الذكرية (Primary Male Nucleus) والنواة الأولية الأنثوية (Primary Female Nucleus) أصلهما من البراميسيوم (Paramecium) نفسه، ولذلك تكون العوامل الجينية (Genetic Factors) متشابهة أو متماثلة (Similar/Homologous). لا يحدث تبادل بين فردين مختلفين، ولا يستخدم جسر سيتوبلازمي (Cytoplasmic Bridge)، ولذلك تبقى المادة الوراثية (Genetic Material) مماثلة للمادة الأصلية.

### 5. تكوّن الأفراد بعد التكاثر الجنسي (Sexual Reproduction)

بعد تكوّن النواة المندمجة (Synkaryon/Compact Nucleus) في الاقتران (Conjugation) أو التوالد الذاتي (Autogamy):

- يستمر البراميسيوم (Paramecium) بالانقسام الثنائي (Binary Fission).
- يعطي كل فرد أولاً فردين (Two Individuals).
- ثم يدخل كل فرد من الفردين في انقسام ثانٍ، فيعطي فردين آخرين.
- تصبح النتيجة أربعة أفراد من البراميسيوم (Four Paramecia) لكل براميسيوم ابتدائي (Original Paramecium).
- في الاقتران (Conjugation)، يكون عدد البراميسيا (Paramecia) الناتج من البراميسيين الأصليين (Two Original Paramecia) ثمانية أفراد (Eight Individuals) إذا احتُسبت نتيجة الفردين معاً.
- الفرق الجوهري هو أن أفراد الاقتران (Conjugation) تختلف مادتها الوراثية (Genetic Material)، أما أفراد التوالد الذاتي (Autogamy) فتبقى مادتها الوراثية مماثلة للمادة الأصلية.

## 📖 التعريفات والمصطلحات

- **التكاثر الجنسي (Sexual Reproduction):** طريقة تكاثر يلجأ إليها البراميسيوم (Paramecium) في الظروف غير الملائمة (Bad Conditions) للمحافظة على النوع (Species) واستمرارية الأجيال (Continuity of Generations).
- **الاقتران (Conjugation):** تكاثر جنسي (Sexual Reproduction) يحدث بين براميسيين (Two Paramecia) من سلالتين مختلفتين (Different Strains)، ويتضمن تبادل المادة الوراثية (Genetic Material).
- **التوالد الذاتي أو الإخصاب الذاتي (Autogamy/Self-Fertilization):** تكاثر جنسي (Sexual Reproduction) يحدث داخل براميسيوم واحد (One Paramecium) من دون تبادل للمادة الوراثية (Genetic Material) بين فردين.
- **الجسر السيتوبلازمي (Cytoplasmic Bridge):** جسر يتكوّن بين براميسيومين (Two Paramecia) بعد تلامسهما، ويسمح بعبور المادة الوراثية (Genetic Material) بينهما.
- **الجسر البروتوبلازمي (Protoplasmic Bridge):** تسمية أخرى للجسر السيتوبلازمي (Cytoplasmic Bridge) المذكور في المحاضرة.
- **الانقسام الاختزالي (Meiosis):** نوع الانقسام الذي تدخل فيه النواة الصغيرة (Micronucleus)، وينتج أربع نوى (Four Nuclei) في تسلسل الاقتران (Conjugation) والتوالد الذاتي (Autogamy).
- **النواة الفعالة (Active Nucleus):** النواة الوحيدة التي تبقى من النوى الأربع (Four Nuclei) بعد اضمحلال ثلاث نوى (Three Nuclei)، ثم تدخل الانقسام الخيطي (Mitosis).
- **النواة الأولية الذكرية (Primary Male Nucleus):** النواة الصغيرة (Small Nucleus) الناتجة من انقسام النواة الفعالة (Active Nucleus)، وتتحرك نحو النواة الأولية الأنثوية (Primary Female Nucleus).
- **النواة الأولية الأنثوية (Primary Female Nucleus):** النواة الكبيرة (Large Nucleus) الناتجة من انقسام النواة الفعالة (Active Nucleus)، وتتحد مع النواة الأولية الذكرية (Primary Male Nucleus).
- **النواة المندمجة أو النواة المشتركة (Synkaryon/Compact Nucleus):** نواة تتكوّن من اتحاد (Union) النواة الأولية الذكرية (Primary Male Nucleus) مع النواة الأولية الأنثوية (Primary Female Nucleus).
- **المادة الوراثية (Genetic Material):** المادة التي تتبادل بين البراميسيا (Paramecia) في الاقتران (Conjugation)، فينتج اختلاف وراثي (Genetic Difference).
- **السلالة (Strain):** المجموعة التي ينتمي إليها البراميسيوم (Paramecium)، ويحدث الاقتران (Conjugation) بين سلالتين مختلفتين (Different Strains) حسب شرح المحاضرة.

## 🔢 القوانين / الصيغ / القواعد

لا تتضمن المحاضرة قوانين حسابية، لكنها تتضمن قواعد عددية وتسلسلية مهمة:

### تسلسل النواة الصغيرة (Micronucleus)

\[
\text{Micronucleus} \xrightarrow{\text{Meiosis}} 4\text{ Nuclei}
\]

ثم:

\[
4\text{ Nuclei} \rightarrow 3\text{ Degenerate Nuclei}+1\text{ Active Nucleus}
\]

ثم:

\[
1\text{ Active Nucleus} \xrightarrow{\text{Mitosis}} 2\text{ Pronuclei}
\]

### قاعدة عدد الأفراد

- كل براميسيوم (Paramecium) بعد الاقتران (Conjugation) أو التوالد الذاتي (Autogamy) يعطي فردين (Two Individuals) في الانشطار الثنائي (Binary Fission).
- كل فرد من الفردين يدخل انقساماً لاحقاً، فتكون النتيجة أربعة أفراد (Four Individuals) لكل فرد ابتدائي.
- براميسيومان (Two Paramecia) في الاقتران (Conjugation) يعطيان أربعة أفراد (Four Paramecia) من كل جهة، أي ثمانية أفراد (Eight Individuals) بالمجموع عند متابعة الانقسامات المذكورة.

### قاعدة المادة الوراثية (Genetic Material)

- الاقتران (Conjugation) = تبادل المادة الوراثية (Genetic Material) وتغيّرها.
- التوالد الذاتي (Autogamy) = اتحاد داخل الفرد نفسه وعدم تغيير المادة الوراثية (Genetic Material) الأصلية.

## 🧪 المسائل والأمثلة المحلولة

### مثال 1: اختيار طريقة التكاثر عند تغيير المادة الوراثية (Genetic Material)

- **المعطى:** يريد البراميسيوم (Paramecium) تغيير مادته الوراثية (Genetic Material) والحصول على اختلاف وراثي (Genetic Difference).
- **القاعدة:** الاقتران (Conjugation) يحدث بين براميسيين (Two Paramecia) من سلالتين مختلفتين (Different Strains) مع تبادل المادة الوراثية (Genetic Material).
- **الخطوات:**
  1. يتقابل براميسيومان (Two Paramecia).
  2. يتلامسان من منطقة التجويف الفمي (Cytostome).
  3. يتكوّن جسر سيتوبلازمي (Cytoplasmic Bridge).
  4. تتبادل النوى الأولية (Pronuclei) بين الفردين.
- **النتيجة:** الاقتران (Conjugation).

### مثال 2: اختيار طريقة التكاثر من دون تغيير المادة الوراثية (Genetic Material)

- **المعطى:** يريد البراميسيوم (Paramecium) المحافظة على مادته الوراثية (Genetic Material) وسلالته (Strain)، لكنه يحتاج إلى تجديد النواة (Nucleus).
- **القاعدة:** التوالد الذاتي (Autogamy) يحدث داخل براميسيوم واحد (One Paramecium) ولا يتضمن تبادل المادة الوراثية (Genetic Material) بين فردين.
- **الخطوات:**
  1. تدخل النواة الصغيرة (Micronucleus) الانقسام الاختزالي (Meiosis).
  2. تتكوّن أربع نوى (Four Nuclei)، وتضمحل ثلاث منها.
  3. تنقسم النواة الفعالة (Active Nucleus) بالانقسام الخيطي (Mitosis).
  4. تتحد النواة الأولية الذكرية (Primary Male Nucleus) مع النواة الأولية الأنثوية (Primary Female Nucleus) داخل الفرد نفسه.
- **النتيجة:** التوالد الذاتي (Autogamy).

### مثال 3: حساب عدد الأفراد الناتجين من الاقتران (Conjugation)

- **المعطيات:** براميسيومان (Two Paramecia)، وكل براميسيوم (Paramecium) يعطي أربعة أفراد (Four Individuals) بعد الانقسامات المتتابعة.
- **القانون:**

\[
2\text{ Paramecia} \times 4\text{ Individuals لكل Paramecium}=8\text{ Individuals}
\]

- **خطوات التعويض:**
  1. عدد البراميسيا (Paramecia) المشاركة = 2.
  2. عدد الأفراد الناتجين من كل براميسيوم (Paramecium) = 4.
  3. نضرب 2 × 4.
- **الناتج النهائي:** ثمانية أفراد من البراميسيوم (Eight Paramecia) عند جمع ناتج الفردين الأصليين.

### مثال 4: ترتيب تكوّن النواة المندمجة (Synkaryon/Compact Nucleus)

- **المعطى:** نواة صغيرة (Micronucleus) دخلت الانقسام الاختزالي (Meiosis).
- **خطوات الحل:**
  1. تتكوّن أربع نوى (Four Nuclei).
  2. تضمر ثلاث نوى (Three Nuclei).
  3. تبقى نواة فعالة واحدة (One Active Nucleus).
  4. تنقسم النواة الفعالة (Active Nucleus) بالانقسام الخيطي (Mitosis).
  5. تتكوّن نواة أولية ذكرية (Primary Male Nucleus) ونواة أولية أنثوية (Primary Female Nucleus).
  6. تتحد النواتان (Two Pronuclei).
- **الناتج النهائي:** النواة المندمجة (Synkaryon/Compact Nucleus).

## ⚠️ تنبيهات وأخطاء شائعة (ملاحظات وزارية)

> ⚠️ **1.** التكاثر الجنسي (Sexual Reproduction) في البراميسيوم (Paramecium) يحدث عند الظروف غير الملائمة (Bad Conditions) للمحافظة على النوع (Species) واستمرارية الأجيال (Continuity of Generations).

> ⚠️ **2.** احفظ الفرق: الاقتران (Conjugation) يغيّر المادة الوراثية (Genetic Material)، والتوالد الذاتي (Autogamy) لا يغيّرها.

> ⚠️ **3.** الاقتران (Conjugation) يحتاج إلى براميسيومين (Two Paramecia) يتلامسان، أما التوالد الذاتي (Autogamy) فيحدث داخل براميسيوم واحد (One Paramecium).

> ⚠️ **4.** يبدأ التلامس (Contact) بين البراميسيين (Two Paramecia) من منطقة التجويف الفمي (Cytostome).

> ⚠️ **5.** الجسر السيتوبلازمي (Cytoplasmic Bridge) أو الجسر البروتوبلازمي (Protoplasmic Bridge) يسمح بعبور المادة الوراثية (Genetic Material) بين البراميسيومين (Two Paramecia).

> ⚠️ **6.** لا تدخل النواة الكبيرة (Macronucleus) في عملية الانقسام الاختزالي (Meiosis) المذكورة؛ النواة التي تبدأ التكاثر (Reproduction) هي النواة الصغيرة (Micronucleus).

> ⚠️ **7.** الانقسام الاختزالي (Meiosis) ينتج أربع نوى (Four Nuclei)، ثم تضمر ثلاث نوى (Three Nuclei) وتبقى نواة فعالة واحدة (One Active Nucleus).

> ⚠️ **8.** لا تسمِّ النوى الأربع (Four Nuclei) كلها نوى صغيرة (Micronuclei) فعالة؛ النواة التي تبقى وتدخل الانقسام الخيطي (Mitosis) هي النواة الفعالة (Active Nucleus).

> ⚠️ **9.** النواة الكبيرة الناتجة من الانقسام الخيطي (Large Nucleus After Mitosis) هي النواة الأولية الأنثوية (Primary Female Nucleus)، والنواة الصغيرة هي النواة الأولية الذكرية (Primary Male Nucleus).

> ⚠️ **10.** في الاقتران (Conjugation)، تتحرك النواة الأولية الذكرية (Primary Male Nucleus) عبر الجسر السيتوبلازمي (Cytoplasmic Bridge) باتجاه البراميسيوم الآخر (Other Paramecium)، ويحدث التبادل في اتجاهين متعاكسين (Opposite Directions).

> ⚠️ **11.** بعد اتحاد النواة الأولية الذكرية (Primary Male Nucleus) مع النواة الأولية الأنثوية (Primary Female Nucleus) تتكون النواة المندمجة (Synkaryon/Compact Nucleus).

> ⚠️ **12.** بعد انتهاء الاقتران (Conjugation) ينفصل البراميسيومان (Two Paramecia)، ولا يبقى الجسر السيتوبلازمي (Cytoplasmic Bridge) ضرورياً.

> ⚠️ **13.** في التوالد الذاتي (Autogamy) لا يوجد تبادل للمادة الوراثية (Genetic Material) بين فردين، ولا يوجد جسر سيتوبلازمي (Cytoplasmic Bridge).

> ⚠️ **14.** في التوالد الذاتي (Autogamy)، تتحرك النواة الأولية الذكرية (Primary Male Nucleus) نحو النواة الأولية الأنثوية (Primary Female Nucleus) داخل البراميسيوم (Paramecium) نفسه.

> ⚠️ **15.** احفظ عدد الأفراد: كل براميسيوم (Paramecium) يعطي أربعة أفراد (Four Individuals) بعد الانقسامات المتتابعة، والبراميسيان (Two Paramecia) في الاقتران (Conjugation) يعطيان ثمانية أفراد (Eight Individuals) بالمجموع عند إكمال التسلسل.

> ⚠️ **16.** الرسم مطلوب ومهم؛ أكدت الأستاذة رسم الاقتران (Conjugation) والتوالد الذاتي (Autogamy) ثلاث مرات ومراجعة أسئلتهما الوزارية.

## 🧠 الخلاصة

- يلجأ البراميسيوم (Paramecium) إلى التكاثر الجنسي (Sexual Reproduction) في الظروف غير الملائمة (Bad Conditions) للمحافظة على النوع (Species) وزيادة عدد الأفراد (Number of Individuals).
- الاقتران (Conjugation) يحدث بين براميسيين (Two Paramecia) من سلالتين مختلفتين (Different Strains)، ويتطلب جسراً سيتوبلازمياً (Cytoplasmic Bridge) ويغيّر المادة الوراثية (Genetic Material).
- التوالد الذاتي (Autogamy) يحدث داخل براميسيوم واحد (One Paramecium)، ولا يتطلب جسراً سيتوبلازمياً (Cytoplasmic Bridge)، ولا يغيّر المادة الوراثية (Genetic Material).
- النواة الصغيرة (Micronucleus) تدخل الانقسام الاختزالي (Meiosis) فتنتج أربع نوى (Four Nuclei)، تضمر ثلاث منها، ثم تنقسم النواة الفعالة (Active Nucleus) بالانقسام الخيطي (Mitosis) إلى نواة أولية ذكرية (Primary Male Nucleus) ونواة أولية أنثوية (Primary Female Nucleus).
- اتحاد النواتين الأوليتين (Two Pronuclei) يكوّن النواة المندمجة (Synkaryon/Compact Nucleus)، وبعدها يستمر البراميسيوم (Paramecium) بالانشطار الثنائي (Binary Fission).

## 📝 Review Questions

1. Why does Paramecium use sexual reproduction under unfavorable conditions?
2. Compare conjugation and autogamy in terms of the number of participating Paramecia and genetic material.
3. What is the location and function of the cytoplasmic bridge during conjugation?
4. Describe the fate of the micronucleus during meiosis in Paramecium.
5. How are the primary male and primary female nuclei formed, and what happens to them afterward?
6. How many Paramecia are produced after the successive binary fissions following conjugation?

---

$lecture_notes$
    )
  ),
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.teacher_topic_videos
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch3-lec9-study'
    AND title = 'المحاضرة 9 — التكاثر الجنسي في البراميسيوم'
);
