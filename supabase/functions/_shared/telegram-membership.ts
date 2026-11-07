const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

export const TELEGRAM_CHANNEL_GROUPS = {
  default: ["@Tamayuzak"],
  nadia: ["@nadiakhaleelalnuaimy"],
  malazam: ["@a6th_DHS", "@sad6ths"],
} as const;

export type TelegramChannelScope = keyof typeof TELEGRAM_CHANNEL_GROUPS;

export type TelegramChannelCheck = {
  channel: string;
  ok: boolean;
  joined: boolean;
  status?: string;
  error?: string;
};

const MEMBER_STATUSES = new Set(["creator", "administrator", "member"]);
const BOT_ACCESS_ERRORS = [
  "chat not found",
  "bot is not a member",
  "member list is inaccessible",
  "not enough rights",
  "have no rights",
];

function isBotAccessError(message: string) {
  const normalized = message.toLowerCase();
  return BOT_ACCESS_ERRORS.some((part) => normalized.includes(part));
}

async function requestMember(channel: string, telegramUserId: number, lovableApiKey: string, telegramApiKey: string) {
  let lastError = "telegram_unavailable";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(`${GATEWAY_URL}/getChatMember`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "X-Connection-Api-Key": telegramApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chat_id: channel, user_id: telegramUserId }),
        signal: AbortSignal.timeout(8_000),
      });
      const data = await res.json().catch(() => ({} as Record<string, unknown>));
      if (res.ok && (data as { ok?: boolean })?.ok) return { data, error: null };

      lastError = (data as { description?: string })?.description ?? `status_${res.status}`;
      if (res.status < 500 && res.status !== 429) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  return { data: null, error: lastError };
}

export async function checkTelegramMembership(
  telegramUserId: number,
  scope: TelegramChannelScope,
): Promise<TelegramChannelCheck[]> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  const telegramApiKey = Deno.env.get("TELEGRAM_API_KEY");
  if (!lovableApiKey || !telegramApiKey) throw new Error("telegram_not_configured");

  return Promise.all(
    TELEGRAM_CHANNEL_GROUPS[scope].map(async (channel): Promise<TelegramChannelCheck> => {
      const { data, error } = await requestMember(channel, telegramUserId, lovableApiKey, telegramApiKey);
      if (!data || error) {
        return {
          channel,
          ok: false,
          joined: false,
          error: error && isBotAccessError(error) ? "bot_not_channel_admin" : error ?? "telegram_unavailable",
        };
      }

      const member = (data as { result?: { status?: string; is_member?: boolean } }).result;
      const status = member?.status;
      const joined = !!status && (MEMBER_STATUSES.has(status) || (status === "restricted" && member?.is_member === true));
      return { channel, ok: true, joined, status };
    }),
  );
}
