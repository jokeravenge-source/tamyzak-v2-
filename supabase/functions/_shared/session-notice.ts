const starts = [
  ["الأول", "03:00 فجرًا", "06:00 صباحًا", "سشن الفجر والتركيز العالي 🌅"],
  ["الثاني", "06:00 صباحًا", "09:00 صباحًا", "انطلاقة الصباح ☀️"],
  ["الثالث", "09:00 صباحًا", "12:00 ظهرًا", "📖"],
  ["الرابع", "12:00 ظهرًا", "03:00 عصرًا", "⏳"],
  ["الخامس", "03:00 عصرًا", "06:00 مساءً", "☕"],
  ["السادس", "06:00 مساءً", "09:00 مساءً", "🌆"],
  ["السابع", "09:00 مساءً", "12:00 منتصف الليل", "🌙"],
  ["الثامن", "12:00 منتصف الليل", "03:00 فجرًا", "سشن الهدوء 🌌"],
] as const;
const subjects: Record<string, string> = {
  physics: "الفيزياء", chemistry: "الكيمياء", biology: "الأحياء", math: "الرياضيات",
  arabic: "العربي", english: "الإنكليزي", english_literature: "الأدب الإنكليزي", french: "الفرنسي", islamic: "الإسلامية",
};
export type SessionTopic = { subject: string; chapter: number; language: "ar" | "en" };

export function makeSessionNotice(slot: string, origin: string, winner?: SessionTopic) {
  const link = new URL("/room?code=37ECJK", origin);
  if (link.protocol !== "https:") throw new Error("INVALID_SITE_URL");
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Asia/Baghdad" }).format(new Date(slot)));
  const [order, from, until, label] = starts[(hour / 3 + 7) % 8];
  const start = new Date(Date.parse(slot) + 5 * 60_000);
  const startTime = new Intl.DateTimeFormat("ar-IQ", { timeZone: "Asia/Baghdad", hour: "numeric", minute: "2-digit" }).format(start);
  const text = winner
    ? `⚔️ تحدّي نهاية السشن\n\nفاز بالتصويت: ${subjects[winner.subject] ?? winner.subject} · الفصل ${winner.chapter} · المنهج ${winner.language === "ar" ? "العربي" : "الإنكليزي"}\nتبدأ الجولة الساعة ${startTime} بتوقيت بغداد. ادخل غرفة تميّزك واضغط «انضم للتحدّي» قبل البداية.\n\n${link}`
    : `♥️ بدأ السشن ${order}\n${from} – ${until} بتوقيت بغداد\n${label}\n\nادخل غرفة تميّزك وابدأ الدراسة.\n${link}`;
  return { text, link_preview_options: { is_disabled: true }, reply_markup: { inline_keyboard: [[{ text: "ادخل غرفة تميّزك", url: link.toString() }]] } };
}
