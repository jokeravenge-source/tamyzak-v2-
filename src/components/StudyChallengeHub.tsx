import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Check, ChevronDown, Clock3, Coins, Crown, DoorOpen, Flame, Loader2, LogOut, Play, Plus, Search, ShieldCheck, Sparkles, Swords, Trophy, UserPlus, UsersRound, X } from "lucide-react";
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
    mode: "Challenge mode", classic: "Classic", classicDesc: "A friendly study-time leaderboard.",
    allOrNothing: "All or Nothing", allOrNothingDesc: "Every student stakes the same points. The winner takes the full pot.",
    launchAllOrNothing: "All or Nothing rooms", launchAllOrNothingDesc: "Join an open room or create your own points room. The owner can start after at least five students join.",
    joinOpenRoom: "Join an open room", joinOpenRoomDesc: "Choose a lobby that has not started yet.",
    createMyRoom: "Create my room", createMyRoomDesc: "Set the stake, invite friends, and start when five students are ready.",
    liveLobby: "Open lobby", protectedStake: "Protected stake", availableRooms: "available rooms", publicBadge: "Tamayzak public challenge",
    openRooms: "Open All or Nothing rooms", noOpenRooms: "There are no open rooms right now. Create the first one.",
    waitingRooms: "Waiting rooms", waitingForPlayers: "Waiting for players", minimumFive: "5 to 10 students per room",
    wager: "Stake per student", points: "points", pot: "Current pot", balance: "Your available balance",
    startChallenge: "Start challenge", starting: "Starting…", needFive: "The owner can start at 5 students",
    leaveRoom: "Leave and refund", leftRoom: "You left the room and your stake was refunded",
    roomStarted: "The challenge has started", stakeNotice: "Accepting reserves the room stake from your points.",
    empty: "No challenges yet. Create one and invite your study friends.",
    titleLabel: "Challenge name", titlePlaceholder: "e.g. Finals focus sprint",
    duration: "Duration", friends: "Invite friends", search: "Search by student name",
    noResults: "No students found", selected: "Selected", days: "days", oneDay: "day",
    startNow: "Classic challenges start immediately. All or Nothing rooms open as a lobby first.", creating: "Creating…",
    accept: "Accept", decline: "Decline", invitedBy: "invited you", pending: "waiting",
    timeLeft: "Time left", participants: "participants", studyNow: "Study now",
    leader: "Current leader", winner: "Winner", tied: "Tie", you: "You",
    cancelled: "Cancelled", cancel: "Cancel challenge", cancelTitle: "Cancel this challenge?",
    cancelDescription: "The leaderboard will close and the challenge cannot be resumed.",
    cancelDescriptionAon: "The lobby will close and every held stake will be refunded.",
    keep: "Keep challenge", confirmCancel: "Yes, cancel", refresh: "Live standings",
    created: "Challenge created and invitations sent", accepted: "Challenge accepted",
    declined: "Invitation declined", cancelledToast: "Challenge cancelled",
    pendingFriends: "invited friends have not answered yet", recorded: "Saved Sessions time",
    publicTitle: "Public challenges", publicWeeklyDesc: "Open to every student for seven days.", publicMonthlyDesc: "Open to every student for thirty days.", join: "Join the challenge", joined: "You joined the challenge",
  },
  ar: {
    eyebrow: "ادرس ويا أصدقائك", title: "تحديات الأصدقاء",
    description: "حدد المدة، ادعُ أصدقاءك، وشوف منو يجمع وقت دراسة أكثر داخل الجلسات.",
    create: "إنشاء تحدي", incoming: "الدعوات", active: "التحديات الفعالة", finished: "النتائج",
    mode: "نوع التحدي", classic: "تحدي عادي", classicDesc: "منافسة ودّية على وقت الدراسة.",
    allOrNothing: "الكل أو لا شيء", allOrNothingDesc: "كل طالب يراهن بنفس عدد النقاط، والفائز ياخذ مجموع نقاط الغرفة.",
    launchAllOrNothing: "غرف الكل أو لا شيء", launchAllOrNothingDesc: "ادخل غرفة بعدها ما بادية أو سوِّ غرفتك وحدد النقاط. الأونر يگدر يبدي من يصيرون خمسة طلاب.",
    joinOpenRoom: "ادخل غرفة مفتوحة", joinOpenRoomDesc: "اختار غرفة بعدها ما بادية وشارك برهانها.",
    createMyRoom: "سوِّ غرفتي الخاصة", createMyRoomDesc: "حدد النقاط، ادعُ أصدقاءك، وابدي من يكتملون خمسة.",
    liveLobby: "غرفة مفتوحة", protectedStake: "رهان محمي", availableRooms: "غرف متاحة", publicBadge: "تحدي تميزك العام",
    openRooms: "غرف الكل أو لا شيء المفتوحة", noOpenRooms: "حالياً ماكو غرف مفتوحة. سوِّ أول غرفة.",
    waitingRooms: "غرف الانتظار", waitingForPlayers: "بانتظار الطلاب", minimumFive: "من ٥ إلى ١٠ طلاب بالغرفة",
    wager: "رهان كل طالب", points: "نقطة", pot: "مجموع الجائزة حالياً", balance: "رصيدك المتوفر",
    startChallenge: "ابدأ التحدي", starting: "جاري البدء…", needFive: "الأونر يگدر يبدي من يصيرون ٥",
    leaveRoom: "اطلع واسترجع النقاط", leftRoom: "طلعت من الغرفة ورجعت نقاطك",
    roomStarted: "بدأ التحدي", stakeNotice: "من تقبل، راح تنحجز نقاط الرهان من رصيدك.",
    empty: "ما عندك تحديات بعد. أنشئ تحدي وادعُ أصدقاء الدراسة.",
    titleLabel: "اسم التحدي", titlePlaceholder: "مثلاً: سباق دراسة الفاينل",
    duration: "مدة التحدي", friends: "ادعُ أصدقاء", search: "ابحث باسم الطالب",
    noResults: "ما لقينا طلاب", selected: "تم اختيار", days: "أيام", oneDay: "يوم",
    startNow: "التحدي العادي يبدي فوراً، وغرفة الكل أو لا شيء تبقى انتظار لحد ما الأونر يبديها.", creating: "جاري الإنشاء…",
    accept: "قبول", decline: "رفض", invitedBy: "دعاك", pending: "بانتظار الرد",
    timeLeft: "الوقت المتبقي", participants: "مشاركين", studyNow: "ابدأ الدراسة",
    leader: "المتصدر حالياً", winner: "الفائز", tied: "تعادل", you: "أنت",
    cancelled: "ملغي", cancel: "إلغاء التحدي", cancelTitle: "تلغي هذا التحدي؟",
    cancelDescription: "ستنغلق لوحة الترتيب وما راح تگدر ترجع التحدي.",
    cancelDescriptionAon: "راح تنغلق الغرفة وترجع كل النقاط المحجوزة للطلاب.",
    keep: "خلي التحدي", confirmCancel: "نعم، إلغاء", refresh: "ترتيب مباشر",
    created: "تم إنشاء التحدي وإرسال الدعوات", accepted: "تم قبول التحدي",
    declined: "تم رفض الدعوة", cancelledToast: "تم إلغاء التحدي",
    pendingFriends: "أصدقاء مدعوين بعدهم ما جاوبوا", recorded: "وقت الجلسات المحفوظ",
    publicTitle: "التحديات العامة", publicWeeklyDesc: "مفتوح لكل الطلاب لمدة سبعة أيام.", publicMonthlyDesc: "مفتوح لكل الطلاب لمدة ثلاثين يومًا.", join: "انضم للتحدي", joined: "انضممت للتحدي",
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
  onStart,
  onLeave,
  busyId,
}: {
  challenge: StudyChallenge;
  language: AppLanguage;
  userId: string;
  now: number;
  onStudy: () => void;
  onCancel: (challenge: StudyChallenge) => void;
  onStart: (challenge: StudyChallenge) => void;
  onLeave: (challenge: StudyChallenge) => void;
  busyId: string | null;
}) {
  const t = COPY[language];
  const phase = challengePhase(challenge, now);
  const calculatedStandings = acceptedStandings(challenge, now);
  const standings = challenge.winnerId
    ? [...calculatedStandings].sort((a, b) => Number(b.userId === challenge.winnerId) - Number(a.userId === challenge.winnerId))
    : calculatedStandings;
  const pendingCount = challenge.participants.filter((participant) => participant.status === "pending").length;
  const maxSeconds = Math.max(1, standings[0]?.totalSeconds ?? 0);
  const isCreator = challenge.creatorId === userId;
  const isLobby = phase === "lobby";
  const acceptedCount = standings.length;
  const canStart = isCreator && acceptedCount >= (challenge.minimumPlayers ?? 5);
  const isFinished = phase === "completed";
  const isClosed = isFinished || phase === "cancelled";
  const tied = isFinished && standings.length > 1 && standings[0].totalSeconds === standings[1].totalSeconds;
  const [open, setOpen] = useState(phase !== "completed");

  return (
    <article className={`w-full min-w-0 rounded-[1.5rem] border bg-card shadow-sm ${isFinished ? "border-amber-400/40" : "border-border"}`}>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full min-w-0 items-start gap-3 p-4 text-start hover:bg-secondary/40 sm:p-5" aria-expanded={open}>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${isFinished ? "bg-amber-500 text-slate-950" : "bg-violet-600 text-white"}`}>
          {isFinished ? <Trophy className="h-5 w-5" /> : <Swords className="h-5 w-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block whitespace-normal font-black leading-relaxed text-foreground [overflow-wrap:anywhere]"><bdi>{challenge.title}</bdi></span>
          {challenge.challengeType === "all_or_nothing" && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-black text-rose-700 dark:text-rose-300"><Flame className="h-3 w-3" />{t.allOrNothing}</span>}
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><UsersRound className="h-3.5 w-3.5" />{standings.length} {t.participants}</span>
            {!isFinished && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{isLobby ? t.waitingForPlayers : remainingLabel(challenge.endsAt, language, now)}</span>}
          </span>
        </span>
        {standings[0] && <span className="hidden max-w-40 truncate rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 sm:block">#{1} {standings[0].displayName}</span>}
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="min-w-0 border-t border-border p-4 sm:p-5">
          {isLobby ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-secondary/45 p-3"><UsersRound className="h-4 w-4 text-violet-600" /><p className="mt-2 text-xs font-semibold text-muted-foreground">{t.waitingForPlayers}</p><p className="font-black">{acceptedCount} / {challenge.minimumPlayers ?? 5}</p></div>
                <div className="rounded-2xl bg-secondary/45 p-3"><Coins className="h-4 w-4 text-amber-600" /><p className="mt-2 text-xs font-semibold text-muted-foreground">{t.wager}</p><p className="font-black">{challenge.wagerPoints ?? 0} {t.points}</p></div>
                <div className="col-span-2 rounded-2xl bg-rose-500/10 p-3 sm:col-span-1"><Trophy className="h-4 w-4 text-rose-600" /><p className="mt-2 text-xs font-semibold text-muted-foreground">{t.pot}</p><p className="font-black text-rose-700 dark:text-rose-300">{challenge.potPoints ?? acceptedCount * (challenge.wagerPoints ?? 0)} {t.points}</p></div>
              </div>
              <p className="mt-3 text-xs font-semibold text-muted-foreground">{t.minimumFive} · {t.needFive}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {isCreator ? <Button onClick={() => onStart(challenge)} disabled={!canStart || busyId === challenge.id} className="gap-2 rounded-xl bg-rose-600 hover:bg-rose-700">{busyId === challenge.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}{busyId === challenge.id ? t.starting : t.startChallenge}</Button> : <Button variant="outline" onClick={() => onLeave(challenge)} disabled={busyId === challenge.id} className="gap-2 rounded-xl"><LogOut className="h-4 w-4" />{t.leaveRoom}</Button>}
                {isCreator && <Button variant="ghost" onClick={() => onCancel(challenge)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">{t.cancel}</Button>}
              </div>
            </>
          ) : (
          <>
          <div className="mb-4 grid min-w-0 grid-cols-1 gap-3 rounded-2xl bg-secondary/45 px-4 py-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{phase === "cancelled" ? t.cancelled : isFinished ? (tied ? t.tied : t.winner) : t.leader}</p>
              <p className="mt-0.5 flex min-w-0 items-start gap-1.5 font-black"><Crown className="mt-1 h-4 w-4 shrink-0 text-amber-500" /><bdi className="min-w-0 [overflow-wrap:anywhere]">{standings[0]?.displayName ?? "—"}</bdi></p>
            </div>
            <div className="min-w-0 sm:text-end">
              <p className="text-xs font-semibold text-muted-foreground">{isFinished && challenge.challengeType === "all_or_nothing" ? t.pot : isFinished ? t.recorded : t.timeLeft}</p>
              <p className="mt-0.5 font-mono font-black">{isFinished && challenge.challengeType === "all_or_nothing" ? `${challenge.potPoints ?? 0} ${t.points}` : isFinished ? formatStudySeconds(standings[0]?.totalSeconds ?? 0, language) : remainingLabel(challenge.endsAt, language, now)}</p>
            </div>
          </div>

          <ol className="space-y-2">
            {standings.map((participant, index) => {
              const progress = Math.max(participant.totalSeconds > 0 ? 4 : 0, (participant.totalSeconds / maxSeconds) * 100);
              return (
                <li key={participant.userId} className="rounded-2xl border border-border/70 bg-background/55 p-3">
                  <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${index === 0 ? "bg-amber-500 text-slate-950" : "bg-secondary text-muted-foreground"}`}>{index + 1}</span>
                    <span className="min-w-0 text-sm font-bold [overflow-wrap:anywhere]">{participant.displayName}{participant.userId === userId && <span className="ms-1 text-xs text-primary">({t.you})</span>}</span>
                    <span className="col-start-2 min-w-0 font-mono text-sm font-black text-violet-700 dark:text-violet-300 sm:col-start-auto">{formatStudySeconds(participant.totalSeconds, language)}</span>
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
          </>
          )}
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
  const [challengeType, setChallengeType] = useState<"standard" | "all_or_nothing">("standard");
  const [wagerPoints, setWagerPoints] = useState(100);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendResult[]>([]);
  const [selected, setSelected] = useState<FriendResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<StudyChallenge | null>(null);
  const [now, setNow] = useState(Date.now());

  const openCreate = (type: "standard" | "all_or_nothing" = "standard") => {
    setChallengeType(type);
    if (type === "all_or_nothing" && !title.trim()) setTitle(language === "ar" ? "الكل أو لا شيء" : "All or Nothing");
    setCreateOpen(true);
  };

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id ?? "";
    setUserId(id);
    if (!id) { setChallenges([]); setLoading(false); return; }
    const [{ data, error }, { data: balance }] = await Promise.all([
      supabase.rpc("get_my_study_challenges"),
      supabase.rpc("points_balance"),
    ]);
    if (error) toast.error(error.message);
    else setChallenges((Array.isArray(data) ? data : []) as unknown as StudyChallenge[]);
    setPointsBalance(Math.max(0, Number(balance) || 0));
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

  const openPublic = useMemo(() => challenges.filter((challenge) => challengePhase(challenge, now) === "open" && challenge.challengeType !== "all_or_nothing"), [challenges, now]);
  const openAllOrNothing = useMemo(() => challenges.filter((challenge) => challengePhase(challenge, now) === "open" && challenge.challengeType === "all_or_nothing" && challenge.participants.filter((participant) => participant.status === "accepted").length < 10), [challenges, now]);
  const incoming = useMemo(() => challenges.filter((challenge) => challengePhase(challenge, now) === "invited"), [challenges, now]);
  const lobbies = useMemo(() => challenges.filter((challenge) => challengePhase(challenge, now) === "lobby"), [challenges, now]);
  const active = useMemo(() => challenges.filter((challenge) => challengePhase(challenge, now) === "active"), [challenges, now]);
  const finished = useMemo(() => challenges.filter((challenge) => ["completed", "cancelled"].includes(challengePhase(challenge, now))), [challenges, now]);

  const respond = async (challengeId: string, accept: boolean) => {
    setBusyId(challengeId);
    const { error } = await supabase.rpc("respond_study_challenge", { _challenge_id: challengeId, _accept: accept });
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(accept ? (challenges.find((c) => c.id === challengeId)?.myStatus === "open" ? t.joined : t.accepted) : t.declined);
    await load();
  };

  const createChallenge = async () => {
    if (!title.trim() || (challengeType === "standard" && selected.length === 0) || creating) return;
    setCreating(true);
    const { data: challengeId, error } = await supabase.rpc("create_study_challenge_v3", {
      _title: title.trim(), _duration_days: duration, _invitee_ids: selected.map((friend) => friend.user_id), _challenge_type: challengeType,
      _wager_points: challengeType === "all_or_nothing" ? wagerPoints : null,
    });
    if (error) { setCreating(false); toast.error(error.message); return; }
    if (challengeId) {
      const { error: pushError } = await supabase.functions.invoke("study-challenge-notify", { body: { challengeId } });
      if (pushError) console.warn("Challenge created, but push delivery could not be started", pushError);
    }
    setCreating(false);
    toast.success(t.created);
    setCreateOpen(false); setTitle(""); setSelected([]); setQuery(""); setDuration(7); setChallengeType("standard"); setWagerPoints(100);
    await load();
  };

  const startChallenge = async (challenge: StudyChallenge) => {
    setBusyId(challenge.id);
    const { error } = await supabase.rpc("start_all_or_nothing_challenge", { _challenge_id: challenge.id });
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t.roomStarted);
    await load();
  };

  const leaveRoom = async (challenge: StudyChallenge) => {
    setBusyId(challenge.id);
    const { error } = await supabase.rpc("leave_all_or_nothing_challenge", { _challenge_id: challenge.id });
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t.leftRoom);
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
    <main className="relative min-h-screen w-full min-w-0 overflow-x-clip px-4 py-6 md:py-12" dir={dir}>
      <div aria-hidden="true" className="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="relative mx-auto w-full min-w-0 max-w-5xl">
        <button onClick={onBack} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/85 px-3 text-sm font-semibold text-muted-foreground shadow-sm hover:text-foreground">
          <ArrowLeft className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} />{language === "ar" ? "رجوع" : "Back"}
        </button>

        <header className="mb-7 overflow-hidden rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-6 text-white shadow-[0_28px_80px_-44px_rgba(124,58,237,0.95)] md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black"><Swords className="h-3.5 w-3.5" />{t.eyebrow}</span>
              <h1 className="mt-4 text-3xl font-black tracking-tight [overflow-wrap:anywhere] md:text-5xl">{t.title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 md:text-base">{t.description}</p>
            </div>
            <Button onClick={() => openCreate("standard")} className="h-12 shrink-0 gap-2 rounded-xl bg-white px-5 font-black text-violet-700 hover:bg-white/90"><Plus className="h-4 w-4" />{t.create}</Button>
          </div>
        </header>

        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-sky-300/20 bg-[linear-gradient(135deg,#071b45_0%,#123a78_52%,#087db3_100%)] p-5 text-white shadow-[0_28px_70px_-35px_rgba(14,116,205,0.85)] sm:p-7">
          <div aria-hidden="true" className="absolute -end-16 -top-20 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 start-1/3 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 text-white shadow-[0_12px_30px_-10px_rgba(34,211,238,0.9)] ring-1 ring-white/35"><Flame className="h-7 w-7" /></span>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black text-cyan-100 backdrop-blur"><Sparkles className="h-3.5 w-3.5" />{t.allOrNothing}</span>
              <h2 className="mt-3 text-xl font-black sm:text-2xl">{t.launchAllOrNothing}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-100/85">{t.launchAllOrNothingDesc}</p>
            </div>
          </div>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => document.getElementById("all-or-nothing-lobbies")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="group relative min-h-36 overflow-hidden rounded-[1.5rem] border border-white/25 bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 p-5 text-start shadow-[0_18px_35px_-20px_rgba(34,211,238,0.95)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_-18px_rgba(34,211,238,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <span aria-hidden="true" className="absolute -end-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl transition group-hover:scale-125" />
              <span className="relative flex h-full items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-white shadow-inner ring-1 ring-white/35 backdrop-blur"><DoorOpen className="h-7 w-7" /></span>
                <span className="min-w-0 flex-1"><span className="block text-lg font-black">{t.joinOpenRoom}</span><span className="mt-1 block text-sm leading-5 text-white/80">{t.joinOpenRoomDesc}</span><span className="mt-3 inline-flex rounded-full bg-slate-950/20 px-2.5 py-1 text-xs font-black">{openAllOrNothing.length} {t.availableRooms}</span></span>
              </span>
            </button>

            <button type="button" onClick={() => openCreate("all_or_nothing")} className="group relative min-h-36 overflow-hidden rounded-[1.5rem] border border-white/25 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-5 text-start shadow-[0_18px_35px_-20px_rgba(217,70,239,0.95)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_-18px_rgba(217,70,239,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <span aria-hidden="true" className="absolute -end-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl transition group-hover:scale-125" />
              <span className="relative flex h-full items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-white shadow-inner ring-1 ring-white/35 backdrop-blur"><Plus className="h-7 w-7" /></span>
                <span className="min-w-0 flex-1"><span className="block text-lg font-black">{t.createMyRoom}</span><span className="mt-1 block text-sm leading-5 text-white/80">{t.createMyRoomDesc}</span><span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/20 px-2.5 py-1 text-xs font-black"><Coins className="h-3.5 w-3.5" />100–1000 {t.points}</span></span>
              </span>
            </button>
          </div>
        </section>

        {loading ? (
          <div className="grid place-items-center py-24"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
        ) : (
          <div className="min-w-0 space-y-8">
            <section id="all-or-nothing-lobbies" className="scroll-mt-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Flame className="h-5 w-5 text-cyan-500" />{t.openRooms}</h2>
              {openAllOrNothing.length > 0 ? (
                <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                  {openAllOrNothing.map((challenge) => {
                    const accepted = challenge.participants.filter((participant) => participant.status === "accepted").length;
                    const pot = challenge.potPoints ?? accepted * (challenge.wagerPoints ?? 0);
                    return (
                      <article key={challenge.id} className="group relative min-w-0 overflow-hidden rounded-[1.75rem] border border-sky-300/20 bg-[linear-gradient(140deg,#071b45_0%,#123d7b_58%,#0b78aa_100%)] p-5 text-white shadow-[0_24px_55px_-32px_rgba(14,116,205,0.95)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_65px_-30px_rgba(14,116,205,0.95)] sm:p-6">
                        <span aria-hidden="true" className="absolute -end-12 -top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl transition group-hover:scale-125" />
                        <div className="relative flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black text-cyan-100 backdrop-blur"><Sparkles className="h-3.5 w-3.5" />{t.liveLobby}</span>
                            <h3 className="mt-3 text-xl font-black leading-relaxed [overflow-wrap:anywhere]"><bdi>{challenge.title}</bdi></h3>
                            <p className="mt-1 text-sm font-semibold text-blue-100/75">{challenge.creatorName}</p>
                          </div>
                          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 shadow-[0_12px_30px_-12px_rgba(34,211,238,0.95)] ring-1 ring-white/30"><Swords className="h-7 w-7" /></span>
                        </div>

                        <div className="relative mt-5 grid grid-cols-3 gap-2">
                          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur"><UsersRound className="h-4 w-4 text-cyan-200" /><p className="mt-2 text-xs text-blue-100/70">{t.waitingForPlayers}</p><p className="mt-0.5 font-black">{accepted} / 10</p></div>
                          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur"><Coins className="h-4 w-4 text-amber-300" /><p className="mt-2 text-xs text-blue-100/70">{t.wager}</p><p className="mt-0.5 font-black">{challenge.wagerPoints ?? 0}</p></div>
                          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur"><Trophy className="h-4 w-4 text-amber-300" /><p className="mt-2 text-xs text-blue-100/70">{t.pot}</p><p className="mt-0.5 font-black">{pot}</p></div>
                        </div>

                        <Button onClick={() => respond(challenge.id, true)} disabled={busyId === challenge.id || pointsBalance < (challenge.wagerPoints ?? 0)} className="relative mt-5 min-h-12 w-full gap-2 rounded-2xl border border-white/25 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 py-3 font-black text-white shadow-[0_14px_28px_-16px_rgba(34,211,238,0.95)] hover:from-blue-400 hover:via-sky-400 hover:to-cyan-300 hover:text-slate-950">
                          {busyId === challenge.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <DoorOpen className="h-5 w-5" />}{t.joinOpenRoom}
                        </Button>
                        <p className="relative mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-cyan-100/75"><ShieldCheck className="h-3.5 w-3.5" />{t.protectedStake}</p>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-sky-300/30 bg-gradient-to-br from-sky-500/5 to-cyan-500/10 px-5 py-10 text-center text-sm text-muted-foreground"><DoorOpen className="mx-auto mb-3 h-7 w-7 text-sky-500" />{t.noOpenRooms}</div>
              )}
            </section>

            {openPublic.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Trophy className="h-5 w-5 text-amber-500" />{t.publicTitle}</h2>
                <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                  {openPublic.map((challenge) => (
                    <article key={challenge.id} className="group relative min-w-0 overflow-hidden rounded-[1.75rem] border border-indigo-300/20 bg-[linear-gradient(135deg,#102657_0%,#17488a_58%,#0f7cb5_100%)] p-5 text-white shadow-[0_24px_55px_-32px_rgba(37,99,235,0.9)] transition duration-300 hover:-translate-y-1 sm:p-6">
                      <span aria-hidden="true" className="absolute -end-12 -top-14 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl transition group-hover:scale-125" />
                      <div className="relative flex items-start gap-4">
                        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.25rem] bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 text-slate-950 shadow-[0_15px_32px_-14px_rgba(251,191,36,0.9)] ring-1 ring-white/30"><Trophy className="h-8 w-8" /></span>
                        <div className="min-w-0 flex-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black text-blue-100"><Sparkles className="h-3.5 w-3.5" />{t.publicBadge}</span>
                          <h3 className="mt-3 text-xl font-black leading-relaxed [overflow-wrap:anywhere]"><bdi>{challenge.title}</bdi></h3>
                          <p className="mt-1 text-sm leading-6 text-blue-100/75">{challenge.publicSeries === "monthly" ? t.publicMonthlyDesc : t.publicWeeklyDesc}</p>
                        </div>
                      </div>
                      <div className="relative mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                        <span className="text-sm font-semibold text-blue-100/75">{t.timeLeft}</span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-sm font-black"><Clock3 className="h-4 w-4 text-cyan-200" />{remainingLabel(challenge.endsAt, language, now)}</span>
                      </div>
                      <Button onClick={() => respond(challenge.id, true)} disabled={busyId === challenge.id} className="relative mt-4 min-h-12 w-full gap-2 rounded-2xl border border-white/25 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 py-3 font-black text-white shadow-[0_14px_28px_-16px_rgba(34,211,238,0.95)] hover:from-blue-400 hover:via-sky-400 hover:to-cyan-300 hover:text-slate-950">
                        {busyId === challenge.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}{t.join}
                      </Button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {incoming.length > 0 && <section><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><UserPlus className="h-5 w-5 text-violet-600" />{t.incoming}<span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-700 dark:text-violet-300">{incoming.length}</span></h2><div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">{incoming.map((challenge) => <article key={challenge.id} className="min-w-0 rounded-[1.5rem] border border-violet-500/25 bg-card p-5 shadow-sm"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white"><Swords className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="min-w-0 font-black leading-relaxed [overflow-wrap:anywhere]"><bdi>{challenge.title}</bdi></h3><p className="mt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">{challenge.creatorName} {t.invitedBy} · {remainingLabel(challenge.endsAt, language, now)}</p>{challenge.challengeType === "all_or_nothing" && <p className="mt-2 rounded-lg bg-rose-500/10 px-2.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300">{t.stakeNotice} {challenge.wagerPoints ?? 0} {t.points}</p>}</div></div><div className="mt-4 flex gap-2"><Button onClick={() => respond(challenge.id, true)} disabled={busyId === challenge.id || (challenge.challengeType === "all_or_nothing" && pointsBalance < (challenge.wagerPoints ?? 0))} className="h-auto min-h-11 min-w-0 flex-1 gap-1.5 whitespace-normal rounded-xl py-2">{busyId === challenge.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{t.accept}</Button><Button onClick={() => respond(challenge.id, false)} disabled={busyId === challenge.id} variant="outline" className="h-auto min-h-11 min-w-0 flex-1 gap-1.5 whitespace-normal rounded-xl py-2"><X className="h-4 w-4" />{t.decline}</Button></div></article>)}</div></section>}

            {lobbies.length > 0 && <section><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><UsersRound className="h-5 w-5 text-rose-600" />{t.waitingRooms}</h2><div className="grid min-w-0 grid-cols-1 gap-4">{lobbies.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} language={language} userId={userId} now={now} onStudy={onStudy} onCancel={setCancelTarget} onStart={startChallenge} onLeave={leaveRoom} busyId={busyId} />)}</div></section>}

            {active.length > 0 && <section><div className="mb-3 flex flex-wrap items-end justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-black"><Clock3 className="h-5 w-5 text-emerald-600" />{t.active}</h2><span className="text-xs font-semibold text-muted-foreground">{t.refresh}</span></div><div className="grid min-w-0 grid-cols-1 gap-4">{active.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} language={language} userId={userId} now={now} onStudy={onStudy} onCancel={setCancelTarget} onStart={startChallenge} onLeave={leaveRoom} busyId={busyId} />)}</div></section>}

            {finished.length > 0 && <section><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><Trophy className="h-5 w-5 text-amber-500" />{t.finished}</h2><div className="grid min-w-0 grid-cols-1 gap-4">{finished.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} language={language} userId={userId} now={now} onStudy={onStudy} onCancel={setCancelTarget} onStart={startChallenge} onLeave={leaveRoom} busyId={busyId} />)}</div></section>}

            {challenges.length === 0 && <section className="rounded-[2rem] border border-dashed border-border bg-card/65 px-6 py-16 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-600"><UsersRound className="h-7 w-7" /></span><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">{t.empty}</p><Button onClick={() => openCreate("standard")} className="mt-5 gap-2 rounded-xl"><Plus className="h-4 w-4" />{t.create}</Button></section>}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" dir={dir}>
          <DialogHeader><DialogTitle className="text-xl font-black">{t.create}</DialogTitle><DialogDescription>{t.startNow}</DialogDescription></DialogHeader>
          <div className="space-y-5 pt-2">
            <fieldset><legend className="mb-2 text-sm font-bold">{t.mode}</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => setChallengeType("standard")} aria-pressed={challengeType === "standard"} className={`rounded-2xl border p-3 text-start transition ${challengeType === "standard" ? "border-violet-600 bg-violet-500/10 ring-1 ring-violet-600" : "border-border bg-card hover:border-violet-400"}`}><span className="block font-black">{t.classic}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{t.classicDesc}</span></button><button type="button" onClick={() => setChallengeType("all_or_nothing")} aria-pressed={challengeType === "all_or_nothing"} className={`rounded-2xl border p-3 text-start transition ${challengeType === "all_or_nothing" ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500" : "border-border bg-card hover:border-rose-400"}`}><span className="flex items-center gap-1.5 font-black"><Flame className="h-4 w-4 text-rose-600" />{t.allOrNothing}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{t.allOrNothingDesc}</span></button></div></fieldset>
            <label className="block"><span className="mb-2 block text-sm font-bold">{t.titleLabel}</span><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.titlePlaceholder} maxLength={80} /></label>
            <fieldset><legend className="mb-2 text-sm font-bold">{t.duration}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{DURATIONS.map((days) => <button key={days} type="button" onClick={() => setDuration(days)} aria-pressed={duration === days} className={`rounded-xl border px-2 py-3 text-sm font-black transition ${duration === days ? "border-violet-600 bg-violet-600 text-white" : "border-border bg-card hover:border-violet-400"}`}>{days}<span className="ms-1 text-xs font-semibold">{days === 1 ? t.oneDay : t.days}</span></button>)}</div></fieldset>
            {challengeType === "all_or_nothing" && <fieldset className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4"><legend className="px-1 text-sm font-black">{t.wager}</legend><div className="mt-2 flex items-center gap-3"><input type="range" min={100} max={1000} step={100} value={wagerPoints} onChange={(event) => setWagerPoints(Number(event.target.value))} className="h-2 min-w-0 flex-1 accent-rose-600" /><span className="min-w-24 rounded-xl bg-background px-3 py-2 text-center font-black text-rose-700 dark:text-rose-300">{wagerPoints} {t.points}</span></div><div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>100</span><span>{t.balance}: <b className={pointsBalance < wagerPoints ? "text-destructive" : "text-foreground"}>{pointsBalance} {t.points}</b></span><span>1000</span></div></fieldset>}
            <div><p className="mb-2 text-sm font-bold">{t.friends}</p><div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="ps-9" />{searching && <Loader2 className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}</div>
              {query.trim().length >= 2 && <div className="mt-2 overflow-hidden rounded-xl border border-border">{results.length ? results.map((friend) => <button key={friend.user_id} type="button" onClick={() => { if (selected.length < (challengeType === "all_or_nothing" ? 9 : 20)) { setSelected((current) => [...current, friend]); setQuery(""); } }} className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-start last:border-0 hover:bg-secondary"><span className="grid h-8 w-8 place-items-center rounded-full bg-violet-500/10 text-xs font-black text-violet-700">{friend.display_name.slice(0, 1).toUpperCase()}</span><span className="text-sm font-bold">{friend.display_name}</span><Plus className="ms-auto h-4 w-4 text-muted-foreground" /></button>) : !searching && <p className="px-3 py-4 text-center text-sm text-muted-foreground">{t.noResults}</p>}</div>}
              {selected.length > 0 && <div className="mt-3"><p className="mb-2 text-xs font-semibold text-muted-foreground">{t.selected}: {selected.length}</p><div className="flex flex-wrap gap-2">{selected.map((friend) => <button key={friend.user_id} type="button" onClick={() => setSelected((current) => current.filter((item) => item.user_id !== friend.user_id))} className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">{friend.display_name}<X className="h-3.5 w-3.5" /></button>)}</div></div>}
            </div>
            <Button onClick={createChallenge} disabled={!title.trim() || (challengeType === "standard" && selected.length === 0) || (challengeType === "all_or_nothing" && pointsBalance < wagerPoints) || creating} className="h-12 w-full gap-2 rounded-xl font-black">{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}{creating ? t.creating : t.create}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(cancelTarget)} onOpenChange={(open) => { if (!open) setCancelTarget(null); }}>
        <AlertDialogContent dir={dir}><AlertDialogHeader><AlertDialogTitle>{t.cancelTitle}</AlertDialogTitle><AlertDialogDescription>{cancelTarget?.challengeType === "all_or_nothing" ? t.cancelDescriptionAon : t.cancelDescription}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t.keep}</AlertDialogCancel><AlertDialogAction onClick={cancelChallenge} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t.confirmCancel}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
