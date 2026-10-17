INSERT INTO public.teacher_topic_videos (
  teacher_id, topic_key, youtube_url, video_id, title, transcript, notes_parts, approved
)
SELECT
  'nadia-al-nuaimy',
  'nadia-en-ch1-lec25-study',
  '',
  NULL,
  'المحاضرة 25 — حسابات دورة كربس والتنفس الهوائي',
  NULL,
  jsonb_build_array(
    jsonb_build_object(
      'title', 'نواتج دورة كربس وحسابات التنفس الهوائي',
      'notes', $lecture_notes$
# المحاضرة الخامسة والعشرون – حسابات دورة كربس والتنفس الهوائي

## 🧭 نظرة عامة

تركز المحاضرة على نواتج دورة كربس وكيفية حل الأسئلة الحسابية المتعلقة بـ ATP والهيدروجين والماء، ثم تجمع نواتج التحلل السكري وتحول البيروفيك ودورتي كربس للحصول على الناتج الكلي للتنفس الهوائي وفق حساب المنهج.

# أولاً: نواتج دورة كربس الواحدة

بحسب المخطط والحساب المعتمد في المحاضرة، تنتج دورة كربس الواحدة:

- 8 ذرات هيدروجين، تمثل أربع مجموعات `2H`.
- 1 ATP مباشرة.
- 2CO₂.
- طاقة مكافئة كلية مقدارها 12 ATP.

## حساب ATP لدورة واحدة

- ثلاث مجموعات `2H` تعطي 3 ATP لكل منها = 9 ATP.
- مجموعة هيدروجين واحدة في المسار تعطي ما يعادل 2 ATP بحسب مخطط المنهج.
- ينتج 1 ATP مباشرة.
- المجموع = 12 ATP.

**1 Krebs Cycle = 12 ATP**

# ثانياً: نواتج دورتين من كربس

لأن جزيء الجلوكوز الواحد ينتج جزيئي بيروفيك ثم جزيئي Acetyl-CoA، تحدث دورتان:

| الناتج | دورة واحدة | دورتان |
|---|---:|---:|
| الطاقة المكافئة | 12 ATP | 24 ATP |
| ذرات الهيدروجين | 8H | 16H |
| مجموعات 2H | 4 | 8 |
| جزيئات الماء المكافئة | 4H₂O | 8H₂O |
| CO₂ | 2 | 4 |

# ثالثاً: حساب الماء من الهيدروجين

عند اتحاد كل مجموعة `2H` مع الأوكسجين يتكون جزيء ماء واحد:

2H + O → H₂O

لذلك:

- 8H في دورة واحدة = أربع مجموعات 2H = 4H₂O.
- 16H في دورتين = ثماني مجموعات 2H = 8H₂O.

# رابعاً: مجموع الهيدروجين في التنفس الكامل

لحساب الهيدروجين الناتج من أكسدة جزيء جلوكوز واحد تجمع المراحل:

| المرحلة | الهيدروجين الناتج |
|---|---:|
| التحلل السكري | 4H |
| تحول جزيئي البيروفيك إلى Acetyl-CoA | 4H |
| دورتا كربس | 16H |
| المجموع | 24H |

**الناتج الكلي = 24 ذرة هيدروجين**

# خامساً: حساب 38 ATP

وفق حساب الطاقة المعتمد في المنهج:

| المصدر | ATP |
|---|---:|
| صافي الربح المباشر من التحلل السكري | 2 |
| الطاقة المكافئة لـ 2H الناتجة من التحلل السكري | 6 |
| الطاقة المكافئة من تحول جزيئي البيروفيك إلى Acetyl-CoA | 6 |
| دورتا كربس | 24 |
| المجموع الكلي | 38 |

**2 + 6 + 6 + 24 = 38 ATP**

# سادساً: طريقة قراءة السؤال الحسابي

قبل الحل حدد المطلوب بدقة:

1. هل السؤال عن التحلل السكري فقط؟
2. هل السؤال عن تحول بيروفيك واحد أم جزيئي البيروفيك؟
3. هل السؤال عن دورة كربس واحدة أم دورتين؟
4. هل يطلب ATP أم الهيدروجين أم الماء أم CO₂؟
5. هل يطلب الناتج المباشر أم الناتج الكلي المكافئ للطاقة؟

# سابعاً: بطاقات حساب سريعة

## دورة كربس واحدة

- 12 ATP.
- 8H.
- 4H₂O.
- 2CO₂.

## دورتان من كربس

- 24 ATP.
- 16H.
- 8H₂O.
- 4CO₂.

## تحول بيروفيك واحد إلى Acetyl-CoA

- 1CO₂.
- 2H.
- ما يعادل 3 ATP.

## تحول جزيئي البيروفيك

- 2CO₂.
- 4H.
- ما يعادل 6 ATP.

## التنفس الهوائي الكامل لجزيء جلوكوز

- 38 ATP وفق المنهج.
- 24H قبل اتحاد الهيدروجين بالأوكسجين.

# ثامناً: أسئلة الأصل داخل دورة كربس

| السؤال | الجواب المختصر |
|---|---|
| ما أصل حامض الستريك؟ | Acetyl-CoA + Oxaloacetic Acid |
| ما أصل ألفا كيتوكلوتاريك؟ | حامض الستريك بعد الأكسدة ونزع CO₂ |
| ما المركب الخماسي الكربون؟ | Alpha-Ketoglutaric Acid |
| ما المركب الرباعي الذي يعاد تكوينه؟ | Oxaloacetic Acid |
| لماذا تحدث دورتان؟ | لأن الجلوكوز يعطي جزيئي بيروفيك ثم جزيئي Acetyl-CoA |

# تاسعاً: مخطط الحل الشامل

Glucose
→ Glycolysis: 2 ATP + 6 ATP equivalent
→ 2 Pyruvic Acid
→ 2 Acetyl-CoA: 6 ATP equivalent
→ 2 Krebs Cycles: 24 ATP
→ Total: 38 ATP

## ⚠️ أخطاء شائعة

- استعمال ناتج دورة واحدة عند السؤال عن جزيء جلوكوز كامل.
- نسيان أن الجلوكوز ينتج دورتين من كربس.
- الخلط بين عدد ذرات الهيدروجين وعدد مجموعات `2H`.
- اعتبار 4 ATP الناتجة في التحلل السكري صافي ربح؛ الصافي المباشر هو 2 ATP.
- جمع نواتج التخمر مع نواتج التنفس الهوائي.
- عدم تحديد ما إذا كان السؤال يطلب ATP المباشر أو الطاقة المكافئة الكلية.

## 🧠 الخلاصة

تنتج دورة كربس الواحدة 12 ATP مكافئة و8H و4H₂O بحسب حساب المنهج، بينما تنتج الدورتان 24 ATP و16H و8H₂O. وعند جمع صافي التحلل السكري وطاقة هيدروجينه وطاقة تحول البيروفيك وناتج دورتَي كربس يكون الناتج الكلي 38 ATP لكل جزيء جلوكوز.

## 📝 Review Questions

1. State the ATP equivalent, hydrogen atoms, water molecules, and carbon dioxide molecules produced per Krebs cycle.
2. Why must the products of one Krebs cycle be doubled for one glucose molecule?
3. Calculate the ATP equivalent of two Krebs cycles.
4. How many hydrogen atoms are produced by one and two Krebs cycles?
5. Explain how the number of water molecules is calculated from hydrogen.
6. Calculate the total hydrogen produced during complete aerobic respiration of one glucose molecule.
7. Show how the textbook total of 38 ATP is obtained.
8. Distinguish between gross and net ATP in glycolysis.
9. What details must be identified before solving a respiration calculation?
10. Explain the origin of citric acid and alpha-ketoglutaric acid.
$lecture_notes$
    )
  ),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.teacher_topic_videos
  WHERE teacher_id = 'nadia-al-nuaimy'
    AND topic_key = 'nadia-en-ch1-lec25-study'
    AND title = 'المحاضرة 25 — حسابات دورة كربس والتنفس الهوائي'
);
