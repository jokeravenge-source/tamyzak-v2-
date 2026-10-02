import { protect } from "../_shared/guard.ts";
import { requireUser } from "../_shared/auth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
const CHANNEL_GROUPS = {
  default: ["@Tamayuzak"],
  nadia: ["@nadiakhaleelalnuaimy"],
} as const;
const MEMBER_STATUSES = new Set(["creator", "administrator", "member"]);

type ChannelCheck = {
  channel: string;
  ok: boolean;
  joined: boolean;
  status?: string;
  error?: string;
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
    const scope = requestBody.scope === "nadia" ? "nadia" : "default";
    const requiredChannels = CHANNEL_GROUPS[scope];

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
      return json({ error: "Telegram connector not configured" }, 500);
    }

    const auth = await requireUser(req);
    if (!auth.ok) {
      // Nadia's force-join gate must never unlock without a verified user.
      return json({ ok: false, joined: scope === "default", error: "unauthenticated", scope });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: row } = await admin
      .from("telegram_verifications")
      .select("telegram_user_id")
      .eq("user_id", auth.userId)
      .maybeSingle();

    const tgId = row?.telegram_user_id;
    if (!tgId) return json({ ok: false, joined: false, error: "not_linked" });


    const channels: ChannelCheck[] = await Promise.all(
      requiredChannels.map(async (channel): Promise<ChannelCheck> => {
        const res = await fetch(`${GATEWAY_URL}/getChatMember`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": TELEGRAM_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chat_id: channel, user_id: Number(tgId) }),
        });
        const data = await res.json().catch(() => ({} as Record<string, unknown>));
        if (!res.ok || !(data as { ok?: boolean })?.ok) {
          return {
            channel,
            ok: false,
            joined: false,
            error: (data as { description?: string })?.description ?? `status_${res.status}`,
          };
        }

        const member = (data as { result?: { status?: string; is_member?: boolean } }).result;
        const status = member?.status;
        const joined = !!status && (MEMBER_STATUSES.has(status) || (status === "restricted" && member?.is_member === true));
        return { channel, ok: true, joined, status };
      }),
    );

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
