import { describe, expect, it } from "vitest";
import { dailyRotate, rankFahrastTopics } from "@/lib/weeklyLearning";

describe("weekly learning personalization", () => {
  it("ranks the closest Al-Fahras topic from the student's wording", () => {
    const topics = [
      { key: "a", en: "Faraday's law", ar: "قانون فاراداي" },
      { key: "b", en: "Eddy currents and Lenz's law", ar: "التيارات الدوامة وقانون لنز" },
      { key: "c", en: "Transformer", ar: "المحولة الكهربائية" },
    ];
    expect(rankFahrastTopics("I confuse eddy currents and Lenz law", topics)[0].key).toBe("b");
  });

  it("returns a stable daily slice without mutating the source", () => {
    const items = Array.from({ length: 20 }, (_, index) => index);
    const first = dailyRotate(items, 10, "2026-09-20:eddy");
    const second = dailyRotate(items, 10, "2026-09-20:eddy");
    expect(first).toEqual(second);
    expect(first).toHaveLength(10);
    expect(items).toEqual(Array.from({ length: 20 }, (_, index) => index));
  });
});
