import { describe, expect, it } from "vitest";
import { ministerialBioCh4 } from "./ministerialBioCh4NadiaEn";

describe("Nadia Al-Nuaimi Biology Chapter 4 ministerial questions", () => {
  it("contains the complete 41-question set", () => {
    expect(ministerialBioCh4).toHaveLength(41);
    expect(ministerialBioCh4.every((item) => item.q.trim() && item.a.trim())).toBe(true);
  });

  it("does not expose extraction or source-file notes", () => {
    const content = JSON.stringify(ministerialBioCh4).toLowerCase();
    expect(content).not.toMatch(/\b(?:pdf|source|booklet|supplied file)\b/);
  });
});
