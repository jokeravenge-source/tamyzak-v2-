import { protect } from "../_shared/guard.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const BOT_USERNAME = Deno.env.get("TAMAYZAK_BOT_USERNAME") || "sovforcejoin_bot";
const TOKEN_TTL_MS = 15 * 60 * 1000;

function randomToken(len = 24): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cleanSource(value: unknown): string {
  const source = String(value ?? "profile").toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 48);
  return source || "profile";
}

function expiresAt(): string {
  return new Date(Date.now() + TOKEN_TTL_MS).toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const guard = await protect(req, "telegram-start", { max: 10, windowSeconds: 60 });
  if (!guard.ok) return new Response(JSON.stringify({ error: guard.error }), { status: guard.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* optional body */ }
    const action = String(body.action ?? "start");
    const source = cleanSource(body.source);
    const userId = userData.user.id;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    if (action === "disconnect") {
      await admin.from("telegram_verifications").delete().eq("user_id", userId);
      return new Response(JSON.stringify({ ok: true, verified: false, telegramUsername: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: existing } = await admin
      .from("telegram_verifications")
      .select("token, verified, telegram_username, token_expires_at, token_used_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing?.verified && action !== "relink") {
      return new Response(JSON.stringify({
        verified: true,
        telegramUsername: existing.telegram_username ?? null,
        botUsername: BOT_USERNAME,
        deepLink: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const expired = !existing?.token_expires_at || new Date(existing.token_expires_at).getTime() <= Date.now();
    const needsFreshToken = action === "relink" || !existing?.token || Boolean(existing?.token_used_at) || expired;
    const token = needsFreshToken ? randomToken() : existing.token;
    const pendingRow = {
      token,
      verified: false,
      telegram_user_id: null,
      telegram_username: null,
      token_expires_at: expiresAt(),
      token_used_at: null,
      connected_at: null,
      connection_source: source,
      last_error: null,
    };

    const { error: writeError } = existing
      ? await admin.from("telegram_verifications").update(pendingRow).eq("user_id", userId)
      : await admin.from("telegram_verifications").insert({ user_id: userId, ...pendingRow });
    if (writeError) throw new Error(writeError.message);

    return new Response(JSON.stringify({
      token,
      deepLink: `https://t.me/${BOT_USERNAME}?start=${token}`,
      botUsername: BOT_USERNAME,
      expiresAt: pendingRow.token_expires_at,
      verified: false,
      telegramUsername: null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
