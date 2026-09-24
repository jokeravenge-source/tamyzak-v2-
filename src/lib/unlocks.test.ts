// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

let currentUser = "user-a";
const rpc = vi.fn(async () => ({
  data: { awarded: 10, streak_bonus: 0, current_streak: 1, longest_streak: 1, new_unlocks: [] },
  error: null,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: { id: currentUser } } }) },
    rpc: () => rpc(),
  },
}));

import { countConsecutiveDays, ensureDailyLogin } from "./unlocks";

describe("daily login streak", () => {
  beforeEach(() => {
    currentUser = "user-a";
    localStorage.clear();
    rpc.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-23T12:00:00Z"));
  });

  it("awards each account separately and repeats on the next Baghdad day", async () => {
    await ensureDailyLogin();
    await ensureDailyLogin();
    expect(rpc).toHaveBeenCalledTimes(1);

    currentUser = "user-b";
    await ensureDailyLogin();
    expect(rpc).toHaveBeenCalledTimes(2);

    currentUser = "user-a";
    vi.setSystemTime(new Date("2026-09-23T21:01:00Z"));
    await ensureDailyLogin();
    expect(rpc).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });
});

describe("historical activity streak", () => {
  it("counts distinct Baghdad days through today or yesterday", () => {
    expect(countConsecutiveDays(["2026-09-24", "2026-09-24", "2026-09-23", "2026-09-22"], "2026-09-24")).toBe(3);
    expect(countConsecutiveDays(["2026-09-23", "2026-09-22"], "2026-09-24")).toBe(2);
  });

  it("does not award an old or interrupted streak", () => {
    expect(countConsecutiveDays(["2026-09-20"], "2026-09-24")).toBe(0);
    expect(countConsecutiveDays(["2026-09-24", "2026-09-22"], "2026-09-24")).toBe(1);
  });
});
