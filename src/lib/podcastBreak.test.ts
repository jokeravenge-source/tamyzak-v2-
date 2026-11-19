import { expect, it } from "vitest";
import { planPodcastBreak } from "./podcastBreak";
const sections = (done: number) =>
  Array.from({ length: 5 }, (_, i) => ({
    narration_text: "شرح قصير",
    completed_at: i < done ? "now" : null,
    verdict: i < done ? "correct" : null,
  }));
it("offers an optional midpoint break only before completion", () => {
  expect(planPodcastBreak(sections(2))).toBeNull();
  expect(planPodcastBreak(sections(3))?.minutes).toBe(2);
  expect(planPodcastBreak(sections(5))).toBeNull();
});
it("recommends more rest for dense material and earlier difficulty", () => {
  expect(planPodcastBreak(sections(3), 2)?.minutes).toBe(5);
  expect(
    planPodcastBreak(
      sections(3).map((s) => ({ ...s, narration_text: "تكامل = ".repeat(10) })),
    )?.minutes,
  ).toBe(5);
});
