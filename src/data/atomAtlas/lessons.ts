import type { Bi } from "./types";

export interface Question { q: Bi; options: Bi[]; answer: number; why: Bi }
export interface Lesson {
  id: string;
  title: Bi;
  summary: Bi;
  diagram: "atom" | "table" | "bond" | "molecule" | "formula" | "trend" | "states" | "naming";
  objectives: Bi[];
  sections: { h: Bi; p: Bi }[];
  example: { q: Bi; a: Bi };
  practice: Question[];
  elements: string[];
  molecules: string[];
}

const b = (en: string, ar: string): Bi => ({ en, ar });

export const LESSONS: Lesson[] = [
  {
    id: "atomic-structure", diagram: "atom",
    title: b("Structure of the atom", "بنية الذرة"),
    summary: b("Protons, neutrons and electrons — and how they define an element.", "البروتونات والنيوترونات والإلكترونات، وكيف تحدّد هوية العنصر."),
    objectives: [b("Name the three subatomic particles and their charges", "تسمية الجسيمات الثلاثة دون الذرية وشحناتها"), b("Use atomic number and mass number to count particles", "استخدام العدد الذري والعدد الكتلي لحساب عدد الجسيمات")],
    sections: [
      { h: b("The nucleus", "النواة"), p: b("Almost all of an atom's mass is in its tiny nucleus, which contains positive protons and neutral neutrons.", "تتركز معظم كتلة الذرة في نواتها الصغيرة جدًا، والتي تحتوي على بروتونات موجبة ونيوترونات متعادلة.") },
      { h: b("Electrons", "الإلكترونات"), p: b("Negative electrons occupy the space around the nucleus. In a neutral atom, electrons = protons.", "تشغل الإلكترونات السالبة الفراغ حول النواة. في الذرة المتعادلة يكون عدد الإلكترونات مساويًا لعدد البروتونات.") },
      { h: b("Isotopes", "النظائر"), p: b("Atoms of one element always have the same number of protons but can differ in neutrons: neutrons = A − Z.", "لذرات العنصر الواحد العدد نفسه من البروتونات دائمًا، لكنها قد تختلف في عدد النيوترونات: النيوترونات = A − Z.") },
    ],
    example: { q: b("How many protons, neutrons and electrons are in a neutral atom of carbon-14 (Z = 6)?", "كم عدد البروتونات والنيوترونات والإلكترونات في ذرة كربون-14 متعادلة (Z = 6)؟"), a: b("Protons = 6, electrons = 6, neutrons = 14 − 6 = 8.", "البروتونات = 6، الإلكترونات = 6، النيوترونات = 14 − 6 = 8.") },
    practice: [
      { q: b("Which particle has no electric charge?", "أي الجسيمات ليس له شحنة كهربائية؟"), options: [b("Proton", "البروتون"), b("Neutron", "النيوترون"), b("Electron", "الإلكترون")], answer: 1, why: b("Neutrons are neutral; protons are positive and electrons negative.", "النيوترونات متعادلة؛ البروتونات موجبة والإلكترونات سالبة.") },
      { q: b("An oxygen-18 atom (Z = 8) has how many neutrons?", "كم عدد النيوترونات في ذرة أكسجين-18 (Z = 8)؟"), options: [b("8", "8"), b("10", "10"), b("18", "18")], answer: 1, why: b("18 − 8 = 10 neutrons.", "18 − 8 = 10 نيوترونات.") },
    ],
    elements: ["H", "C", "O"], molecules: [],
  },
  {
    id: "periodic-table", diagram: "table",
    title: b("Organisation of the periodic table", "تنظيم الجدول الدوري"),
    summary: b("Why elements are arranged by atomic number into groups and periods.", "لماذا تُرتَّب العناصر حسب العدد الذري في مجموعات ودورات."),
    objectives: [b("Distinguish groups from periods", "التمييز بين المجموعات والدورات"), b("Locate metals, nonmetals and metalloids", "تحديد مواقع الفلزات واللافلزات وأشباه الفلزات")],
    sections: [
      { h: b("Ordered by atomic number", "الترتيب حسب العدد الذري"), p: b("Elements are listed in order of increasing atomic number; the table has 118 confirmed elements.", "تُرتَّب العناصر تصاعديًا حسب العدد الذري، ويضم الجدول 118 عنصرًا مؤكَّدًا.") },
      { h: b("Groups and periods", "المجموعات والدورات"), p: b("The 18 columns are groups; elements in a group have similar outer electrons and similar chemistry. The 7 rows are periods.", "الأعمدة الثمانية عشر مجموعات، ولعناصر المجموعة إلكترونات خارجية وسلوك كيميائي متشابه. والصفوف السبعة دورات.") },
      { h: b("Blocks", "الفئات"), p: b("The s, p, d and f blocks show which subshell is being filled. The lanthanides and actinides (f-block) are drawn below the main table to save space.", "تُظهر الفئات s وp وd وf المستوى الفرعي الذي يُملأ. وتُرسم اللانثانيدات والأكتينيدات (الفئة f) أسفل الجدول توفيرًا للمساحة.") },
    ],
    example: { q: b("Sodium is in period 3, group 1. What does this tell us?", "الصوديوم في الدورة 3 والمجموعة 1. ماذا يعني ذلك؟"), a: b("It has three occupied shells and one outer electron, so it is a reactive alkali metal.", "لديه ثلاثة مستويات طاقة مشغولة وإلكترون خارجي واحد، فهو فلز قلوي نشط.") },
    practice: [
      { q: b("Elements in the same group have similar…", "عناصر المجموعة الواحدة متشابهة في…"), options: [b("mass", "الكتلة"), b("chemical properties", "الخواص الكيميائية"), b("number of neutrons", "عدد النيوترونات")], answer: 1, why: b("They have the same number of outer electrons.", "لأن لها العدد نفسه من الإلكترونات الخارجية.") },
    ],
    elements: ["Na", "K", "Cl", "Ne"], molecules: [],
  },
  {
    id: "chemical-bonding", diagram: "bond",
    title: b("Chemical bonding", "الروابط الكيميائية"),
    summary: b("Covalent sharing versus ionic transfer of electrons.", "المشاركة التساهمية مقابل الانتقال الأيوني للإلكترونات."),
    objectives: [b("Explain covalent and ionic bonds", "شرح الرابطة التساهمية والأيونية"), b("Predict the bond type from the elements involved", "توقع نوع الرابطة من العناصر المشتركة")],
    sections: [
      { h: b("Covalent bonds", "الروابط التساهمية"), p: b("Nonmetal atoms share pairs of electrons. One shared pair is a single bond; two a double bond; three a triple bond.", "تتشارك ذرات اللافلزات في أزواج من الإلكترونات: زوج واحد رابطة أحادية، وزوجان رابطة ثنائية، وثلاثة رابطة ثلاثية.") },
      { h: b("Ionic bonds", "الروابط الأيونية"), p: b("A metal transfers electrons to a nonmetal. The resulting positive and negative ions attract each other in a lattice.", "ينقل الفلز إلكترونات إلى اللافلز، فتتجاذب الأيونات الموجبة والسالبة الناتجة في شبكة بلورية.") },
    ],
    example: { q: b("What type of bonding is in NaCl and in H₂O?", "ما نوع الترابط في NaCl وفي H₂O؟"), a: b("NaCl: ionic (metal + nonmetal). H₂O: covalent (two nonmetals).", "NaCl: أيوني (فلز + لافلز). H₂O: تساهمي (لافلزان).") },
    practice: [
      { q: b("N₂ contains which bond?", "ما نوع الرابطة في N₂؟"), options: [b("Single covalent", "تساهمية أحادية"), b("Triple covalent", "تساهمية ثلاثية"), b("Ionic", "أيونية")], answer: 1, why: b("Each N shares three electron pairs: N≡N.", "تتشارك ذرتا النيتروجين في ثلاثة أزواج: N≡N.") },
      { q: b("MgO is held together by…", "يترابط MgO بواسطة…"), options: [b("ionic bonding", "رابطة أيونية"), b("covalent bonding", "رابطة تساهمية")], answer: 0, why: b("Mg (metal) gives two electrons to O (nonmetal): Mg²⁺ O²⁻.", "يعطي Mg (فلز) إلكترونين لـ O (لافلز): Mg²⁺ O²⁻.") },
    ],
    elements: ["Na", "Cl", "Mg", "O"], molecules: ["sodium-chloride", "nitrogen", "water"],
  },
  {
    id: "molecules-compounds", diagram: "molecule",
    title: b("Molecules and compounds", "الجزيئات والمركّبات"),
    summary: b("Atoms, molecules, compounds and lattices are not the same thing.", "الذرات والجزيئات والمركّبات والشبكات ليست الشيء نفسه."),
    objectives: [b("Classify substances as elements or compounds", "تصنيف المواد إلى عناصر أو مركّبات"), b("Recognise that ionic compounds form lattices, not molecules", "إدراك أن المركّبات الأيونية تكوّن شبكات لا جزيئات")],
    sections: [
      { h: b("Molecules of elements", "جزيئات العناصر"), p: b("O₂ and N₂ are molecules, but each contains only one element, so they are not compounds.", "O₂ و N₂ جزيئات، لكن كلًّا منها يحتوي عنصرًا واحدًا فقط، فهي ليست مركّبات.") },
      { h: b("Compounds", "المركّبات"), p: b("Water and carbon dioxide are covalent compounds made of molecules. Sodium chloride is an ionic compound made of a continuous lattice.", "الماء وثاني أكسيد الكربون مركّبات تساهمية تتكوّن من جزيئات، أما كلوريد الصوديوم فمركّب أيوني يتكوّن من شبكة متصلة.") },
    ],
    example: { q: b("Is O₂ an element or a compound?", "هل O₂ عنصر أم مركّب؟"), a: b("An element: it is a molecule containing only oxygen atoms.", "عنصر: جزيء يحتوي على ذرات أكسجين فقط.") },
    practice: [
      { q: b("Which is a compound?", "أيّها مركّب؟"), options: [b("He", "He"), b("O₂", "O₂"), b("CO₂", "CO₂")], answer: 2, why: b("CO₂ contains two different elements chemically combined.", "يحتوي CO₂ على عنصرين مختلفين متحدين كيميائيًا.") },
    ],
    elements: ["O", "N"], molecules: ["oxygen", "carbon-dioxide", "sodium-chloride"],
  },
  {
    id: "chemical-formulas", diagram: "formula",
    title: b("Chemical formulas", "الصيغ الكيميائية"),
    summary: b("Reading symbols and subscripts to count atoms.", "قراءة الرموز والأرقام السفلية لحساب الذرات."),
    objectives: [b("Count atoms in a formula", "حساب الذرات في صيغة"), b("Interpret formulas of ionic compounds as ratios", "تفسير صيغ المركّبات الأيونية كنسب")],
    sections: [
      { h: b("Subscripts", "الأرقام السفلية"), p: b("A subscript counts the atom immediately before it. No subscript means one.", "يدل الرقم السفلي على عدد الذرة التي تسبقه مباشرة، وغيابه يعني ذرة واحدة.") },
      { h: b("Ionic formulas", "الصيغ الأيونية"), p: b("For ionic compounds the formula gives the simplest ratio of ions, chosen so charges balance: Mg²⁺ + 2 Cl⁻ → MgCl₂.", "في المركّبات الأيونية تعطي الصيغة أبسط نسبة للأيونات بحيث تتوازن الشحنات: Mg²⁺ + 2 Cl⁻ ← MgCl₂.") },
    ],
    example: { q: b("How many atoms are in one CH₄ molecule?", "كم ذرة في جزيء CH₄ واحد؟"), a: b("1 carbon + 4 hydrogen = 5 atoms.", "1 كربون + 4 هيدروجين = 5 ذرات.") },
    practice: [
      { q: b("How many oxygen atoms are in CO₂?", "كم ذرة أكسجين في CO₂؟"), options: [b("1", "1"), b("2", "2"), b("3", "3")], answer: 1, why: b("The subscript 2 follows O.", "الرقم السفلي 2 يأتي بعد O.") },
      { q: b("How many atoms in total in NH₃?", "كم مجموع الذرات في NH₃؟"), options: [b("3", "3"), b("4", "4"), b("5", "5")], answer: 1, why: b("1 N + 3 H = 4.", "1 N + 3 H = 4.") },
    ],
    elements: ["C", "H", "N"], molecules: ["methane", "ammonia", "carbon-dioxide"],
  },
  {
    id: "periodic-trends", diagram: "trend",
    title: b("Periodic trends", "التدرّجات الدورية"),
    summary: b("How electronegativity and atomic radius change across the table.", "كيف تتغير السالبية الكهربائية ونصف القطر الذري عبر الجدول."),
    objectives: [b("Describe the trend in electronegativity", "وصف تدرج السالبية الكهربائية"), b("Explain why atomic radius changes", "تفسير تغير نصف القطر الذري")],
    sections: [
      { h: b("Across a period", "عبر الدورة"), p: b("Moving left to right, nuclear charge increases while the shell stays the same, so atoms generally get smaller and electronegativity generally increases.", "من اليسار إلى اليمين تزداد شحنة النواة مع بقاء المستوى نفسه، فتصغر الذرات عمومًا وتزداد السالبية الكهربائية عمومًا.") },
      { h: b("Down a group", "نزولًا في المجموعة"), p: b("Each step down adds a shell, so atoms generally get larger and electronegativity generally decreases. Trends are general patterns with exceptions.", "كل خطوة نزولًا تضيف مستوى طاقة، فتكبر الذرات عمومًا وتقل السالبية الكهربائية. التدرجات أنماط عامة لها استثناءات.") },
    ],
    example: { q: b("Which is more electronegative, F or I?", "أيهما أعلى سالبية كهربائية: F أم I؟"), a: b("F (3.98) is more electronegative than I (2.66, Pauling scale).", "F (3.98) أعلى من I (2.66، مقياس باولنغ).") },
    practice: [
      { q: b("Across period 3 from Na to Cl, atomic radius generally…", "عبر الدورة 3 من Na إلى Cl، نصف القطر الذري عمومًا…"), options: [b("increases", "يزداد"), b("decreases", "يقل")], answer: 1, why: b("Increasing nuclear charge pulls the same shell closer.", "تزايد شحنة النواة يجذب المستوى نفسه أقرب.") },
    ],
    elements: ["F", "Cl", "I", "Na"], molecules: ["hydrogen-chloride"],
  },
  {
    id: "states-of-matter", diagram: "states",
    title: b("States of matter", "حالات المادة"),
    summary: b("Solids, liquids and gases at the particle level.", "الصلب والسائل والغاز على مستوى الجسيمات."),
    objectives: [b("Describe particle arrangement in each state", "وصف ترتيب الجسيمات في كل حالة"), b("Use melting and boiling points to predict state", "استخدام درجتي الانصهار والغليان لتوقع الحالة")],
    sections: [
      { h: b("Particle model", "النموذج الجسيمي"), p: b("In solids particles vibrate in fixed positions; in liquids they move past each other; in gases they move freely and far apart.", "في الصلب تهتز الجسيمات في مواضع ثابتة، وفي السائل تنزلق فوق بعضها، وفي الغاز تتحرك بحرية ومتباعدة.") },
      { h: b("Predicting state", "توقع الحالة"), p: b("At a temperature T: below the melting point → solid; between melting and boiling points → liquid; above the boiling point → gas.", "عند درجة حرارة T: أقل من درجة الانصهار ← صلب؛ بين الانصهار والغليان ← سائل؛ أعلى من الغليان ← غاز.") },
    ],
    example: { q: b("Bromine melts at 266 K and boils at 332 K. What is its state at 298 K?", "ينصهر البروم عند 266 K ويغلي عند 332 K. ما حالته عند 298 K؟"), a: b("298 K lies between the two, so bromine is a liquid.", "تقع 298 K بينهما، فالبروم سائل.") },
    practice: [
      { q: b("Which element is liquid at room conditions?", "أي العناصر سائل في ظروف الغرفة؟"), options: [b("Mercury", "الزئبق"), b("Iron", "الحديد"), b("Neon", "النيون")], answer: 0, why: b("Mercury melts at about 234 K, below room temperature.", "ينصهر الزئبق عند نحو 234 K، أقل من حرارة الغرفة.") },
    ],
    elements: ["Hg", "Br", "Fe", "Ne"], molecules: ["water"],
  },
  {
    id: "nomenclature", diagram: "naming",
    title: b("Introductory nomenclature", "مبادئ التسمية الكيميائية"),
    summary: b("Naming simple binary compounds.", "تسمية المركّبات الثنائية البسيطة."),
    objectives: [b("Name binary ionic compounds", "تسمية المركّبات الأيونية الثنائية"), b("Use prefixes for simple covalent compounds", "استخدام البادئات للمركّبات التساهمية البسيطة")],
    sections: [
      { h: b("Ionic compounds", "المركّبات الأيونية"), p: b("Name the metal, then the nonmetal with the ending -ide: NaCl is sodium chloride. In Arabic the anion comes first: كلوريد الصوديوم.", "في الإنجليزية يُذكر الفلز ثم اللافلز بالمقطع -ide. وفي العربية يُذكر الأيون السالب أولًا: NaCl كلوريد الصوديوم.") },
      { h: b("Covalent compounds", "المركّبات التساهمية"), p: b("Prefixes give the number of atoms: mono-, di-, tri-. CO₂ is carbon dioxide (ثاني أكسيد الكربون).", "تبيّن البادئات عدد الذرات: أحادي، ثنائي، ثلاثي. CO₂ هو ثاني أكسيد الكربون.") },
    ],
    example: { q: b("Name MgO.", "سمِّ MgO."), a: b("Magnesium oxide (أكسيد المغنيسيوم).", "أكسيد المغنيسيوم (Magnesium oxide).") },
    practice: [
      { q: b("What is the name of HCl (as a gas)?", "ما اسم HCl (في الحالة الغازية)؟"), options: [b("Hydrogen chloride", "كلوريد الهيدروجين"), b("Chlorine hydride", "هيدريد الكلور"), b("Hydrochlorine", "هيدروكلورين")], answer: 0, why: b("Hydrogen + chlorine with -ide ending.", "هيدروجين + كلور مع المقطع -ide (كلوريد).") },
    ],
    elements: ["Mg", "Cl"], molecules: ["sodium-chloride", "magnesium-oxide", "carbon-dioxide", "hydrogen-chloride"],
  },
];

export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);

