import { describe, expect, it } from "vitest";
import { PINNED_STUDY_ROOMS, roomSessionSubject } from "./pinnedStudyRooms";

describe("pinned study rooms", () => {
  it("always includes the eight school subjects and the requested Tamayzak code", () => {
    expect(PINNED_STUDY_ROOMS).toHaveLength(9);
    expect(PINNED_STUDY_ROOMS.filter((r) => r.subject).map((r) => r.subject).sort()).toEqual(
      ["arabic", "biology", "chemistry", "english", "french", "islamic", "math", "physics"],
    );
    expect(PINNED_STUDY_ROOMS.find((r) => r.en === "Tamayzak")?.code).toBe("37ECJK");
    expect(new Set(PINNED_STUDY_ROOMS.map((r) => r.code)).size).toBe(9);
  });
  it("starts public-room sessions without requiring subject selection", () => {
    expect(roomSessionSubject("physics")).toBe("physics");
    expect(roomSessionSubject(null)).toBe("general");
  });
});