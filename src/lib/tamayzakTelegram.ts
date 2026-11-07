export const TAMAYZAK_BOT_USERNAME = "sovforcejoin_bot";
export const TAMAYZAK_BOT_URL = `https://t.me/${TAMAYZAK_BOT_USERNAME}`;

type TelegramStartPayload = {
  token?: unknown;
  deepLink?: unknown;
};

/**
 * Builds the connection URL locally so a stale server environment variable
 * can never send a student to a different Telegram bot.
 */
export function tamayzakBotLink(payload: TelegramStartPayload | null | undefined): string | null {
  const token = typeof payload?.token === "string" ? payload.token.trim() : "";
  if (/^[a-f0-9]{48}$/i.test(token)) return `${TAMAYZAK_BOT_URL}?start=${token}`;

  const deepLink = typeof payload?.deepLink === "string" ? payload.deepLink : "";
  if (!deepLink) return null;
  try {
    const url = new URL(deepLink);
    const expectedPath = `/${TAMAYZAK_BOT_USERNAME}`.toLowerCase();
    return url.protocol === "https:" && url.hostname.toLowerCase() === "t.me" &&
      url.pathname.replace(/\/+$/, "").toLowerCase() === expectedPath
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
