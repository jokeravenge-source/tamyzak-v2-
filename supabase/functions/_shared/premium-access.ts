export const PREMIUM_AI_FEATURES = new Set([
  "mcq", "essay", "video-notes", "video", "agent", "problem_generator",
  "physics_solver", "surah-verify", "poem-verify", "hadith-verify",
  "english_essay", "english_reading_generate", "english_reading_grade",
  "exam_generator", "exam_grade",
]);

type AccessResult = { ok: true } | { ok: false; status: number; error: string };

export type EntitlementResult =
  | { ok: true; userId: string; bypassed: boolean }
  | { ok: false; status: number; error: string };

/** Feature access is independent of how many times it was used today. */
export async function authorizeFeature(
  userId: string | undefined,
  feature: string,
  checkPremium: () => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<EntitlementResult> {
  if (!userId) return { ok: false, status: 401, error: "Sign in to use this feature." };
  if (PREMIUM_AI_FEATURES.has(feature)) {
    const access = await verifyPremiumAccess(checkPremium);
    if (access.ok === false) return access;
    return { ok: true, userId, bypassed: true };
  }
  return { ok: true, userId, bypassed: false };
}

export async function verifyPremiumAccess(
  check: () => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<AccessResult> {
  try {
    const { data, error } = await check();
    if (error) return { ok: false, status: 500, error: "Could not verify Premium membership. Please try again." };
    if (data !== true) return { ok: false, status: 403, error: "Premium membership required. Unlock via Telegram: @ias404." };
    return { ok: true };
  } catch {
    return { ok: false, status: 500, error: "Could not verify Premium membership. Please try again." };
  }
}
