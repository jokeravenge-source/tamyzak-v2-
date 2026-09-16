import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { PREMIUM_AI_FEATURES, verifyPremiumAccess } from "./premium-access.ts";

export type EntitlementResult =
  | { ok: true; userId: string; bypassed: boolean }
  | { ok: false; status: number; error: string };

/**
 * Validates the incoming JWT and reserves one daily use of `feature` for the
 * authenticated user. Premium AI tools require a server-verified live
 * subscription (or existing admin/owner access), without consuming quota.
 *
 * Returns 401 if no auth, 403 if Premium is required, 429 if quota is exhausted.
 */
export async function claimFeature(req: Request, feature: string, dailyLimit?: number): Promise<EntitlementResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Sign in to use this feature." };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace("Bearer ", "").trim();
  let userId: string | undefined;
  try {
    const { data: claimsData } = await supabase.auth.getClaims(token);
    userId = claimsData?.claims?.sub as string | undefined;
  } catch (_e) { /* fall through */ }
  if (!userId) {
    try {
      const { data } = await supabase.auth.getUser(token);
      userId = data?.user?.id;
    } catch (_e) { /* fall through */ }
  }
  if (!userId) {
    return { ok: false, status: 401, error: "Your session expired. Please sign out and sign in again." };
  }

  if (PREMIUM_AI_FEATURES.has(feature)) {
    const access = await verifyPremiumAccess(() => supabase.rpc("can_use_premium_tools"));
    if (!access.ok) return access;
    return { ok: true, userId, bypassed: true };
  }

  const { data: allowed, error } = dailyLimit == null
    ? await supabase.rpc("claim_daily_feature", { _feature: feature })
    : await supabase.rpc("claim_daily_feature_limit", {
      _feature: feature,
      _limit: Math.max(0, Math.floor(dailyLimit)),
    });
  if (error) {
    return { ok: false, status: 500, error: error.message };
  }
  if (!allowed) {
    return {
      ok: false,
      status: 429,
      error: "You've reached today's usage limit for this tool. It resets at midnight Baghdad time (Asia/Baghdad, UTC+3).",
    };
  }
  return { ok: true, userId, bypassed: false };
}
