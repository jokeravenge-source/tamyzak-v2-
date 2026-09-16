export const PREMIUM_AI_FEATURES = new Set([
  "mcq", "essay", "video-notes", "video", "agent", "problem_generator",
  "physics_solver", "surah-verify", "poem-verify", "hadith-verify",
  "english_essay", "english_reading_generate", "english_reading_grade",
  "exam_generator", "exam_grade",
]);

type AccessResult = { ok: true } | { ok: false; status: number; error: string };

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
