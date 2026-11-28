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
const minuteMs = 60_000;
const timeInBaghdad = new Intl.DateTimeFormat("ar-IQ", { timeZone: "Asia/Baghdad", hour: "numeric", minute: "2-digit" });
const localHour = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Asia/Baghdad" });
const studentNumber = new Intl.NumberFormat("ar-IQ");

export type SessionTopic = { subject: string; chapter: number; language: "ar" | "en" };
export type SessionPostKind = "session" | "break" | "battle";
export type SessionNotice = { kind: "session" | "break"; studentCount: number } | { kind: "battle"; winner: SessionTopic };

export function dueSessionPosts(slotTime: number, now: number): SessionPostKind[] {
  const elapsed = now - slotTime;
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed >= 5 * minuteMs) return [];
  return elapsed < 3 * minuteMs ? ["session", "break"] : ["battle"];
}

export function makeSessionNotice(slot: string, origin: string, notice: SessionNotice) {
  const link = new URL("/room?code=37ECJK", origin);
  if (link.protocol !== "https:") throw new Error("INVALID_SITE_URL");
  const slotTime = Date.parse(slot);
  const returnTime = timeInBaghdad.format(slotTime + 5 * minuteMs);

  let text: string;
  if (notice.kind === "battle") {
    const { winner } = notice;
    text = `⚔️ تحدّي نهاية السشن\n\nفاز بالتصويت: ${subjects[winner.subject] ?? winner.subject} · الفصل ${winner.chapter} · المنهج ${winner.language === "ar" ? "العربي" : "الإنكليزي"}\nتبدأ الجولة الساعة ${returnTime} بتوقيت بغداد. ادخل غرفة تميّزك واضغط «انضم للتحدّي» قبل البداية.`;
  } else {
    if (!Number.isSafeInteger(notice.studentCount) || notice.studentCount < 0) throw new Error("ROOM_COUNT_UNAVAILABLE");
    const countLine = `👥 عدد الطلاب بالغرفة هسه · ${studentNumber.format(notice.studentCount)}`;
    if (notice.kind === "break") {
      text = `☕ استراحة ٥ دقايق\nنرجع الساعة ${returnTime} بتوقيت بغداد.\n\n${countLine}`;
    } else {
      const hour = Number(localHour.format(slotTime));
      const [order, from, until, label] = starts[(hour / 3 + 7) % 8];
      text = `♥️ بدأ السشن ${order}\n${from} – ${until} بتوقيت بغداد\n${label}\n\n${countLine}\nادخل غرفة تميّزك واستعد للدراسة.`;
    }
  }

  return { text: `${text}\n\n${link}`, link_preview_options: { is_disabled: true }, reply_markup: { inline_keyboard: [[{ text: "ادخل غرفة تميّزك", url: link.toString() }]] } };
}
