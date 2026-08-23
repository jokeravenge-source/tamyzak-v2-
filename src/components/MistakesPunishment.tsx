import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLanguage } from "@/components/LanguageGate";
import { dueMistakesCount } from "@/lib/mistakes";
import { activateZombie, clearRedoAndZombie, isZombieActive } from "@/components/ZombieGuard";

const OPENED_KEY = "mistakes_opened_on_v1";
const PUNISH_KEY = "mistakes_punished_v1";

const today = () => new Date().toISOString().slice(0, 10);

/** Call when the student opens the My Mistakes tool. */
export const markMistakesOpened = () => {
  localStorage.setItem(OPENED_KEY, today());
};

/** Call after the student has no due mistakes left — lifts the punishment. */
export const liftMistakesPunishment = () => {
  localStorage.removeItem(PUNISH_KEY);
  clearRedoAndZombie();
  window.dispatchEvent(new Event("app:mistakes-punishment-lifted"));
};

export const isMistakesPunished = () => localStorage.getItem(PUNISH_KEY) === "1";

export default function MistakesPunishment({
  language,
  onOpenMistakes,
}: {
  language: AppLanguage;
  onOpenMistakes: () => void;
}) {
  const isAr = language === "ar";
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const due = await dueMistakesCount();
      if (cancelled) return;
      if (due === 0) {
        if (isMistakesPunished()) liftMistakesPunishment();
        return;
      }
      if (localStorage.getItem(OPENED_KEY) === today()) return;
      localStorage.setItem(PUNISH_KEY, "1");
      if (!isZombieActive()) activateZombie();
      setCount(due);
      setShow(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] grid place-items-center bg-background/85 backdrop-blur-sm px-4"
          dir={isAr ? "rtl" : "ltr"}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-secondary/70 p-6 text-center shadow-xl"
          >
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15">
              <Skull className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-black">
              {isAr ? "وضع الزومبي مُفعّل 🧟" : "Zombie mode activated 🧟"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAr
                ? `لديك ${count} خطأ بانتظار المراجعة ولم تفتح صفحة "أخطائي" اليوم، لذلك أصبح الموقع بشكل الزومبي.`
                : `You have ${count} mistake(s) waiting for review and you didn't open "My Mistakes" today, so the whole app went zombie.`}
            </p>
            <div className="mt-4 rounded-xl border border-white/10 bg-background/50 p-4 text-start">
              <p className="text-sm font-semibold">
                {isAr ? "كيف تتخلّص من العقوبة؟" : "How to remove the punishment?"}
              </p>
              <ol className="mt-2 list-decimal space-y-1 ps-5 text-sm text-muted-foreground">
                <li>{isAr ? 'افتح أداة "أخطائي".' : 'Open the "My Mistakes" tool.'}</li>
                <li>{isAr ? "أعد حل كل الأخطاء المستحقة اليوم." : "Redo every mistake that is due today."}</li>
                <li>
                  {isAr
                    ? "بمجرد انتهائها يعود الموقع لشكله الطبيعي فوراً."
                    : "As soon as none are due, the app returns to normal instantly."}
                </li>
              </ol>
            </div>
            <Button
              className="mt-5 h-12 w-full"
              onClick={() => {
                setShow(false);
                markMistakesOpened();
                onOpenMistakes();
              }}
            >
              {isAr ? "راجع أخطائي الآن" : "Review my mistakes now"}
              <ArrowRight className={`ms-1 h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
