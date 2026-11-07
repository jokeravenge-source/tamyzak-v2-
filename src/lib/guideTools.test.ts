import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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
    const source = readFileSync(
      join(process.cwd(), "supabase/functions/guide-chat/index.ts"),
      "utf8",
    );
    const catalog = source.match(/const TOOLS = `\n([\s\S]*?)\n`;/)?.[1] ?? "";
    const functionKeys = catalog
      .split("\n")
      .map((line) => line.match(/^([a-zA-Z][a-zA-Z0-9_-]*)\s+—/)?.[1])
      .filter((key): key is string => Boolean(key));

    expect(functionKeys).toEqual([...GUIDE_TOOL_KEYS]);
  });
});
