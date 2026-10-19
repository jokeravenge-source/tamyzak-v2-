// Ahmed Al-Nadawi — Chemistry Chapter 1.
// The published Arabic deck is matched against the uploaded Arabic handout.
// Source numbering is retained so every card can be traced during admin review.
import { ahmedNadawiChemCh1ArTranslated } from "./flashcardsChemCh1AhmedNadawiArTranslated";
import { chemAhmedAr035_084 } from "./chemAhmedAr035_084";
import { chemAhmedAr085_134 } from "./chemAhmedAr085_134";
import { chemAhmedAr135_159 } from "./chemAhmedAr135_159";
import { chemAhmedAr160_184 } from "./chemAhmedAr160_184";
import { chemAhmedAr185_234 } from "./chemAhmedAr185_234";
import { chemAhmedAr235_284 } from "./chemAhmedAr235_284";
import { chemAhmedAr285_334 } from "./chemAhmedAr285_334";
import { chemAhmedAr335_384 } from "./chemAhmedAr335_384";
import { chemAhmedAr385_430 } from "./chemAhmedAr385_430";

const rawAhmedNadawiChemCh1CardsAr = [
  ...ahmedNadawiChemCh1ArTranslated,
  ...chemAhmedAr035_084,
  ...chemAhmedAr085_134,
  ...chemAhmedAr135_159,
  ...chemAhmedAr160_184,
  ...chemAhmedAr185_234,
  ...chemAhmedAr235_284,
  ...chemAhmedAr285_334,
  ...chemAhmedAr335_384,
  ...chemAhmedAr385_430,
];

/**
 * These source items contain contradictory quantities, malformed equations or
 * missing data in the uploaded handout. They are intentionally kept out of the
 * student deck instead of turning printing errors into study material.
 */
export const ahmedNadawiChemCh1ExcludedSourceIds = [
  "CH1-0405",
  "CH1-0407",
  "CH1-0413",
  "CH1-0416",
  "CH1-0417",
  "CH1-0426",
  "CH1-0427",
  "CH1-0428",
  "CH1-0429",
  "CH1-0430",
] as const;

const excludedSourceIds = new Set<string>(ahmedNadawiChemCh1ExcludedSourceIds);

const directStudentCopy: Record<number, { q?: string; a?: string }> = {
  423: {
    q: "إذا كانت ΔG° لذوبان AgCl تساوي 56.9624 kJ عند 298 K وفي محلول HCl ذي pH=2، فما ذوبانية AgCl؟",
    a: "10⁻⁸ mol/L.",
  },
  425: {
    q: "محلول أمونيا تركيزه 0.1 M وله pH=11 عند 25°C؛ أوجد الطاقة الحرة القياسية للتأين.",
    a: "نحو +28.48 kJ/mol.",
  },
};

const cleanQuestionSourceLabel = (question: string) =>
  question.replace(/^\[(?:بنك الأسئلة|مراجعة)[^\]]+\]\s*/u, "");

export const ahmedNadawiChemCh1CardsAr = rawAhmedNadawiChemCh1CardsAr
  .map((card, index) => {
    const sourceNumber = index + 1;
    const id = `CH1-${String(sourceNumber).padStart(4, "0")}`;
    const pageMatch = card.q.match(/ص(\d+)/u);
    const copy = directStudentCopy[sourceNumber];

    return {
      ...card,
      id,
      q: copy?.q ?? cleanQuestionSourceLabel(card.q),
      a: copy?.a ?? card.a,
      ...(pageMatch ? { pages: pageMatch[1] } : {}),
    };
  })
  .filter(({ id }) => !excludedSourceIds.has(id));

export const ahmedNadawiChemCh1SourceAudit = {
  sourceFile: "الفصل الاول.pdf",
  sourcePdfPages: 151,
  sourcePdfSha256: "5929393b70336f7aa25d8a82010c4557743e2b3b4ffba347d03ea2ed51bfe5ba",
  rawCardCount: 430,
  publishedArabicCardCount: 420,
  excludedAmbiguousCardCount: ahmedNadawiChemCh1ExcludedSourceIds.length,
} as const;

export const ahmedNadawiChemCh1TopicsAr: Record<string, string> = {
  "01": "الديناميكا الحرارية والأنظمة",
  "02": "الحرارة والسعة الحرارية والحرارة النوعية",
  "03": "الإنثالبي ودوال الحالة والخواص",
  "04": "المسعر والحسابات المتعلقة بالاحتراق",
  "05": "إنثالبيات التفاعل والتكوين والاحتراق القياسية",
  "06": "إنثالبي تغيرات الحالة الفيزيائية وقانون هس",
  "07": "التلقائية والإنتروبي",
  "08": "طاقة غيبس الحرة",
  "09": "إشارات معادلة غيبس وتأثير درجة الحرارة",
  "10": "إنتروبي تغيرات الطور والاتزان",
  "11": "الحرارة النوعية: مسائل محلولة ومراجعة",
  "12": "المسعر الحراري: مسائل حسابية للمراجعة",
  "13": "التكوين والاحتراق وقانون هس: أسئلة مراجعة",
  "14": "الإنتروبي وطاقة غيبس: حسابات المراجعة",
  "15": "إشارات غيبس ومسائل تغير الطور",
  "16": "أسئلة إضافية من بنك الأسئلة",
};
