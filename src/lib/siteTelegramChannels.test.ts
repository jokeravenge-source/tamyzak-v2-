import { beforeEach, describe, expect, it, vi } from "vitest";
import { hasRecentSiteTelegramVerification, SITE_TELEGRAM_VERIFIED_STORAGE_KEY } from "./siteTelegramChannels";

const now = 1_800_000_000_000;
beforeEach(() => { localStorage.clear(); });

describe("two-channel verification cache", () => {
  it("requires a new verification even if the former DHS-only check is cached", () => {
    localStorage.setItem("tg_channel_verified_v1", String(now));
    expect(hasRecentSiteTelegramVerification(now)).toBe(false);
    localStorage.setItem(SITE_TELEGRAM_VERIFIED_STORAGE_KEY, String(now));
    expect(hasRecentSiteTelegramVerification(now)).toBe(true);
  });
  it.each([String(now - 3 * 24 * 60 * 60 * 1000), String(now + 1), "invalid", "0"])("rejects an expired or invalid timestamp: %s", value => {
    localStorage.setItem(SITE_TELEGRAM_VERIFIED_STORAGE_KEY, value);
    expect(hasRecentSiteTelegramVerification(now)).toBe(false);
  });
  it("requires verification when browser storage is unavailable", () => {
    const read = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
    expect(hasRecentSiteTelegramVerification(now)).toBe(false);
    read.mockRestore();
  });
});
