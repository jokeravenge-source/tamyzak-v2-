import { mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";

const mode = process.argv[2] ?? "reel";
if (!["reel", "opening", "preview", "storyboard"].includes(mode))
  throw new Error("Use reel, opening, preview, or storyboard.");
const configFile = process.env.REEL_CONFIG ?? "reels/tamayzak.json";
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  outDir: path.resolve(".render-bundle"),
  onProgress: () => {},
});
const chromiumOptions = { gl: process.env.REMOTION_GL ?? "swangle" };
const browser = await openBrowser("chrome", { chromiumOptions });
const inputProps = { configFile, captions: true, soundtrack: true };
mkdirSync("out/qa", { recursive: true });
try {
  const composition = await selectComposition({
    serveUrl,
    id: mode === "opening" ? "Opening-5s" : "Tamayzak-Reel",
    inputProps,
    puppeteerInstance: browser,
    chromiumOptions,
  });
  if (mode === "storyboard") {
    const frames = process.env.STORYBOARD_FRAMES
      ? process.env.STORYBOARD_FRAMES.split(",").map(Number)
      : [65, 225, 335, 420, 535, 585, 650, 740, 865];
    for (const frame of frames) {
      if (frame >= composition.durationInFrames) continue;
      const output = `out/qa/frame-${String(frame).padStart(3, "0")}.png`;
      await renderStill({
        serveUrl,
        composition,
        inputProps,
        frame,
        output,
        puppeteerInstance: browser,
        chromiumOptions,
      });
      console.log(`Verified frame ${frame}: ${output}`);
    }
    if (frames.includes(65)) {
      await renderStill({
        serveUrl,
        composition,
        inputProps,
        frame: 65,
        output: "out/qa/repeated-065.png",
        puppeteerInstance: browser,
        chromiumOptions,
      });
      const hash = (file) =>
        createHash("sha256").update(readFileSync(file)).digest("hex");
      if (hash("out/qa/frame-065.png") !== hash("out/qa/repeated-065.png"))
        throw new Error(
          "Frame 65 changed after seeking. Check for non-deterministic animation.",
        );
      console.log(
        "Pixel determinism passed: frame 65 is identical after seeking through the storyboard.",
      );
    }
  } else {
    let lastProgress = -1;
    await renderMedia({
      serveUrl,
      composition,
      inputProps,
      codec: "h264",
      pixelFormat: "yuv420p",
      crf: 18,
      imageFormat: "jpeg",
      jpegQuality: 95,
      audioCodec: "aac",
      audioBitrate: "192k",
      outputLocation: `out/${mode === "opening" ? "opening-5s" : mode === "preview" ? "tamayzak-review-540p" : "tamayzak-reel"}.mp4`,
      scale: mode === "preview" ? 0.5 : 1,
      concurrency: Number(process.env.RENDER_CONCURRENCY ?? 2),
      puppeteerInstance: browser,
      chromiumOptions,
      onProgress: ({ progress, renderedFrames }) => {
        const step = Math.floor(progress * 20);
        if (step !== lastProgress) {
          console.log(
            `${Math.round(progress * 100)}% · ${renderedFrames}/${composition.durationInFrames} frames`,
          );
          lastProgress = step;
        }
      },
    });
    console.log("MP4 export complete.");
  }
} finally {
  await browser.close({ silent: true });
}
