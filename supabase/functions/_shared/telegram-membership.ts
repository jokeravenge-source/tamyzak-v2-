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

export async function checkTelegramMembership(
  telegramUserId: number,
  scope: TelegramChannelScope,
): Promise<TelegramChannelCheck[]> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  const telegramApiKey = Deno.env.get("TELEGRAM_API_KEY");
  if (!lovableApiKey || !telegramApiKey) throw new Error("telegram_not_configured");

  return Promise.all(
    TELEGRAM_CHANNEL_GROUPS[scope].map(async (channel): Promise<TelegramChannelCheck> => {
      const res = await fetch(`${GATEWAY_URL}/getChatMember`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "X-Connection-Api-Key": telegramApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chat_id: channel, user_id: telegramUserId }),
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
}
