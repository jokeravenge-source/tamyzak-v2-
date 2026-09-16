export type EquationText = { ar: string; en: string };

export const chemicalEquationTopics = [
  { id: "thermochemistry", title: { ar: "الكيمياء الحرارية", en: "Thermochemistry" } },
  { id: "equilibrium", title: { ar: "الاتزان الكيميائي", en: "Chemical equilibrium" } },
  { id: "weak-electrolytes", title: { ar: "الإلكتروليتات الضعيفة", en: "Weak electrolytes" } },
  { id: "water-ionization", title: { ar: "التأين التلقائي للماء", en: "Water autoionization" } },
  { id: "neutralization", title: { ar: "تفاعلات التعادل", en: "Neutralization" } },
  { id: "redox", title: { ar: "الأكسدة والاختزال", en: "Oxidation and reduction" } },
  { id: "double-salts", title: { ar: "المركبات المزدوجة", en: "Double salts" } },
  { id: "coordination", title: { ar: "المركبات التناسقية", en: "Coordination compounds" } },
] as const;

export type ChemicalEquationTopic = typeof chemicalEquationTopics[number]["id"];
export type ChemicalEquation = {
  id: number;
  topic: ChemicalEquationTopic;
  title: EquationText;
  subtopic: EquationText;
  formula: string;
  hint: EquationText;
  value?: { text: string; kind: "released" | "absorbed" | "potential" };
  note?: EquationText;
  reference?: { title: string; url: string };
};

const formation = { ar: "إنثالبي التكوين", en: "Enthalpy of formation" };
const phaseChange = { ar: "تغيرات الحالة الفيزيائية", en: "Phase changes" };
const zinc = { ar: "أنصاف تفاعلات الخارصين", en: "Zinc half-reactions" };

// Keep the user's 19 numbered learning examples in order, omitting the two
// repeated occurrences. The scaled zinc equation is intentionally retained.
// Unicode formulae are rendered LTR; no HTML or unrendered LaTeX is injected.
export const chemicalEquations: readonly ChemicalEquation[] = [
  {
    id: 1, topic: "thermochemistry", subtopic: formation,
    title: { ar: "تكوين الماء السائل", en: "Formation of liquid water" },
    formula: "H₂(g) + ½ O₂(g) → H₂O(l)",
    value: { text: "ΔH = −286 kJ/mol", kind: "released" },
    hint: {
      ar: "كوّن مولاً واحداً من الماء: مول H₂ ونصف مول O₂. تذكّر أن السائل يطلق حرارة أكثر من البخار: −286 للسائل و−242 للبخار، والفرق 44.",
      en: "Make one mole of water from one H₂ and half an O₂. Liquid water releases more heat than vapor: −286 for liquid, −242 for vapor; the difference is 44.",
    },
  },
  {
    id: 2, topic: "thermochemistry", subtopic: formation,
    title: { ar: "تكوين بخار الماء", en: "Formation of water vapor" },
    formula: "H₂(g) + ½ O₂(g) → H₂O(g)",
    value: { text: "ΔH = −242 kJ/mol", kind: "released" },
    hint: {
      ar: "نفس متفاعلات تكوين الماء السائل، لكن الناتج يحمل (g). البخار يحتفظ بطاقة أكبر، لذلك حرارة تكوينه أقل سالبية: −242 بدلاً من −286.",
      en: "Keep the same reactants but give the product a (g). Vapor retains more energy, so its formation enthalpy is less negative: −242 rather than −286.",
    },
  },
  {
    id: 3, topic: "thermochemistry", subtopic: phaseChange,
    title: { ar: "التبخر", en: "Vaporization" },
    formula: "H₂O(l) → H₂O(g)",
    value: { text: "ΔH = +44 kJ/mol", kind: "absorbed" },
    hint: {
      ar: "السائل يصير غازاً ويحتاج طاقة: الإشارة موجبة. اربط 44 بالتبخر؛ وهي أيضاً الفرق بين −242 و−286.",
      en: "Liquid becomes gas and needs energy, so the sign is positive. Link 44 to vaporization; it is also the difference between −242 and −286.",
    },
  },
  {
    id: 4, topic: "thermochemistry", subtopic: phaseChange,
    title: { ar: "الانصهار", en: "Melting" },
    formula: "H₂O(s) → H₂O(l)",
    value: { text: "ΔH = +6 kJ/mol", kind: "absorbed" },
    hint: {
      ar: "ثلج → ماء سائل: نضيف حرارة حتى ينصهر، فتكون +6. احفظ الزوج: الانصهار +6 والتجمد −6.",
      en: "Ice → liquid water: energy goes in, so +6. Memorize the pair: melting +6, freezing −6.",
    },
    note: { ar: "وردت هذه المعادلة مرتين في النص المرسل؛ نعرضها مرة واحدة فقط.", en: "This equation appeared twice in the supplied text; it is listed only once here." },
  },
  {
    id: 5, topic: "thermochemistry", subtopic: phaseChange,
    title: { ar: "التكثف", en: "Condensation" },
    formula: "H₂O(g) → H₂O(l)",
    value: { text: "ΔH = −44 kJ/mol", kind: "released" },
    hint: {
      ar: "اعكس معادلة التبخر واعكس الإشارة فقط: الغاز يعود سائلاً ويطلق حرارة، لذلك −44.",
      en: "Reverse vaporization and reverse only the sign. Gas returns to liquid and releases heat: −44.",
    },
  },
  {
    id: 6, topic: "thermochemistry", subtopic: phaseChange,
    title: { ar: "التجمد", en: "Freezing" },
    formula: "H₂O(l) → H₂O(s)",
    value: { text: "ΔH = −6 kJ/mol", kind: "released" },
    hint: {
      ar: "التجمد عكس الانصهار: سائل → صلب، مع خروج حرارة. نفس المقدار 6، لكن الإشارة سالبة.",
      en: "Freezing reverses melting: liquid → solid, with heat leaving. Keep the magnitude 6 and make the sign negative.",
    },
  },
  {
    id: 7, topic: "equilibrium",
    subtopic: { ar: "مثال الأطوار الصلبة في المصدر", en: "All-solid source example" },
    title: { ar: "اتزان بين مواد صلبة", en: "Equilibrium involving solids" },
    formula: "A(s) + B(s) ⇌ AB(s)",
    hint: {
      ar: "احفظ A + B ⇌ AB مع (s) لكل مادة. السهم المزدوج يعني تفاعلاً عكوساً؛ وحدد التجانس من عدد الأطوار، لا من تشابه رموز الحالة وحده.",
      en: "Remember A + B ⇌ AB with an (s) on each species. The double arrow marks reversibility; classify homogeneity by the number of phases, not just matching state symbols.",
    },
    note: {
      ar: "سُمّي هذا المثال متجانساً في النص المرسل. لكن المواد الصلبة المختلفة قد تكون أطواراً منفصلة؛ عندها يكون الاتزان غير متجانس. تشابه (s) وحده لا يثبت وجود طور واحد.",
      en: "The supplied text calls this homogeneous. Different solids may instead be separate phases, making the equilibrium heterogeneous. Matching (s) labels alone does not establish a single phase.",
    },
    reference: { title: "OpenStax · Equilibrium constants", url: "https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants" },
  },
  {
    id: 8, topic: "equilibrium",
    subtopic: { ar: "الاتزان غير المتجانس", en: "Heterogeneous equilibrium" },
    title: { ar: "اتزان بين سائل وغاز وصلب", en: "Liquid–gas–solid equilibrium" },
    formula: "A(l) + B(g) ⇌ AB(s)",
    hint: {
      ar: "احفظ الحالات بالترتيب: سائل + غاز ⇌ صلب. وجود أكثر من طور هو مفتاح تذكّر أنه اتزان غير متجانس.",
      en: "Read the states in order: liquid + gas ⇌ solid. More than one phase is the cue for heterogeneous equilibrium.",
    },
  },
  {
    id: 9, topic: "weak-electrolytes",
    subtopic: { ar: "تأين الحمض الضعيف", en: "Weak-acid ionization" },
    title: { ar: "تأين حامض الخليك", en: "Acetic-acid ionization" },
    formula: "CH₃COOH ⇌ CH₃COO⁻ + H⁺",
    hint: {
      ar: "احذف H الأخير من مجموعة COOH: تبقى CH₃COO⁻ ويخرج H⁺. الشحنتان − و+ تتعادلان، والسهم مزدوج لأن التأين جزئي.",
      en: "Remove the final H from COOH: CH₃COO⁻ stays behind and H⁺ leaves. The − and + charges balance; use a double arrow because ionization is partial.",
    },
    note: { ar: "هذه صيغة مختصرة؛ في الماء يرتبط البروتون بالماء ويُمثّل بـ H₃O⁺.", en: "This is shorthand; in water the proton binds to water and is represented as H₃O⁺." },
  },
  {
    id: 10, topic: "water-ionization",
    subtopic: { ar: "انتقال البروتون", en: "Proton transfer" },
    title: { ar: "التأين التلقائي للماء", en: "Autoionization of water" },
    formula: "H₂O + H₂O ⇌ H₃O⁺ + OH⁻",
    hint: {
      ar: "جزيئتان ماء: واحدة تمنح H⁺ فتتحول إلى OH⁻، والثانية تستقبله فتصير H₃O⁺. عدّ الذرات: 4H و2O على الطرفين.",
      en: "Two waters: one donates H⁺ and becomes OH⁻; the other accepts it and becomes H₃O⁺. Count four H and two O on each side.",
    },
  },
  {
    id: 11, topic: "neutralization",
    subtopic: { ar: "حمض وقاعدة", en: "Acid and base" },
    title: { ar: "تعادل HCl مع NaOH", en: "HCl–NaOH neutralization" },
    formula: "HCl + NaOH → NaCl + H₂O",
    hint: {
      ar: "حمض + قاعدة → ملح + ماء. اجمع Na مع Cl للملح، واجمع H مع OH للماء؛ هنا المعاملات كلها 1.",
      en: "Acid + base → salt + water. Pair Na with Cl for the salt and H with OH for water; every coefficient here is 1.",
    },
  },
  {
    id: 12, topic: "redox", subtopic: { ar: "الأكسدة", en: "Oxidation" },
    title: { ar: "فقد إلكترون", en: "Losing an electron" },
    formula: "A⁰ → A⁺ + e⁻",
    hint: {
      ar: "الأكسدة فقد إلكترونات: الإلكترون على يمين السهم. فقد شحنة سالبة يجعل A موجبة؛ وتبقى الشحنة الكلية صفرًا.",
      en: "Oxidation is electron loss: put the electron on the right. Losing a negative charge makes A positive; total charge remains zero.",
    },
  },
  {
    id: 13, topic: "redox", subtopic: { ar: "الاختزال", en: "Reduction" },
    title: { ar: "اكتساب إلكترون", en: "Gaining an electron" },
    formula: "A⁰ + e⁻ → A⁻",
    hint: {
      ar: "الاختزال اكتساب إلكترونات: الإلكترون على يسار السهم. A المتعادلة تكتسب شحنة سالبة فتصير A⁻.",
      en: "Reduction is electron gain: put the electron on the left. Neutral A gains a negative charge and becomes A⁻.",
    },
  },
  {
    id: 14, topic: "redox", subtopic: { ar: "تفاعل إحلال", en: "Displacement reaction" },
    title: { ar: "الخارصين وكبريتات النحاس", en: "Zinc and copper sulfate" },
    formula: "Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)",
    hint: {
      ar: "الخارصين يحل محل النحاس: Zn يدخل مع SO₄، وCu يخرج فلزاً. مجموعة SO₄ تبقى كما هي؛ Zn يتأكسد وCu²⁺ يختزل.",
      en: "Zinc replaces copper: Zn pairs with SO₄ and Cu becomes metal. SO₄ stays together; Zn is oxidized and Cu²⁺ is reduced.",
    },
  },
  {
    id: 15, topic: "redox", subtopic: zinc,
    title: { ar: "أكسدة الخارصين عند الأنود", en: "Zinc oxidation at the anode" },
    formula: "Zn(s) → Zn²⁺(aq) + 2e⁻",
    value: { text: "E°ox = +0.76 V", kind: "potential" },
    hint: {
      ar: "Zn يصير Zn²⁺ بفقد إلكترونين، لذلك ضع 2e⁻ يمين السهم. اربط الأنود بالأكسدة، وجهد الأكسدة هنا +0.76 V.",
      en: "Zn becomes Zn²⁺ by losing two electrons, so put 2e⁻ on the right. Link the anode to oxidation; its oxidation potential is +0.76 V.",
    },
    note: {
      ar: "القيمة +0.76 V هي جهد الأكسدة القياسي؛ جهد الاختزال للتفاعل العكسي −0.76 V. المعادلة المكررة بوصفها تفاعل الأنود مدرجة هنا مرة واحدة.",
      en: "+0.76 V is the standard oxidation potential; the reverse reduction potential is −0.76 V. The repeated anode equation is listed only once.",
    },
    reference: { title: "OpenStax · Electrode potentials", url: "https://openstax.org/books/chemistry-2e/pages/17-3-electrode-and-cell-potentials" },
  },
  {
    id: 16, topic: "redox", subtopic: zinc,
    title: { ar: "مضاعفة معادلة أكسدة الخارصين", en: "Doubling the zinc oxidation equation" },
    formula: "2Zn(s) → 2Zn²⁺(aq) + 4e⁻",
    value: { text: "E°ox = +0.76 V", kind: "potential" },
    hint: {
      ar: "ضاعف عدد الذرات والإلكترونات: 1، 1، 2 تصبح 2، 2، 4. الجهد لا يتضاعف؛ احفظ: نضاعف المعاملات، لا الفولتات.",
      en: "Double atoms and electrons: 1, 1, 2 becomes 2, 2, 4. Potential does not double: scale coefficients, not volts.",
    },
    note: { ar: "يبقى جهد التفاعل نفسه عند ضرب المعاملات؛ الذي يتضاعف هو مقدار الشحنة المنقولة والطاقة الكلية.", en: "Scaling the equation leaves its potential unchanged; the transferred charge and total energy scale instead." },
  },
  {
    id: 17, topic: "redox", subtopic: zinc,
    title: { ar: "اختزال أيون الخارصين", en: "Reduction of the zinc ion" },
    formula: "Zn²⁺(aq) + 2e⁻ → Zn(s)",
    hint: {
      ar: "اعكس نصف تفاعل الأكسدة: Zn²⁺ يستقبل إلكترونين ويرجع Zn متعادلاً. الإلكترونات على اليسار؛ وإذا استعملت الجهد القياسي فالإشارة تنعكس إلى −0.76 V.",
      en: "Reverse the oxidation half-reaction: Zn²⁺ accepts two electrons and becomes neutral Zn. Electrons go on the left; the standard potential reverses sign to −0.76 V.",
    },
  },
  {
    id: 18, topic: "double-salts", subtopic: { ar: "ملح مور", en: "Mohr’s salt" },
    title: { ar: "تكوين ملح مور", en: "Formation of Mohr’s salt" },
    formula: "(NH₄)₂SO₄ + FeSO₄ + 6H₂O → FeSO₄·(NH₄)₂SO₄·6H₂O",
    hint: {
      ar: "احفظه: ملحان + 6 ماء. اجمع كبريتات الأمونيوم وكبريتات الحديد الثنائي، ثم اربطهما بنقاط ومعهما 6H₂O للتبلور.",
      en: "Remember: two salts + six waters. Join ammonium sulfate and iron(II) sulfate with dots, followed by 6H₂O of crystallization.",
    },
  },
  {
    id: 19, topic: "coordination", subtopic: { ar: "معقد النحاس والأمونيا", en: "Copper–ammonia complex" },
    title: { ar: "تفكك ملح معقد النحاس", en: "Dissociation of the copper complex salt" },
    formula: "CuSO₄·4NH₃ ⇌ [Cu(NH₃)₄]²⁺ + SO₄²⁻",
    hint: {
      ar: "الأمونيا تبقى مع النحاس داخل القوس: أربع NH₃ حول Cu. الكبريتات خارج القوس؛ شحنة المعقد +2 تقابل شحنة الكبريتات −2.",
      en: "Ammonia stays inside the brackets with copper: four NH₃ around Cu. Sulfate stays outside; the complex’s +2 balances sulfate’s −2.",
    },
    note: { ar: "هذه صيغة تعليمية مختصرة كما أرسلتها؛ إنها تفكك ملح المعقد، لا تفكك روابط الأمونيا داخل المعقد.", en: "This is the supplied simplified teaching formula: the complex salt dissociates, not the ammonia bonds inside the complex." },
  },
];
