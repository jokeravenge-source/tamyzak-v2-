// One-off maintenance endpoint: (re)registers the Telegram webhook.
// Admin-only.
import { requireAdmin } from "../_shared/auth.ts";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

async function deriveSecret(apiKey: string): Promise<string> {
  const data = new TextEncoder().encode(`telegram-webhook:${apiKey}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

Deno.serve(async (req) => {
  const auth = await requireAdmin(req);
  if (!auth.ok) return new Response(auth.error, { status: auth.status });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    return new Response(JSON.stringify({ error: "telegram_not_configured" }), { status: 500 });
  }

  const secret = await deriveSecret(TELEGRAM_API_KEY);
  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/telegram-webhook`;

  const call = async (method: string, body: unknown) => {
    const res = await fetch(`${GATEWAY_URL}/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.text() };
  };

  const set = await call("setWebhook", {
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["message", "edited_message"],
    drop_pending_updates: true,
  });
  const info = await call("getWebhookInfo", {});

  return new Response(JSON.stringify({ webhookUrl, set, info }), {
    headers: { "Content-Type": "application/json" },
  });
});