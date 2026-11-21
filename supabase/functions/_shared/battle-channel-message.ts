export type BattleChannelPost = {
  id: string; host_name: string; subject: string; chapter: number; language: string;
  question_count: number; expires_at: string; status: string;
};
const subjects: Record<string, string> = { physics: "الفيزياء", chemistry: "الكيمياء", biology: "الأحياء", math: "الرياضيات", arabic: "العربية", english: "الإنكليزي", english_literature: "الأدب الإنكليزي", french: "الفرنسية", islamic: "الإسلامية" };
const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function forwardedChannelId(message: unknown): string | null {
  const origin = (message as { forward_origin?: { type?: unknown; chat?: { id?: unknown; type?: unknown } } } | null)?.forward_origin;
  const id = origin?.chat?.id;
  return origin?.type === "channel" && origin.chat?.type === "channel" && typeof id === "number" && Number.isSafeInteger(id) && /^-100\d+$/.test(String(id)) ? String(id) : null;
}

export function battleChannelMessage(room: BattleChannelPost, origin = "https://tamyazak.site") {
  const link = new URL("/", origin);
  if (link.protocol !== "https:" || link.username || link.password) throw new Error("INVALID_SITE_URL");
  link.searchParams.set("menu", "liveBattle");
  link.searchParams.set("battle", room.id);
  const waiting = room.status === "waiting";
  const status = waiting ? "🔎 بانتظار منافس — أول طالب ينضم يحجز المكان." : room.status === "claimed" ? "✅ تم العثور على منافس. الغرفة ممتلئة." : room.status === "started" ? "🎮 بدأ التحدّي. الغرفة مغلقة." : room.status === "expired" ? "⌛ انتهت مهلة التحدّي." : "🚫 أُلغي التحدّي.";
  const expiry = new Intl.DateTimeFormat("ar-IQ", { timeZone: "Asia/Baghdad", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(room.expires_at));
  return {
    text: ["⚔️ <b>تحدّي تميّزك</b>", `👤 الطالب: <b>${escape(room.host_name)}</b>`, `📚 المادة: ${escape(subjects[room.subject] ?? room.subject)}`,
      `📖 ${room.chapter ? `الفصل ${room.chapter}` : "كل الفصول المتاحة"}`, `🌐 لغة الأسئلة: ${room.language === "ar" ? "عربي" : "English"}`,
      `📝 ${room.question_count} سؤال MCQ من بنك تميّزك`, "⏱ ٢٥ ثانية لكل سؤال · لاعبان", "🏆 الفائز صاحب أكثر إجابات صحيحة", `🕒 الدعوة لغاية ${expiry} بتوقيت بغداد`, "", status,
      waiting ? "خلي صفحة التحدّي مفتوحة. الدخول بحساب تميّزك." : ""].filter(Boolean).join("\n"),
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: { inline_keyboard: waiting ? [[{ text: "⚔️ انضم للتحدّي", url: link.toString() }]] : [] },
  };
}

type GatewayResult = { ok: boolean; status: number; data: Record<string, unknown> | null; error: string | null };
export async function sendBattleChannelPost(room: BattleChannelPost, chatId: string, gateway: (method: string, body: unknown) => Promise<GatewayResult>, origin?: string) {
  const response = await gateway("sendMessage", { chat_id: chatId, ...battleChannelMessage(room, origin) });
  const result = response.data?.result as { message_id?: unknown } | undefined;
  const messageId = Number(result?.message_id);
  if (response.ok && Number.isSafeInteger(messageId) && messageId > 0) return { state: "sent" as const, messageId };
  // A timeout or gateway 5xx may happen after Telegram accepted the message.
  // Do not automatically send another copy when delivery is uncertain.
  return { state: response.status === 0 || response.status >= 500 || response.ok ? "unknown" as const : "failed" as const, messageId: null };
}
