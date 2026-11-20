import { expect, it } from "vitest";
import { speechSettings } from "../../supabase/functions/_shared/speechSettings";

it("selects a steady Iraqi tutor delivery for podcast speech", () => {
  const result = speechSettings({
    purpose: "podcast",
    voice: "shimmer",
    speed: 2,
  });
  expect(result.voice).toBe("onyx");
  expect(result.speed).toBe(1);
  expect(result.instructions).toContain("العراقية");
});

it("preserves voice and speed selection for other speech callers", () => {
  expect(speechSettings({ voice: "nova", speed: 1.1 })).toEqual({
    voice: "nova",
    speed: 1.1,
  });
  expect(speechSettings({})).toEqual({ voice: "alloy", speed: 1.25 });
});
