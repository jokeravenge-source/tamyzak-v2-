import { describe, it, expect } from "vitest";
import { readableMath } from "./readableMath";
describe("readableMath", () => {
  it("converts fractions, roots and powers", () => {
    expect(readableMath("$\\frac{a}{b} + \\sqrt{x} = x^2$")).toBe("a/b + √x = x²");
  });
  it("converts symbols", () => {
    expect(readableMath("$x \\leq 3 \\times \\pi$")).toBe("x ≤ 3 × π");
  });
  it("leaves plain text alone", () => {
    expect(readableMath("ملاحظات x² + 1")).toBe("ملاحظات x² + 1");
  });
});
