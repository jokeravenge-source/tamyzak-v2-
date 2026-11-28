import { describe, expect, it } from "vitest";
import { baghdadReportBounds, baghdadReportDate } from "../../../supabase/functions/_shared/baghdadReportDay";

describe("Baghdad report day", () => {
  it("changes at 21:00 UTC and never includes the following midnight", () => {
    expect(baghdadReportDate(new Date("2026-11-28T20:59:59.999Z"))).toBe("2026-11-28");
    expect(baghdadReportDate(new Date("2026-11-28T21:00:00.000Z"))).toBe("2026-11-29");
    expect(baghdadReportBounds("2026-11-29")).toEqual({
      start: "2026-11-28T21:00:00.000Z", end: "2026-11-29T21:00:00.000Z",
    });
  });
});
