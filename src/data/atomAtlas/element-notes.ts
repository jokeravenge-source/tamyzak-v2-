import type { Bi } from "./types";

/**
 * Hand-written educational notes for selected elements. Only widely documented,
 * textbook-level facts are included (cross-checked against PubChem element pages
 * and the Royal Society of Chemistry periodic table). Elements without an entry
 * receive a generated summary built only from the dataset values.
 */
export interface ElementNote {
  about: Bi;
  uses: Bi[];
  fact?: Bi;
}

export const ELEMENT_NOTES: Record<number, ElementNote> = {
  1: {
    about: { en: "The lightest element and the most abundant in the universe. A hydrogen atom has one proton and one electron.", ar: "أخف العناصر وأكثرها وفرة في الكون. تتكوّن ذرة الهيدروجين من بروتون واحد وإلكترون واحد." },
    uses: [{ en: "Ammonia production (Haber–Bosch process)", ar: "إنتاج الأمونيا (عملية هابر–بوش)" }, { en: "Fuel cells", ar: "خلايا الوقود" }],
    fact: { en: "Stars, including the Sun, are powered mainly by fusion of hydrogen into helium.", ar: "تستمد النجوم، ومنها الشمس، طاقتها أساسًا من اندماج الهيدروجين إلى هيليوم." },
  },
  2: {
    about: { en: "A colourless, unreactive noble gas. Its full first shell (two electrons) makes it extremely stable.", ar: "غاز نبيل عديم اللون وخامل كيميائيًا. غلافه الأول الممتلئ بإلكترونين يجعله مستقرًا جدًا." },
    uses: [{ en: "Cooling superconducting magnets (e.g. MRI scanners)", ar: "تبريد المغانط فائقة التوصيل (مثل أجهزة الرنين المغناطيسي)" }, { en: "Lifting gas for balloons", ar: "غاز لرفع المناطيد والبالونات" }],
    fact: { en: "Helium was first detected in the Sun's spectrum (1868) before being found on Earth.", ar: "اكتُشف الهيليوم أولًا في طيف الشمس عام 1868 قبل العثور عليه على الأرض." },
  },
  6: {
    about: { en: "The basis of organic chemistry and all known life. Carbon forms four covalent bonds and long chains.", ar: "أساس الكيمياء العضوية وكل أشكال الحياة المعروفة. يكوّن الكربون أربع روابط تساهمية وسلاسل طويلة." },
    uses: [{ en: "Steel making", ar: "صناعة الفولاذ" }, { en: "Graphite in pencils and electrodes", ar: "الغرافيت في أقلام الرصاص والأقطاب" }],
    fact: { en: "Diamond and graphite are both pure carbon, differing only in how the atoms are bonded.", ar: "الألماس والغرافيت كلاهما كربون نقي، ويختلفان فقط في طريقة ترابط الذرات." },
  },
  7: {
    about: { en: "Nitrogen makes up about 78% of Earth's atmosphere by volume, mostly as N₂ molecules with a strong triple bond.", ar: "يشكّل النيتروجين نحو 78% من حجم الغلاف الجوي، غالبًا على هيئة جزيئات N₂ ذات رابطة ثلاثية قوية." },
    uses: [{ en: "Fertilisers (via ammonia)", ar: "الأسمدة (عن طريق الأمونيا)" }, { en: "Inert atmosphere for food packaging", ar: "جو خامل لتغليف الأغذية" }],
  },
  8: {
    about: { en: "Oxygen makes up about 21% of the atmosphere and is the most abundant element in Earth's crust by mass.", ar: "يشكّل الأكسجين نحو 21% من الغلاف الجوي، وهو أكثر العناصر وفرة في القشرة الأرضية من حيث الكتلة." },
    uses: [{ en: "Respiration and medical oxygen", ar: "التنفس والأكسجين الطبي" }, { en: "Steel production", ar: "إنتاج الفولاذ" }],
  },
  10: {
    about: { en: "A noble gas that glows red-orange in electric discharge tubes.", ar: "غاز نبيل يتوهّج باللون الأحمر البرتقالي في أنابيب التفريغ الكهربائي." },
    uses: [{ en: "Advertising signs", ar: "لافتات الإعلانات المضيئة" }],
  },
  11: {
    about: { en: "A soft, highly reactive alkali metal. It loses one electron to form Na⁺ ions, as in table salt.", ar: "فلز قلوي طري شديد النشاط. يفقد إلكترونًا واحدًا ليكوّن أيون Na⁺ كما في ملح الطعام." },
    uses: [{ en: "Sodium chloride (salt)", ar: "كلوريد الصوديوم (الملح)" }, { en: "Street lighting (sodium vapour lamps)", ar: "إنارة الشوارع (مصابيح بخار الصوديوم)" }],
  },
  12: {
    about: { en: "A light alkaline earth metal; Mg²⁺ is found at the centre of chlorophyll.", ar: "فلز قلوي ترابي خفيف؛ ويوجد أيون Mg²⁺ في مركز جزيء الكلوروفيل." },
    uses: [{ en: "Lightweight alloys", ar: "سبائك خفيفة الوزن" }],
  },
  13: {
    about: { en: "The most abundant metal in Earth's crust; light and corrosion resistant thanks to a thin oxide layer.", ar: "أكثر الفلزات وفرة في القشرة الأرضية؛ خفيف ومقاوم للتآكل بفضل طبقة أكسيد رقيقة." },
    uses: [{ en: "Cans, foil and aircraft alloys", ar: "العلب ورقائق التغليف وسبائك الطائرات" }],
  },
  14: {
    about: { en: "A metalloid and semiconductor; the second most abundant element in Earth's crust.", ar: "شبه فلز وموصل شبه؛ ثاني أكثر العناصر وفرة في القشرة الأرضية." },
    uses: [{ en: "Computer chips and solar cells", ar: "الرقائق الإلكترونية والخلايا الشمسية" }, { en: "Glass (as silica)", ar: "الزجاج (على هيئة سيليكا)" }],
  },
  17: {
    about: { en: "A reactive halogen, a yellow-green gas as Cl₂. It gains one electron to form chloride ions, Cl⁻.", ar: "هالوجين نشط، غاز أصفر مخضر على هيئة Cl₂. يكتسب إلكترونًا ليكوّن أيون الكلوريد Cl⁻." },
    uses: [{ en: "Water disinfection", ar: "تعقيم المياه" }, { en: "PVC plastics", ar: "بلاستيك PVC" }],
  },
  18: {
    about: { en: "The most abundant noble gas in Earth's atmosphere (about 0.93%).", ar: "أكثر الغازات النبيلة وفرة في الغلاف الجوي (نحو 0.93%)." },
    uses: [{ en: "Shielding gas in welding", ar: "غاز واقٍ في اللحام" }],
  },
  20: {
    about: { en: "An alkaline earth metal essential to bones, teeth and shells (as calcium compounds).", ar: "فلز قلوي ترابي أساسي في العظام والأسنان والأصداف (على هيئة مركّبات الكالسيوم)." },
    uses: [{ en: "Cement and lime (as calcium compounds)", ar: "الإسمنت والجير (مركّبات الكالسيوم)" }],
  },
  26: {
    about: { en: "The most used metal; the main component of steel. Earth's core is thought to be mostly iron.", ar: "أكثر الفلزات استخدامًا والمكوّن الرئيس للفولاذ. يُعتقد أن لبّ الأرض يتكوّن معظمه من الحديد." },
    uses: [{ en: "Steel construction", ar: "البناء بالفولاذ" }, { en: "Haemoglobin in blood carries oxygen using iron", ar: "يحمل الهيموغلوبين في الدم الأكسجين بواسطة الحديد" }],
  },
  29: {
    about: { en: "A reddish metal with excellent electrical conductivity.", ar: "فلز محمر ذو توصيل كهربائي ممتاز." },
    uses: [{ en: "Electrical wiring", ar: "الأسلاك الكهربائية" }, { en: "Bronze and brass alloys", ar: "سبائك البرونز والنحاس الأصفر" }],
  },
  47: {
    about: { en: "Silver has the highest electrical conductivity of any metal.", ar: "تمتلك الفضة أعلى توصيل كهربائي بين جميع الفلزات." },
    uses: [{ en: "Jewellery and electronics", ar: "المجوهرات والإلكترونيات" }],
  },
  79: {
    about: { en: "A dense, unreactive precious metal that does not tarnish in air.", ar: "فلز نفيس كثيف وقليل النشاط لا يفقد بريقه في الهواء." },
    uses: [{ en: "Jewellery and coins", ar: "المجوهرات والعملات" }, { en: "Electronic connectors", ar: "الموصلات الإلكترونية" }],
  },
  80: {
    about: { en: "The only metal that is liquid at standard room conditions. Mercury and its compounds are toxic.", ar: "الفلز الوحيد السائل في الظروف القياسية. الزئبق ومركّباته سامّة." },
    uses: [{ en: "Historically in thermometers (now largely phased out)", ar: "استُخدم تاريخيًا في موازين الحرارة (وتم التخلي عنه غالبًا)" }],
  },
  92: {
    about: { en: "A dense, weakly radioactive actinide that occurs naturally.", ar: "أكتينيد كثيف ضعيف النشاط الإشعاعي يوجد في الطبيعة." },
    uses: [{ en: "Fuel for nuclear power reactors", ar: "وقود لمفاعلات الطاقة النووية" }],
  },
  118: {
    about: { en: "The heaviest element confirmed so far. Only a handful of atoms have been produced, so its properties are predicted rather than measured.", ar: "أثقل عنصر مؤكَّد حتى الآن. لم يُحضَّر منه إلا عدد قليل من الذرات، لذا فخصائصه متوقعة لا مقيسة." },
    uses: [{ en: "Scientific research only", ar: "البحث العلمي فقط" }],
  },
};

