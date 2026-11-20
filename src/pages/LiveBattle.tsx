import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Check, Copy, Loader2, Shuffle, Swords, Trophy, User, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { AppLanguage } from "@/components/LanguageGate";
import { useFeatureUsed } from "@/hooks/useFeatureUsed";
import { BATTLE_QUESTION_SECONDS, useLiveBattle } from "@/hooks/useLiveBattle";
import { supabase } from "@/integrations/supabase/client";
import { consumePendingBattle, newRoomCode } from "@/lib/battleInvite";
import { loadRaceQuestionBank, type RaceQuestion } from "@/lib/raceQuestionBank";
import { selectBattleQuestions, type LiveBattleQuestion } from "@/lib/liveBattleBank";
import { toast } from "sonner";

const LABELS: Record<string, { ar: string; en: string }> = {
  physics: { ar: "الفيزياء", en: "Physics" }, chemistry: { ar: "الكيمياء", en: "Chemistry" },
  biology: { ar: "الأحياء", en: "Biology" }, math: { ar: "الرياضيات", en: "Math" },
  arabic: { ar: "العربية", en: "Arabic" }, english: { ar: "الإنكليزي", en: "English" },
  english_literature: { ar: "الأدب الإنكليزي", en: "English literature" },
  french: { ar: "الفرنسية", en: "French" }, islamic: { ar: "الإسلامية", en: "Islamic studies" },
};
type QueueChannel = ReturnType<typeof supabase.channel>;

export default function LiveBattle({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  useFeatureUsed("live_battle");
  const ar = language === "ar";
  const text = useCallback((arabic: string, english: string) => ar ? arabic : english, [ar]);
  const [name, setName] = useState(() => localStorage.getItem("app_display_name_v1") || text("لاعب", "Player"));
  const [bankLanguage, setBankLanguage] = useState<AppLanguage>(language);
  const [bank, setBank] = useState<RaceQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [partial, setPartial] = useState(false);
  const [retry, setRetry] = useState(0);
  const [subject, setSubject] = useState("physics");
  const [chapter, setChapter] = useState(0);
  const [count, setCount] = useState(10);
  const [joinCode, setJoinCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const cache = useRef(new Map<AppLanguage, { questions: RaceQuestion[]; partial: boolean }>());
  const pending = useRef<ReturnType<typeof consumePendingBattle>>(null);
  const pendingRead = useRef(false);
  const battle = useLiveBattle(name);
  const battleRef = useRef(battle);
  battleRef.current = battle;
  const [solo, setSolo] = useState<null | { questions: LiveBattleQuestion[]; index: number; score: number; picked: number | null; done: boolean; started: number }>(null);
  const soloRef = useRef(solo);
  soloRef.current = solo;
  const [soloSeconds, setSoloSeconds] = useState(BATTLE_QUESTION_SECONDS);
  const soloAnswered = useRef(false);
  const soloId = useRef("");
  const queue = useRef<QueueChannel | null>(null);
  const queueGeneration = useRef(0);
  const queueTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueLeave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matched = useRef(false);
  const awarded = useRef(new Set<string>());

  const stopQueue = useCallback(() => {
    queueGeneration.current++;
    if (queueTimeout.current !== null) clearTimeout(queueTimeout.current);
    if (queueLeave.current !== null) clearTimeout(queueLeave.current);
    queueTimeout.current = null; queueLeave.current = null;
    const old = queue.current; queue.current = null;
    if (old) void supabase.removeChannel(old);
  }, []);
  useEffect(() => () => stopQueue(), [stopQueue]);
  const reset = () => { stopQueue(); matched.current = false; setSearching(false); battle.reset(); setSolo(null); setMessage(""); };

  useEffect(() => {
    if (!pendingRead.current) {
      pendingRead.current = true;
      pending.current = consumePendingBattle();
      if (pending.current) {
        const p = pending.current;
        setBankLanguage(p.lang ?? language); setSubject(p.subject ?? "physics"); setChapter(p.chapter ?? 1); setCount(p.count ?? 10);
        if (!p.host) { battleRef.current.connect(p.code, false); pending.current = null; }
      }
    }
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setBank([]); setMessage("");
    const saved = cache.current.get(bankLanguage);
    const load = saved && retry === 0 ? Promise.resolve(saved) : loadRaceQuestionBank(bankLanguage, controller.signal);
    void load.then((result) => {
      if (controller.signal.aborted) return;
      if (!result.partial) cache.current.set(bankLanguage, result);
      setBank(result.questions); setPartial(result.partial); setLoading(false);
      const p = pending.current;
      if (p?.host && (p.lang ?? language) === bankLanguage) {
        pending.current = null;
        const qs = selectBattleQuestions(result.questions, p.subject ?? "physics", p.chapter ?? 1, p.count ?? 10, Number(p.code));
        if (qs.length) battleRef.current.connect(p.code, true, qs);
        else setMessage(text("ماكو أسئلة بالبنك لهذا الفصل والمنهج. اختَر فصلاً آخر.", "No bank questions for this chapter and curriculum. Choose another chapter."));
      }
    }).catch(() => {
      if (!controller.signal.aborted) { setLoading(false); setPartial(true); setMessage(text("تعذّر تحميل البنك، حاول مرة ثانية.", "Could not load the bank. Try again.")); }
    });
    return () => controller.abort();
  }, [bankLanguage, retry, language, text]);

  const subjects = useMemo(() => [...new Set(bank.map((q) => q.subject))].sort(), [bank]);
  const selectedSubject = subjects.includes(subject) ? subject : subjects[0] ?? "";
  const chapters = useMemo(() => [...new Set(bank.filter((q) => q.subject === selectedSubject).map((q) => q.chapter))].sort((a, b) => a - b), [bank, selectedSubject]);
  const selectedChapter = chapter && chapters.includes(chapter) ? chapter : 0;
  const available = useMemo(() => bank.filter((q) => q.subject === selectedSubject && (!selectedChapter || q.chapter === selectedChapter)), [bank, selectedSubject, selectedChapter]);
  const roundCount = Math.min(count, available.length);
  const pick = (seed: number) => selectBattleQuestions(bank, selectedSubject, selectedChapter, count, seed);
  const ready = !loading && roundCount > 0;
  const busy = searching || battle.phase !== "idle" || solo !== null;

  const award = useCallback(async (key: string, source: string, points: number) => {
    if (points <= 0 || awarded.current.has(key)) return;
    awarded.current.add(key);
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { error } = await supabase.rpc("award_points_safe", { _source: source, _points: points, _ref_id: key });
        if (!error) window.dispatchEvent(new CustomEvent("app:progress-updated"));
      }
    } catch { /* The battle result is still available if the points service is offline. */ }
  }, []);
  const myScore = battle.scores[battle.meId] ?? 0;
  const opponent = battle.players.find((p) => p.id !== battle.meId);
  const opponentScore = opponent ? battle.scores[opponent.id] ?? 0 : 0;
  useEffect(() => {
    if (battle.phase === "done") void award(battle.code, "live_battle", myScore * 2 + (myScore > opponentScore ? battle.questions.length : 0));
  }, [battle.phase, battle.code, battle.questions.length, myScore, opponentScore, award]);
  useEffect(() => {
    if (solo?.done) void award(soloId.current, "mcq", Math.min(5, solo.score));
  }, [solo?.done, solo?.score, award]);

  const locked = battle.phase === "countdown" || battle.phase === "playing";
  useEffect(() => {
    (window as Window & { __battleLocked?: boolean }).__battleLocked = locked;
    window.dispatchEvent(new CustomEvent("app:battle-lock", { detail: { locked } }));
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    if (locked) window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      (window as Window & { __battleLocked?: boolean }).__battleLocked = false;
      window.dispatchEvent(new CustomEvent("app:battle-lock", { detail: { locked: false } }));
    };
  }, [locked]);

  useEffect(() => {
    const run = soloRef.current;
    if (!run || run.done || run.picked !== null) return;
    const deadline = run.started + BATTLE_QUESTION_SECONDS * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSoloSeconds(left);
      if (!left) { soloAnswered.current = true; clearInterval(timer); }
    }, 200);
    return () => clearInterval(timer);
  }, [solo?.index, solo?.done, solo?.started, solo?.picked]);

  const startSolo = () => {
    if (!ready) return;
    soloId.current = `solo:${crypto.randomUUID()}`;
    soloAnswered.current = false; setSoloSeconds(BATTLE_QUESTION_SECONDS);
    setSolo({ questions: pick(Date.now()), index: 0, score: 0, picked: null, done: false, started: Date.now() });
  };
  const soloAnswer = (choice: number) => {
    const run = soloRef.current;
    if (!run || run.done || soloAnswered.current || Date.now() >= run.started + BATTLE_QUESTION_SECONDS * 1000) return;
    soloAnswered.current = true;
    setSolo({ ...run, picked: choice, score: run.score + Number(run.questions[run.index].answer === choice) });
  };
  const soloNext = () => {
    const run = soloRef.current;
    if (!run) return;
    if (run.index + 1 >= run.questions.length) { setSolo({ ...run, done: true }); return; }
    soloAnswered.current = false; setSoloSeconds(BATTLE_QUESTION_SECONDS);
    setSolo({ ...run, index: run.index + 1, picked: null, started: Date.now() });
  };
  const createRoom = () => {
    if (!ready) return;
    const code = newRoomCode();
    battle.connect(code, true, pick(Number(code)));
  };
  const joinRoom = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(joinCode)) return;
    battle.connect(joinCode, false);
  };
  const findOpponent = () => {
    if (!ready) return;
    stopQueue(); matched.current = false; setSearching(true); setMessage("");
    const token = queueGeneration.current;
    // Language and question count are part of matching, not just subject/chapter.
    const ch = supabase.channel(`battle:lobby:${bankLanguage}:${selectedSubject}:${selectedChapter}:${count}`, { config: { presence: { key: battle.meId } } });
    queue.current = ch;
    const active = () => token === queueGeneration.current && queue.current === ch;
    ch.on("presence", { event: "sync" }, () => {
      if (!active() || matched.current) return;
      const ids = Object.keys(ch.presenceState()).sort();
      if (ids.length < 2 || !ids.slice(0, 2).includes(battle.meId)) return;
      matched.current = true;
      if (queueTimeout.current !== null) clearTimeout(queueTimeout.current);
      let hash = 0;
      for (const char of ids.slice(0, 2).join(":")) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
      const code = String(100000 + (Math.abs(hash) % 900000));
      const host = ids[0] === battle.meId;
      battle.connect(code, host, host ? pick(Math.abs(hash)) : undefined);
      setSearching(false);
      // Give both students time to observe the same pair before leaving the queue.
      queueLeave.current = setTimeout(() => { if (active()) stopQueue(); }, 1500);
    });
    ch.subscribe(async (status) => {
      if (!active()) return;
      if (status === "SUBSCRIBED") {
        try { await ch.track({ name }); } catch { if (active()) { stopQueue(); setSearching(false); setMessage(text("تعذّر الاتصال. حاول مرة ثانية.", "Connection failed. Try again.")); } }
      } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status) && !matched.current) {
        stopQueue(); setSearching(false); setMessage(text("تعذّر الاتصال. حاول مرة ثانية.", "Connection failed. Try again."));
      }
    });
    queueTimeout.current = setTimeout(() => {
      if (!active() || matched.current) return;
      stopQueue(); setSearching(false); setMessage(text("ما لكينا منافس هسه. جرّب تحدّي صديق أو تدرّب وحدك.", "No opponent right now. Challenge a friend or practise solo."));
    }, 60000);
  };

  const question = solo && !solo.done ? solo.questions[solo.index] : battle.questions[battle.index];
  const playing = (solo && !solo.done) || battle.phase === "playing";
  const picked = solo ? solo.picked : battle.answered;
  const seconds = solo ? soloSeconds : battle.seconds;
  const revealed = picked !== null || seconds === 0;
  const index = solo ? solo.index : battle.index;
  const total = solo ? solo.questions.length : battle.questions.length;
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(battle.code); toast.success(text("تم نسخ الرمز", "Code copied")); }
    catch { toast.error(text("انسخ الرمز الظاهر وشاركه ويا صديقك.", "Copy the displayed code and share it with your friend.")); }
  };

  return (
    <main className="min-h-screen bg-background p-4 pb-28" dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-2xl space-y-5">
        <Button variant="ghost" disabled={locked} onClick={() => busy ? reset() : onBack()}><ArrowLeft className={ar ? "h-4 w-4 rotate-180" : "h-4 w-4"} />{text("رجوع", "Back")}</Button>
        <header className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-primary"><Swords className="h-5 w-5" />LIVE BATTLE</span>
          <h1 className="text-2xl font-black">{text("تحدّي سريع، وأسئلة جاهزة", "Quick battle. Ready questions.")}</h1>
          {!busy && <p className="text-sm leading-6 text-muted-foreground">{text("اختَر المادة والفصل، والعب من بنك الـMCQ الموجود بتميّزك.", "Choose a subject and chapter, then play from Tamayzak’s MCQ bank.")}</p>}
        </header>
        {message && <p role="status" className="rounded-xl border bg-secondary p-4 text-sm">{message}</p>}

        {!busy && <>
          <section className="space-y-4 rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-bold"><BookOpen className="h-4 w-4 text-primary" />{text("أسئلة من البنك", "Questions from the bank")}</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="min-w-0 space-y-2 text-sm">{text("المادة", "Subject")}
                <select className="block min-h-11 min-w-0 w-full rounded-xl border bg-background px-3" value={selectedSubject} disabled={loading || !subjects.length} onChange={(e) => { setSubject(e.target.value); setChapter(0); }}>
                  {!subjects.length && <option value="">{text("لا توجد مواد متاحة", "No subjects available")}</option>}
                  {subjects.map((s) => <option key={s} value={s}>{LABELS[s]?.[language] ?? s}</option>)}
                </select>
              </label>
              <label className="min-w-0 space-y-2 text-sm">{text("الفصل", "Chapter")}
                <select className="block min-h-11 min-w-0 w-full rounded-xl border bg-background px-3" value={selectedChapter} disabled={loading || !chapters.length} onChange={(e) => setChapter(Number(e.target.value))}>
                  <option value={0}>{text("كل الفصول المتاحة", "All available chapters")}</option>
                  {chapters.map((c) => <option key={c} value={c}>{text(`الفصل ${c}`, `Chapter ${c}`)}</option>)}
                </select>
              </label>
            </div>
            <details className="rounded-xl border p-3">
              <summary className="cursor-pointer text-sm font-medium">{text("خيارات الجولة", "Round options")}</summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="min-w-0 space-y-2 text-sm">{text("لغة الأسئلة", "Question language")}
                  <select className="block min-h-11 min-w-0 w-full rounded-xl border bg-background px-3" value={bankLanguage} onChange={(e) => { setBankLanguage(e.target.value as AppLanguage); setChapter(0); setRetry(0); }}>
                    <option value="ar">عربي</option><option value="en">English</option>
                  </select>
                </label>
                <label className="min-w-0 space-y-2 text-sm">{text("عدد الأسئلة", "Questions")}
                  <select className="block min-h-11 min-w-0 w-full rounded-xl border bg-background px-3" value={count} onChange={(e) => setCount(Number(e.target.value))}>{[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}</select>
                </label>
                <label className="col-span-2 space-y-2 text-sm">{text("اسمك", "Your name")}<Input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} /></label>
              </div>
            </details>
            {loading ? <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />{text("جاري تحميل البنك…", "Loading bank…")}</p>
              : <p className="text-sm text-muted-foreground">{text(`${roundCount} أسئلة · ٢٥ ثانية للسؤال · ${available.length} سؤال متاح`, `${roundCount} questions · 25 seconds each · ${available.length} available`)}</p>}
            {!loading && (partial || !available.length) && <div className="min-w-0 space-y-2 text-sm"><p>{partial ? text("بعض أسئلة البنك ما تحمّلت. نعرض المتاح حالياً.", "Some bank questions could not load. Showing available questions.") : text("ماكو أسئلة بهذا الاختيار. غيّر المادة أو لغة الأسئلة.", "No questions for this selection. Change the subject or question language.")}</p><Button variant="outline" size="sm" onClick={() => setRetry((n) => n + 1)}>{text("إعادة التحميل", "Retry loading")}</Button></div>}
          </section>
          <Button size="lg" className="min-h-14 w-full gap-2 rounded-2xl text-base font-bold" disabled={!ready} onClick={createRoom}><Users className="h-5 w-5" />{text("تحدّ صديق", "Challenge a friend")}</Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="min-h-14 gap-2 rounded-2xl px-2 text-xs sm:px-4 sm:text-sm" disabled={!ready} onClick={findOpponent}><Shuffle className="h-4 w-4" />{text("منافس عشوائي", "Random opponent")}</Button>
            <Button variant="outline" className="min-h-14 gap-2 rounded-2xl px-2 text-xs sm:px-4 sm:text-sm" disabled={!ready} onClick={startSolo}><User className="h-4 w-4" />{text("تدرّب وحدك", "Practise solo")}</Button>
          </div>
          <form onSubmit={joinRoom} className="space-y-3 rounded-2xl border bg-card p-4">
            <label htmlFor="battle-code" className="block text-sm font-bold">{text("عندك رمز من صديقك؟", "Have a friend’s room code?")}</label>
            <div className="flex gap-2"><Input id="battle-code" value={joinCode} placeholder="123456" inputMode="numeric" autoComplete="off" maxLength={6} dir="ltr" className="min-w-0 text-center font-mono tracking-widest" onChange={(e) => setJoinCode(e.target.value.replace(/[٠-٩]/g, (n) => String(n.charCodeAt(0) - 1632)).replace(/\D/g, "").slice(0, 6))} /><Button type="submit" disabled={!/^\d{6}$/.test(joinCode)}>{text("انضم", "Join")}</Button></div>
          </form>
        </>}

        {searching && <section className="space-y-4 rounded-2xl border p-6 text-center"><Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" /><h2 className="font-bold">{text("ندورلك على منافس…", "Finding an opponent…")}</h2><p className="text-sm text-muted-foreground">{LABELS[selectedSubject]?.[language] ?? selectedSubject} · {selectedChapter ? text(`الفصل ${selectedChapter}`, `Chapter ${selectedChapter}`) : text("كل الفصول", "All chapters")} · {bankLanguage === "ar" ? "عربي" : "English"}</p><Button variant="outline" onClick={reset}>{text("إلغاء البحث", "Cancel search")}</Button></section>}
        {battle.phase === "lobby" && <section className="space-y-5 rounded-2xl border bg-card p-6 text-center"><h2 className="font-bold">{text("شارك الرمز ويا صديقك", "Share the code with your friend")}</h2><div className="flex items-center justify-center gap-2"><span dir="ltr" className="font-mono text-4xl font-black tracking-widest">{battle.code}</span><Button variant="ghost" size="icon" aria-label={text("نسخ الرمز", "Copy code")} onClick={() => void copyCode()}><Copy className="h-4 w-4" /></Button></div><p role="status" className="text-sm text-muted-foreground">{text("بانتظار اللاعب الثاني… الجولة تبدأ تلقائياً.", "Waiting for the second player… The round starts automatically.")}</p><Button variant="outline" onClick={reset}>{text("إلغاء الغرفة", "Cancel room")}</Button></section>}
        {battle.phase === "countdown" && <div className="space-y-4 py-12 text-center"><p>{text("جهّز نفسك!", "Get ready!")}</p><div className="text-7xl font-black text-primary">{battle.countdown}</div></div>}

        {playing && question && <section className="space-y-4">
          {!solo && <div className="grid grid-cols-2 gap-3">{battle.players.map((p) => <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl border bg-card p-3"><span className="truncate text-sm">{p.id === battle.meId ? text("أنت", "You") : p.name}</span><b>{battle.scores[p.id] ?? 0}</b></div>)}</div>}
          <div className="flex justify-between text-sm"><span>{text("السؤال", "Question")} {index + 1} / {total}</span><span className={seconds <= 5 ? "font-bold text-destructive" : ""}>{seconds} {text("ثانية", "seconds")}</span></div>
          <Progress value={seconds / BATTLE_QUESTION_SECONDS * 100} className="h-2" />
          <article className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
            <h2 dir="auto" className="break-words whitespace-pre-wrap text-lg font-bold leading-8">{question.q}</h2>
            <div className="grid gap-3">{question.choices.map((choice, i) => <button key={i} disabled={revealed} dir="auto" onClick={() => {
              if (solo) soloAnswer(i);
              else if (battle.answer(i) === true) void award(`${battle.code}:${index}`, "live_battle", 1);
            }} className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border p-4 text-start leading-7 transition-colors ${revealed ? i === question.answer ? "border-emerald-500 bg-emerald-50 text-emerald-950" : picked === i ? "border-rose-500 bg-rose-50 text-rose-950" : "opacity-60" : "hover:border-primary hover:bg-primary/5"}`}><span className="min-w-0 break-words whitespace-pre-wrap">{choice}</span>{revealed && i === question.answer && <Check className="h-5 w-5 shrink-0" />}{revealed && picked === i && i !== question.answer && <X className="h-5 w-5 shrink-0" />}</button>)}</div>
            {revealed && <div role="status" className="min-w-0 space-y-2 text-sm"><p className="font-bold">{picked === null ? text("خلص الوقت. هاي الإجابة الصحيحة.", "Time’s up. Here is the correct answer.") : picked === question.answer ? text("عاشت إيدك! إجابة صحيحة.", "Correct! Well done.") : text("مو مشكلة، راجع الإجابة الصحيحة.", "Review the correct answer and keep going.")}</p>{solo && question.explanation && <p dir="auto" className="whitespace-pre-wrap leading-7 text-muted-foreground">{question.explanation}</p>}{!solo && <p className="text-muted-foreground">{text("ننتقل بعد جواب الطرفين أو انتهاء الوقت.", "Next question after both answers or when time runs out.")}</p>}</div>}
          </article>
          {solo && revealed && <Button className="w-full" onClick={soloNext}>{index + 1 === total ? text("شوف النتيجة", "See result") : text("السؤال التالي", "Next question")}</Button>}
        </section>}

        {(battle.phase === "done" || solo?.done) && <section className="space-y-5 rounded-2xl border bg-card p-6 text-center"><Trophy className="mx-auto h-16 w-16 text-amber-500" /><h2 className="text-2xl font-black">{solo ? text("خلصت الجولة!", "Round complete!") : myScore === opponentScore ? text("تعادل!", "It’s a tie!") : myScore > opponentScore ? text("فزت بالتحدّي!", "You won!") : text("محاولة حلوة، جرّب مرة ثانية!", "Good effort. Try again!")}</h2><p className="text-lg">{solo ? `${solo.score} / ${solo.questions.length}` : `${myScore} — ${opponentScore}`}</p><Button onClick={reset}>{text("العب مرة ثانية", "Play again")}</Button></section>}
        {battle.phase === "disconnected" && <section className="space-y-4 rounded-2xl border p-6 text-center"><h2 className="font-bold">{text("انقطع الاتصال بالغرفة", "Room connection lost")}</h2><p className="text-sm text-muted-foreground">{text("ممكن اللاعب غادر أو الاتصال انقطع. ارجع وأنشئ تحدّياً جديداً.", "A player left or the connection was interrupted. Start a new challenge.")}</p><Button onClick={reset}>{text("رجوع للتحدّيات", "Back to battles")}</Button></section>}
      </div>
    </main>
  );
}
