// Ahmed Al-Nadawi Chemistry Chapter 3 — verified against the adopted Arabic PDF.
// Keep the published deck free of extraction notes and cards that belong to a
// different source edition.
import { flashcardsChemCh3AhmedNadawi_001_060 } from "./flashcardsChemCh3AhmedNadawi_001_060";
import { flashcardsChemCh3AhmedNadawi_061_120 } from "./flashcardsChemCh3AhmedNadawi_061_120";
import { flashcardsChemCh3AhmedNadawi_121_180 } from "./flashcardsChemCh3AhmedNadawi_121_180";
import { flashcardsChemCh3AhmedNadawi_181_240 } from "./flashcardsChemCh3AhmedNadawi_181_240";
import { flashcardsChemCh3AhmedNadawi_241_300 } from "./flashcardsChemCh3AhmedNadawi_241_300";
import { flashcardsChemCh3AhmedNadawi_301_360 } from "./flashcardsChemCh3AhmedNadawi_301_360";
import { flashcardsChemCh3AhmedNadawi_361_390 } from "./flashcardsChemCh3AhmedNadawi_361_390";
import { flashcardsChemCh3AhmedNadawi_391_414 } from "./flashcardsChemCh3AhmedNadawi_391_414";
import { chemAhmedCh3VerbalOverridesAr } from "./chemAhmedCh3VerbalOverridesAr";

export type AhmedNadawiChemCh3Card = {
  id: string;
  q: string;
  a: string;
  topic: string;
  kind: string;
  pages: string;
  sourceNotes?: string;
};

const rawAhmedNadawiChemCh3Cards: AhmedNadawiChemCh3Card[] = [
  ...flashcardsChemCh3AhmedNadawi_001_060,
  ...flashcardsChemCh3AhmedNadawi_061_120,
  ...flashcardsChemCh3AhmedNadawi_121_180,
  ...flashcardsChemCh3AhmedNadawi_181_240,
  ...flashcardsChemCh3AhmedNadawi_241_300,
  ...flashcardsChemCh3AhmedNadawi_301_360,
  ...flashcardsChemCh3AhmedNadawi_361_390,
  ...flashcardsChemCh3AhmedNadawi_391_414,
];

type SourceWording = Partial<Pick<AhmedNadawiChemCh3Card, "q" | "a" | "pages">>;

const sourceWordingById: Record<string, SourceWording> = {
  "CH3-012": {
    q: "كيف يكون تأين الإلكتروليت القوي في المحاليل المخففة جداً والمركزة؟",
  },
  "CH3-025": {
    q: "احسب [H+] في محلول H₂SO₄ تركيزه 0.12M بافتراض التأين التام.",
  },
  "CH3-026": {
    a: "[Na⁺]=0.8M، و[SO₄²⁻]=0.4M.",
    pages: "صفحة PDF 159, 161",
  },
  "CH3-039": {
    pages: "صفحة PDF 159, 160",
  },
  "CH3-068": {
    a: "pOH≈1.30، وpH≈12.70؛ الاختيار الصحيح هو (ج).",
    pages: "صفحة PDF 159, 161",
  },
  "CH3-098": {
    a: "C₆H₅OH⇌H⁺+C₆H₅O⁻؛ H₂CO₃⇌H⁺+HCO₃⁻.",
  },
  "CH3-102": {
    a: "C≈0.22M، وكتلة CH₃COOH≈3.3g.",
  },
  "CH3-103": {
    a: "C≈0.22M، وكتلة CH₃COOH≈2.64g.",
  },
  "CH3-112": {
    q: "اكتب مرحلتي تأين حامض الأوكزاليك وثابتي التأين.",
  },
  "CH3-144": {
    a: "NH₄Cl حامضي لأنه مشتق من حامض قوي وقاعدة ضعيفة؛ Na₂SO₄ متعادل لأنه مشتق من حامض قوي وقاعدة قوية؛ CH₃COOK قاعدي لأنه مشتق من حامض ضعيف وقاعدة قوية؛ CaF₂ قاعدي لأنه مشتق من حامض ضعيف وقاعدة قوية؛ MgSO₄ حامضي لأنه مشتق من حامض قوي وقاعدة ضعيفة؛ KCl متعادل لأنه مشتق من حامض قوي وقاعدة قوية.",
    pages: "صفحة PDF 159, 160",
  },
  "CH3-165": {
    a: "pH≈8.35.",
  },
  "CH3-203": {
    a: "[H⁺]≈9×10⁻⁶M، وpH≈5.04.",
  },
  "CH3-249": {
    a: "n=C×V(L) أو n=m/Mm، ثم تُضرب المولات في عدد أيونات H⁺ أو OH⁻ المتحررة؛ فكل مول من H₂SO₄ يعطي مولين من H⁺، وكل مول من Ca(OH)₂ أو Ba(OH)₂ يعطي مولين من OH⁻.",
  },
  "CH3-263": {
    a: "n(H⁺)=0.01mol؛ بعد الإضافة تصبح مولات الملح 0.01mol ومولات الحامض 0.03mol؛ pH قبل الإضافة=4.74، وpH بعدها≈4.263، لذا ΔpH≈−0.477.",
  },
  "CH3-265": {
    a: "pH قبل الإضافة≈3.447، وpH بعدها≈3.616، وΔpH≈+0.169.",
  },
  "CH3-287": {
    q: "لتر من منظم NH₃ تركيزه 0.01M وNH₄Cl تركيزه 0.02M؛ أضيف إليه 1mL من KOH تركيزه 10M. احسب ΔpH إذا كان Kb=1.8×10⁻⁵.",
  },
  "CH3-303": { pages: "صفحة PDF 164" },
  "CH3-304": { pages: "صفحة PDF 164" },
  "CH3-305": { pages: "صفحة PDF 164" },
  "CH3-306": { pages: "صفحة PDF 164" },
  "CH3-307": { pages: "صفحة PDF 164" },
  "CH3-308": { pages: "صفحة PDF 164" },
  "CH3-309": { pages: "صفحة PDF 164" },
  "CH3-310": { pages: "صفحة PDF 164" },
  "CH3-311": { pages: "صفحة PDF 164" },
  "CH3-312": { pages: "صفحة PDF 164" },
  "CH3-313": { pages: "صفحة PDF 164" },
  "CH3-314": { pages: "صفحة PDF 164" },
  "CH3-319": {
    a: "S≈1.1×10⁻⁵M، وKsp≈1.21×10⁻¹⁰.",
  },
  "CH3-321": {
    a: "S≈0.73×10⁻³M، والكتلة≈53.4mg؛ الاختيار الصحيح هو (ج).",
    pages: "صفحة PDF 159, 160",
  },
  "CH3-337": {
    a: "باستعمال Ksp≈1.2×10⁻⁵: في الماء S≈0.0144M والذوبانية≈4.52g/L؛ وفي 0.15M K₂SO₄ تكون S≈0.00447M والذوبانية≈1.40g/L.",
  },
  "CH3-357": {
    q: "أوجد S لـBaCrO₄ في محلول BaCl₂ تركيزه 0.1M إذا كان Ksp=1.2×10⁻³⁵.",
    a: "S≈1.2×10⁻³⁴M.",
  },
  "CH3-374": {
    a: "تزداد ذوبانية Zn(OH)₂ برفع درجة الحرارة أو بخفض pH بإضافة حامض، بينما تقل الذوبانية عند إضافة أيون مشترك.",
  },
  "CH3-378": {
    a: "عند pH=8 تكون S=18M، وعند pH=10 تكون S=1.8×10⁻³M.",
  },
  "CH3-399": {
    q: "خُلط 10mL من SO₄²⁻ تركيزه 0.01M مع 10mL من Ba²⁺ تركيزه 0.001M؛ إذا كان Ksp=1.6×10⁻⁶ فهل يحدث ترسيب؟",
  },
  "CH3-402": {
    q: "خُلط 20mL من SO₄²⁻ تركيزه 0.02M مع 20mL من Ba²⁺ تركيزه 0.002M؛ إذا كان Ksp=1.6×10⁻⁶ فهل يترسب BaSO₄؟",
  },
};

const excludedSourceIds = new Set(["CH3-413"]);

export const ahmedNadawiChemCh3Cards: AhmedNadawiChemCh3Card[] = rawAhmedNadawiChemCh3Cards
  .map((card) => ({
    ...card,
    ...sourceWordingById[card.id],
    sourceNotes: undefined,
  }))
  .filter((card) => !excludedSourceIds.has(card.id))
  .map((card) => {
    const override = card.kind === "وزاري نظري" ? chemAhmedCh3VerbalOverridesAr[card.id] : undefined;
    return override ? { ...card, q: override.q ?? card.q, a: override.a } : card;
  });

export const ahmedNadawiChemCh3Topics = [
  {
    "key": "01",
    "title": "المحاليل المائية والإلكتروليتات",
    "expectedCount": 27
  },
  {
    "key": "02",
    "title": "برونستد-لوري والتأين الذاتي للماء",
    "expectedCount": 13
  },
  {
    "key": "03",
    "title": "حساب pH وpOH للمحاليل القوية",
    "expectedCount": 29
  },
  {
    "key": "04",
    "title": "التخفيف والتغير في pH",
    "expectedCount": 13
  },
  {
    "key": "05",
    "title": "الحوامض الضعيفة ودرجة التأين",
    "expectedCount": 28
  },
  {
    "key": "06",
    "title": "الحوامض متعددة البروتون",
    "expectedCount": 6
  },
  {
    "key": "07",
    "title": "القواعد الضعيفة ودرجة التأين",
    "expectedCount": 20
  },
  {
    "key": "08",
    "title": "الأملاح والتحلل المائي",
    "expectedCount": 9
  },
  {
    "key": "09",
    "title": "الأملاح المتعادلة",
    "expectedCount": 9
  },
  {
    "key": "10",
    "title": "الأملاح القاعدية",
    "expectedCount": 14
  },
  {
    "key": "11",
    "title": "الأملاح الحامضية",
    "expectedCount": 17
  },
  {
    "key": "12",
    "title": "أملاح الحوامض والقواعد الضعيفة",
    "expectedCount": 5
  },
  {
    "key": "13",
    "title": "الأيون المشترك للحامض الضعيف",
    "expectedCount": 26
  },
  {
    "key": "14",
    "title": "الأيون المشترك للقاعدة الضعيفة",
    "expectedCount": 21
  },
  {
    "key": "15",
    "title": "المحاليل المنظمة وآلية عملها",
    "expectedCount": 14
  },
  {
    "key": "16",
    "title": "المنظم الحامضي وإضافة حامض قوي",
    "expectedCount": 12
  },
  {
    "key": "17",
    "title": "المنظم الحامضي وإضافة قاعدة قوية",
    "expectedCount": 12
  },
  {
    "key": "18",
    "title": "المنظم القاعدي وإضافة حامض قوي",
    "expectedCount": 5
  },
  {
    "key": "19",
    "title": "المنظم القاعدي وإضافة قاعدة قوية",
    "expectedCount": 10
  },
  {
    "key": "20",
    "title": "الذوبانية وحاصل ضرب الذوبانية في الماء",
    "expectedCount": 33
  },
  {
    "key": "21",
    "title": "تأثير الأيون المشترك في الذوبانية",
    "expectedCount": 44
  },
  {
    "key": "22",
    "title": "تأثير pH والحرارة في الذوبانية",
    "expectedCount": 17
  },
  {
    "key": "23",
    "title": "حاصل الأيونات وتوقع الترسيب",
    "expectedCount": 22
  },
  {
    "key": "24",
    "title": "بداية الترسيب والترسيب الانتقائي",
    "expectedCount": 7
  }
] as const;
