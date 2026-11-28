import type { AppLanguage } from "@/components/LanguageGate";

// Short, authored practice for curriculum entries without a complete flashcard deck.
const languageExercises: Record<string, readonly [string, string][]> = {
  "arabic/ar-nafy": [
    ["ما أثر «لم» في الفعل المضارع في «لم يهملْ الطالب»؟", "تجزمه، وتنفي وقوع الفعل في الماضي."],
    ["انفِ الجملة «يسافر المسافر غدًا» باستعمال «لن» واضبط آخر الفعل.", "لن يسافرَ المسافر غدًا. «لن» تنصب المضارع وتفيد نفيه في المستقبل."],
    ["عيّن اسم «ليس» وخبرها في «ليس الطريقُ طويلًا».", "الطريقُ اسم ليس مرفوع. طويلًا خبرها منصوب."],
  ],
  "arabic/ar-tamanni": [
    ["ما الفرق بين التمني والترجي؟", "التمني طلب أمر محبوب يتعذر وقوعه أو يبعد. الترجي انتظار أمر محبوب ممكن الوقوع."],
    ["استخرج أداة التمني في «ليت الشبابَ يعود».", "ليت. والشبابَ اسم ليت منصوب."],
    ["عبّر عن رجاء نجاح الطالب بأداة مناسبة.", "لعلَّ الطالبَ ناجحٌ. «لعلّ» من أدوات الترجي."],
  ],
  "arabic/ar-ardh": [
    ["شلون تميّز العرض من التحضيض؟", "العرض طلب الفعل برفق، والتحضيض حثٌّ عليه بقوة."],
    ["ما الأسلوب في «ألا تزورنا غدًا؟» إذا كان القصد طلب الزيارة برفق؟", "أسلوب عرض. الأداة «ألا»."],
    ["حوّل «تساعد المحتاج» إلى تحضيض باستعمال «هلّا».", "هلّا تساعدُ المحتاجَ؟"],
  ],
  "arabic/ar-tahdir": [
    ["ما الفرق بين التحذير والإغراء؟", "التحذير تنبيه المخاطَب إلى أمر مكروه ليجتنبه، والإغراء حثّه على أمر محمود ليلزمه."],
    ["عيّن الأسلوب في «إيّاكَ والكذبَ».", "أسلوب تحذير. المحذَّر منه الكذب."],
    ["عيّن الأسلوب في «الصدقَ الصدقَ».", "أسلوب إغراء بالتكرار. المعنى: الزم الصدقَ."],
  ],
  "arabic/ar-adab": [
    ["إلى أي مدرسة أدبية يُنسب ميخائيل نعيمة في المنهج؟", "مدرسة المهجر."],
    ["اذكر شاعرًا عراقيًا من روّاد الشعر الحر في المنهج.", "بدر شاكر السيّاب."],
    ["بأي فن أدبي يرد اسم فؤاد التكرلي في المنهج؟", "القصة القصيرة."],
  ],
  "arabic/ar-nusos": [
    ["ما عنوان النص المقرّر لبدر شاكر السيّاب؟", "«أنشودة المطر»."],
    ["من كتبت «صلاة إلى العام الجديد»؟", "فدوى طوقان."],
    ["لمن قصيدة «يوميات جرح فلسطيني»؟", "لمحمود درويش."],
  ],
  "french/tenses": [
    ["Mettez au passé composé : « Nous finissons le travail. »", "Nous avons fini le travail."],
    ["Mettez à l’imparfait : « Quand j’étais petit, je (jouer) dehors. »", "Quand j’étais petit, je jouais dehors."],
    ["Mettez au futur simple : « Demain, ils (partir) tôt. »", "Demain, ils partiront tôt."],
  ],
  "french/dialogues": [
    ["Vous voulez acheter un cahier. Demandez son prix.", "Combien coûte ce cahier ?"],
    ["À la gare, demandez l’heure du départ du train.", "À quelle heure part le train ?"],
    ["Vous avez besoin d’aide. Formulez une demande polie.", "Pourriez-vous m’aider, s’il vous plaît ?"],
  ],
  "islamic/3": [
    ["شنو من دروس قصة موسى والعبد الصالح في طلب العلم؟", "الصبر والتواضع في طلب العلم، وعدم التسرع في الحكم قبل معرفة السبب."],
    ["ما المقصود بمحاسبة النفس؟", "أن يراجع المرء أقواله وأعماله، فيستمرّ في الصواب ويتوب عن الخطأ ويصلحه."],
    ["اذكر مثالًا عمليًا لمحاسبة النفس.", "إذا تذكّر الطالب أنه أساء لزميله، يعترف بخطئه ويعتذر ويحرص ألّا يكرره."],
  ],
  "islamic/4": [
    ["ما المخالفة التي نهاهم عنها شعيب عليه السلام في البيع؟", "نهاهم عن التطفيف في الكيل والميزان وبَخْس الناس أشياءهم."],
    ["شلون يظهر التكبر في معاملة الناس؟", "من صوره احتقار الآخرين ورفض الحق بسبب الاستعلاء."],
    ["اذكر تطبيقًا للأمانة في التعاملات الاقتصادية.", "أن يزن البائع السلعة بالعدل ويبيّن عيبها للمشتري."],
  ],
  "islamic/5": [
    ["بماذا يرشدنا درس نبأ الفاسق عند وصول خبر غير موثوق؟", "إلى التثبّت من الخبر قبل نشره أو إصدار حكم قد يظلم الآخرين."],
    ["ما المقصود بالقناعة؟", "رضا النفس بما رزقها الله مع الاستمرار بالسعي المشروع."],
    ["اذكر مثالًا على حسن الخلق عند الاختلاف.", "الاستماع باحترام، والكلام بلطف، وتجنّب الإساءة إلى من يخالفنا."],
  ],
  "islamic/recitation": [
    ["ما حكم النون الساكنة إذا جاء بعدها حرف الباء؟", "الإقلاب. تُقلب النون ميمًا مخفاةً مع الغنة."],
    ["ما حكم النون الساكنة في «مِنْ هادٍ»؟", "الإظهار الحلقي لأن الهاء جاءت بعد النون الساكنة."],
    ["ما حكم النون الساكنة في «مِنْ رَبِّهِمْ»؟", "الإدغام بغير غنة لأن الراء جاءت بعد النون الساكنة."],
  ],
};

const translatedExercises: Record<string, Record<AppLanguage, readonly [string, string][]>> = {
  "biology/drawings": {
    ar: [
      ["ارسم خلية نباتية مبسّطة. وين ترسم الجدار الخلوي قياسًا بالغشاء البلازمي؟", "الجدار الخلوي هو الحد الخارجي. الغشاء البلازمي يقع إلى داخل الجدار."],
      ["على رسم الخلية النباتية، وين تحدد الفجوة العصارية المركزية؟", "تظهر كحيز كبير في وسط الخلية ويدفع السيتوبلازم نحو المحيط."],
      ["على رسم المايتوكوندريا، أي غشاء يكوّن الأعراف؟", "الغشاء الداخلي. انثناءاته للداخل هي الأعراف."],
    ],
    en: [
      ["Sketch a plant cell. Where do you draw the cell wall relative to the plasma membrane?", "The cell wall forms the outer boundary. The plasma membrane lies just inside it."],
      ["Where do you label the central vacuole in a plant cell sketch?", "It occupies a large central space, pushing the cytoplasm toward the edge."],
      ["Which mitochondrial membrane forms the cristae?", "The inner membrane. Its inward folds are the cristae."],
    ],
  },
  "math/3": {
    ar: [
      ["عيّن النقاط الحرجة للدالة f(x) = x³ − 3x.", "المشتقة 3x² − 3 تساوي صفرًا عند x = −1 و x = 1."],
      ["شنو طبيعة النقطة الحرجة x = 0 للدالة f(x) = x² + 2؟", "نقطة صغرى محلية. المشتقة الثانية 2 موجبة."],
      ["جد ميل المماس لمنحنى y = x² عند x = 3.", "الميل يساوي قيمة المشتقة 2x عند x = 3، أي 6."],
    ],
    en: [
      ["Find the critical x-values of f(x) = x³ − 3x.", "The derivative 3x² − 3 is zero at x = −1 and x = 1."],
      ["Classify the critical point at x = 0 for f(x) = x² + 2.", "A local minimum, since the second derivative is positive (2)."],
      ["Find the slope of the tangent to y = x² at x = 3.", "Evaluate the derivative 2x at x = 3 to get 6."],
    ],
  },
  "math/4": {
    ar: [
      ["احسب ∫ (3x² − 4) dx.", "x³ − 4x + C."],
      ["احسب التكامل المحدد للدالة 2x من 0 إلى 3.", "عوّض في x² عند الحدين. الناتج 9 − 0 = 9."],
      ["جد مساحة المنطقة بين المنحنى y = x² ومحور السينات من x = 0 إلى x = 3.", "المساحة تساوي تكامل x² من 0 إلى 3. نحسب x³/3 عند الحدين فنحصل على 9 وحدات مربعة."],
    ],
    en: [
      ["Evaluate ∫ (3x² − 4) dx.", "x³ − 4x + C."],
      ["Evaluate the definite integral of 2x from 0 to 3.", "Evaluate x² at both limits. The result is 9 − 0 = 9."],
      ["Find the area between y = x² and the x-axis from x = 0 to x = 3.", "Integrate x² over the interval. Evaluating x³/3 at the limits gives 9 square units."],
    ],
  },
  "math/5": {
    ar: [
      ["صنّف رتبة المعادلة y″ + 3y′ = x.", "معادلة من الرتبة الثانية لأن أعلى مشتقة هي y″."],
      ["حل المعادلة y′ = 2x مع الشرط y(0) = 3.", "بالتكامل y = x² + C. من الشرط C = 3، إذن y = x² + 3."],
      ["حلّ بفصل المتغيرات dy/dx = 2y مع y(0) = 1.", "نفصل dy/y = 2 dx. بالتكامل والتعويض في الشرط نحصل على y = e²ˣ."],
    ],
    en: [
      ["Determine the order of y″ + 3y′ = x.", "Second order, because y″ is the highest derivative."],
      ["Solve y′ = 2x with y(0) = 3.", "Integrating gives y = x² + C. The condition gives C = 3, so y = x² + 3."],
      ["Solve dy/dx = 2y with y(0) = 1 by separating variables.", "Separate dy/y = 2 dx. Integrating and applying the initial condition gives y = e²ˣ."],
    ],
  },
  "math/6": {
    ar: [
      ["شلون ترسم الزاوية المستوية لزاوية ثنائية السطح؟", "اختر نقطة على حرف الزاوية، وارسم منها في كل سطح شعاعًا عموديًا على الحرف. الزاوية بين الشعاعين هي الزاوية المستوية."],
      ["إذا كان قياس الزاوية المستوية لزاوية ثنائية السطح 90°، شنو العلاقة بين المستويين؟", "المستويان متعامدان."],
      ["نقطة P خارج المستوى، والعمود النازل منها يلاقي المستوى في H. ما الإسقاط المتعامد للنقطة P؟", "النقطة H، وهي قدم العمود على المستوى."],
    ],
    en: [
      ["How do you draw the plane angle of a dihedral angle?", "Pick a point on the common edge. In each face draw a ray perpendicular to the edge at that point. The angle between those rays is the plane angle."],
      ["If the plane angle of a dihedral angle measures 90°, how are the two planes related?", "The two planes are perpendicular."],
      ["The perpendicular from P meets the plane at H. What is the orthogonal projection of P onto the plane?", "Point H, the foot of the perpendicular."],
    ],
  },
};

export function getQuickStudySupplement(subject: string, chapter: string, language: AppLanguage) {
  const key = `${subject}/${chapter}`;
  return (translatedExercises[key]?.[language] ?? languageExercises[key] ?? []).map(([q, a]) => ({ q, a }));
}
