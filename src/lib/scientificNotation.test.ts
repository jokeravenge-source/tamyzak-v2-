import { describe, expect, it } from "vitest";
import { normalizeScientificText } from "./scientificNotation";

describe("normalizeScientificText", () => {
  it("makes common ASCII operators readable", () => {
    expect(normalizeScientificText("v = d/t, x^2 >= 4, a != b -> c")).toBe(
      "v = d/t, x² ≥ 4, a ≠ b → c",
    );
  });

  it("converts common pasted LaTeX notation", () => {
    expect(normalizeScientificText("$\\Delta x = \\frac{1}{2} \\times t^2$")).toBe(
      "Δ x = (1)⁄(2) × t²",
    );
  });

  it("keeps Arabic explanations and Unicode symbols intact", () => {
    expect(normalizeScientificText("القوة F = ma، ودرجة الحرارة 25℃")).toBe(
      "القوة F = ma، ودرجة الحرارة 25℃",
    );
  });
});
