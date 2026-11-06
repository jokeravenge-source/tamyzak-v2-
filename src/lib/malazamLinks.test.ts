import { describe, expect, it } from "vitest";
import { malzamaPath, parseMalzamaId, slugifyMalzamaName } from "./malazamLinks";

const id = "123e4567-e89b-42d3-a456-426614174000";

describe("malazam links", () => {
  it("creates a stable unique Arabic URL", () => {
    expect(slugifyMalzamaName("  ملزمة الفيزياء — الفصل الأول  ")).toBe("ملزمة-الفيزياء-الفصل-الأول");
    expect(decodeURIComponent(malzamaPath({ id, name: "ملزمة الفيزياء — الفصل الأول" }))).toBe(
      `/malazam/file/${id}/ملزمة-الفيزياء-الفصل-الأول/`,
    );
  });

  it("extracts only valid item identifiers", () => {
    expect(parseMalzamaId(`/malazam/file/${id}/sample/`)).toBe(id);
    expect(parseMalzamaId("/malazam/file/not-an-id/sample/")).toBeNull();
    expect(parseMalzamaId("/malazam/physics/")).toBeNull();
  });
});
