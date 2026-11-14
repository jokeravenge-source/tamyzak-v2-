import { describe, expect, it } from "vitest";
import { STUDENT_TOOLS } from "../../supabase/functions/_shared/mutamayizTools";
import { GUIDE_TOOL_KEYS, isGuideToolKey } from "./guideTools";

describe("guide tool destinations", () => {
  it("keeps every destination unique", () => {
    expect(new Set(GUIDE_TOOL_KEYS).size).toBe(GUIDE_TOOL_KEYS.length);
  });

  it("accepts current student tools and rejects admin or invented keys", () => {
    expect(isGuideToolKey("malazam")).toBe(true);
    expect(isGuideToolKey("englishReadingPractice")).toBe(true);
    expect(isGuideToolKey("sessions")).toBe(true);
    expect(isGuideToolKey("adminDashboard")).toBe(false);
    expect(isGuideToolKey("subjectTutor")).toBe(false);
    expect(isGuideToolKey("madeUpTool")).toBe(false);
  });

  it("matches the destinations advertised by the guide function", () => {
    const functionKeys = STUDENT_TOOLS.map(tool => tool.key);
    expect(functionKeys).toEqual([...GUIDE_TOOL_KEYS]);
  });
});
