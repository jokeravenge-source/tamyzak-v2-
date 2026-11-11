import { protect } from "../_shared/guard.ts";
import { requireUser } from "../_shared/auth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkTelegramMembership,
  type TelegramChannelScope,
} from "../_shared/telegram-membership.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const guard = await protect(req, "telegram-channel-check", { max: 20, windowSeconds: 60 });
  if (!guard.ok) return new Response(JSON.stringify({ error: guard.error }), { status: guard.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    let requestBody: { scope?: string } = {};
    try { requestBody = await req.json(); } catch { /* body is optional */ }
    const scope: TelegramChannelScope = requestBody.scope === "nadia"
      ? "nadia"
      : requestBody.scope === "malazam"
        ? "malazam"
        : requestBody.scope === "dhs"
          ? "dhs"
          : "default";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = await requireUser(req);
    if (!auth.ok) {
      // Nadia's force-join gate must never unlock without a verified user.
      return json({ ok: false, joined: scope === "default", error: "unauthenticated", scope });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: row } = await admin
      .from("telegram_verifications")
      .select("telegram_user_id, verified")
      .eq("user_id", auth.userId)
      .maybeSingle();

    const tgId = row?.telegram_user_id;
    if (!row?.verified || !tgId) return json({ ok: false, joined: false, error: "not_linked" });


    const channels = await checkTelegramMembership(Number(tgId), scope);

    const failedCheck = channels.find((channel) => !channel.ok);
    if (failedCheck) {
      return json({
        ok: false,
        joined: false,
        error: failedCheck.error,
        channel: failedCheck.channel,
        channels,
      });
    }

    const missingChannels = channels.filter((channel) => !channel.joined).map((channel) => channel.channel);
    return json({
      ok: true,
      joined: missingChannels.length === 0,
      scope,
      missingChannels,
      channels,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
