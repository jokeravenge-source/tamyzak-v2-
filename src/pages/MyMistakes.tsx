import { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, Loader2, AlertTriangle, CalendarClock, Eye, Trophy, Frown } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { fetchAllMistakes, resolveMistake, type Mistake } from "@/lib/mistakes";
import { markMistakesOpened, liftMistakesPunishment } from "@/components/MistakesPunishment";

const SOURCE_LABELS: Record<string, { ar: string; en: string }> = {
  mcq_bank: { ar: "بنك الأسئلة", en: "MCQ Bank" },
  mcq_generator: { ar: "مولّد الأسئلة", en: "MCQ Generator" },
  daily_gift: { ar: "هدية اليوم", en: "Daily gift" },
  daily_game: { ar: "لعبة اليوم", en: "Daily game" },
  challenge: { ar: "التحدي", en: "Challenge" },
  flashcard: { ar: "البطاقات", en: "Flashcards" },
  other: { ar: "أخرى", en: "Other" },
};

const asChoices = (v: unknown): string[] =>
  Array.isArray(v) ? (v as unknown[]).map(String).filter(Boolean) : [];

export default function MyMistakes({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const isAr = language === "ar";
  const Back = isAr ? ArrowRight : ArrowLeft;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Mistake[]>([]);
  const [mode, setMode] = useState<"list" | "redo">("list");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ right: 0, wrong: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await fetchAllMistakes());
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const now = Date.now();
  const due = useMemo(
    () => items.filter((m) => !m.resolved && new Date(m.next_review_at).getTime() <= now),
    [items, now],
  );
  const upcoming = useMemo(
    () => items.filter((m) => !m.resolved && new Date(m.next_review_at).getTime() > now),
    [items, now],
  );
  const resolved = useMemo(() => items.filter((m) => m.resolved), [items]);

  const deck = due.length ? due : upcoming;
  const current = deck[index];
  const choices = asChoices(current?.choices);

  const answer = useCallback(async (value: string | null, correct: boolean) => {
    if (!current || revealed) return;
    setPicked(value);
    setRevealed(true);
    setScore((s) => ({ right: s.right + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
    if (correct) confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
    await resolveMistake(current.id, correct);
  }, [current, revealed]);

  const next = () => {
    setPicked(null);
    setRevealed(false);
    if (index + 1 >= deck.length) { setMode("list"); setIndex(0); void load(); }
    else setIndex((i) => i + 1);
  };

  const header = (
    <div className="flex items-center gap-3 mb-6">
      <Button variant="ghost" size="icon" onClick={() => (mode === "redo" ? (setMode("list"), setIndex(0), setRevealed(false), setPicked(null)) : onBack())} aria-label={isAr ? "رجوع" : "Back"}>
        <Back className="w-5 h-5" />
      </Button>
      <h1 className="text-xl font-bold">{isAr ? "أخطائي" : "My mistakes"}</h1>
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center" dir={isAr ? "rtl" : "ltr"}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  if (mode === "redo" && current) {
    const correctAnswer = current.correct_answer ?? "";
    return (
      <main className="min-h-screen px-4 py-8 pb-28" dir={isAr ? "rtl" : "ltr"}>
        {header}
        <div className="max-w-2xl">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>{index + 1} / {deck.length}</span>
            <span>{score.right} ✓ · {score.wrong} ✗</span>
          </div>
          <motion.div key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-secondary/40 p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {(SOURCE_LABELS[current.source] ?? SOURCE_LABELS.other)[isAr ? "ar" : "en"]}
              {current.subject ? ` · ${current.subject}` : ""}
            </p>
            <h2 className="text-lg font-semibold mb-4 whitespace-pre-wrap">{current.question}</h2>

            {choices.length > 0 ? (
              <div className="space-y-2">
                {choices.map((c, i) => {
                  const isAnswer = revealed && correctAnswer && c === correctAnswer;
                  const isWrongPick = revealed && picked === c && c !== correctAnswer;
                  return (
                    <button
                      key={i}
                      disabled={revealed}
                      onClick={() => void answer(c, c === correctAnswer)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3 text-start transition-colors ${
                        isAnswer ? "border-emerald-500 bg-emerald-500/10"
                        : isWrongPick ? "border-rose-500 bg-rose-500/10"
                        : "border-white/10 hover:border-primary/50"
                      }`}
                    >
                      <span className="w-7 h-7 shrink-0 grid place-items-center rounded-full border border-white/15 text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{c}</span>
                      {isAnswer && <Check className="w-5 h-5 text-emerald-500" />}
                      {isWrongPick && <X className="w-5 h-5 text-rose-500" />}
                    </button>
                  );
                })}
              </div>
            ) : !revealed ? (
              <Button variant="secondary" onClick={() => setRevealed(true)}>
                <Eye className="w-4 h-4 me-1" />{isAr ? "أظهر الإجابة" : "Show answer"}
              </Button>
            ) : (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-primary mb-1">{isAr ? "الإجابة" : "Answer"}</p>
                <p className="text-sm whitespace-pre-wrap">{correctAnswer || (isAr ? "غير متوفرة" : "Not available")}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => void resolveMistake(current.id, true).then(next)}>
                    {isAr ? "حفظتها ✅" : "I know it ✅"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void resolveMistake(current.id, false).then(next)}>
                    {isAr ? "أعدها لاحقاً" : "Show again later"}
                  </Button>
                </div>
              </div>
            )}

            <AnimatePresence>
              {revealed && choices.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-white/10 bg-background/40 p-4 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full grid place-items-center mb-2 bg-background/60">
                    {picked === correctAnswer ? <Trophy className="w-6 h-6 text-emerald-500" /> : <Frown className="w-6 h-6 text-rose-500" />}
                  </div>
                  <p className="font-bold">
                    {picked === correctAnswer
                      ? (isAr ? "أحسنت! تم شطب الخطأ" : "Nice! Mistake cleared")
                      : (isAr ? "سنعيده بعد 3 أيام" : "We'll bring it back in 3 days")}
                  </p>
                  {current.explanation && <p className="mt-2 text-sm text-muted-foreground">{current.explanation}</p>}
                  <Button className="mt-4" onClick={next}>
                    {index + 1 >= deck.length ? (isAr ? "إنهاء" : "Finish") : (isAr ? "التالي" : "Next")}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 pb-28" dir={isAr ? "rtl" : "ltr"}>
      {header}
      <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
        {isAr
          ? "كل سؤال تخطئ فيه في الموقع يُحفظ هنا، ويعود لك للمراجعة بعد 3 أيام حتى تتقنه."
          : "Every question you get wrong anywhere in the app is saved here and comes back for review after 3 days until you master it."}
      </p>

      {items.length === 0 ? (
        <p className="text-muted-foreground">{isAr ? "لا توجد أخطاء محفوظة — استمر! 🎉" : "No saved mistakes — keep it up! 🎉"}</p>
      ) : (
        <div className="max-w-2xl space-y-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { n: due.length, l: isAr ? "للمراجعة الآن" : "Due now" },
              { n: upcoming.length, l: isAr ? "قادمة" : "Upcoming" },
              { n: resolved.length, l: isAr ? "أتقنتها" : "Mastered" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-secondary/40 p-3">
                <p className="text-2xl font-black tabular-nums">{s.n}</p>
                <p className="text-[11px] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>

          {deck.length > 0 && (
            <Button
              className="w-full h-12"
              onClick={() => { setMode("redo"); setIndex(0); setPicked(null); setRevealed(false); setScore({ right: 0, wrong: 0 }); }}
            >
              {due.length > 0 ? <CalendarClock className="w-4 h-4 me-1" /> : <AlertTriangle className="w-4 h-4 me-1" />}
              {due.length > 0
                ? (isAr ? `راجع أخطاءك (${due.length})` : `Review your mistakes (${due.length})`)
                : (isAr ? "تدرّب على الأخطاء القادمة" : "Practice upcoming mistakes")}
            </Button>
          )}

          <div className="space-y-2">
            {items.map((m) => (
              <div key={m.id} className={`rounded-xl border p-3 ${m.resolved ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-secondary/30"}`}>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {(SOURCE_LABELS[m.source] ?? SOURCE_LABELS.other)[isAr ? "ar" : "en"]}
                  {m.subject ? ` · ${m.subject}` : ""}
                  {` · ${isAr ? "خطأ" : "wrong"} ×${m.times_wrong}`}
                </p>
                <p className="mt-1 text-sm line-clamp-2">{m.question}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {m.resolved
                    ? (isAr ? "تم إتقانها" : "Mastered")
                    : `${isAr ? "المراجعة" : "Review"}: ${new Date(m.next_review_at).toLocaleDateString(isAr ? "ar" : "en")}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
