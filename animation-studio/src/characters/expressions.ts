import { ease, mix } from "../animation/motion";

export type StudentExpression =
  | "confused"
  | "frustrated"
  | "curious"
  | "excited"
  | "happy";
export type RobotExpression =
  | "happy"
  | "thinking"
  | "surprised"
  | "talking"
  | "blinking";
export type Face = {
  brow: number;
  eye: number;
  smile: number;
  jaw: number;
  tilt: number;
};
export const studentFaces: Record<StudentExpression, Face> = {
  frustrated: { brow: -0.26, eye: 0.64, smile: -0.07, jaw: 0, tilt: 0.13 },
  confused: { brow: -0.16, eye: 0.82, smile: -0.04, jaw: 0.05, tilt: -0.12 },
  curious: { brow: 0.16, eye: 1.03, smile: 0.015, jaw: 0.07, tilt: -0.04 },
  excited: { brow: 0.24, eye: 1.16, smile: 0.095, jaw: 0.18, tilt: -0.05 },
  happy: { brow: 0.11, eye: 0.88, smile: 0.085, jaw: 0.06, tilt: 0.02 },
};
export const robotFaces: Record<RobotExpression, Face> = {
  happy: { brow: 0.12, eye: 0.85, smile: 0.07, jaw: 0.02, tilt: -0.06 },
  thinking: { brow: -0.18, eye: 0.66, smile: 0, jaw: 0, tilt: 0.1 },
  surprised: { brow: 0.25, eye: 1.3, smile: 0, jaw: 0.14, tilt: -0.12 },
  talking: { brow: 0.1, eye: 1, smile: 0.04, jaw: 0.07, tilt: -0.03 },
  blinking: { brow: 0.03, eye: 0.06, smile: 0.05, jaw: 0.01, tilt: 0 },
};
export type ExpressionCue<T extends string> = {
  frame: number;
  value: T;
  transition?: number;
};
export const expressionAt = <T extends string>(
  frame: number,
  cues: ExpressionCue<T>[],
  faces: Record<T, Face>,
): Face => {
  let previous = faces[cues[0].value];
  for (let i = 1; i < cues.length; i++) {
    const cue = cues[i];
    if (frame < cue.frame) break;
    const next = faces[cue.value];
    const t = ease(frame, cue.frame, cue.frame + (cue.transition ?? 18));
    previous = Object.fromEntries(
      Object.keys(previous).map((key) => [
        key,
        mix(previous[key as keyof Face], next[key as keyof Face], t),
      ]),
    ) as Face;
  }
  return previous;
};
