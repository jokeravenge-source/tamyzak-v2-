import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowLeft, Play, Pause, Square, Trophy, Timer, Target, Music, SkipForward, Volume2, VolumeX, BookOpen, Languages, Globe, Sigma, Atom, FlaskConical, Leaf, Moon, Coffee, Settings, Trash2, ListChecks, ChevronDown, CheckCircle2, Circle, ArrowUpDown, ArrowDownUp, ArrowDown, ArrowUp, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import track1Asset from "@/assets/music/track1.mp3.asset.json";
import track2Asset from "@/assets/music/track2.mp3.asset.json";
import track3Asset from "@/assets/music/track3.mp3.asset.json";
import track4Asset from "@/assets/music/track4.mp3.asset.json";
import track5Asset from "@/assets/music/track5.mp3.asset.json";
import track6Asset from "@/assets/music/track6.mp3.asset.json";
import quranTrackAsset from "@/assets/music/quran.mp3.asset.json";
import SpotifyPlayerBlock from "@/components/SpotifyPlayerBlock";
import StudyRoom from "@/components/StudyRoom";
import PrivateStudyRooms from "@/components/PrivateStudyRooms";
import { pushTodos, pullTodos } from "@/lib/todosSync";

type TodoItem = { id: string; text: string; done: boolean; day?: string };
const TODO_STORAGE_KEY = "app_todos_v1";

type PastSession = {
  id: string;
  subject: string;
  mission: string | null;
  duration_seconds: number;
  points: number;
  mission_completed: boolean;
  created_at: string;
};

type SortField = "date" | "minutes" | "points";
type SortDir = "asc" | "desc";

const SessionsHistory = ({ language, userId }: { language: AppLanguage; userId: string | null }) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const L = language === "ar"
    ? { title: "سجل جلساتي", empty: "لا توجد جلسات سابقة.", delete: "حذف", deleted: "تم حذف الجلسة", confirmT: "حذف هذه الجلسة؟", confirmD: "لا يمكن التراجع. لن تُعاد النقاط.", cancel: "إلغاء", yes: "نعم، احذف", loading: "جاري التحميل...", pts: "نقطة", mins: "دقيقة", noMission: "بدون مهمة", sort: "ترتيب", byDate: "التاريخ", byMins: "الدقائق", byPoints: "النقاط", asc: "تصاعدي", desc: "تنازلي" }
    : { title: "My session history", empty: "No past sessions.", delete: "Delete", deleted: "Session deleted", confirmT: "Delete this session?", confirmD: "This cannot be undone. Points will not be restored.", cancel: "Cancel", yes: "Yes, delete", loading: "Loading...", pts: "pts", mins: "min", noMission: "No mission", sort: "Sort", byDate: "Date", byMins: "Minutes", byPoints: "Points", asc: "Ascending", desc: "Descending" };

  const SUBJ_LBL: Record<string, { en: string; ar: string }> = {
    islamic: { en: "Islamic", ar: "التربية الإسلامية" }, arabic: { en: "Arabic", ar: "العربية" },
    english: { en: "English", ar: "الإنجليزية" }, french: { en: "French", ar: "الفرنسية" },
    math: { en: "Math", ar: "الرياضيات" }, physics: { en: "Physics", ar: "الفيزياء" },
    chemistry: { en: "Chemistry", ar: "الكيمياء" }, biology: { en: "Biology", ar: "الأحياء" },
  };

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("study_sessions")
      .select("id,subject,mission,duration_seconds,points,mission_completed,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error) setRows((data ?? []) as PastSession[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows];
    const factor = sortDir === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      if (sortField === "date") return factor * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      if (sortField === "minutes") return factor * (a.duration_seconds - b.duration_seconds);
      return factor * (a.points - b.points);
    });
    return sorted;
  }, [rows, sortField, sortDir]);

  const setSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "date" ? "desc" : "desc");
    }
  };

  const SortPill = ({ field, label }: { field: SortField; label: string }) => {
    const active = sortField === field;
    const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <button
        type="button"
        onClick={() => setSort(field)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </button>
    );
  };

  const doDelete = async (id: string) => {
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    const { error } = await supabase.from("study_sessions").delete().eq("id", id);
    if (error) {
      setRows(prev);
      toast.error(error.message);
    } else {
      toast.success(L.deleted);
    }
    setConfirmId(null);
  };

  return (
    <div className="max-w-5xl mx-auto mb-6 rounded-2xl border-2 border-primary/30 bg-card shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-primary/10 hover:bg-primary/15 transition"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Timer className="w-5 h-5 text-primary" />
        </div>
        <span className="text-base font-bold flex-1 text-start">{L.title}</span>
        <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-primary">{rows.length}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-primary/20">
          <div className="px-4 py-3 border-b border-primary/20 bg-secondary/30 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{L.sort}:</span>
            <SortPill field="date" label={L.byDate} />
            <SortPill field="minutes" label={L.byMins} />
            <SortPill field="points" label={L.byPoints} />
          </div>
          <div className="max-h-[28rem] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">{L.loading}</p>
            ) : sortedRows.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground text-center">{L.empty}</p>
            ) : (
              <ul className="divide-y divide-border">
                {sortedRows.map((r) => {
                  const s = SUBJ_LBL[r.subject];
                  const subjName = s ? (language === "ar" ? s.ar : s.en) : r.subject;
                  const mins = Math.round(r.duration_seconds / 60);
                  const date = new Date(r.created_at).toLocaleDateString(language === "ar" ? "ar-EG" : undefined, { year: "numeric", month: "short", day: "numeric" });
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-foreground">{subjName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground font-mono">{mins} {L.mins}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono font-semibold">+{r.points} {L.pts}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{date} — {r.mission || L.noMission}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setConfirmId(r.id)} className="text-destructive border-destructive/40 hover:bg-destructive/10 gap-1 shrink-0">
                        <Trash2 className="w-4 h-4" /> {L.delete}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{L.confirmT}</AlertDialogTitle>
            <AlertDialogDescription>{L.confirmD}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{L.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmId && doDelete(confirmId)}>{L.yes}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const SessionTodos = ({
  language,
  onPick,
  selectedText,
  pickDisabled,
}: {
  language: AppLanguage;
  onPick?: (text: string) => void;
  selectedText?: string;
  pickDisabled?: boolean;
}) => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(TODO_STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [open, setOpen] = useState(!!onPick);

  useEffect(() => {
    const onChange = () => {
      try { setTodos(JSON.parse(localStorage.getItem(TODO_STORAGE_KEY) || "[]")); } catch { /* noop */ }
    };
    window.addEventListener("app:todos-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("app:todos-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await pullTodos();
      if (cancelled || !remote) return;
      const local: TodoItem[] = (() => {
        try { return JSON.parse(localStorage.getItem(TODO_STORAGE_KEY) || "[]"); } catch { return []; }
      })();
      const seen = new Set(remote.map((r) => r.id));
      const merged = [...remote, ...local.filter((l) => !seen.has(l.id))] as TodoItem[];
      setTodos(merged);
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(merged));
    })();
    return () => { cancelled = true; };
  }, []);

  const toggle = (id: string) => {
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(next));
      pushTodos(next);
      try { window.dispatchEvent(new Event("app:todos-changed")); } catch { /* noop */ }
      return next;
    });
  };

  const L = language === "ar"
    ? { title: "قائمة مهامي", empty: "لا توجد مهام. أضفها من صفحة المهام.", done: "منجزة", pick: "اختر كمهمة", picked: "المهمة الحالية", hint: "اضغط على مهمة لجعلها مهمة هذه الجلسة." }
    : { title: "My To-Do List", empty: "No tasks. Add some from the To-Do page.", done: "done", pick: "Use as mission", picked: "Current mission", hint: "Tap a task to make it this session's mission." };

  const completed = todos.filter((t) => t.done).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-secondary/30 backdrop-blur overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition"
      >
        <ListChecks className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold flex-1 text-start">{L.title}</span>
        <span className="text-xs text-muted-foreground">{completed}/{todos.length} {L.done}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-white/10 max-h-64 overflow-y-auto">
          {onPick && todos.length > 0 && (
            <p className="px-4 pt-3 text-[11px] text-muted-foreground">{L.hint}</p>
          )}
          {todos.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-foreground text-center">{L.empty}</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {todos.map((t) => {
                const isPicked = !!onPick && !!selectedText && selectedText === t.text;
                return (
                <li key={t.id} className={`flex items-center gap-3 px-4 py-2.5 ${isPicked ? "bg-primary/10" : ""}`}>
                  <button
                    type="button"
                    onClick={() => toggle(t.id)}
                    className="shrink-0"
                    aria-label="toggle"
                  >
                    {t.done
                      ? <CheckCircle2 className="w-5 h-5 text-primary" />
                      : <Circle className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  {onPick ? (
                    <button
                      type="button"
                      disabled={pickDisabled}
                      onClick={() => onPick(t.text)}
                      className={`text-sm flex-1 text-start ${t.done ? "line-through text-muted-foreground" : ""} ${pickDisabled ? "opacity-60 cursor-not-allowed" : "hover:text-primary"}`}
                    >
                      {t.text}
                    </button>
                  ) : (
                    <span className={`text-sm flex-1 ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.text}</span>
                  )}
                  {onPick && (
                    isPicked ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary shrink-0">{L.picked}</span>
                    ) : (
                      <button
                        type="button"
                        disabled={pickDisabled}
                        onClick={() => onPick(t.text)}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-primary/40 text-primary shrink-0 disabled:opacity-50"
                      >
                        {L.pick}
                      </button>
                    )
                  )}
                  {t.day && <span className="text-[10px] text-muted-foreground">{t.day}</span>}
                </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const MUSIC_TRACKS = [track1Asset.url, track2Asset.url, track3Asset.url, track4Asset.url, track5Asset.url, track6Asset.url];
const QURAN_TRACKS = [quranTrackAsset.url];
const MAX_SECONDS = 48 * 3600;
const PERSIST_KEY = "study_session_state_v1";
const POMODORO_KEY = "pomodoro_settings_v1";
const DEFAULT_WORK_MIN = 45;
const DEFAULT_REST_MIN = 15;

// Play a multi-beep alarm via WebAudio (no asset needed).
const playAlarm = () => {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;
    const beeps = 6;
    for (let i = 0; i < beeps; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      const t0 = now + i * 0.35;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.5, t0 + 0.02);
      g.gain.linearRampToValueAtTime(0, t0 + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 0.27);
    }
    setTimeout(() => ctx.close().catch(() => {}), beeps * 400 + 500);
  } catch {}
};

const SUBJECTS = [
  { code: "islamic", en: "Islamic", ar: "التربية الإسلامية", Icon: Moon },
  { code: "arabic", en: "Arabic", ar: "العربية", Icon: BookOpen },
  { code: "english", en: "English", ar: "الإنجليزية", Icon: Languages },
  { code: "french", en: "French", ar: "الفرنسية", Icon: Globe },
  { code: "math", en: "Math", ar: "الرياضيات", Icon: Sigma },
  { code: "physics", en: "Physics", ar: "الفيزياء", Icon: Atom },
  { code: "chemistry", en: "Chemistry", ar: "الكيمياء", Icon: FlaskConical },
  { code: "biology", en: "Biology", ar: "الأحياء", Icon: Leaf },
] as const;

const SUBJECT_TINTS: Record<string, { card: string; icon: string }> = {
  islamic: { card: "border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15", icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  arabic: { card: "border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/15", icon: "bg-rose-500/15 text-rose-600 dark:text-rose-300" },
  english: { card: "border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/15", icon: "bg-blue-500/15 text-blue-600 dark:text-blue-300" },
  french: { card: "border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/15", icon: "bg-violet-500/15 text-violet-600 dark:text-violet-300" },
  math: { card: "border-indigo-500/25 bg-indigo-500/10 hover:bg-indigo-500/15", icon: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300" },
  physics: { card: "border-sky-500/25 bg-sky-500/10 hover:bg-sky-500/15", icon: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  chemistry: { card: "border-orange-500/25 bg-orange-500/10 hover:bg-orange-500/15", icon: "bg-orange-500/15 text-orange-600 dark:text-orange-300" },
  biology: { card: "border-lime-500/25 bg-lime-500/10 hover:bg-lime-500/15", icon: "bg-lime-500/15 text-lime-700 dark:text-lime-300" },
};

const T = {
  en: {
    title: "Study Sessions", desc: "Pick a subject, set a mission, and earn points.",
    leaderboard: "Leaderboard", mission: "Mission for this session", missionPh: "e.g. Finish chapter 3 exercises",
    start: "Start", pause: "Pause", resume: "Resume", stop: "Stop & save",
    completed: "Mark mission completed", points: "pts", hours: "hours", minutes: "min", noOne: "No scores yet.",
    switchRoom: "Switch room",
    saved: "Session saved",
    pointsTitle: "How points work",
    pointsLine1: "You earn 5 points for every full hour you study.",
    pointsLine2: "Mark your mission complete to keep a clear record of your progress.",
    pointsLine3: "Points add up per subject on the leaderboard.",
    pomodoro: "Pomodoro",
    pomodoroOn: "On",
    pomodoroOff: "Off",
    workPhase: "Focus time",
    restPhase: "Break time",
    workDone: "Time for a break!",
    restDone: "Break over — back to focus!",
    workMin: "Study minutes",
    restMin: "Rest minutes",
    discard: "Discard session",
    discarded: "Session discarded",
    discardTitle: "Discard this session?",
    discardIntro: "This will permanently remove the current session. The following will NOT be saved:",
    discardBullet1: "Time studied so far in this session",
    discardBullet2: "Points you would have earned (5 per full hour)",
    discardBullet3: "Your mission text and completion status",
    discardNote: "Your past saved sessions and leaderboard score are not affected. This action cannot be undone.",
    discardCancel: "Keep session",
    discardConfirmBtn: "Yes, discard",
    hourTitle: "One hour completed!",
    hourDesc: "Great work — take a quick breath. Click continue when you're ready to keep studying.",
    hourContinue: "Continue session",
  },
  ar: {
    title: "جلسات الدراسة", desc: "اختر مادة وحدد مهمتك واكسب النقاط.",
    leaderboard: "لوحة المتصدرين", mission: "مهمة هذه الجلسة", missionPh: "مثلاً: إنهاء تمارين الفصل 3",
    start: "ابدأ", pause: "إيقاف مؤقت", resume: "متابعة", stop: "إيقاف وحفظ",
    completed: "تم إنجاز المهمة", points: "نقطة", hours: "ساعة", minutes: "دقيقة", noOne: "لا توجد نتائج بعد.",
    switchRoom: "تغيير الغرفة",
    saved: "تم حفظ الجلسة",
    pointsTitle: "كيف تُحسب النقاط",
    pointsLine1: "تحصل على 5 نقاط لكل ساعة دراسة كاملة.",
    pointsLine2: "علّم المهمة كمكتملة حتى يبقى إنجازك واضحاً بسجل الجلسات.",
    pointsLine3: "تتجمع النقاط لكل مادة على لوحة المتصدرين.",
    pomodoro: "بومودورو",
    pomodoroOn: "مفعّل",
    pomodoroOff: "متوقف",
    workPhase: "وقت التركيز",
    restPhase: "وقت الراحة",
    workDone: "حان وقت الاستراحة!",
    restDone: "انتهت الاستراحة — عُد للتركيز!",
    workMin: "دقائق الدراسة",
    restMin: "دقائق الراحة",
    discard: "إلغاء الجلسة",
    discarded: "تم إلغاء الجلسة",
    discardTitle: "إلغاء هذه الجلسة؟",
    discardIntro: "سيتم حذف الجلسة الحالية نهائياً. لن يتم حفظ ما يلي:",
    discardBullet1: "الوقت الذي درسته في هذه الجلسة",
    discardBullet2: "النقاط التي كنت ستكسبها (5 نقاط لكل ساعة كاملة)",
    discardBullet3: "نص المهمة وحالة الإنجاز",
    discardNote: "جلساتك المحفوظة سابقاً ونقاطك على لوحة المتصدرين لن تتأثر. لا يمكن التراجع عن هذا الإجراء.",
    discardCancel: "الاحتفاظ بالجلسة",
    discardConfirmBtn: "نعم، احذف",
    hourTitle: "أتممت ساعة كاملة!",
    hourDesc: "أحسنت — خذ نفساً سريعاً. اضغط على متابعة عندما تكون جاهزاً لمواصلة الدراسة.",
    hourContinue: "متابعة الجلسة",
  },
} as const;

const fmt = (s: number) => {
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
};

const Sessions = ({ language, onBack }: { language: AppLanguage; onBack: () => void }) => {
  const L = T[language];
  const dir = language === "ar" ? "rtl" : "ltr";
  const [subject, setSubject] = useState<string | null>(null);
  const [mission, setMission] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [board, setBoard] = useState<{ name: string; points: number }[]>([]);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [pomodoro, setPomodoro] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [hourPauseOpen, setHourPauseOpen] = useState(false);
  const lastHourPromptRef = useRef(0);
  const [pomodoroWorkMin, setPomodoroWorkMin] = useState(DEFAULT_WORK_MIN);
  const [pomodoroRestMin, setPomodoroRestMin] = useState(DEFAULT_REST_MIN);
  const [phase, setPhase] = useState<"work" | "rest">("work");
  const phaseStartRef = useRef(0);
  const lastPhaseSwitchRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  // Wall-clock timer refs: drift-proof across device sleep / background tabs.
  const resumeAtRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [playlist, setPlaylist] = useState<"music" | "quran">("music");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const TRACKS = playlist === "quran" ? QURAN_TRACKS : MUSIC_TRACKS;
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const savingRef = useRef(false);
  const heartbeatRef = useRef<number | null>(null);
  // Mirror the studying timer so presence writes can reflect accumulated seconds
  // (paused-aware), making the room timer match the user's own timer exactly.
  const secondsRef = useRef(0);
  useEffect(() => { secondsRef.current = seconds; }, [seconds]);
  const runningRef = useRef(false);
  useEffect(() => { runningRef.current = running; }, [running]);
  // Mirror identity/progress fields so the pagehide flush can write the
  // latest values even after React has begun tearing the component down.
  const subjectRef = useRef<string | null>(null);
  const missionRef = useRef("");
  const completedRef = useRef(false);
  const startedRef = useRef(false);
  useEffect(() => { subjectRef.current = subject; }, [subject]);
  useEffect(() => { missionRef.current = mission; }, [mission]);
  useEffect(() => { completedRef.current = completed; }, [completed]);
  useEffect(() => { startedRef.current = started; }, [started]);

  // Pomodoro phase switching: work min of studying triggers rest min rest, then back to work.
  useEffect(() => {
    if (!pomodoro || !started) return;
    if (phase === "work") {
      const workElapsed = seconds - phaseStartRef.current;
      if (workElapsed >= pomodoroWorkMin * 60 && lastPhaseSwitchRef.current !== seconds) {
        lastPhaseSwitchRef.current = seconds;
        setPhase("rest");
        phaseStartRef.current = Date.now();
        setRunning(false);
        toast.success(L.workDone);
        playAlarm();
      }
    }
  }, [seconds, pomodoro, started, phase, pomodoroWorkMin, L.workDone]);

  // Force a check-in pause after every full hour of studying.
  useEffect(() => {
    if (!started || !running) return;
    const hourMark = Math.floor(seconds / 3600);
    if (hourMark > 0 && hourMark > lastHourPromptRef.current) {
      lastHourPromptRef.current = hourMark;
      setRunning(false);
      setHourPauseOpen(true);
      try { playAlarm(); } catch { /* noop */ }
    }
  }, [seconds, started, running]);

  // Rest timer (separate, real-time)
  const [restRemaining, setRestRemaining] = useState(0);
  useEffect(() => {
    if (!pomodoro || phase !== "rest" || !started) return;
    const restSeconds = pomodoroRestMin * 60;
    setRestRemaining(restSeconds);
    const start = Date.now();
    const id = window.setInterval(() => {
      const left = restSeconds - Math.floor((Date.now() - start) / 1000);
      if (left <= 0) {
        window.clearInterval(id);
        setRestRemaining(0);
        setPhase("work");
        phaseStartRef.current = secondsRef.current;
        lastPhaseSwitchRef.current = -1;
        setRunning(true);
        toast.success(L.restDone);
        playAlarm();
      } else {
        setRestRemaining(left);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [phase, pomodoro, started, pomodoroRestMin, L.restDone]);

  // --- Live presence helpers ---
  const upsertPresence = async (subj: string, miss: string) => {
    if (!userId) return;
    if (!startedRef.current) return;
    const nowMs = Date.now();
    const startedIso = new Date(nowMs - secondsRef.current * 1000).toISOString();
    const nowIso = new Date(nowMs).toISOString();
    try {
      await supabase.from("active_sessions").upsert(
      {
        user_id: userId,
        subject: subj,
        mission: miss.slice(0, 200),
        last_seen_at: nowIso,
        started_at: startedIso,
        elapsed_seconds: secondsRef.current,
        is_running: runningRef.current,
      },
      { onConflict: "user_id" }
      );
    } catch { /* transient network error — heartbeat retries */ }
  };
  const clearPresence = async () => {
    if (!userId) return;
    try {
      await supabase.from("active_sessions").delete().eq("user_id", userId);
    } catch { /* ignore */ }
  };

  // Push a single presence update (used by heartbeat, focus, and pause/resume).
  // Uses upsert so presence is recreated after a session was stopped/cleared.
  const pushPresence = async () => {
    if (!userId) return;
    const nowMs = Date.now();
    const startedIso = new Date(nowMs - secondsRef.current * 1000).toISOString();
    if (!subjectRef.current || !startedRef.current) return;
    try {
      await supabase.from("active_sessions").upsert(
        {
          user_id: userId,
          subject: subjectRef.current,
          mission: (missionRef.current ?? "").slice(0, 200),
          last_seen_at: new Date(nowMs).toISOString(),
          started_at: startedIso,
          elapsed_seconds: secondsRef.current,
          is_running: runningRef.current,
        },
        { onConflict: "user_id" },
      );
    } catch { /* transient network error — next heartbeat retries */ }
  };

  // Heartbeat while a subject is selected so the room keeps showing the user
  // (even while paused). Only fully clear presence when leaving the page.
  useEffect(() => {
    if (heartbeatRef.current) { window.clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
    if (userId && subject && started) {
      upsertPresence(subject, mission);
      heartbeatRef.current = window.setInterval(() => {
        pushPresence();
      }, 10000);
      // Also refresh on tab focus (setInterval is throttled in background tabs).
      const onVis = () => {
        if (document.visibilityState === "visible" && userId) pushPresence();
      };
      document.addEventListener("visibilitychange", onVis);
      window.addEventListener("focus", onVis);
      return () => {
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("focus", onVis);
        if (heartbeatRef.current) { window.clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
      };
    }
    return () => {
      if (heartbeatRef.current) { window.clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, subject, started]);

  // Immediate sync whenever play/pause toggles so the room reflects it instantly.
  useEffect(() => {
    if (userId && subject && started) pushPresence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Keep presence alive even when leaving Sessions — the timer continues counting
  // in the background and the user stays visible in the room. Presence is only
  // cleared when the user explicitly stops/saves or switches rooms.

  // Restore persisted session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERSIST_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s?.subject) return;
      const base = s.accumulated ?? 0;
      const extra = s.running && s.startedAt ? Math.floor((Date.now() - s.startedAt) / 1000) : 0;
      let total = base + extra;
      if (total >= MAX_SECONDS) total = MAX_SECONDS;
      setSubject(s.subject);
      setMission(s.mission ?? "");
      setCompleted(!!s.completed);
      setStarted(true);
      setSeconds(total);
      setRunning(!!s.running && total < MAX_SECONDS);
      accumulatedRef.current = total;
      resumeAtRef.current = Date.now();
    } catch {}
  }, []);

  // Restore pomodoro settings on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POMODORO_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.workMin === "number") setPomodoroWorkMin(Math.max(1, Math.min(180, s.workMin)));
      if (typeof s.restMin === "number") setPomodoroRestMin(Math.max(1, Math.min(180, s.restMin)));
    } catch {}
  }, []);

  // Persist on relevant state changes
  useEffect(() => {
    if (!started || !subject) return;
    // Anchor the running timer to its actual resume moment so that backgrounded
    // tabs (where setInterval is throttled and `seconds` goes stale) still
    // restore the correct elapsed time on reopen.
    const payload = {
      subject, mission, completed, started: true,
      running,
      startedAt: running ? resumeAtRef.current || Date.now() : null,
      accumulated: running ? accumulatedRef.current : seconds,
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));
  }, [started, subject, mission, completed, running, seconds]);

  // Flush the latest session snapshot whenever the page is about to be hidden
  // or unloaded (tab close, route change, mobile background). Using refs keeps
  // the write resilient to stale React state from throttled intervals.
  useEffect(() => {
    const flush = () => {
      if (!startedRef.current || !subjectRef.current) return;
      const isRunning = runningRef.current;
      const liveSeconds = isRunning && resumeAtRef.current
        ? Math.min(
            MAX_SECONDS,
            accumulatedRef.current + Math.floor((Date.now() - resumeAtRef.current) / 1000),
          )
        : secondsRef.current;
      const payload = {
        subject: subjectRef.current,
        mission: missionRef.current,
        completed: completedRef.current,
        started: true,
        running: isRunning,
        startedAt: isRunning ? (resumeAtRef.current || Date.now()) : null,
        accumulated: isRunning ? accumulatedRef.current : liveSeconds,
      };
      try { localStorage.setItem(PERSIST_KEY, JSON.stringify(payload)); } catch {}
    };
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  // Persist pomodoro settings
  useEffect(() => {
    localStorage.setItem(POMODORO_KEY, JSON.stringify({ workMin: pomodoroWorkMin, restMin: pomodoroRestMin }));
  }, [pomodoroWorkMin, pomodoroRestMin]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      if (!u) return;
      setUserId(u.id);
      const { data: prof } = await supabase.from("profiles").select("display_name").eq("user_id", u.id).maybeSingle();
      if (prof?.display_name) setDisplayName(prof.display_name);
      else {
        const fallback = u.email?.split("@")[0] ?? "Student";
        setDisplayName(fallback);
        await supabase.from("profiles").insert({ user_id: u.id, display_name: fallback });
      }
    });
  }, []);

  useEffect(() => {
    if (!subject) return;
    loadBoard(subject);
  }, [subject]);

  useEffect(() => {
    if (running) {
      resumeAtRef.current = Date.now();
      accumulatedRef.current = secondsRef.current;
      const tick = () => {
        const elapsed = accumulatedRef.current + Math.floor((Date.now() - resumeAtRef.current) / 1000);
        if (elapsed >= MAX_SECONDS) { setSeconds(MAX_SECONDS); setRunning(false); }
        else setSeconds(elapsed);
      };
      tick();
      intervalRef.current = window.setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Recompute elapsed when tab regains focus
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      if (runningRef.current) {
        const elapsed = accumulatedRef.current + Math.floor((Date.now() - resumeAtRef.current) / 1000);
        if (elapsed >= MAX_SECONDS) { setSeconds(MAX_SECONDS); setRunning(false); }
        else setSeconds(elapsed);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    window.addEventListener("pageshow", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      window.removeEventListener("pageshow", onVis);
    };
  }, []);

  // Auto stop+save at max
  useEffect(() => {
    if (started && seconds >= MAX_SECONDS && running === false) {
      // fire once
      stopAndSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, started]);

  // Music volume sync
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const loadBoard = async (subj: string) => {
    const { data } = await supabase.from("study_sessions").select("user_id,points").eq("subject", subj);
    if (!data) return;
    const map = new Map<string, number>();
    data.forEach((r: any) => map.set(r.user_id, (map.get(r.user_id) ?? 0) + (r.points ?? 0)));
    const ids = Array.from(map.keys());
    if (ids.length === 0) { setBoard([]); return; }
    const { data: profs } = await supabase.from("profiles").select("user_id,display_name").in("user_id", ids);
    const nameMap = new Map<string, string>();
    (profs ?? []).forEach((p: any) => nameMap.set(p.user_id, p.display_name));
    const rows = ids
      .map((id) => ({ name: nameMap.get(id) ?? "Student", points: map.get(id) ?? 0 }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);
    setBoard(rows);
  };

  const startSession = () => {
    if (!mission.trim()) { toast.error(language === "ar" ? "أدخل مهمتك" : "Type a mission first"); return; }
    setStarted(true);
    setRunning(true);
    setPhase("work");
    phaseStartRef.current = 0;
    lastPhaseSwitchRef.current = -1;
    lastHourPromptRef.current = 0;
    setHourPauseOpen(false);
  };

  const stopAndSave = async () => {
    if (!userId || !subject) return;
    if (savingRef.current) return;
    if (seconds <= 0) {
      setStarted(false); setRunning(false); setMission(""); setCompleted(false);
      localStorage.removeItem(PERSIST_KEY);
      return;
    }
    savingRef.current = true;
    setRunning(false);
    // 5 points per full studied hour.
    const points = Math.floor(seconds / 3600) * 5;
    let insertedId: string | null = null;
    let lastErr: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data: inserted, error } = await supabase.from("study_sessions").insert({
          user_id: userId, subject, mission: mission.trim(), duration_seconds: seconds,
          mission_completed: completed, points,
        }).select("id").single();
        if (!error) { insertedId = inserted?.id ?? null; lastErr = null; break; }
        lastErr = error.message;
        if (!/fetch|network|timeout/i.test(error.message)) break;
      } catch (e: any) {
        lastErr = e?.message ?? "Network error";
      }
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
    if (lastErr) {
      savingRef.current = false;
      toast.error(lastErr);
      return;
    }
    try { await clearPresence(); } catch { /* ignore */ }
    if (points > 0 && insertedId) {
      try {
        await supabase.rpc("award_points_safe", {
          _source: "session", _points: points, _ref_id: insertedId,
        });
      } catch { /* points can be reconciled later; the session is saved */ }
    }
    toast.success(`${L.saved} (+${points} ${L.points})`);
    try { localStorage.setItem("session_completed_today_v1", new Date().toISOString().slice(0,10)); } catch {}
    setStarted(false); setSeconds(0); setMission(""); setCompleted(false);
    localStorage.removeItem(PERSIST_KEY);
    setPhase("work");
    phaseStartRef.current = 0;
    lastPhaseSwitchRef.current = -1;
    loadBoard(subject);
    setTimeout(() => { savingRef.current = false; }, 500);
  };

  const discardSession = async () => {
    if (!started) return;
    setRunning(false);
    await clearPresence();
    setStarted(false);
    setSeconds(0);
    setMission("");
    setCompleted(false);
    accumulatedRef.current = 0;
    resumeAtRef.current = 0;
    setPhase("work");
    phaseStartRef.current = 0;
    lastPhaseSwitchRef.current = -1;
    localStorage.removeItem(PERSIST_KEY);
    setDiscardOpen(false);
    lastHourPromptRef.current = 0;
    setHourPauseOpen(false);
    toast.success(L.discarded);
  };

  const toggleMusic = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (musicPlaying) { a.pause(); setMusicPlaying(false); }
    else { try { await a.play(); setMusicPlaying(true); } catch {} }
  };
  const nextTrack = () => {
    setTrackIdx((i) => (i + 1) % TRACKS.length);
    setTimeout(() => { if (musicPlaying) audioRef.current?.play().catch(() => {}); }, 50);
  };

  const switchPlaylist = (p: "music" | "quran") => {
    if (p === playlist) return;
    setPlaylist(p);
    setTrackIdx(0);
    setTimeout(() => { if (musicPlaying) audioRef.current?.play().catch(() => {}); }, 50);
  };

  if (!subject) {
    return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:py-12" dir={dir}>
        <div aria-hidden="true" className="pointer-events-none absolute -top-28 -end-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute top-[36rem] -start-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <button onClick={onBack} aria-label={language === "ar" ? "رجوع" : "Back"} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/80 px-3 text-sm font-semibold text-muted-foreground backdrop-blur hover:text-foreground">
            <ArrowLeft className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} /> {language === "ar" ? "رجوع" : "Back"}
          </button>
          <header className="relative mb-6 overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/15 via-card to-cyan-500/10 p-6 shadow-[0_24px_70px_-38px_hsl(var(--primary)/0.55)] md:p-9">
            <div aria-hidden="true" className="absolute -end-12 -top-16 h-48 w-48 rounded-full border-[30px] border-primary/10" />
            <div className="relative max-w-2xl">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> {language === "ar" ? "ركّز وأنجز" : "Focus and achieve"}</span>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">{L.title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{L.desc}</p>
            </div>
          </header>

          <section className="mb-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div><h2 className="text-xl font-extrabold">{language === "ar" ? "اختار المادة وابدأ" : "Choose a subject to begin"}</h2><p className="mt-1 text-sm text-muted-foreground">{language === "ar" ? "تگدر تغيّر الغرفة بعدين بدون ما تخسر وقتك." : "You can switch rooms later without losing your time."}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {SUBJECTS.map((s) => {
                const SIcon = s.Icon;
                const tint = SUBJECT_TINTS[s.code];
                return (
                  <button key={s.code} onClick={() => setSubject(s.code)} className={`group min-h-32 rounded-2xl border p-4 text-start shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${tint.card}`}>
                    <span className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${tint.icon}`}><SIcon className="h-5 w-5" /></span>
                    <span className="flex items-center gap-2"><span className="min-w-0 flex-1 font-bold">{language === "ar" ? s.ar : s.en}</span><ChevronRight className={`h-4 w-4 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5 ${dir === "rtl" ? "rotate-180" : ""}`} /></span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            {[L.pointsLine1, L.pointsLine2, L.pointsLine3].map((line, i) => (
              <div key={line} className="flex gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 text-sm"><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">{i + 1}</span><span className="leading-relaxed text-muted-foreground">{line}</span></div>
            ))}
          </div>

        <PrivateStudyRooms language={language}>
          <div className="text-sm font-semibold mb-1">
            {language === "ar" ? "ابدأ مؤقت الدراسة وأنت داخل غرفتك الخاصة" : "Start your study timer inside your private room"}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {language === "ar"
              ? "اختر المادة وستبقى غرفتك الخاصة والدردشة ظاهرة مع المؤقت والبومودورو والموسيقى."
              : "Pick a subject — your private room and chat stay visible along with the timer, pomodoro and music."}
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s.code}
                onClick={() => setSubject(s.code)}
                className="px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
              >
                {language === "ar" ? s.ar : s.en}
              </button>
            ))}
          </div>
        </PrivateStudyRooms>
          <div className="mt-8"><SessionsHistory language={language} userId={userId} /></div>
        </div>
      </main>
    );
  }

  const subj = SUBJECTS.find((s) => s.code === subject)!;
  const ActiveSubjectIcon = subj.Icon;
  const activeTint = SUBJECT_TINTS[subj.code];
  const nextHourProgress = ((seconds % 3600) / 3600) * 100;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:py-12" dir={dir}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-28 -end-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/80 px-3 text-sm font-semibold text-muted-foreground backdrop-blur hover:text-foreground">
          <ArrowLeft className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} /> {language === "ar" ? "الرئيسية" : "Home"}
        </button>
        <header className={`mb-6 rounded-[2rem] border p-5 shadow-sm ${activeTint.card}`}>
          <div className="flex items-center gap-4">
            <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${activeTint.icon}`}><ActiveSubjectIcon className="h-6 w-6" /></span>
            <div className="min-w-0 flex-1"><h1 className="truncate text-2xl font-black md:text-3xl">{language === "ar" ? subj.ar : subj.en}</h1><p className="mt-0.5 text-sm text-muted-foreground">{displayName}</p></div>
            {started && <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${running ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-amber-500/15 text-amber-600 dark:text-amber-300"}`}><span className={`h-2 w-2 rounded-full ${running ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`} />{running ? (language === "ar" ? "يدرس الآن" : "Focusing") : (language === "ar" ? "متوقف مؤقتاً" : "Paused")}</span>}
          </div>
        </header>

        {/* All session features live inside the private room card */}
        <PrivateStudyRooms language={language}>
        <div className="rounded-[2rem] border border-border/70 bg-card/80 p-5 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.55)] backdrop-blur md:p-8 space-y-5">
          <label className="block">
            <span className="text-sm text-muted-foreground flex items-center gap-2 mb-2"><Target className="w-4 h-4" /> {L.mission}</span>
            <Input value={mission} onChange={(e) => setMission(e.target.value)} placeholder={L.missionPh} disabled={started} maxLength={200} />
          </label>

          <SessionTodos
            language={language}
            onPick={(text) => { if (!started) setMission(text.slice(0, 200)); }}
            selectedText={mission}
            pickDisabled={started}
          />

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => !started && setPomodoro((v) => !v)}
              disabled={started}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${pomodoro ? "border-primary bg-primary/15 text-primary" : "border-white/10 bg-secondary/40 text-muted-foreground"} ${started ? "opacity-60 cursor-not-allowed" : "hover:border-primary/60"}`}
            >
              <Coffee className="w-4 h-4" />
              <span>{L.pomodoro}</span>
              <span className="text-xs opacity-80">· {pomodoro ? L.pomodoroOn : L.pomodoroOff}</span>
            </button>
          </div>

          {!started && pomodoro && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm">
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{L.workMin}</span>
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={pomodoroWorkMin}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setPomodoroWorkMin(Math.max(1, Math.min(180, v)));
                  }}
                  className="w-20 text-center"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{L.restMin}</span>
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={pomodoroRestMin}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setPomodoroRestMin(Math.max(1, Math.min(180, v)));
                  }}
                  className="w-20 text-center"
                />
              </label>
            </div>
          )}

          {started && pomodoro && (
            <div className={`text-center text-sm font-semibold ${phase === "rest" ? "text-primary" : "text-muted-foreground"}`}>
              {phase === "rest"
                ? `${L.restPhase} — ${fmt(restRemaining)}`
                : L.workPhase}
            </div>
          )}

          <div className="py-5 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{started ? (running ? L.workPhase : L.pause) : (language === "ar" ? "جاهز للبدء" : "Ready to focus")}</p>
            <div className="font-mono text-5xl font-black tracking-tight text-foreground md:text-7xl">{fmt(seconds)}</div>
            <div className="mx-auto mt-5 max-w-md"><div className="mb-1.5 flex justify-between text-[10px] text-muted-foreground"><span>{language === "ar" ? "التقدم نحو الساعة القادمة" : "Progress to next hour"}</span><span>{Math.floor(nextHourProgress)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-foreground/10"><div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all" style={{ width: `${nextHourProgress}%` }} /></div></div>
          </div>

          {started && (
            <label className="flex items-center gap-2 justify-center text-sm">
              <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
              <span>{L.completed}</span>
            </label>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {!started ? (
              <Button size="lg" onClick={startSession} className="h-12 min-w-40 gap-2 rounded-xl text-base shadow-lg shadow-primary/20"><Play className="w-5 h-5" /> {L.start}</Button>
            ) : (
              <>
                {running ? (
                  <Button size="lg" variant="secondary" onClick={() => setRunning(false)} className="gap-2"><Pause className="w-4 h-4" /> {L.pause}</Button>
                ) : (
                  <Button size="lg" onClick={() => setRunning(true)} className="gap-2"><Play className="w-4 h-4" /> {L.resume}</Button>
                )}
                <Button size="lg" variant="destructive" onClick={stopAndSave} className="gap-2"><Square className="w-4 h-4" /> {L.stop}</Button>
                <Button size="lg" variant="outline" onClick={() => setDiscardOpen(true)} className="gap-2"><Trash2 className="w-4 h-4" /> {L.discard}</Button>
              </>
            )}
          </div>

          {started && (
            <div className="flex justify-center">
              <button
                onClick={async () => {
                  // Switch room without ending the session: pause the timer,
                  // clear presence in the current room, and return to room picker.
                  // The session (time, mission, completion) is preserved and will
                  // continue under whichever room the user enters next.
                  setRunning(false);
                  await clearPresence();
                  setSubject(null);
                }}
                className="text-xs text-primary underline underline-offset-4 hover:text-primary/80"
              >
                {L.switchRoom}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur">
          <Music className="w-5 h-5 text-primary" />
          <div className="flex rounded-full border border-white/10 overflow-hidden text-xs">
            <button onClick={() => switchPlaylist("music")} className={`px-3 py-1 ${playlist === "music" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"}`}>{language === "ar" ? "موسيقى" : "Music"}</button>
            <button onClick={() => switchPlaylist("quran")} className={`px-3 py-1 ${playlist === "quran" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"}`}>{language === "ar" ? "قرآن" : "Quran"}</button>
          </div>
          <span className="text-sm font-medium">{language === "ar" ? `موسيقى ${trackIdx + 1}/${TRACKS.length}` : `Track ${trackIdx + 1}/${TRACKS.length}`}</span>
          <Button size="sm" variant="secondary" onClick={toggleMusic} className="gap-2">
            {musicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={nextTrack} className="gap-2"><SkipForward className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2 ml-auto">
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <input type="range" min={0} max={1} step={0.05} value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-28" />
          </div>
          <audio ref={audioRef} src={TRACKS[trackIdx]} loop preload="none" />
        </div>

        <SpotifyPlayerBlock language={language} />
        </PrivateStudyRooms>

        <section className="mt-8 rounded-[2rem] border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur md:p-5">
          <div className="mb-4 flex items-center gap-2"><span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Timer className="h-4 w-4" /></span><div><h2 className="font-extrabold">{language === "ar" ? "غرفة الدراسة المباشرة" : "Live study room"}</h2><p className="text-xs text-muted-foreground">{language === "ar" ? "شوف الطلاب اللي يدرسون نفس المادة وياك." : "See students focusing on the same subject."}</p></div></div>
          <StudyRoom language={language} subject={subject} currentUserId={userId} />
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-amber-500/25 bg-card/60 backdrop-blur">
          <button type="button" onClick={() => setLeaderboardOpen((value) => !value)} aria-expanded={leaderboardOpen} className="flex w-full items-center gap-3 p-3.5 text-start hover:bg-amber-500/10">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300"><Trophy className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{L.leaderboard}</span><span className="block truncate text-xs text-muted-foreground">{board.length > 0 ? `${board.length} ${language === "ar" ? "طالب" : "students"}${board[0] ? ` · #1 ${board[0].name}` : ""}` : L.noOne}</span></span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${leaderboardOpen ? "rotate-180" : ""}`} />
          </button>
          {leaderboardOpen && (
            <div className="border-t border-amber-500/15 p-3">
              {board.length === 0 ? (
                <p className="py-5 text-center text-sm text-muted-foreground">{L.noOne}</p>
              ) : (
                <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border/70 bg-card/70">
                  {board.map((r, i) => (
                    <li key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? "bg-amber-500 text-slate-950" : "bg-muted text-muted-foreground"}`}>{i + 1}</span><span>{r.name}</span></div>
                      <span className="font-semibold text-amber-600 dark:text-amber-300">{r.points} {L.points}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </section>
      </div>
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{L.discardTitle}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>{L.discardIntro}</p>
                <ul className="list-disc ps-5 space-y-1 text-foreground">
                  <li>{L.discardBullet1} <span className="text-primary font-mono">({fmt(seconds)})</span></li>
                  <li>{L.discardBullet2}</li>
                  <li>{L.discardBullet3}</li>
                </ul>
                <p className="text-muted-foreground">{L.discardNote}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{L.discardCancel}</AlertDialogCancel>
            <AlertDialogAction onClick={discardSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {L.discardConfirmBtn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={hourPauseOpen} onOpenChange={(o) => { if (!o) return; setHourPauseOpen(o); }}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{L.hourTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-sm">{L.hourDesc}</span>
              <span className="block mt-3 text-2xl font-mono text-primary">{fmt(seconds)}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setHourPauseOpen(false); setRunning(true); }}>
              {L.hourContinue}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default Sessions;
