import { boardRecord, boardText } from "./whiteboard.ts";

export const PAPER_REVIEW_PATH = "/paper-review";
export const PAPER_REVIEW_IMAGE_BYTES = 1_800_000;
export const PAPER_REVIEW_BODY_BYTES = 2_405_000;

export type PaperLocation = [top: number, left: number, bottom: number, right: number];
export type PaperFinding = {
  excerpt: string;
  explanation: string;
  kind: "teacher-mark" | "suggestion";
  location: PaperLocation | null;
};
export type PaperPractice = {
  question: string;
  choices: [string, string, string];
  correctIndex: number;
  explanation: string;
};
export type PaperReport = {
  status: "reviewed" | "unclear";
  summary: string;
  skill: string | null;
  findings: PaperFinding[];
  practice: PaperPractice | null;
};
export type PaperReviewView = Omit<PaperReport, "practice"> & {
  practice: Pick<PaperPractice, "question" | "choices"> | null;
};
export type PaperReviewAccess = {
  premium: boolean;
  remaining: 0 | 1 | null;
  pending: boolean;
  resetAt: string;
  completedPractices: number;
};

type Language = "ar" | "en";
type Bilingual = Record<Language, string>;
type Exercise = { id: string; title: Bilingual; question: Bilingual; guide: Bilingual; practice: Record<Language, PaperPractice> };

export const PAPER_EXERCISES: readonly Exercise[] = [
  {
    id: "distance",
    title: { ar: "المسافة بين اللوحين", en: "Plate separation" },
    question: {
      ar: "سعة متسعة ذات لوحين متوازيين تساوي 12 µF. إذا تضاعفت المسافة بين اللوحين مع ثبات المساحة والعازل، فما السعة الجديدة؟",
      en: "A parallel-plate capacitor has a capacitance of 12 µF. What is its new capacitance when the plate separation doubles and area and dielectric stay fixed?",
    },
    guide: {
      ar: "سلم تدريب · درجتان: درجة لاستخدام العلاقة العكسية C ∝ 1/d مع ثبات المساحة والعازل، ودرجة للناتج 6 µF مع الوحدة.",
      en: "Practice key · 2 marks: 1 for the inverse relation C ∝ 1/d at fixed area and dielectric, and 1 for 6 µF with the unit.",
    },
    practice: {
      ar: { question: "سعة المتسعة 24 µF. إذا صارت المسافة ثلاثة أمثالها وبقيت المساحة والعازل ثابتين، شكد السعة الجديدة؟", choices: ["72 µF", "8 µF", "12 µF"], correctIndex: 1, explanation: "المسافة صارت 3d، فالسعة صارت ثلث قيمتها: 24 ÷ 3 = 8 µF." },
      en: { question: "Capacitance is 24 µF. The separation triples at fixed area and dielectric. What is the new capacitance?", choices: ["72 µF", "8 µF", "12 µF"], correctIndex: 1, explanation: "With 3d in the denominator, capacitance becomes one-third: 24 ÷ 3 = 8 µF." },
    },
  },
  {
    id: "area",
    title: { ar: "المساحة المتقابلة", en: "Overlapping plate area" },
    question: {
      ar: "متسعة سعتها 8 µF. أصبحت المساحة المتقابلة للوحين مرة ونصف مساحتها الأصلية، مع ثبات المسافة والعازل. احسب السعة الجديدة.",
      en: "A capacitor has capacitance 8 µF. Its overlapping plate area increases to 1.5 times the original at fixed separation and dielectric. Find the new capacitance.",
    },
    guide: {
      ar: "سلم تدريب · درجتان: درجة للعلاقة الطردية C ∝ A، ودرجة للتعويض الصحيح 8 × 1.5 = 12 µF.",
      en: "Practice key · 2 marks: 1 for the direct relation C ∝ A and 1 for 8 × 1.5 = 12 µF.",
    },
    practice: {
      ar: { question: "إذا كانت السعة 6 µF وتضاعفت المساحة المتقابلة للوحين وبقي كلشي ثاني ثابت، شكد تصير؟", choices: ["3 µF", "6 µF", "12 µF"], correctIndex: 2, explanation: "المساحة بالبسط. إذا تضاعفت المساحة وحدها، تتضاعف السعة: 6 × 2 = 12 µF." },
      en: { question: "What happens to a 6 µF capacitance if the overlapping area doubles with the other variables fixed?", choices: ["3 µF", "6 µF", "12 µF"], correctIndex: 2, explanation: "Area is in the numerator, so doubling it doubles the capacitance to 12 µF." },
    },
  },
  {
    id: "dielectric",
    title: { ar: "إدخال العازل", en: "Inserting a dielectric" },
    question: {
      ar: "متسعة هوائية سعتها 4 µF. ملأ عازل ثابت عزله النسبي 3 الفراغ بين لوحيها تماماً. احسب سعتها بعد إدخال العازل.",
      en: "An air capacitor has capacitance 4 µF. A dielectric of relative permittivity 3 completely fills the gap. Find the new capacitance.",
    },
    guide: {
      ar: "سلم تدريب · درجتان: درجة لكتابة C₂ = κC₁ عند امتلاء الفراغ بالعازل، ودرجة للناتج 12 µF.",
      en: "Practice key · 2 marks: 1 for C₂ = κC₁ when the dielectric fills the gap, and 1 for 12 µF.",
    },
    practice: {
      ar: { question: "متسعة هوائية 5 µF. عازل ثابت عزله 4 ملأ كل الفراغ بين اللوحين. شكد تصير السعة؟", choices: ["20 µF", "1.25 µF", "9 µF"], correctIndex: 0, explanation: "نضرب السعة الهوائية بثابت العزل لأن العازل ملأ الفراغ كله: 5 × 4 = 20 µF." },
      en: { question: "The air capacitance is 5 µF and a dielectric with κ = 4 fills the gap. What is the new capacitance?", choices: ["20 µF", "1.25 µF", "9 µF"], correctIndex: 0, explanation: "The dielectric fills the gap, so multiply the air capacitance by κ: 5 × 4 = 20 µF." },
    },
  },
  {
    id: "units",
    title: { ar: "تحويل وحدات السعة", en: "Capacitance units" },
    question: { ar: "حوّل سعة مقدارها 5 µF إلى الفاراد.", en: "Convert a capacitance of 5 µF to farads." },
    guide: {
      ar: "سلم تدريب · درجتان: درجة لإدراك أن المايكرو يساوي 10⁻⁶، ودرجة لكتابة 5 × 10⁻⁶ F.",
      en: "Practice key · 2 marks: 1 for the micro prefix 10⁻⁶ and 1 for 5 × 10⁻⁶ F.",
    },
    practice: {
      ar: { question: "حوّل 8 µF إلى الفاراد.", choices: ["8 × 10⁻³ F", "8 × 10⁻⁶ F", "8 × 10⁶ F"], correctIndex: 1, explanation: "الرمز µ يعني جزءاً من مليون، فـ 8 µF تساوي 8 × 10⁻⁶ F." },
      en: { question: "Convert 8 µF to farads.", choices: ["8 × 10⁻³ F", "8 × 10⁻⁶ F", "8 × 10⁶ F"], correctIndex: 1, explanation: "The prefix micro means one millionth, so 8 µF equals 8 × 10⁻⁶ F." },
    },
  },
  {
    id: "formula",
    title: { ar: "التعويض بقانون السعة", en: "Using the capacitance formula" },
    question: {
      ar: "سماحية العازل ε = 4 × 10⁻¹¹ F/m، ومساحة اللوح A = 0.02 m² والمسافة d = 0.004 m. احسب سعة المتسعة ذات اللوحين.",
      en: "A parallel-plate capacitor has ε = 4 × 10⁻¹¹ F/m, A = 0.02 m², and d = 0.004 m. Find its capacitance.",
    },
    guide: {
      ar: "سلم تدريب · درجتان: درجة للتعويض في C = εA/d، ودرجة للناتج بوحدته 2 × 10⁻¹⁰ F.",
      en: "Practice key · 2 marks: 1 for substitution into C = εA/d and 1 for 2 × 10⁻¹⁰ F with the unit.",
    },
    practice: {
      ar: { question: "إذا كانت ε = 5 × 10⁻¹¹ F/m، وكانت A = 0.03 m² وd = 0.005 m، شكد C؟", choices: ["3 × 10⁻⁹ F", "3 × 10⁻¹² F", "3 × 10⁻¹⁰ F"], correctIndex: 2, explanation: "نقسم A على d فنحصل على 6، ثم نضرب بسماحية العازل: 6 × 5 × 10⁻¹¹ = 3 × 10⁻¹⁰ F." },
      en: { question: "Find C when ε = 5 × 10⁻¹¹ F/m, A = 0.03 m², and d = 0.005 m.", choices: ["3 × 10⁻⁹ F", "3 × 10⁻¹² F", "3 × 10⁻¹⁰ F"], correctIndex: 2, explanation: "A/d = 6. Multiply by the permittivity: 6 × 5 × 10⁻¹¹ = 3 × 10⁻¹⁰ F." },
    },
  },
];

export const paperExercise = (value: unknown) => PAPER_EXERCISES.find(({ id }) => id === value);

export function paperReviewImage(value: unknown) {
  const prefix = "data:image/jpeg;base64,";
  if (typeof value !== "string" || !value.startsWith(prefix)) return null;
  const encoded = value.slice(prefix.length);
  if (encoded.length > Math.ceil(PAPER_REVIEW_IMAGE_BYTES / 3) * 4
      || encoded.length < 16 || encoded.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return null;
  const header = atob(encoded.slice(0, 16));
  const size = encoded.length / 4 * 3 - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
  return size <= PAPER_REVIEW_IMAGE_BYTES && header.startsWith("\xff\xd8\xff") ? value : null;
}

function readLocation(value: unknown): PaperLocation | null {
  if (!Array.isArray(value) || value.length !== 4 || !value.every(n => Number.isInteger(n) && n >= 0 && n <= 1000)) return null;
  const [top, left, bottom, right] = value;
  return bottom > top && right > left ? [top, left, bottom, right] : null;
}

function readPractice(value: unknown): PaperPractice | null {
  const row = boardRecord(value);
  const question = boardText(row?.question, 380);
  const explanation = boardText(row?.explanation, 440);
  const choices = Array.isArray(row?.choices) ? row.choices.map(choice => boardText(choice, 120)) : [];
  const index = row?.correctIndex;
  if (!question || !explanation || choices.length !== 3 || choices.some(choice => !choice) || new Set(choices).size !== 3
    || typeof index !== "number" || !Number.isInteger(index) || index < 0 || index > 2) return null;
  return { question, choices: choices as PaperPractice["choices"], correctIndex: index, explanation };
}

export function parsePaperReport(value: unknown, options?: { exercise?: Exercise; language: Language }): PaperReport | null {
  const row = boardRecord(value);
  const summary = boardText(row?.summary, 360);
  if (!row || !summary || (row.status !== "reviewed" && row.status !== "unclear")) return null;
  if (row.status === "unclear") {
    return { status: row.status, summary, skill: null, findings: [], practice: null };
  }

  if (!Array.isArray(row.findings) || row.findings.length > 4) return null;
  const findings: PaperFinding[] = [];
  for (const value of row.findings) {
    const finding = boardRecord(value);
    const excerpt = boardText(finding?.excerpt, 110);
    const explanation = boardText(finding?.explanation, 450);
    if (!finding || !excerpt || !explanation || (finding.kind !== "teacher-mark" && finding.kind !== "suggestion")) return null;
    findings.push({ excerpt, explanation, kind: finding.kind, location: readLocation(finding.location) });
  }
  const matched = row.matchedExercise === true ? options?.exercise : undefined;
  return {
    status: row.status, summary, findings,
    skill: matched ? matched.title[options!.language] : boardText(row.skill, 100),
    practice: matched ? matched.practice[options!.language] : readPractice(row.practice),
  };
}

export const paperReviewView = ({ practice, ...report }: PaperReport): PaperReviewView => ({
  ...report,
  practice: practice ? { question: practice.question, choices: practice.choices } : null,
});
