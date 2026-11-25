import type { BoardFocus } from "../../../supabase/functions/_shared/whiteboard";

export type DrawingSelection = {
  target: BoardFocus;
  stepIndex: number;
  label: string;
  question: string;
};

type IllustratedPart = Exclude<BoardFocus, "idea" | "reason" | "result" | "equation">;

const parts = {
  plates: ["لوحا المتسعة", "Capacitor plates", "ليش أحد لوحي المتسعة موجب والثاني سالب؟", "Why do the two capacitor plates have opposite charges?"],
  area: ["مساحة اللوحين", "Plate area", "شلون مساحة اللوحين تأثر على السعة؟", "How does plate area affect capacitance?"],
  distance: ["المسافة بين اللوحين", "Distance between the plates", "شلون المسافة بين اللوحين تأثر على السعة؟", "How does the distance between the plates affect capacitance?"],
  dielectric: ["العازل", "Dielectric", "شنو يصير للعازل من ندخله بين اللوحين؟", "What happens to the dielectric when it enters the gap?"],
  field: ["المجال الأصلي", "Original field", "شنو يبيّن السهم E اللي يشير من الموجب للسالب؟", "What does the arrow E from the positive plate to the negative plate show?"],
  polarization: ["مجال الاستقطاب", "Opposing polarization field", "ليش مجال الاستقطاب يعاكس المجال الأصلي؟", "Why does the polarization field point opposite the original field?"],
  "net-field": ["المجال المحصّل", "Net field", "ليش المجال المحصّل يقل بعد دخول العازل؟", "Why does the net field decrease when the dielectric is added?"],
} satisfies Record<IllustratedPart, string[]>;

export function drawingPart(target: IllustratedPart, stepIndex: number, ar: boolean): DrawingSelection {
  const [arLabel, enLabel, arQuestion, enQuestion] = parts[target];
  return { target, stepIndex, label: ar ? arLabel : enLabel, question: ar ? arQuestion : enQuestion };
}

export function drawingText(target: "equation" | "idea" | "reason" | "result", stepIndex: number, label: string, ar: boolean): DrawingSelection {
  const subject = label.length > 160 ? label.slice(0, 157) + "…" : label;
  const question = target === "equation"
    ? (ar ? `شلون نفهم المعادلة ${subject}؟` : `How should I interpret the equation ${subject}?`)
    : (ar ? `شنو المقصود بـ «${subject}»؟` : `What does “${subject}” mean in this step?`);
  return { target, stepIndex, label, question };
}

export const askPartLabel = (label: string, ar: boolean) => ar ? `اسأل عن ${label}` : `Ask about ${label}`;
