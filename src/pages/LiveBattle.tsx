import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Check, Copy, Loader2, Shuffle, Swords, Trophy, User, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { AppLanguage } from "@/components/LanguageGate";
import { useFeatureUsed } from "@/hooks/useFeatureUsed";
import { BATTLE_QUESTION_SECONDS, useLiveBattle } from "@/hooks/useLiveBattle";
import { supabase } from "@/integrations/supabase/client";
import { consumePendingBattle, isGroupBattleCode, newRoomCode } from "@/lib/battleInvite";
import { loadRaceQuestionBank, type RaceQuestion } from "@/lib/raceQuestionBank";
import { selectBattleQuestions, type LiveBattleQuestion } from "@/lib/liveBattleBank";
import { toast } from "sonner";
import { useBattleChannel } from "@/hooks/useBattleChannel";
import { battleChannelError } from "@/lib/battleChannel";
import { clearBattleChannelLink, pendingBattleChannelId } from "@/lib/battleChannelLink";
import BattleJoinPanel from "@/components/BattleJoinPanel";
import StudyRoyale from "@/components/StudyRoyale";
import { createRoyale, getRoyale } from "@/lib/sessionRoyale";
import { battleChallengeStatus, BATTLE_INVITE_LIFETIME, cancelBattleChallenge, sendBattleChallenge, type BattleStudent } from "@/lib/battleChallenges";

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
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [royale, setRoyale] = useState<{ id: string; host: boolean } | null>(null);
  const [outgoing, setOutgoing] = useState<{ id: string; name: string; expiresAt: number } | null>(null);
  const outgoingRef = useRef<string | null>(null);
  const mounted = useRef(true);
  const sending = useRef(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const cache = useRef(new Map<AppLanguage, { questions: RaceQuestion[]; partial: boolean }>());
  const pending = useRef<ReturnType<typeof consumePendingBattle>>(null);

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
  const publicQuestions = useRef<LiveBattleQuestion[]>([]);

  const stopQueue = useCallback(() => {
    queueGeneration.current++;
    if (queueTimeout.current !== null) clearTimeout(queueTimeout.current);
    if (queueLeave.current !== null) clearTimeout(queueLeave.current);
    queueTimeout.current = null; queueLeave.current = null;
    const old = queue.current; queue.current = null;
    if (old) void supabase.removeChannel(old);
  }, []);
  useEffect(() => () => stopQueue(), [stopQueue]);
  const clearInvitation = useCallback(() => {
    const id = outgoingRef.current; outgoingRef.current = null;
    if (id) void cancelBattleChallenge(id).catch(() => {});
  }, []);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearInvitation(); }; }, [clearInvitation]);
  const publicBattle = useBattleChannel((room) => {
    stopQueue(); setSearching(false); setSolo(null);
    if (room.is_host && !publicQuestions.current.length) { setMessage(text("تعذّر استعادة أسئلة الغرفة. أنشئ تحدّي جديد.", "Could not restore the room questions. Create a new challenge.")); return; }
    setBankLanguage(room.language); setSubject(room.subject); setChapter(room.chapter); setCount([5, 10, 15, 20].find((value) => value >= room.question_count) ?? 20);
    battleRef.current.connect(`tg:${room.room_key}`, room.is_host, room.is_host ? publicQuestions.current : undefined);
  }, () => { battleRef.current.reset(); });
  const { join: joinPublishedBattle, markStarted: markPublishedBattleStarted, cancel: cancelPublishedBattle } = publicBattle;
  useEffect(() => {
    const id = pendingBattleChannelId();
    if (id) void joinPublishedBattle(id).then(clearBattleChannelLink);
  }, [joinPublishedBattle]);
  useEffect(() => {
    if (battle.phase === "countdown" || battle.phase === "playing") markPublishedBattleStarted();
  }, [battle.phase, markPublishedBattleStarted]);
  const reset = () => { publicBattle.cancel(); clearInvitation(); setOutgoing(null); stopQueue(); matched.current = false; setSearching(false); battle.reset(); setSolo(null); setMessage(""); };

  useEffect(() => {
    const receive = () => {
      const p = consumePendingBattle();
      if (!p) return;
      cancelPublishedBattle();
      clearInvitation(); setOutgoing(null); stopQueue(); setSearching(false); setSolo(null); battleRef.current.reset();
      if (isGroupBattleCode(p.code)) {
        setRoyale({ id: p.code.slice(3), host: p.host });
        return;
      }
      setRoyale(null);
      pending.current = p;
      setBankLanguage(p.lang ?? language); setSubject(p.subject ?? "physics"); setChapter(p.chapter ?? 1); setCount([5, 10, 15, 20].includes(p.count ?? 10) ? p.count ?? 10 : 10);
      if (!p.host) { battleRef.current.connect(p.code, false); pending.current = null; }
      else setRetry((n) => n + 1);
    };
    receive();
    window.addEventListener("app:join-battle", receive);
    window.addEventListener("app:open-battle", receive);
    return () => { window.removeEventListener("app:join-battle", receive); window.removeEventListener("app:open-battle", receive); };
  }, [language, clearInvitation, stopQueue, cancelPublishedBattle]);

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
  const busy = searching || battle.phase !== "idle" || solo !== null || publicBattle.pending || publicBattle.room !== null;

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
  const findChannelOpponent = () => {
    if (!ready || publicBattle.pending) return;
    publicQuestions.current = pick(Date.now());
    setMessage("");
    void publicBattle.publish({ subject: selectedSubject, chapter: selectedChapter, language: bankLanguage, question_count: publicQuestions.current.length });
  };
  const createRoom = () => {
    if (!ready) return;
    const code = newRoomCode();
    battle.connect(code, true, pick(Number(code)));
  };
  const joinRoom = (code: string) => {
    if (/^\d{6}$/.test(code) && !sending.current) battle.connect(code, false);
  };
  const challengeStudent = async (student: BattleStudent) => {
    if (!ready || sending.current) return;
    sending.current = true; setSendingId(student.user_id); setMessage("");
    const code = newRoomCode();
    const questions = pick(Number(code));
    try {
      const id = await sendBattleChallenge(student.user_id, { code, subject: selectedSubject, chapter: selectedChapter, language: bankLanguage, count: questions.length });
      if (!mounted.current) { void cancelBattleChallenge(id).catch(() => {}); return; }
      outgoingRef.current = id; setOutgoing({ id, name: student.display_name, expiresAt: Date.now() + BATTLE_INVITE_LIFETIME });
      battle.connect(code, true, questions);
      toast.success(text("تم إرسال دعوة التحدّي", "Challenge invitation sent"));
    } catch {
      if (mounted.current) setMessage(text("تعذّر إرسال الدعوة. تأكد من اتصالك وتسجيل دخولك وحاول مرة ثانية.", "Could not send the invitation. Check your connection and sign-in, then retry."));
    } finally {
      sending.current = false; if (mounted.current) setSendingId(null);
    }
  };
  const challengeGroup = async (students: BattleStudent[]) => {
    if (!ready || sending.current) return;
    sending.current = true;
    setSendingId("group");
    setMessage("");
    try {
      const id = await createRoyale(students.map((student) => student.user_id), {
        subject: selectedSubject, chapter: selectedChapter, language: bankLanguage,
      }, pick(Date.now()));
      if (!mounted.current) { void getRoyale(id, "leave").catch(() => {}); return; }
      setRoyale({ id, host: true });
      toast.success(text("تم إرسال الدعوات لنفس الغرفة", "Invitations sent for the same room"));
    } catch (error) {
      if (mounted.current) setMessage(error instanceof Error && error.message === "ROOM_ALREADY_OPEN"
        ? text("عدك غرفة مفتوحة. انتظر انتهاء مهلة الدعوات قبل ما تفتح غيرها.", "You already have an open room. Wait for its invitation window to end.")
        : text("تعذّر إرسال الدعوات. تأكد من اتصالك وحاول مرة ثانية.", "Could not send the invitations. Check your connection and retry."));
    } finally {
      sending.current = false;
      if (mounted.current) setSendingId(null);
    }
  };
  useEffect(() => {
    if (!outgoing) return;
    let active = true;
    const check = async () => {
      try {
        const status = await battleChallengeStatus(outgoing.id);
        if (!active) return;
        if (status === "declined" || status === "cancelled") {
          outgoingRef.current = null; setOutgoing(null); battleRef.current.reset();
          setMessage(text("صديقك رفض الدعوة أو أُلغي التحدّي. تگدر ترسل تحدّي جديد.", "Your friend declined or the challenge was cancelled. You can send a new challenge."));
        }
      } catch { /* The next notification or poll can recover a temporary network error. */ }
    };
    const channel = supabase.channel(`battle-invitation-sent:${outgoing.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "battle_invites", filter: `id=eq.${outgoing.id}` }, () => { void check(); }).subscribe();
    const poll = setInterval(() => { void check(); }, 10000);
    const expiry = setTimeout(() => {
      if (!active) return;
      clearInvitation(); setOutgoing(null); battleRef.current.reset();
      setMessage(text("انتهت مهلة الدعوة. جرّب إرسال تحدّي جديد.", "The invitation expired. Try sending a new challenge."));
    }, Math.max(0, outgoing.expiresAt - Date.now()));
    return () => { active = false; clearInterval(poll); clearTimeout(expiry); void supabase.removeChannel(channel); };
  }, [outgoing, clearInvitation, text]);
  useEffect(() => {
    if (["countdown", "playing", "done", "disconnected"].includes(battle.phase)) { clearInvitation(); setOutgoing(null); }
  }, [battle.phase, clearInvitation]);
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

  if (royale) return <main className="min-h-screen bg-background px-4 py-6 pb-28">
    <div className="mx-auto max-w-2xl">
      <StudyRoyale key={royale.id} id={royale.id} language={language} existingMember={royale.host} onBack={() => setRoyale(null)} />
    </div>
  </main>;

  return (
    <main className="min-h-screen bg-background p-4 pb-28" dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-2xl space-y-5">
        <Button variant="ghost" disabled={locked || !!sendingId} onClick={() => busy ? reset() : onBack()}><ArrowLeft className={ar ? "h-4 w-4 rotate-180" : "h-4 w-4"} />{text("رجوع", "Back")}</Button>
        <header className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-primary"><Swords className="h-5 w-5" />LIVE BATTLE</span>
          <h1 className="text-2xl font-black">{text("تحدّي سريع، وأسئلة جاهزة", "Quick battle. Ready questions.")}</h1>
          {!busy && <p className="text-sm leading-6 text-muted-foreground">{text("اختَر المادة والفصل، والعب من بنك الـMCQ الموجود بتميّزك.", "Choose a subject and chapter, then play from Tamayzak’s MCQ bank.")}</p>}
        </header>
        {publicBattle.error && <p role="status" className="rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-sm text-amber-950">{battleChannelError(publicBattle.error, ar)}</p>}
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
          {publicBattle.config.enabled && <section className="space-y-3 rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <h2 className="font-bold">{text("تحدّيات الكروب", "Group challenges")}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{text("البوت ينشر اسمك وتفاصيل الجولة بالكروب حتى أول منافس ينضم إلك. خلي الصفحة مفتوحة؛ الدعوة تنتهي بعد ٣ دقائق.", "The bot posts your display name and round details to the group. The first opponent joins you. Keep this page open; the invite lasts 3 minutes.")}</p>
            <Button className="min-h-12 w-full gap-2" disabled={!ready || !!sendingId} onClick={findChannelOpponent}><Users className="h-4 w-4" />{text("دوّر منافس بالكروب", "Find an opponent in the group")}</Button>
            {publicBattle.config.invite_url && <a href={publicBattle.config.invite_url} target="_blank" rel="noopener noreferrer" className="block py-2 text-center text-sm font-bold text-primary underline">{text("افتح كروب التحدّيات", "Open the challenge group")}</a>}
          </section>}
          <BattleJoinPanel language={language} canCreate={ready} sendingId={sendingId} onCreate={createRoom} onJoin={joinRoom} onChallenge={(student) => void challengeStudent(student)} onGroupChallenge={(students) => void challengeGroup(students)} />
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="min-h-14 gap-2 rounded-2xl px-2 text-xs sm:px-4 sm:text-sm" disabled={!ready || !!sendingId} onClick={findOpponent}><Shuffle className="h-4 w-4" />{text("منافس عشوائي", "Random opponent")}</Button>
            <Button variant="outline" className="min-h-14 gap-2 rounded-2xl px-2 text-xs sm:px-4 sm:text-sm" disabled={!ready || !!sendingId} onClick={startSolo}><User className="h-4 w-4" />{text("تدرّب وحدك", "Practise solo")}</Button>
          </div>
        </>}

        {publicBattle.pending && <section className="space-y-3 rounded-2xl border p-6 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /><p role="status">{text("جاري ربط التحدّي بالكروب…", "Connecting the challenge to the group…")}</p><Button variant="outline" onClick={reset}>{text("إلغاء", "Cancel")}</Button></section>}
        {publicBattle.room?.status === "waiting" && <section className="space-y-4 rounded-2xl border bg-card p-6 text-center"><Swords className="mx-auto h-10 w-10 text-primary" /><h2 className="font-bold">{text("نشرنا تحدّيك بالكروب — بانتظار منافس", "Your challenge is posted — waiting for an opponent")}</h2><p className="text-sm text-muted-foreground">{text("خلي هالصفحة مفتوحة. أول طالب ينضم تبدي الجولة وياه تلقائياً.", "Keep this page open. The first student to join starts the round with you.")}</p><p className="text-sm tabular-nums">{publicBattle.remaining} {text("ثانية متبقية للدعوة", "seconds left on the invite")}</p><Button variant="outline" onClick={reset}>{text("إلغاء التحدّي", "Cancel challenge")}</Button></section>}
        {searching && <section className="space-y-4 rounded-2xl border p-6 text-center"><Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" /><h2 className="font-bold">{text("ندورلك على منافس…", "Finding an opponent…")}</h2><p className="text-sm text-muted-foreground">{LABELS[selectedSubject]?.[language] ?? selectedSubject} · {selectedChapter ? text(`الفصل ${selectedChapter}`, `Chapter ${selectedChapter}`) : text("كل الفصول", "All chapters")} · {bankLanguage === "ar" ? "عربي" : "English"}</p><Button variant="outline" onClick={reset}>{text("إلغاء البحث", "Cancel search")}</Button></section>}
        {battle.phase === "lobby" && <section className="space-y-5 rounded-2xl border bg-card p-6 text-center"><h2 className="font-bold">{publicBattle.room ? text("المنافس انضم، ننتظر اتصال الطرفين…", "Opponent joined; connecting both players…") : text("شارك الرمز ويا صديقك", "Share the code with your friend")}</h2>{!publicBattle.room && <div className="flex items-center justify-center gap-2"><span dir="ltr" className="font-mono text-4xl font-black tracking-widest">{battle.code}</span><Button variant="ghost" size="icon" aria-label={text("نسخ الرمز", "Copy code")} onClick={() => void copyCode()}><Copy className="h-4 w-4" /></Button></div>}<p role="status" className="text-sm text-muted-foreground">{outgoing ? text(`تم إرسال الدعوة إلى ${outgoing.name}. بانتظار قبوله…`, `Invitation sent to ${outgoing.name}. Waiting for acceptance…`) : text("بانتظار اللاعب الثاني… الجولة تبدأ تلقائياً.", "Waiting for the second player… The round starts automatically.")}</p><Button variant="outline" onClick={reset}>{text("إلغاء الغرفة", "Cancel room")}</Button></section>}
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
