import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { durationOf, parseReel, sceneAt } from "../src/timeline/schema";

const json = JSON.parse(
  readFileSync(
    new URL("../public/reels/tamayzak.json", import.meta.url),
    "utf8",
  ),
);
const reel = parseReel(json);
test("reel is exactly 900 frames and has the six requested scene boundaries", () => {
  assert.equal(durationOf(reel), 900);
  assert.equal(reel.width, 1080);
  assert.equal(reel.height, 1920);
  assert.equal(reel.fps, 30);
  for (const [frame, id, localFrame] of [
    [0, "opening", 0],
    [149, "opening", 149],
    [150, "wake", 0],
    [300, "dialogue", 0],
    [480, "learning", 0],
    [690, "confidence", 0],
    [810, "brand", 0],
    [899, "brand", 89],
  ] as const) {
    const state = sceneAt(reel, frame);
    assert.equal(state.scene.id, id);
    assert.equal(state.frame, localFrame);
  }
});
test("invalid camera coverage, expression cues and quiz answers fail clearly", () => {
  const camera = structuredClone(json);
  camera.scenes[0].shots[0].to = 149;
  assert.throws(() => parseReel(camera), /coverage/);
  const expression = structuredClone(json);
  expression.scenes[0].studentExpressions[0].frame = 5;
  assert.throws(() => parseReel(expression), /frame 0/);
  const quiz = structuredClone(json);
  quiz.learning.quiz.correctIndex = 100;
  assert.throws(() => parseReel(quiz), /correctIndex/);
  const duplicate = structuredClone(json);
  duplicate.scenes[1].id = "opening";
  assert.throws(() => parseReel(duplicate), /Duplicate/);
});
test("all authored animation source is free from wall-clock animation loops", async () => {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(new URL("../src/", import.meta.url), {
    recursive: true,
  });
  for (const name of entries.filter((n) => /\.(ts|tsx)$/.test(n))) {
    const text = readFileSync(
      new URL(`../src/${name}`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      text,
      /\b(?:useFrame|setInterval|requestAnimationFrame|Date\.now|Math\.random)\s*\(/,
      name,
    );
  }
});
