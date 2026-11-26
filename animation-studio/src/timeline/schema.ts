import { z } from "zod";

const frameNumberSchema = z.number().int().nonnegative();
const vector = z.tuple([
  z.number().finite(),
  z.number().finite(),
  z.number().finite(),
]);
const expression = <T extends z.ZodType>(values: T) =>
  z.object({
    frame: frameNumberSchema,
    value: values,
    // eslint-disable-next-line @remotion/non-pure-animation -- Zod field declaration, not a CSS transition.
    transition: frameNumberSchema.optional(),
  });
const student = z.enum([
  "confused",
  "frustrated",
  "curious",
  "excited",
  "happy",
]);
const robot = z.enum(["happy", "thinking", "surprised", "talking", "blinking"]);
export const shotSchema = z.object({
  from: frameNumberSchema,
  to: frameNumberSchema,
  position: vector,
  endPosition: vector,
  target: vector,
  endTarget: vector.optional(),
  fov: z.number().min(15).max(80),
  endFov: z.number().min(15).max(80).optional(),
});
export const sceneSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  kind: z.enum([
    "opening",
    "wake",
    "dialogue",
    "learning",
    "confidence",
    "brand",
  ]),
  duration: z.number().int().positive(),
  kicker: z.string(),
  title: z.string(),
  copy: z.string(),
  shots: z.array(shotSchema).min(1),
  studentExpressions: z.array(expression(student)).min(1),
  robotExpressions: z.array(expression(robot)).min(1),
  dialogue: z.array(
    z.object({
      from: frameNumberSchema,
      to: frameNumberSchema,
      speaker: z.enum(["student", "robot"]),
      text: z.string(),
      audio: z.string().optional(),
    }),
  ),
});
export const reelSchema = z.object({
  version: z.literal(1),
  name: z.string(),
  brand: z.string(),
  tagline: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.number().int().min(1).max(60),
  soundtrack: z.string().optional(),
  learning: z.object({
    flashcard: z.object({ question: z.string(), answer: z.string() }),
    quiz: z.object({
      question: z.string(),
      options: z.array(z.string()).min(2).max(4),
      correctIndex: z.number().int().nonnegative(),
    }),
    diagramTitle: z.string(),
  }),
  scenes: z.array(sceneSchema).min(1),
});
export type ReelDefinition = z.infer<typeof reelSchema>;
export type SceneDefinition = z.infer<typeof sceneSchema>;

export const parseReel = (input: unknown): ReelDefinition => {
  const reel = reelSchema.parse(input);
  const seen = new Set<string>();
  if (reel.learning.quiz.correctIndex >= reel.learning.quiz.options.length)
    throw new Error("Quiz correctIndex must refer to an option.");
  for (const scene of reel.scenes) {
    if (seen.has(scene.id)) throw new Error(`Duplicate scene id: ${scene.id}`);
    seen.add(scene.id);
    for (const cues of [scene.studentExpressions, scene.robotExpressions]) {
      if (cues[0].frame !== 0)
        throw new Error(`${scene.id}: expressions must start at frame 0.`);
      cues.forEach((c, i) => {
        if (c.frame >= scene.duration || (i && c.frame <= cues[i - 1].frame))
          throw new Error(
            `${scene.id}: expression cues must be ordered and inside the scene.`,
          );
      });
    }
    let end = 0;
    for (const shot of scene.shots) {
      if (shot.from !== end || shot.to <= shot.from || shot.to > scene.duration)
        throw new Error(
          `${scene.id}: camera shots must cover the scene without gaps or overlaps.`,
        );
      end = shot.to;
    }
    if (end !== scene.duration)
      throw new Error(`${scene.id}: camera coverage must end at duration.`);
    for (const cue of scene.dialogue)
      if (cue.to <= cue.from || cue.to > scene.duration)
        throw new Error(`${scene.id}: dialogue cue exceeds the scene.`);
  }
  return reel;
};
export const durationOf = (reel: ReelDefinition) =>
  reel.scenes.reduce((sum, s) => sum + s.duration, 0);
export const sceneAt = (reel: ReelDefinition, frame: number) => {
  let start = 0;
  for (let index = 0; index < reel.scenes.length; index++) {
    const scene = reel.scenes[index];
    if (frame < start + scene.duration || index === reel.scenes.length - 1)
      return {
        scene,
        index,
        start,
        frame: Math.max(0, Math.min(scene.duration - 1, frame - start)),
      };
    start += scene.duration;
  }
  throw new Error("Reel has no scenes");
};
