import assert from "node:assert/strict";
import { test } from "node:test";
import {
  blink,
  entrance,
  exit,
  headTurn,
  mouthMovement,
} from "../src/animation/motion";
import { expressionAt, studentFaces } from "../src/characters/expressions";
import { cameraPose } from "../src/camera/CameraController";

test("scrubbing in arbitrary order produces identical animation values", () => {
  const cues = [
    { from: 20, to: 65, speaker: "student" as const, text: "A test line" },
  ];
  const sample = (frame: number) => ({
    blink: blink(frame),
    speech: mouthMovement(frame, cues, "student"),
    head: headTurn(frame, 10, 40, [0, 0, 0], [0, 1, 0]),
  });
  const expected = Array.from({ length: 150 }, (_, i) => sample(i));
  for (const frame of [149, 0, 94, 40, 12, 65, 23, 94, 0])
    assert.deepEqual(sample(frame), expected[frame]);
});
test("blinks close and recover; dialogue stays silent outside its cue", () => {
  assert.equal(blink(90), 1);
  assert.ok(blink(94) < 0.05);
  assert.equal(blink(98), 1);
  const cues = [{ from: 20, to: 65, speaker: "robot" as const, text: "Hello" }];
  assert.equal(mouthMovement(19, cues, "robot"), 0);
  assert.ok(mouthMovement(30, cues, "robot") > 0);
  assert.equal(mouthMovement(30, cues, "student"), 0);
  assert.equal(mouthMovement(65, cues, "robot"), 0);
});
test("expression transitions are continuous and reach their target", () => {
  const cues = [
    { frame: 0, value: "frustrated" as const },
    { frame: 50, value: "happy" as const, transition: 20 },
  ];
  assert.deepEqual(
    expressionAt(49, cues, studentFaces),
    studentFaces.frustrated,
  );
  assert.deepEqual(
    expressionAt(50, cues, studentFaces),
    studentFaces.frustrated,
  );
  assert.deepEqual(expressionAt(70, cues, studentFaces), studentFaces.happy);
  assert.ok(
    expressionAt(60, cues, studentFaces).smile > studentFaces.frustrated.smile,
  );
});
test("camera cuts land on the intended shot without accumulating drift", () => {
  const shots = [
    {
      from: 0,
      to: 50,
      position: [0, 2, 5] as [number, number, number],
      endPosition: [0, 2, 4] as [number, number, number],
      target: [0, 2, 0] as [number, number, number],
      fov: 40,
    },
    {
      from: 50,
      to: 90,
      position: [2, 2, 3] as [number, number, number],
      endPosition: [1, 2, 3] as [number, number, number],
      target: [0, 2, 0] as [number, number, number],
      fov: 32,
    },
  ];
  assert.equal(cameraPose(49, shots).fov, 40);
  assert.deepEqual(cameraPose(50, shots).position, [2, 2, 3]);
  assert.deepEqual(cameraPose(90, shots).position, [1, 2, 3]);
  assert.equal(entrance(-10, 0), 0);
  assert.equal(entrance(24, 0), 1);
  assert.equal(exit(24, 0), 0);
});
