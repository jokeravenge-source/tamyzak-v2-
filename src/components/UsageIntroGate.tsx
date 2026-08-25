import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass } from "lucide-react";

/** Per-day key: the card is shown again once every calendar day the site is opened. */
const KEY = "usage_intro_answered_day";

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function usageIntroAnswered(): boolean {
  try {
    return localStorage.getItem(KEY) === todayStamp();
  } catch {
    return true;
  }
}

const UsageIntroGate = ({
  language,
  onNeedHelp,
}: {
  language: "en" | "ar";
  onNeedHelp: () => void;
}) => {
  const isAr = language === "ar";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!usageIntroAnswered());
  }, []);

  const answer = (knows: boolean) => {
    try {
      localStorage.setItem(KEY, todayStamp());
    } catch {
      /* ignore */
    }
    setOpen(false);
    if (!knows) onNeedHelp();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-primary/40 bg-card/95 p-7 text-center shadow-[var(--shadow-glow)]"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
              <Compass className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">
              {isAr ? "هل تعرف كيف تستخدم الموقع؟" : "Do you know how to use the site?"}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {isAr
                ? "إذا لم تكن متأكداً، سيرشدك مساعد ذكي إلى الأداة المناسبة لهدفك."
                : "If you're not sure, a smart guide will point you to the right tool for your goal."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => answer(true)}
                className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {isAr ? "نعم، أعرف" : "Yes, I do"}
              </button>
              <button
                onClick={() => answer(false)}
                className="h-11 rounded-xl border border-border bg-secondary font-semibold text-foreground transition-colors hover:bg-secondary/70"
              >
                {isAr ? "لا، أرشدني" : "No, guide me"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UsageIntroGate;
