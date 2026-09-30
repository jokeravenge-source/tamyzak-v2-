/**
 * Permanent per-device flag. Once the student answers, this introduction is
 * never shown again on this browser/device.
 */
const KEY = "usage_intro_answered_device_v1";
const LEGACY_DAILY_KEY = "usage_intro_answered_day";

export function usageIntroAnswered(): boolean {
  try {
    // Treat anyone who answered the older daily prompt as already introduced,
    // so existing students are not interrupted again after this migration.
    return localStorage.getItem(KEY) === "1" || localStorage.getItem(LEGACY_DAILY_KEY) !== null;
  } catch {
    return true;
  }
}

export function markUsageIntroAnswered(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // Storage can be unavailable in strict private-browsing environments.
  }
}
