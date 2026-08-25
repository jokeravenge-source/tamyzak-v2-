import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wrench, X } from "lucide-react";

export type FeatureAnnouncement = {
  /** Unique id — bump it to re-show a card. */
  id: string;
  /** "feature" for something new, "fix" for a resolved issue. */
  kind?: "feature" | "fix";
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
};

/**
 * Add one entry here every time a new feature ships or a bug is fixed.
 * Each card is shown once per visit (tracked in sessionStorage by `id`).
 */
export const FEATURE_ANNOUNCEMENTS: FeatureAnnouncement[] = [
  {
    id: "exam-lang-2026-08b",
    kind: "feature",
    titleAr: "امتحان كامل بلغة منهجك",
    titleEn: "Full exam in your curriculum language",
    descAr: "عند توليد امتحان وزاري كامل يمكنك اختيار لغة المنهج (عربي/إنكليزي) وسيصدر الامتحان والتصحيح بنفس اللغة.",
    descEn: "When generating a full ministerial exam you can pick the curriculum language (Arabic/English) — paper and grading follow it.",
  },
  {
    id: "push-notifications-2026-08b",
    kind: "feature",
    titleAr: "تنبيهات على جهازك",
    titleEn: "Device notifications",
    descAr: "فعّل التنبيهات لتصلك تذكيرات الامتحانات ومراجعة أخطائك والأخبار الجديدة مباشرة على هاتفك.",
    descEn: "Enable notifications to get exam reminders, mistakes review and news straight on your device.",
  },
  {
    id: "profile-battle-2026-08b",
    kind: "feature",
    titleAr: "تحدَّ أصدقاءك من ملفهم الشخصي",
    titleEn: "Challenge friends from their profile",
    descAr: "من الجلسات اضغط على أي طالب وتحدّاه: اختر المادة والفصل واللغة وعدد الأسئلة.",
    descEn: "In Sessions, tap any student and challenge them — choose subject, chapter, language and question count.",
  },
  {
    id: "guide-chat-2026-08",
    kind: "feature",
    titleAr: "مرشد التطبيق الذكي",
    titleEn: "Smart app guide",
    descAr: "لا تعرف من أين تبدأ؟ أخبر المرشد بما تريد إنجازه وسينقلك مباشرة إلى الأداة المناسبة.",
    descEn: "Not sure where to start? Tell the guide what you want to do and it takes you straight to the right tool.",
  },
  {
    id: "notes-unread-dot-2026-08",
    kind: "feature",
    titleAr: "تنبيه الملاحظات الجديدة",
    titleEn: "New notes indicator",
    descAr: "تظهر نقطة حمراء على بطاقة الملاحظات عندما تكون هناك ملاحظات لم تقرأها بعد.",
    descEn: "A red dot appears on the notes card whenever there are notes you haven't opened yet.",
  },
  {
    id: "join-tamayzak-2026-08",
    titleAr: "انضم الى تميزك",
    titleEn: "Join Tamayzak",
    descAr: "صار بإمكانك التسجيل معنا مباشرة من التطبيق — املأ اسمك ومعرف تيليجرام واسم مدرّسك وسنتواصل معك.",
    descEn: "You can now sign up straight from the app — fill in your name, Telegram handle and teacher, and we'll reach out.",
  },
  {
    id: "canvas-notes-free-2026-08",
    titleAr: "اللوحة والملاحظات مفتوحة للجميع",
    titleEn: "Canvas & Notes unlocked",
    descAr: "لم تعد بحاجة إلى نقاط — استخدم اللوحة والملاحظات مجاناً الآن.",
    descEn: "No points needed anymore — use Canvas and Notes for free.",
  },
];


const KEY = "seen_feature_announcements_session";

function readSeen(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

const NewFeatureAnnouncement = ({ language }: { language: "en" | "ar" }) => {
  const isAr = language === "ar";
  const [queue, setQueue] = useState<FeatureAnnouncement[]>([]);

  useEffect(() => {
    const seen = readSeen();
    setQueue(FEATURE_ANNOUNCEMENTS.filter((f) => !seen.includes(f.id)));
  }, []);

  const current = queue[0];
  const dismiss = () => {
    if (!current) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify([...readSeen(), current.id]));
    } catch {
      /* ignore */
    }
    setQueue((q) => q.slice(1));
  };

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={dismiss} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-primary/40 bg-card/95 p-7 text-center shadow-[var(--shadow-glow)]"
          >
            <button
              onClick={dismiss}
              aria-label={isAr ? "إغلاق" : "Close"}
              className="absolute top-3 end-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
              {current.kind === "fix" ? (
                <Wrench className="h-7 w-7 text-primary" />
              ) : (
                <Sparkles className="h-7 w-7 text-primary" />
              )}
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {current.kind === "fix"
                ? (isAr ? "تم الإصلاح" : "Fixed")
                : (isAr ? "ميزة جديدة" : "New feature")}
            </p>

            <h2 className="mt-2 text-2xl font-bold gradient-text">
              {isAr ? current.titleAr : current.titleEn}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {isAr ? current.descAr : current.descEn}
            </p>
            <button
              onClick={dismiss}
              className="mt-6 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {isAr ? "تمام" : "Got it"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewFeatureAnnouncement;
