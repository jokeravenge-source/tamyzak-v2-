// Pure, seekable animation functions. All time is supplied by the caller.
export type V3 = [number, number, number];
export const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
export const mix = (a: number, b: number, t: number) =>
  t <= 0 ? a : t >= 1 ? b : a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const ease = (frame: number, from: number, to: number) =>
  smooth((frame - from) / Math.max(1, to - from));
export const mixV3 = (a: V3, b: V3, t: number): V3 =>
  a.map((v, i) => mix(v, b[i], t)) as V3;
export const pulse = (frame: number, start: number, end: number, edge = 8) =>
  ease(frame, start, start + edge) * (1 - ease(frame, end - edge, end));
export const blink = (frame: number, offset = 0) => {
  const phase = (((frame + offset) % 127) + 127) % 127;
  const close = Math.max(0, 1 - Math.abs(phase - 94) / 3.5);
  return 1 - close * 0.96;
};
export type SpeechCue = {
  from: number;
  to: number;
  text: string;
  speaker: "student" | "robot";
  audio?: string;
};
export const mouthMovement = (
  frame: number,
  cues: SpeechCue[],
  speaker: SpeechCue["speaker"],
) => {
  const cue = cues.find(
    (c) => c.speaker === speaker && frame >= c.from && frame < c.to,
  );
  if (!cue) return 0;
  const t = frame - cue.from;
  const envelope = pulse(frame, cue.from, cue.to, 4);
  return (
    envelope *
    (0.24 +
      0.5 * Math.abs(Math.sin(t * 0.51)) +
      0.26 * Math.abs(Math.sin(t * 0.89)))
  );
};
export const idle = (frame: number, seed = 0) => ({
  breathe: Math.sin(frame / 27 + seed) * 0.012,
  sway: Math.sin(frame / 56 + seed) * 0.017,
  float: Math.sin(frame / 19 + seed) * 0.035,
});
export const headTurn = (
  frame: number,
  start: number,
  end: number,
  from: V3,
  to: V3,
) => mixV3(from, to, ease(frame, start, end));
export const armGesture = (
  frame: number,
  start: number,
  end: number,
  strength = 1,
) => pulse(frame, start, end, 12) * strength;
export const entrance = (frame: number, start: number, duration = 24) =>
  ease(frame, start, start + duration);
export const exit = (frame: number, start: number, duration = 24) =>
  1 - ease(frame, start, start + duration);
export const seeded = (index: number) => {
  const n = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};
