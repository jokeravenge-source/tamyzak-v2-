import { callTelegramGateway, verifyTamayzakBotConnection } from "./telegram-gateway.ts";

export const TELEGRAM_CHANNEL_GROUPS = {
  default: ["@Tamayuzak"],
  nadia: ["@nadiakhaleelalnuaimy"],
  malazam: ["@a6th_DHS", "@sad6ths"],
  dhs: ["@a6th_DHS"],
} as const;

export type TelegramChannelScope = keyof typeof TELEGRAM_CHANNEL_GROUPS;

export type TelegramChannelCheck = {
  channel: string;
  ok: boolean;
  joined: boolean;
  status?: string;
  error?: string;
  actualBotUsername?: string | null;
  firstName?: string;
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

async function requestMember(channel: string, telegramUserId: number) {
  let lastError = "telegram_unavailable";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await callTelegramGateway("getChatMember", { chat_id: channel, user_id: telegramUserId });
      if (response.ok && response.data) return { data: response.data, error: null };

      lastError = response.error ?? "telegram_gateway_unavailable";
      if (response.status > 0 && response.status < 500 && response.status !== 429) break;
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
  const bot = await verifyTamayzakBotConnection();
  if (!bot.ok) {
    return TELEGRAM_CHANNEL_GROUPS[scope].map((channel) => ({
      channel,
      ok: false,
      joined: false,
      error: bot.error,
      actualBotUsername: bot.actualUsername,
    }));
  }

  return Promise.all(
    TELEGRAM_CHANNEL_GROUPS[scope].map(async (channel): Promise<TelegramChannelCheck> => {
      const { data, error } = await requestMember(channel, telegramUserId);
      if (!data || error) {
        return {
          channel,
          ok: false,
          joined: false,
          error: error && isBotAccessError(error) ? "bot_not_channel_admin" : error ?? "telegram_unavailable",
        };
      }

      const member = (data as { result?: { status?: string; is_member?: boolean; user?: { first_name?: string } } }).result;
      const status = member?.status;
      const joined = !!status && (MEMBER_STATUSES.has(status) || (status === "restricted" && member?.is_member === true));
      return { channel, ok: true, joined, status, firstName: member?.user?.first_name };
    }),
  );
}
