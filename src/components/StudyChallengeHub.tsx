import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Check, ChevronDown, Clock3, Crown, Loader2, Plus, Search, Swords, Trophy, UserPlus, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  acceptedStandings,
  challengePhase,
  formatStudySeconds,
  remainingLabel,
  type StudyChallenge,
} from "@/lib/studyChallenges";

type FriendResult = { user_id: string; display_name: string };

const COPY = {
  en: {
    eyebrow: "Study with friends", title: "Friend challenges",
    description: "Choose a duration, invite friends, and see who records the most study time in Sessions.",
    create: "Create challenge", incoming: "Invitations", active: "Active challenges", finished: "Results",
    empty: "No challenges yet. Create one and invite your study friends.",
    titleLabel: "Challenge name", titlePlaceholder: "e.g. Finals focus sprint",
    duration: "Duration", friends: "Invite friends", search: "Search by student name",
    noResults: "No students found", selected: "Selected", days: "days", oneDay: "day",
    startNow: "The challenge starts immediately after creation.", creating: "Creating…",
    accept: "Accept", decline: "Decline", invitedBy: "invited you", pending: "waiting",
    timeLeft: "Time left", participants: "participants", studyNow: "Study now",
    leader: "Current leader", winner: "Winner", tied: "Tie", you: "You",
    cancelled: "Cancelled", cancel: "Cancel challenge", cancelTitle: "Cancel this challenge?",
    cancelDescription: "The leaderboard will close and the challenge cannot be resumed.",
    keep: "Keep challenge", confirmCancel: "Yes, cancel", refresh: "Live standings",
    created: "Challenge created and invitations sent", accepted: "Challenge accepted",
    declined: "Invitation declined", cancelledToast: "Challenge cancelled",
    pendingFriends: "invited friends have not answered yet", recorded: "Saved Sessions time",
  },
  ar: {
    eyebrow: "ادرس ويا أصدقائك", title: "تحديات الأصدقاء",
    description: "حدد المدة، ادعُ أصدقاءك، وشوف منو يجمع وقت دراسة أكثر داخل الجلسات.",
    create: "إنشاء تحدي", incoming: "الدعوات", active: "التحديات الفعالة", finished: "النتائج",
    empty: "ما عندك تحديات بعد. أنشئ تحدي وادعُ أصدقاء الدراسة.",
    titleLabel: "اسم التحدي", titlePlaceholder: "مثلاً: سباق دراسة الفاينل",
    duration: "مدة التحدي", friends: "ادعُ أصدقاء", search: "ابحث باسم الطالب",
    noResults: "ما لقينا طلاب", selected: "تم اختيار", days: "أيام", oneDay: "يوم",
    startNow: "يبدأ التحدي مباشرة بعد الإنشاء.", creating: "جاري الإنشاء…",
    accept: "قبول", decline: "رفض", invitedBy: "دعاك", pending: "بانتظار الرد",
    timeLeft: "الوقت المتبقي", participants: "مشاركين", studyNow: "ابدأ الدراسة",
    leader: "المتصدر حالياً", winner: "الفائز", tied: "تعادل", you: "أنت",
    cancelled: "ملغي", cancel: "إلغاء التحدي", cancelTitle: "تلغي هذا التحدي؟",
    cancelDescription: "ستنغلق لوحة الترتيب وما راح تگدر ترجع التحدي.",
    keep: "خلي التحدي", confirmCancel: "نعم، إلغاء", refresh: "ترتيب مباشر",
    created: "تم إنشاء التحدي وإرسال الدعوات", accepted: "تم قبول التحدي",
    declined: "تم رفض الدعوة", cancelledToast: "تم إلغاء التحدي",
    pendingFriends: "أصدقاء مدعوين بعدهم ما جاوبوا", recorded: "وقت الجلسات المحفوظ",
  },
} as const;

const DURATIONS = [1, 3, 7, 14];

function ChallengeCard({
  challenge,
  language,
  userId,
  now,
  onStudy,
  onCancel,
}: {
  challenge: StudyChallenge;
  language: AppLanguage;
  userId: string;
  now: number;
  onStudy: () => void;
  onCancel: (challenge: StudyChallenge) => void;
}) {
  const t = COPY[language];
  const phase = challengePhase(challenge, now);
  const standings = acceptedStandings(challenge);
  const pendingCount = challenge.participants.filter((participant) => participant.status === "pending").length;
  const maxSeconds = Math.max(1, standings[0]?.totalSeconds ?? 0);
  const isCreator = challenge.creatorId === userId;
  const isFinished = phase === "completed";
  const isClosed = isFinished || phase === "cancelled";
  const tied = isFinished && standings.length > 1 && standings[0].totalSeconds === standings[1].totalSeconds;
  const [open, setOpen] = useState(phase !== "completed");

  return (
    <article className={`overflow-hidden rounded-[1.5rem] border bg-card shadow-sm ${isFinished ? "border-amber-400/40" : "border-border"}`}>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 p-4 text-start hover:bg-secondary/40 sm:p-5" aria-expanded={open}>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${isFinished ? "bg-amber-500 text-slate-950" : "bg-violet-600 text-white"}`}>
          {isFinished ? <Trophy className="h-5 w-5" /> : <Swords className="h-5 w-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-black text-foreground">{challenge.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><UsersRound className="h-3.5 w-3.5" />{standings.length} {t.participants}</span>
            {!isFinished && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{remainingLabel(challenge.endsAt, language, now)}</span>}
          </span>
        </span>
        {standings[0] && <span className="hidden max-w-40 truncate rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 sm:block">#{1} {standings[0].displayName}</span>}
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-border p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/45 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{phase === "cancelled" ? t.cancelled : isFinished ? (tied ? t.tied : t.winner) : t.leader}</p>
              <p className="mt-0.5 flex items-center gap-1.5 font-black"><Crown className="h-4 w-4 text-amber-500" />{standings[0]?.displayName ?? "—"}</p>
            </div>
            <div className="text-end">
              <p className="text-xs font-semibold text-muted-foreground">{isFinished ? t.recorded : t.timeLeft}</p>
              <p className="mt-0.5 font-mono font-black">{isFinished ? formatStudySeconds(standings[0]?.totalSeconds ?? 0, language) : remainingLabel(challenge.endsAt, language, now)}</p>
            </div>
          </div>

          <ol className="space-y-2">
            {standings.map((participant, index) => {
              const progress = Math.max(participant.totalSeconds > 0 ? 4 : 0, (participant.totalSeconds / maxSeconds) * 100);
              return (
                <li key={participant.userId} className="rounded-2xl border border-border/70 bg-background/55 p-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${index === 0 ? "bg-amber-500 text-slate-950" : "bg-secondary text-muted-foreground"}`}>{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{participant.displayName}{participant.userId === userId && <span className="ms-1 text-xs text-primary">({t.you})</span>}</span>
                    <span className="font-mono text-sm font-black text-violet-700 dark:text-violet-300">{formatStudySeconds(participant.totalSeconds, language)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-[width]" style={{ width: `${progress}%` }} /></div>
                </li>
              );
            })}
          </ol>

          {pendingCount > 0 && <p className="mt-3 text-xs text-muted-foreground">{pendingCount} {t.pendingFriends}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {!isClosed && <Button onClick={onStudy} className="gap-2 rounded-xl"><Clock3 className="h-4 w-4" />{t.studyNow}</Button>}
            {isCreator && phase === "active" && <Button variant="ghost" onClick={() => onCancel(challenge)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">{t.cancel}</Button>}
          </div>
        </div>
      )}
    </article>
  );
}

export default function StudyChallengeHub({ language, onBack, onStudy }: { language: AppLanguage; onBack: () => void; onStudy: () => void }) {
  const t = COPY[language];
  const dir = language === "ar" ? "rtl" : "ltr";
  const [userId, setUserId] = useState("");
  const [challenges, setChallenges] = useState<StudyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(7);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendResult[]>([]);
  const [selected, setSelected] = useState<FriendResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<StudyChallenge | null>(null);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id ?? "";
    setUserId(id);
    if (!id) { setChallenges([]); setLoading(false); return; }
    const { data, error } = await supabase.rpc("get_my_study_challenges");
    if (error) toast.error(error.message);
    else setChallenges((Array.isArray(data) ? data : []) as unknown as StudyChallenge[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => { setNow(Date.now()); void load(); }, 30_000);
    const refresh = () => { if (document.visibilityState === "visible") { setNow(Date.now()); void load(); } };
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);

  useEffect(() => {
    const clean = query.trim().replace(/[%_]/g, "");
    if (!createOpen || clean.length < 2 || !userId) { setResults([]); return; }
    const timer = window.setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase.from("profiles").select("user_id,display_name")
        .neq("user_id", userId).ilike("display_name", `%${clean}%`).limit(8);
      const selectedIds = new Set(selected.map((friend) => friend.user_id));
      setResults(((data ?? []) as FriendResult[]).filter((friend) => !selectedIds.has(friend.user_id)));
      setSearching(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [createOpen, query, selected, userId]);

  const incoming = useMemo(() => challenges.filter((challenge) => challengePhase(challenge, now) === "invited"), [challenges, now]);
  const active = useMemo(() => challenges.filter((challenge) => challengePhase(challenge, now) === "active"), [challenges, now]);
  const finished = useMemo(() => challenges.filter((challenge) => ["completed", "cancelled"].includes(challengePhase(challenge, now))), [challenges, now]);

  const respond = async (challengeId: string, accept: boolean) => {
    setBusyId(challengeId);
    const { error } = await supabase.rpc("respond_study_challenge", { _challenge_id: challengeId, _accept: accept });
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(accept ? t.accepted : t.declined);
    await load();
  };

  const createChallenge = async () => {
    if (!title.trim() || selected.length === 0 || creating) return;
    setCreating(true);
    const { error } = await supabase.rpc("create_study_challenge", {
      _title: title.trim(), _duration_days: duration, _invitee_ids: selected.map((friend) => friend.user_id),
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t.created);
    setCreateOpen(false); setTitle(""); setSelected([]); setQuery(""); setDuration(7);
    await load();
  };

  const cancelChallenge = async () => {
    if (!cancelTarget) return;
    const target = cancelTarget;
    setBusyId(target.id); setCancelTarget(null);
    const { error } = await supabase.rpc("cancel_study_challenge", { _challenge_id: target.id });
    setBusyId(null);
    if (error) toast.error(error.message);
    else { toast.success(t.cancelledToast); await load(); }
  };

  return (
    <main className="relative min-h-screen overflow-x-clip px-4 py-6 md:py-12" dir={dir}>
      <div aria-hidden="true" className="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <button onClick={onBack} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/85 px-3 text-sm font-semibold text-muted-foreground shadow-sm hover:text-foreground">
          <ArrowLeft className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} />{language === "ar" ? "رجوع" : "Back"}
        </button>

        <header className="mb-7 overflow-hidden rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-6 text-white shadow-[0_28px_80px_-44px_rgba(124,58,237,0.95)] md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black"><Swords className="h-3.5 w-3.5" />{t.eyebrow}</span>
              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">{t.title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 md:text-base">{t.description}</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="h-12 shrink-0 gap-2 rounded-xl bg-white px-5 font-black text-violet-700 hover:bg-white/90"><Plus className="h-4 w-4" />{t.create}</Button>
          </div>
        </header>

        {loading ? (
          <div className="grid place-items-center py-24"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-8">
            {incoming.length > 0 && <section><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><UserPlus className="h-5 w-5 text-violet-600" />{t.incoming}<span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-700 dark:text-violet-300">{incoming.length}</span></h2><div className="grid gap-3 md:grid-cols-2">{incoming.map((challenge) => <article key={challenge.id} className="rounded-[1.5rem] border border-violet-500/25 bg-card p-5 shadow-sm"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white"><Swords className="h-5 w-5" /></span><div><h3 className="font-black">{challenge.title}</h3><p className="mt-1 text-xs text-muted-foreground">{challenge.creatorName} {t.invitedBy} · {remainingLabel(challenge.endsAt, language, now)}</p></div></div><div className="mt-4 flex gap-2"><Button onClick={() => respond(challenge.id, true)} disabled={busyId === challenge.id} className="flex-1 gap-1.5 rounded-xl">{busyId === challenge.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{t.accept}</Button><Button onClick={() => respond(challenge.id, false)} disabled={busyId === challenge.id} variant="outline" className="flex-1 gap-1.5 rounded-xl"><X className="h-4 w-4" />{t.decline}</Button></div></article>)}</div></section>}

            {active.length > 0 && <section><div className="mb-3 flex items-end justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-black"><Clock3 className="h-5 w-5 text-emerald-600" />{t.active}</h2><span className="text-xs font-semibold text-muted-foreground">{t.refresh}</span></div><div className="grid gap-4">{active.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} language={language} userId={userId} now={now} onStudy={onStudy} onCancel={setCancelTarget} />)}</div></section>}

            {finished.length > 0 && <section><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><Trophy className="h-5 w-5 text-amber-500" />{t.finished}</h2><div className="grid gap-4">{finished.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} language={language} userId={userId} now={now} onStudy={onStudy} onCancel={setCancelTarget} />)}</div></section>}

            {challenges.length === 0 && <section className="rounded-[2rem] border border-dashed border-border bg-card/65 px-6 py-16 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-600"><UsersRound className="h-7 w-7" /></span><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">{t.empty}</p><Button onClick={() => setCreateOpen(true)} className="mt-5 gap-2 rounded-xl"><Plus className="h-4 w-4" />{t.create}</Button></section>}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" dir={dir}>
          <DialogHeader><DialogTitle className="text-xl font-black">{t.create}</DialogTitle><DialogDescription>{t.startNow}</DialogDescription></DialogHeader>
          <div className="space-y-5 pt-2">
            <label className="block"><span className="mb-2 block text-sm font-bold">{t.titleLabel}</span><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.titlePlaceholder} maxLength={80} /></label>
            <fieldset><legend className="mb-2 text-sm font-bold">{t.duration}</legend><div className="grid grid-cols-4 gap-2">{DURATIONS.map((days) => <button key={days} type="button" onClick={() => setDuration(days)} aria-pressed={duration === days} className={`rounded-xl border px-2 py-3 text-sm font-black transition ${duration === days ? "border-violet-600 bg-violet-600 text-white" : "border-border bg-card hover:border-violet-400"}`}>{days}<span className="ms-1 text-xs font-semibold">{days === 1 ? t.oneDay : t.days}</span></button>)}</div></fieldset>
            <div><p className="mb-2 text-sm font-bold">{t.friends}</p><div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="ps-9" />{searching && <Loader2 className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}</div>
              {query.trim().length >= 2 && <div className="mt-2 overflow-hidden rounded-xl border border-border">{results.length ? results.map((friend) => <button key={friend.user_id} type="button" onClick={() => { if (selected.length < 20) { setSelected((current) => [...current, friend]); setQuery(""); } }} className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-start last:border-0 hover:bg-secondary"><span className="grid h-8 w-8 place-items-center rounded-full bg-violet-500/10 text-xs font-black text-violet-700">{friend.display_name.slice(0, 1).toUpperCase()}</span><span className="text-sm font-bold">{friend.display_name}</span><Plus className="ms-auto h-4 w-4 text-muted-foreground" /></button>) : !searching && <p className="px-3 py-4 text-center text-sm text-muted-foreground">{t.noResults}</p>}</div>}
              {selected.length > 0 && <div className="mt-3"><p className="mb-2 text-xs font-semibold text-muted-foreground">{t.selected}: {selected.length}</p><div className="flex flex-wrap gap-2">{selected.map((friend) => <button key={friend.user_id} type="button" onClick={() => setSelected((current) => current.filter((item) => item.user_id !== friend.user_id))} className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">{friend.display_name}<X className="h-3.5 w-3.5" /></button>)}</div></div>}
            </div>
            <Button onClick={createChallenge} disabled={!title.trim() || selected.length === 0 || creating} className="h-12 w-full gap-2 rounded-xl font-black">{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}{creating ? t.creating : t.create}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(cancelTarget)} onOpenChange={(open) => { if (!open) setCancelTarget(null); }}>
        <AlertDialogContent dir={dir}><AlertDialogHeader><AlertDialogTitle>{t.cancelTitle}</AlertDialogTitle><AlertDialogDescription>{t.cancelDescription}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t.keep}</AlertDialogCancel><AlertDialogAction onClick={cancelChallenge} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t.confirmCancel}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
