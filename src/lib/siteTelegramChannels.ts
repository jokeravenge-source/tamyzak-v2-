/** Existing server scopes verify each channel with Telegram's getChatMember. */
export const SITE_TELEGRAM_CHANNELS = [
  { username: "Tamayuzak", scope: "default", nameAr: "تميّزك", nameEn: "Tamayzak" },
  { username: "a6th_DHS", scope: "dhs", nameAr: "6th D'H'S", nameEn: "6th D'H'S" },
] as const;

// A previous single-channel verification must not satisfy the two-channel gate.
export const SITE_TELEGRAM_VERIFIED_STORAGE_KEY = "tg_channels_verified_tamayuzak_a6th_dhs_v2";

const VERIFIED_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export function hasRecentSiteTelegramVerification(now = Date.now()): boolean {
  if (typeof window === "undefined") return false;
  try {
    const verifiedAt = Number(localStorage.getItem(SITE_TELEGRAM_VERIFIED_STORAGE_KEY) || 0);
    const age = now - verifiedAt;
    return verifiedAt > 0 && age >= 0 && age < VERIFIED_TTL_MS;
  } catch { return false; }
}
