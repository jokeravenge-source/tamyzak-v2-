import { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, Loader2, AlertTriangle, CalendarClock, Eye, Trophy, Frown } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { fetchAllMistakes, recordMistake, resolveMistake, type Mistake } from "@/lib/mistakes";
import { cardKey, fetchDueFlashcards, loadDeckStates, rateCard, type DueFlashcard, type SrsRating } from "@/lib/srs";
import { recordTopicPractice } from "@/lib/topicMastery";
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
  const [dueCards, setDueCards] = useState<DueFlashcard[]>([]);
  const [mode, setMode] = useState<"list" | "redo" | "daily">("list");
  const [reviewDeck, setReviewDeck] = useState<Mistake[]>([]);
  const [dailyDeck, setDailyDeck] = useState<({ kind: "mistake"; item: Mistake } | { kind: "card"; item: DueFlashcard })[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [recall, setRecall] = useState("");
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState({ right: 0, wrong: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const [list, cards] = await Promise.all([fetchAllMistakes(), fetchDueFlashcards()]);
    setItems(list);
    setDueCards(cards);
    const stillDue = list.some((m) => !m.resolved && new Date(m.next_review_at).getTime() <= Date.now());
    if (!stillDue) liftMistakesPunishment();
    setLoading(false);
  }, []);

  useEffect(() => { markMistakesOpened(); void load(); }, [load]);

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

  const eligibleCards = dueCards.filter((card) => !items.some((mistake) =>
    !mistake.resolved && mistake.source === "flashcard" && mistake.subject === card.subject
    && mistake.chapter === card.chapter && mistake.question === card.question));
  const dailyMistakes = due.filter((m) => m.source !== "flashcard" || !m.question.startsWith("Review ") && !m.question.startsWith("مراجعة بطاقات "));
  const current = mode === "daily" ? (dailyDeck[index]?.kind === "mistake" ? dailyDeck[index].item as Mistake : undefined) : reviewDeck[index];
  const currentCard = mode === "daily" && dailyDeck[index]?.kind === "card" ? dailyDeck[index].item as DueFlashcard : undefined;
  const reviewLength = mode === "daily" ? dailyDeck.length : reviewDeck.length;
  const choices = asChoices(current?.choices);

  const begin = (selected: Mistake[]) => {
    setReviewDeck(selected);
    setMode("redo"); setIndex(0); setPicked(null); setRevealed(false); setRecall(""); setScore({ right: 0, wrong: 0 });
  };
  const beginDaily = () => {
    const queue: typeof dailyDeck = [];
    for (let i = 0; queue.length < 10 && (i < dailyMistakes.length || i < eligibleCards.length); i++) {
      if (dailyMistakes[i] && queue.length < 10) queue.push({ kind: "mistake", item: dailyMistakes[i] });
      if (eligibleCards[i] && queue.length < 10) queue.push({ kind: "card", item: eligibleCards[i] });
    }
    setDailyDeck(queue);
    setMode("daily"); setIndex(0); setPicked(null); setRevealed(false); setRecall(""); setScore({ right: 0, wrong: 0 });
  };

  const answer = useCallback(async (value: string | null, correct: boolean) => {
    if (!current || revealed) return;
    setPicked(value);
    setRevealed(true);
    setScore((s) => ({ right: s.right + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
    if (correct) confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
    await resolveMistake(current.id, correct);
    if (current.subject && current.chapter && (current.source === "mcq_bank" && choices.length > 0 || current.source === "flashcard" && !current.question.startsWith("Review ") && !current.question.startsWith("مراجعة بطاقات "))) {
      void recordTopicPractice({ subject: current.subject, chapter: current.chapter, question: current.question,
        context: current.correct_answer ?? "", source: current.source === "flashcard" ? "flashcards" : "mcq_bank", correct });
      if (current.source === "flashcard" && current.correct_answer) {
        const states = await loadDeckStates(current.subject, current.chapter);
        await rateCard({ subject: current.subject, chapter: current.chapter, language: current.language === "en" ? "en" : "ar",
          card: { q: current.question, a: current.correct_answer }, rating: correct ? "good" : "forgot",
          prev: states.get(cardKey(current.subject, current.chapter, current.question)) });
      }
    }
  }, [current, revealed, choices.length]);

  const rateDailyCard = async (rating: SrsRating) => {
    if (!currentCard || busy) return;
    setBusy(true);
    const correct = rating === "good" || rating === "easy";
    const states = await loadDeckStates(currentCard.subject, currentCard.chapter);
    await rateCard({ subject: currentCard.subject, chapter: currentCard.chapter,
      language: currentCard.language === "en" ? "en" : "ar", card: { q: currentCard.question, a: currentCard.answer },
      rating, prev: states.get(currentCard.card_key) });
    if (!correct) await recordMistake({ source: "flashcard", refId: `card:${currentCard.card_key}:${currentCard.language}`,
      subject: currentCard.subject, chapter: currentCard.chapter, language: currentCard.language,
      question: currentCard.question, correctAnswer: currentCard.answer, userAnswer: rating === "forgot" ? "Forgot" : "Hard" });
    void recordTopicPractice({ subject: currentCard.subject, chapter: currentCard.chapter, question: currentCard.question,
      context: currentCard.answer, source: "flashcards", correct });
    setScore((s) => ({ right: s.right + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
    setBusy(false);
    next();
  };

  const next = () => {
    setPicked(null);
    setRevealed(false);
    setRecall("");
    if (index + 1 >= reviewLength) { setMode("list"); setIndex(0); void load(); }
    else setIndex((i) => i + 1);
  };

  const header = (
    <div className="flex items-center gap-3 mb-6">
      <Button variant="ghost" size="icon" onClick={() => (mode !== "list" ? (setMode("list"), setIndex(0), setRevealed(false), setPicked(null), void load()) : onBack())} aria-label={isAr ? "رجوع" : "Back"}>
        <Back className="w-5 h-5" />
      </Button>
      <h1 className="text-xl font-bold">{mode === "daily" ? (isAr ? "مراجعة اليوم" : "Daily review") : (isAr ? "أخطائي" : "My mistakes")}</h1>
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center" dir={isAr ? "rtl" : "ltr"}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  if (mode === "daily" && currentCard) {
    return (
      <main className="min-h-screen px-4 py-8 pb-28" dir={isAr ? "rtl" : "ltr"}>
        {header}
        <div className="max-w-2xl rounded-2xl border border-border bg-card p-5">
          <p className="mb-3 text-sm text-muted-foreground">{index + 1} / {reviewLength} · {score.right} ✓ · {score.wrong} ✗ · {isAr ? "بطاقة" : "Flashcard"} · {currentCard.subject}</p>
          <h2 className="mb-4 text-lg font-semibold whitespace-pre-wrap">{currentCard.question}</h2>
          {!revealed ? <>
            <label className="block text-sm text-muted-foreground">{isAr ? "حاول تذكر الإجابة أولاً (اختياري)" : "Try to recall the answer first (optional)"}</label>
            <textarea value={recall} onChange={(e) => setRecall(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-border bg-background p-3" />
            <Button className="mt-3" onClick={() => setRevealed(true)}><Eye className="me-2 h-4 w-4" />{isAr ? "أظهر الإجابة" : "Show answer"}</Button>
          </> : <>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="mb-1 text-sm font-semibold text-primary">{isAr ? "الإجابة الصحيحة" : "Correct answer"}</p>
              <p className="whitespace-pre-wrap">{currentCard.answer}</p>
              {recall.trim() && <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">{isAr ? "إجابتك: " : "Your recall: "}{recall}</p>}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{isAr ? "قيّم تذكرك للإجابة" : "Rate how well you recalled it"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["forgot", "hard", "good", "easy"] as const).map((rating) => <Button key={rating} variant={rating === "forgot" ? "destructive" : "secondary"} disabled={busy} onClick={() => void rateDailyCard(rating)}>{({ forgot: isAr ? "نسيت" : "Forgot", hard: isAr ? "صعب" : "Hard", good: isAr ? "جيد" : "Good", easy: isAr ? "سهل" : "Easy" })[rating]}</Button>)}
            </div>
          </>}
        </div>
      </main>
    );
  }

  if ((mode === "redo" || mode === "daily") && current) {
    const correctAnswer = current.correct_answer ?? "";
    return (
      <main className="min-h-screen px-4 py-8 pb-28" dir={isAr ? "rtl" : "ltr"}>
        {header}
        <div className="max-w-2xl">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>{index + 1} / {reviewLength}</span>
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
            ) : !revealed ? (<div>
              <label className="block text-sm text-muted-foreground">{isAr ? "حاول الإجابة قبل الكشف (اختياري)" : "Try answering before revealing (optional)"}</label>
              <textarea value={recall} onChange={(e) => setRecall(e.target.value)} rows={3} className="my-3 w-full rounded-xl border border-border bg-background p-3" />
              <Button variant="secondary" onClick={() => setRevealed(true)}><Eye className="w-4 h-4 me-1" />{isAr ? "أظهر الإجابة" : "Show answer"}</Button>
            </div>
            ) : (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-primary mb-1">{isAr ? "الإجابة" : "Answer"}</p>
                <p className="text-sm whitespace-pre-wrap">{correctAnswer || (isAr ? "غير متوفرة" : "Not available")}</p>
                {recall.trim() && <p className="mt-3 text-sm text-muted-foreground">{isAr ? "إجابتك: " : "Your recall: "}{recall}</p>}
                <p className="mt-3 text-sm text-muted-foreground">{current.explanation || (isAr ? "راجع الفرق بين إجابتك والنموذج، ثم حاول استرجاع الإجابة قبل المراجعة القادمة." : "Compare your recall with the answer, then try recalling it again at the next review.")}</p>
                <p className="mt-3 text-xs text-muted-foreground">{isAr ? "قارن إجابتك بالنموذج وقيّم نفسك بصدق." : "Compare your recall with the answer and rate yourself."}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => void answer(recall, true).then(next)}>
                    {isAr ? "أجبت صح ✅" : "I got it right ✅"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void answer(recall, false).then(next)}>
                    {isAr ? "أعدها لاحقاً" : "Review again later"}
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
                  {correctAnswer && <p className="mt-2 text-sm text-muted-foreground">{isAr ? "الإجابة الصحيحة: " : "Correct answer: "}{correctAnswer}</p>}
                  {!current.explanation && <p className="mt-2 text-sm text-muted-foreground">{isAr ? "راجع سبب اختلاف اختيارك عن الإجابة الصحيحة قبل المحاولة القادمة." : "Compare your choice with the correct answer before your next attempt."}</p>}
                  <Button className="mt-4" onClick={next}>
                    {index + 1 >= reviewLength ? (isAr ? "إنهاء" : "Finish") : (isAr ? "التالي" : "Next")}
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

      {(dailyMistakes.length > 0 || eligibleCards.length > 0) && <Button className="mb-5 h-12 w-full max-w-2xl" onClick={beginDaily}>
        {isAr ? `مراجعة اليوم · ${Math.min(10, dailyMistakes.length + eligibleCards.length)} أسئلة وبطاقات` : `Daily review · ${Math.min(10, dailyMistakes.length + eligibleCards.length)} questions and cards`}
      </Button>}

      {items.length === 0 && dueCards.length === 0 ? (
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

          {(due.length > 0 || upcoming.length > 0) && (
            <Button
              className="w-full h-12"
              onClick={() => begin(due.length ? due : upcoming)}
            >
              {due.length > 0 ? <CalendarClock className="w-4 h-4 me-1" /> : <AlertTriangle className="w-4 h-4 me-1" />}
              {due.length > 0
                ? (isAr ? `راجع أخطاءك (${due.length})` : `Review your mistakes (${due.length})`)
                : (isAr ? "تدرّب على الأخطاء القادمة" : "Practice upcoming mistakes")}
            </Button>
          )}

          <div className="space-y-2">
            {items.map((m) => (
              <button type="button" key={m.id} onClick={() => begin([m])} className={`w-full rounded-xl border p-3 text-start hover:border-primary/60 ${m.resolved ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-secondary/30"}`}>
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
                <p className="mt-2 text-xs font-semibold text-primary">{isAr ? "أعد المحاولة ←" : "Retry question →"}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
