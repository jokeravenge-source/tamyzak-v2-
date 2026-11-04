import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { authorizeFeature, type EntitlementResult } from "./premium-access.ts";
export type { EntitlementResult } from "./premium-access.ts";

/**
 * Validates the incoming JWT and feature membership, without daily quotas.
 * Premium AI tools still require a server-verified live subscription
 * (or existing admin/owner access). Short-term rate guards remain at endpoints.
 *
 * Returns 401 if no auth and 403 if Premium is required.
 */
export async function claimFeature(req: Request, feature: string): Promise<EntitlementResult> {
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

  if (feature === "english_reading_generate" || feature === "english_reading_grade") {
    try {
      const { data, error } = await supabase.rpc("claim_english_reading_access");
      if (error || !data || typeof data !== "object") {
        return { ok: false, status: 500, error: "Could not verify reading-practice access. Please try again." };
      }
      const access = data as { access?: unknown; premium?: unknown };
      if (access.access !== true) {
        return { ok: false, status: 403, error: "Your 3-day reading-practice trial has ended. Premium membership is required." };
      }
      return { ok: true, userId, bypassed: access.premium === true };
    } catch {
      return { ok: false, status: 500, error: "Could not verify reading-practice access. Please try again." };
    }
  }

  return authorizeFeature(userId, feature, () => supabase.rpc("can_use_premium_tools"));
}
