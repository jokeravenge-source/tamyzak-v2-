export const TAMAYZAK_BOT_USERNAME = "sovforcejoin_bot";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

export type TelegramGatewayResult = {
  ok: boolean;
  data: Record<string, unknown> | null;
  status: number;
  error: string | null;
};

export async function callTelegramGateway(method: string, body: unknown): Promise<TelegramGatewayResult> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  const telegramApiKey = Deno.env.get("TELEGRAM_API_KEY");
  if (!lovableApiKey || !telegramApiKey) {
    return { ok: false, data: null, status: 0, error: "telegram_not_configured" };
  }

  try {
    const response = await fetch(`${GATEWAY_URL}/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": telegramApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    });
    const data = await response.json().catch(() => ({} as Record<string, unknown>));
    const description = typeof data.description === "string" ? data.description : null;
    const ok = response.ok && data.ok === true;
    return {
      ok,
      data,
      status: response.status,
      error: ok ? null : description ?? (response.status ? `status_${response.status}` : "telegram_gateway_unavailable"),
    };
  } catch {
    return { ok: false, data: null, status: 0, error: "telegram_gateway_unavailable" };
  }
}

export async function verifyTamayzakBotConnection() {
  const response = await callTelegramGateway("getMe", {});
  if (!response.ok || !response.data) {
    return { ok: false as const, error: response.error ?? "telegram_gateway_unavailable", actualUsername: null };
  }

  const result = response.data.result as { username?: unknown } | undefined;
  const actualUsername = typeof result?.username === "string" ? result.username.replace(/^@/, "") : null;
  if (!actualUsername || actualUsername.toLowerCase() !== TAMAYZAK_BOT_USERNAME.toLowerCase()) {
    return { ok: false as const, error: "wrong_bot_connection", actualUsername };
  }
  return { ok: true as const, error: null, actualUsername };
}
