import { protect } from "../_shared/guard.ts";
import { requireUser } from "../_shared/auth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
const CHANNEL = "@Tamayuzak";
const MEMBER_STATUSES = new Set(["creator", "administrator", "member", "restricted"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const guard = await protect(req, "telegram-channel-check", { max: 20, windowSeconds: 60 });
  if (!guard.ok) return new Response(JSON.stringify({ error: guard.error }), { status: guard.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
      return json({ error: "Telegram connector not configured" }, 500);
    }

    const auth = await requireUser(req);
    if (!auth.ok) {
      // Not signed in / stale token: never block the app, just report unknown.
      return json({ ok: false, joined: true, error: "unauthenticated" });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: row } = await admin
      .from("telegram_verifications")
      .select("telegram_user_id")
      .eq("user_id", auth.userId)
      .maybeSingle();

    const tgId = row?.telegram_user_id;
    if (!tgId) return json({ ok: false, joined: false, error: "not_linked" });


    const res = await fetch(`${GATEWAY_URL}/getChatMember`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: CHANNEL, user_id: Number(tgId) }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.ok) {
      return json({ ok: false, joined: false, error: data?.description ?? `status_${res.status}` });
    }
    const status = data.result?.status as string | undefined;
    const joined = !!status && MEMBER_STATUSES.has(status) && status !== "left" && status !== "kicked";
    return json({ ok: true, joined, status, channel: CHANNEL });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});