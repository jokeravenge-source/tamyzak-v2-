// One-off maintenance endpoint: (re)registers the Telegram webhook.
// Admin-only.
import { requireAdmin } from "../_shared/auth.ts";
import { callTelegramGateway, TAMAYZAK_BOT_USERNAME, verifyTamayzakBotConnection } from "../_shared/telegram-gateway.ts";

async function deriveSecret(apiKey: string): Promise<string> {
  const data = new TextEncoder().encode(`telegram-webhook:${apiKey}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

Deno.serve(async (req) => {
  const auth = await requireAdmin(req);
  if (!auth.ok) return new Response(auth.error, { status: auth.status });

  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!TELEGRAM_API_KEY) {
    return new Response(JSON.stringify({ error: "telegram_not_configured" }), { status: 500 });
  }

  const bot = await verifyTamayzakBotConnection();
  if (!bot.ok) {
    return new Response(JSON.stringify({
      error: bot.error,
      expectedBotUsername: TAMAYZAK_BOT_USERNAME,
      actualBotUsername: bot.actualUsername,
    }), { status: bot.error === "wrong_bot_connection" ? 409 : 503, headers: { "Content-Type": "application/json" } });
  }

  const secret = await deriveSecret(TELEGRAM_API_KEY);
  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/telegram-webhook`;

  const set = await callTelegramGateway("setWebhook", {
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["message", "edited_message"],
    drop_pending_updates: true,
  });
  const info = await callTelegramGateway("getWebhookInfo", {});

  return new Response(JSON.stringify({ webhookUrl, botUsername: TAMAYZAK_BOT_USERNAME, set, info }), {
    headers: { "Content-Type": "application/json" },
  });
});
