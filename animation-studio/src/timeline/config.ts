import { staticFile, type CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import defaultData from "../../public/reels/tamayzak.json";
import {
  durationOf,
  parseReel,
  reelSchema,
  type ReelDefinition,
} from "./schema";

export const defaultReel = parseReel(defaultData);
export const studioSchema = z.object({
  configFile: z
    .string()
    .regex(/^reels\/[a-zA-Z0-9_-]+\.json$/)
    .describe("JSON file inside public/reels"),
  captions: z.boolean(),
  soundtrack: z.boolean(),
  reel: reelSchema.optional(),
});
export type StudioProps = z.infer<typeof studioSchema>;
export const loadMetadata =
  (sceneId?: string): CalculateMetadataFunction<StudioProps> =>
  async ({ props, abortSignal }) => {
    const response = await fetch(staticFile(props.configFile), {
      signal: abortSignal,
    });
    if (!response.ok)
      throw new Error(
        `Could not load ${props.configFile}: HTTP ${response.status}`,
      );
    const reel: ReelDefinition = parseReel(await response.json());
    const scene = sceneId
      ? reel.scenes.find((s) => s.id === sceneId)
      : undefined;
    if (sceneId && !scene)
      throw new Error(
        `The selected configuration does not contain scene '${sceneId}'. Use the full reel composition for a custom scene list.`,
      );
    return {
      durationInFrames: scene?.duration ?? durationOf(reel),
      fps: reel.fps,
      width: reel.width,
      height: reel.height,
      props: { ...props, reel },
      defaultOutName: sceneId ? `tamayzak-${sceneId}` : "tamayzak-reel",
    };
  };
