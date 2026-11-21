export function isTelegramGroupId(value: unknown): boolean {
  return (typeof value === "number" || typeof value === "string") && /^-[1-9]\d{0,15}$/.test(String(value)) && Number.isSafeInteger(Number(value));
}

export function isTelegramGroupLink(value: string): boolean {
  return /^https:\/\/t\.me\/(?:\+[A-Za-z0-9_-]+|joinchat\/[A-Za-z0-9_-]+|[A-Za-z0-9_]{5,64})\/?$/.test(value);
}

/** Public group links/usernames can be resolved by Telegram; private links need an ID. */
export function telegramGroupTarget(id: string, invite: string): string | null {
  const value = id.trim();
  if (isTelegramGroupId(value)) return value;
  if (/^@[A-Za-z0-9_]{5,64}$/.test(value)) return value;
  const match = (value || invite.trim()).match(/^https:\/\/t\.me\/([A-Za-z0-9_]{5,64})\/?$/);
  return match ? `@${match[1]}` : null;
}

type GroupChat = { id?: unknown; type?: unknown; permissions?: { can_send_messages?: unknown } };
type GroupMember = { status?: unknown; is_member?: unknown; can_send_messages?: unknown; can_post_messages?: unknown };
export function resolvedBattleChatId(value: unknown): string | null {
  const chat = value as GroupChat | null;
  return chat?.type === "channel" && isTelegramGroupId(chat.id) ? String(chat.id) : resolvedGroupId(value);
}

export function botCanPostBattle(chatValue: unknown, memberValue: unknown): boolean {
  const chat = chatValue as GroupChat | null;
  const member = memberValue as GroupMember | null;
  if (chat?.type === "channel") return !!resolvedBattleChatId(chat) && !!member && (member.status === "creator" || (member.status === "administrator" && member.can_post_messages === true));
  return botCanPostToGroup(chatValue, memberValue);
}
export function resolvedGroupId(value: unknown): string | null {
  const chat = value as GroupChat | null;
  return chat && ["group", "supergroup"].includes(String(chat.type)) && isTelegramGroupId(chat.id) ? String(chat.id) : null;
}

export function botCanPostToGroup(chatValue: unknown, memberValue: unknown): boolean {
  const chat = chatValue as GroupChat | null;
  const member = memberValue as GroupMember | null;
  if (!resolvedGroupId(chat) || !member) return false;
  if (member.status === "creator" || member.status === "administrator") return true;
  if (member.status === "member") return chat?.permissions?.can_send_messages === true;
  return member.status === "restricted" && member.is_member === true && member.can_send_messages === true;
}

export function groupIdCommand(value: unknown, botUsername: string): string | null {
  const message = value as { text?: unknown; chat?: GroupChat } | null;
  if (!message || typeof message.text !== "string") return null;
  const match = message.text.trim().match(/^\/groupid(?:@([A-Za-z0-9_]+))?$/i);
  if (!match || (match[1] && match[1].toLowerCase() !== botUsername.toLowerCase())) return null;
  return resolvedGroupId(message.chat);
}
