import { parseBoardLesson, type BoardLesson, type BoardSource, type BoardStep } from "./whiteboard.ts";

export const PARALLEL_PLATES_TITLE = "سعة المتسعة ذات اللوحين";
const excerpt = "حيث أن C = ε·A/d ⇒ C ∝ 1/d، فإن زيادة المسافة تقلل السعة الكلية (بثبوت المساحة المتقابلة ونوع العازل).";
export const CAPACITOR_SOURCE: BoardSource = {
  id: "tamayzak:physics:ch1:parallel-plates",
  kind: "lesson",
  title: "بنك وزاريات تميّزك · فيزياء السادس العلمي",
  chapter: "الفصل الأول · المتسعات",
  // Supporting excerpt from the app's Arabic chapter-one bank (ministerialPhysicsCh1Ar).
  excerpt,
};
const reference = { sourceId: CAPACITOR_SOURCE.id, quote: excerpt };

const steps: BoardStep[] = [
  {
    title: "اللوحين والعازل",
    narration: "شوف هذني اللوحين المتوازيين. الحرف أي يمثّل مساحة الوجه المقابل من كل لوح. واللون الأزرق بيناتهم يمثّل الوسط العازل، وسماحيته نرمزلها بإبسيلون.",
    reference,
    actions: [
      { kind: "reveal", target: "plates", at: 0.03 },
      { kind: "reveal", target: "area", at: 0.32 },
      { kind: "reveal", target: "dielectric", at: 0.65 },
      { kind: "highlight", target: "dielectric", at: 0.75 },
    ],
  },
  {
    title: "المسافة وقانون السعة",
    narration: "المسافة بين اللوحين نسميها دي. هسه نكتب القانون: السعة تساوي إبسيلون مضروبة بالمساحة أي، مقسومة على دي. لاحظ دي بالمقام. من تكبر وحدها، السعة تصغر.",
    reference,
    actions: [
      { kind: "arrow", target: "distance", at: 0.08 },
      { kind: "highlight", target: "distance", at: 0.13 },
      { kind: "equation", text: "C = εA/d", at: 0.39 },
      { kind: "highlight", target: "equation", at: 0.62 },
    ],
  },
  {
    title: "جرّب نضاعف المسافة",
    narration: "خلّي مساحة اللوحين نفسها ونفس العازل. هسه نباعد اللوحين حتى تصير المسافة اثنين دي. طالع شنو تغيّر بالمقام، وفكّر: شكد تصير السعة الجديدة مقارنة بالأولى؟",
    reference,
    actions: [
      { kind: "highlight", target: "area", at: 0.08 },
      { kind: "double-gap", at: 0.36 },
      { kind: "highlight", target: "distance", at: 0.40 },
    ],
  },
];

export function capacitorLesson(): BoardLesson {
  const lesson = parseBoardLesson({ title: PARALLEL_PLATES_TITLE, steps }, [CAPACITOR_SOURCE], "parallel-plates");
  if (!lesson) throw new Error("Invalid parallel-plate lesson");
  return lesson;
}

export function isParallelPlateQuestion(value: string) {
  const question = value.normalize("NFC").replace(/\p{M}/gu, "").replace(/[أإآ]/gu, "ا");
  const capacitor = /capacitor|\bcapacitance\b|متسع|مكثف/iu.test(question);
  const parallelPlates = /parallel[\s‑–-]*plates?|لوح[ايي]?.{0,15}متوازي|لوحين|صفيحتين|صفيحت[ايي]/iu.test(question);
  const distance = /\bdistance\b|المسافة|البعد بين/iu.test(question);
  // Do not switch a question about stored charge, insertion, or combinations to the geometry lesson.
  return capacitor && (parallelPlates || distance)
    && !/(?:series|in parallel|disconnect|insert|voltage|شحنة|تفريغ|توالي|ربط|ادخال|فرق الجهد)/iu.test(question);
}
