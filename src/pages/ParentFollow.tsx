import { useEffect, useRef, useState } from "react";
import { CalendarDays, GraduationCap, Brain, ListChecks, CheckCircle2, Circle, Lock, Wrench, Clock3, Trophy, Target, RefreshCw, Eye, ShieldCheck, Activity, NotebookPen, Plus, Loader2, Award, FileDown, BarChart3, X, Printer, Download } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const PARENT_INPUT = "h-12 w-full rounded-xl border border-white/10 bg-[#111321]/80 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";


type Snapshot = {
  student_name: string;
  parent_name: string | null;
  total_points: number;
  days_to_exam: number | null;
  target_grade: number | null;
  weekly_goal_hours: number | null;
  last_7_days: Array<{ date: string; minutes: number }>;
  last_report: any;
  todays_todos?: Array<{ id: string; text: string; done: boolean; day?: string }>;
  channel?: string;
  today_minutes?: number;
  today_seconds?: number;
  today_per_subject?: Record<string, { minutes: number; sessions: number; missions: number }>;
  tools_used_today?: Array<{ feature: string; count: number }>;
  questions_solved_today?: number;
  weekly_days?: Array<{ date: string; minutes: number; sessions: number; missions: number; points: number; questions: number; tools: number; todo_done: number; todo_total: number; subjects: Record<string, number> }>;
  weekly_subjects?: Array<{ subject: string; minutes: number }>;
  parent_scores?: Array<{ id: string; subject: string; title: string; score: number; max_score: number; note: string | null; created_at: string }>;
  parent_notes?: Array<{ id: string; note_text: string; created_at: string }>;
};

const TOOL_LABELS: Record<string, string> = {
  mcq: "MCQ practice",
  "generate-mcq": "MCQ generator",
  agent: "Subject AI agent",
  video: "Video notes",
  "video-notes": "Video notes",
  "essay-coach": "Al-Musahhih",
  essay: "Al-Musahhih",
  english_essay: "English essay check",
  "hadith-verify": "Hadith verify",
  "poem-verify": "Poem verify",
  "surah-verify": "Surah verify",
};

export default function ParentFollow({ token }: { token: string }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string>(() => sessionStorage.getItem(`pf_code_${token}`) ?? "");
  const [unlocked, setUnlocked] = useState<boolean>(() => !!sessionStorage.getItem(`pf_code_${token}`));
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "report" | "scores" | "notes">("overview");
  const [exportingPdf, setExportingPdf] = useState(false);
  const weeklyReportRef = useRef<HTMLDivElement>(null);
  const pdfFrameRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState("weekly-report.pdf");
  const [savingEntry, setSavingEntry] = useState(false);
  const [entryMessage, setEntryMessage] = useState<string | null>(null);
  const [scoreForm, setScoreForm] = useState({ subject: "", title: "", score: "", maxScore: "100", note: "" });
  const [noteText, setNoteText] = useState("");

  const fetchSnapshot = async (codeArg?: string) => {
    const c = codeArg ?? code;
    // Use raw fetch: functions.invoke swallows the response body on non-2xx,
    // which hid the real reason (wrong code / revoked link) from parents.
    try {
      const url = `${SUPABASE_URL}/functions/v1/parent-follow-view`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ token, code: c }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || (d as any)?.error) {
        const reason = (d as any)?.error ?? `http_${res.status}`;
        if (reason === "code_required" || res.status === 401) {
          sessionStorage.removeItem(`pf_code_${token}`);
          setUnlocked(false);
          setErr("Incorrect access code. Ask the student for the 6-digit code shown in their app.");
        } else if (reason === "invalid_or_revoked" || res.status === 404) {
          setErr("invalid_or_revoked");
        } else if (res.status === 429) {
          setErr("Too many attempts. Please wait a minute and try again.");
          setUnlocked(false);
        } else {
          setErr(String(reason));
        }
        return null;
      }
      setData(d as Snapshot);
      setLastUpdated(new Date());
      setErr(null);
      return d as Snapshot;
    } catch (e: any) {
      setErr("Network error. Check your connection and try again.");
      return null;
    }
  };


  useEffect(() => {
    if (!unlocked) return;
    (async () => {
      setLoading(true);
      await fetchSnapshot();
      setLoading(false);
    })();
  }, [token, unlocked]);

  // Live-ish updates: poll every 45s while the tab is visible (cheaper than realtime).
  useEffect(() => {
    if (!unlocked) return;
    let id: number | null = null;
    const start = () => {
      if (id !== null) return;
      id = window.setInterval(() => { fetchSnapshot(); }, 45000);
    };
    const stop = () => {
      if (id !== null) { window.clearInterval(id); id = null; }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else { fetchSnapshot(); start(); }
    };
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => { document.removeEventListener("visibilitychange", onVisibility); stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, token]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim();
    if (clean.length < 4) { setErr("Enter the access code"); return; }
    setSubmitting(true);
    const res = await fetchSnapshot(clean);
    setSubmitting(false);
    if (res) {
      sessionStorage.setItem(`pf_code_${token}`, clean);
      setUnlocked(true);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchSnapshot();
    setRefreshing(false);
  };

  const saveParentEntry = async (action: "add_score" | "add_note", payload: Record<string, unknown>) => {
    setSavingEntry(true);
    setEntryMessage(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/parent-follow-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ token, code, action, payload }),
      });
      const next = await res.json().catch(() => null);
      if (!res.ok || next?.error) throw new Error(next?.error ?? "save_failed");
      setData(next as Snapshot);
      setLastUpdated(new Date());
      setEntryMessage(action === "add_score" ? "Score added successfully." : "Note added successfully.");
      if (action === "add_score") setScoreForm({ subject: "", title: "", score: "", maxScore: "100", note: "" });
      else setNoteText("");
    } catch {
      setEntryMessage("Could not save. Please check the values and try again.");
    } finally {
      setSavingEntry(false);
    }
  };

  const exportWeeklyPdf = async () => {
    const node = weeklyReportRef.current;
    if (!node || !data) return;
    setExportingPdf(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(node, {
        backgroundColor: "#f8fafc",
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: Math.max(node.scrollWidth, 900),
      });
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const printableHeight = pageHeight - margin * 2;
      const image = canvas.toDataURL("image/jpeg", 0.94);
      let offset = 0;
      do {
        if (offset > 0) pdf.addPage();
        pdf.addImage(image, "JPEG", margin, margin - offset, imageWidth, imageHeight, undefined, "FAST");
        offset += printableHeight;
      } while (offset < imageHeight);
      const safeName = data.student_name.replace(/[^\p{L}\p{N}_-]+/gu, "-");
      const fileName = `${safeName || "student"}-weekly-report.pdf`;
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfFileName(fileName);
      setPdfUrl(url);
    } catch (error) {
      console.error("Weekly report PDF export failed", error);
      setEntryMessage("The PDF could not be created. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  const closePdfViewer = () => setPdfUrl(null);

  const printPdf = () => {
    const frame = pdfFrameRef.current;
    if (frame?.contentWindow) {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      return;
    }
    if (pdfUrl) window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const PARCHMENT = "relative min-h-screen overflow-hidden bg-background text-foreground";
  const FONT_STYLE = { fontFamily: "Inter, 'IBM Plex Sans Arabic', system-ui, sans-serif" };

  if (!unlocked) {
    return (
      <main className={`${PARCHMENT} flex items-center justify-center p-5`} style={FONT_STYLE}>
        <div aria-hidden="true" className="absolute -top-24 -end-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -start-20 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
        <form onSubmit={submitCode} className="relative w-full max-w-md space-y-6 rounded-[2rem] border border-white/10 bg-[#191a2b]/95 p-7 text-center text-slate-100 shadow-[0_28px_80px_-35px_rgba(99,102,241,0.5)] backdrop-blur-xl sm:p-9">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/20 text-indigo-600 ring-1 ring-indigo-500/20 dark:text-indigo-300">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.32em] text-indigo-600 dark:text-indigo-300">Tamyzak</p>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}>Parent follow-up</h1>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">Enter the private 6-digit code shared by the student to view their progress.</p>
          </div>
          <input
            inputMode="numeric"
            autoFocus
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            aria-label="6-digit access code"
            className="h-16 w-full rounded-2xl border border-indigo-500/15 bg-indigo-500/5 text-center font-mono text-3xl font-bold tracking-[0.55em] text-foreground outline-none transition focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10"
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button type="submit" disabled={submitting || code.length < 4} className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-50">
            {submitting ? "Checking…" : "Unlock"}
          </button>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Private, secure and read-only</div>
        </form>
      </main>
    );
  }

  if (loading)
    return (
      <main className={`${PARCHMENT} flex items-center justify-center`}>
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
      </main>
    );

  if (!data)
    return (
      <main className={`${PARCHMENT} flex items-center justify-center p-6`} style={FONT_STYLE}>
        <div className="max-w-md space-y-3 rounded-[2rem] border border-white/10 bg-[#191a2b] p-8 text-center text-slate-100 shadow-2xl">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}>Link not available</h1>
          <p className="text-muted-foreground text-sm">
            {err && err !== "invalid_or_revoked" ? err : "This follow-up link is invalid or has been revoked by the student."}
          </p>
          <button
            onClick={() => { sessionStorage.removeItem(`pf_code_${token}`); setErr(null); setUnlocked(false); }}
            className="h-10 rounded-xl border border-border px-5 text-xs font-semibold hover:bg-muted"
          >
            Try another code
          </button>
        </div>
      </main>
    );


  const max = Math.max(1, ...data.last_7_days.map((d) => d.minutes));
  const r = data.last_report;
  const todayHours = (data.today_seconds ?? 0) / 3600;
  const studiedToday = todayHours >= 1 ? `${todayHours.toFixed(1)} h` : `${data.today_minutes ?? 0} min`;
  const perSubject = Object.entries(data.today_per_subject ?? {}).sort((a, b) => b[1].minutes - a[1].minutes);
  const tools = data.tools_used_today ?? [];
  const totalToolUses = tools.reduce((a, t) => a + t.count, 0);
  const todoTotal = data.todays_todos?.length ?? 0;
  const todoDone = data.todays_todos?.filter((todo) => todo.done).length ?? 0;
  const todoPct = todoTotal ? Math.round((todoDone / todoTotal) * 100) : 0;
  const weekMinutes = data.last_7_days.reduce((sum, day) => sum + day.minutes, 0);
  const weeklyDays = data.weekly_days ?? data.last_7_days.map((day) => ({ ...day, sessions: 0, missions: 0, points: 0, questions: 0, tools: 0, todo_done: 0, todo_total: 0, subjects: {} }));
  const weekSessions = weeklyDays.reduce((sum, day) => sum + day.sessions, 0);
  const weekMissions = weeklyDays.reduce((sum, day) => sum + day.missions, 0);
  const weekQuestions = weeklyDays.reduce((sum, day) => sum + day.questions, 0);
  const weekTodoDone = weeklyDays.reduce((sum, day) => sum + day.todo_done, 0);
  const weekTodoTotal = weeklyDays.reduce((sum, day) => sum + day.todo_total, 0);
  const weeklyGoalMinutes = Math.max(0, Number(data.weekly_goal_hours ?? 0) * 60);
  const weeklyGoalPct = weeklyGoalMinutes ? Math.min(100, Math.round((weekMinutes / weeklyGoalMinutes) * 100)) : null;
  const reportStart = weeklyDays[0]?.date;
  const reportEnd = weeklyDays[weeklyDays.length - 1]?.date;

  return (
    <main className={PARCHMENT} style={FONT_STYLE}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -end-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[42rem] -start-32 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-12">
        <header className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/25 via-[#1b1b31] to-violet-500/20 p-5 text-slate-100 shadow-[0_24px_70px_-35px_rgba(99,102,241,0.5)] md:p-8">
          <div aria-hidden="true" className="absolute -end-12 -top-16 h-48 w-48 rounded-full border-[30px] border-violet-500/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                <Eye className="h-3.5 w-3.5" /> Parent view · read-only
              </div>
              <p className="text-sm font-medium text-muted-foreground">Today's progress for</p>
              <h1 className="mt-1 truncate text-3xl font-black tracking-tight md:text-5xl" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
                {data.student_name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-indigo-500" /> Live progress</span>
                {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
              </div>
            </div>
            <button onClick={refresh} disabled={refreshing} aria-label="Refresh progress" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden text-xs font-bold sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Measure icon={Clock3} tone="indigo" label="Studied today" value={studiedToday} />
          <Measure icon={Trophy} tone="amber" label="Total points" value={`${data.total_points}`} />
          <Measure icon={Target} tone="rose" label="Target grade" value={data.target_grade != null ? `${data.target_grade}` : "—"} unit={data.target_grade != null ? "%" : undefined} />
          <Measure icon={CalendarDays} tone="cyan" label="Days to exam" value={data.days_to_exam != null ? `${data.days_to_exam}` : "—"} />
        </section>

        <nav className="mb-6 grid grid-cols-4 gap-1.5 rounded-2xl border border-white/10 bg-[#191a2b]/95 p-1.5 shadow-sm" aria-label="Parent follow-up sections">
          {([
            ["overview", "Overview", Activity],
            ["report", "Weekly", BarChart3],
            ["scores", "Scores", Award],
            ["notes", "Notes", NotebookPen],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => { setActiveTab(key); setEntryMessage(null); }}
              aria-current={activeTab === key ? "page" : undefined}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition sm:text-sm ${activeTab === key ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>

        {activeTab === "overview" && <div className="space-y-6 md:space-y-8">
          {/* Today's activity */}
          <Panel icon={Wrench} title="Today's activity">
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Mini label="Study time" value={studiedToday} tone="indigo" />
              <Mini label="Sessions" value={`${r?.sessions_count ?? 0}`} tone="violet" />
              <Mini label="Tools used" value={`${tools.length}`} tone="cyan" />
              <Mini label="Questions solved" value={`${data.questions_solved_today ?? 0}`} tone="emerald" />
            </div>

            {perSubject.length > 0 && (
              <div className="mb-6">
                <SubHeading>By subject</SubHeading>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {perSubject.map(([subj, v]) => (
                    <li key={subj} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm">
                      <div className="flex items-center justify-between gap-2"><span className="font-bold capitalize">{subj}</span><span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">{v.minutes} min</span></div>
                      <span className="mt-1 block text-xs text-muted-foreground">{v.sessions} sessions · {v.missions} missions</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tools.length > 0 ? (
              <div>
                <SubHeading>
                  Tools & AI features used <span className="font-mono normal-case tracking-normal">({totalToolUses} total)</span>
                </SubHeading>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {tools.map((t) => (
                    <li key={t.feature} className="flex items-center justify-between rounded-xl bg-violet-500/5 px-3 py-2.5 text-sm">
                      <span>{TOOL_LABELS[t.feature] ?? t.feature}</span>
                      <span className="font-mono tabular-nums">× {t.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No AI tools used yet today.</p>
            )}
          </Panel>

          {/* Last 7 days chart */}
          <Panel icon={CalendarDays} title="Last 7 days · focused minutes">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div><p className="text-xs text-muted-foreground">Weekly total</p><p className="font-mono text-3xl font-black">{weekMinutes} <span className="text-sm font-medium text-muted-foreground">min</span></p></div>
              <div className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-600 dark:text-violet-300">Avg {Math.round(weekMinutes / 7)} min/day</div>
            </div>
            <div className="flex h-40 items-end justify-between gap-2 rounded-2xl bg-white/[0.035] px-3 pt-4">
              {data.last_7_days.map((d) => (
                <div key={d.date} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${d.date}: ${d.minutes} minutes`}>
                  <span className="font-mono text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">{d.minutes}</span>
                  <div
                    className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-indigo-600 via-violet-500 to-fuchsia-400 transition-all group-hover:brightness-110"
                    style={{ height: `${Math.max(2, (d.minutes / max) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-2 mt-2">
              {data.last_7_days.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center">
                  <div className="font-mono text-[10px] text-muted-foreground tabular-nums">{new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <div className="font-mono text-xs font-semibold tabular-nums">{d.minutes}</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* AI Coach */}
          {r?.ai_summary && (
            <Panel icon={Brain} title="AI Coach summary">
              <p className="text-[15px] leading-relaxed mb-5">{r.ai_summary}</p>
              {r.ai_strengths?.length ? <Section title="Strengths" items={r.ai_strengths} /> : null}
              {r.ai_weaknesses?.length ? <Section title="Needs work" items={r.ai_weaknesses} /> : null}
              {r.ai_plan?.length ? <Section title="Plan for tomorrow" items={r.ai_plan} /> : null}
            </Panel>
          )}

          {/* To-do */}
          <Panel icon={ListChecks} title="Today's to-do list">
            {!data.todays_todos?.length ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.035] p-6 text-center">
                <ListChecks className="mx-auto mb-2 h-7 w-7 text-muted-foreground/60" />
                <p className="text-sm font-semibold">No tasks planned for today</p>
                <p className="mt-1 text-xs text-muted-foreground">New tasks will appear here automatically.</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-4 rounded-2xl bg-emerald-500/10 p-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#111321] font-mono text-sm font-black text-emerald-300 shadow-sm">{todoPct}%</div>
                  <div className="min-w-0 flex-1"><p className="font-bold">{todoDone} of {todoTotal} completed</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${todoPct}%` }} /></div></div>
                </div>
                <ul className="space-y-2">
                  {data.todays_todos.map((td, i) => (
                    <li key={td.id} className={`flex items-center gap-3 rounded-xl border p-3 ${td.done ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/10 bg-white/[0.035]"}`}>
                      {td.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                      <span className={`flex-1 text-sm ${td.done ? "line-through text-muted-foreground" : "font-medium"}`}>{td.text}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>

          <p className="text-center text-[10px] uppercase tracking-[0.28em] text-muted-foreground pt-4">
            <GraduationCap className="w-3 h-3 inline-block mb-0.5 me-1.5" />
            Tamyzak parent view
          </p>
        </div>}

        {activeTab === "report" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold">Complete weekly report</p>
                <p className="mt-1 text-xs text-muted-foreground">Review the full week, then save or print a polished PDF copy.</p>
              </div>
              <button
                type="button"
                onClick={() => void exportWeeklyPdf()}
                disabled={exportingPdf}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-60"
              >
                {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                {exportingPdf ? "Creating PDF…" : "Download PDF"}
              </button>
            </div>
            {entryMessage && <p className="text-center text-xs font-semibold text-destructive">{entryMessage}</p>}
            <WeeklyReport
              reportRef={weeklyReportRef}
              studentName={data.student_name}
              parentName={data.parent_name}
              days={weeklyDays}
              subjects={data.weekly_subjects ?? []}
              totalMinutes={weekMinutes}
              sessions={weekSessions}
              missions={weekMissions}
              questions={weekQuestions}
              todoDone={weekTodoDone}
              todoTotal={weekTodoTotal}
              goalHours={data.weekly_goal_hours}
              goalPct={weeklyGoalPct}
              startDate={reportStart}
              endDate={reportEnd}
              scores={data.parent_scores ?? []}
            />
          </div>
        )}

        {activeTab === "scores" && (
          <div className="space-y-6">
            <Panel icon={Award} title="Add a student score">
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveParentEntry("add_score", {
                    subject: scoreForm.subject,
                    title: scoreForm.title,
                    score: Number(scoreForm.score),
                    max_score: Number(scoreForm.maxScore),
                    note: scoreForm.note,
                  });
                }}
              >
                <Field label="Subject"><input required maxLength={80} value={scoreForm.subject} onChange={(e) => setScoreForm((v) => ({ ...v, subject: e.target.value }))} placeholder="e.g. Physics" className={PARENT_INPUT} /></Field>
                <Field label="Exam or assignment"><input required maxLength={120} value={scoreForm.title} onChange={(e) => setScoreForm((v) => ({ ...v, title: e.target.value }))} placeholder="e.g. Chapter 2 quiz" className={PARENT_INPUT} /></Field>
                <Field label="Score"><input required type="number" min="0" step="0.01" value={scoreForm.score} onChange={(e) => setScoreForm((v) => ({ ...v, score: e.target.value }))} placeholder="85" className={PARENT_INPUT} /></Field>
                <Field label="Out of"><input required type="number" min="0.01" step="0.01" value={scoreForm.maxScore} onChange={(e) => setScoreForm((v) => ({ ...v, maxScore: e.target.value }))} className={PARENT_INPUT} /></Field>
                <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">Comment (optional)</span><textarea maxLength={500} rows={3} value={scoreForm.note} onChange={(e) => setScoreForm((v) => ({ ...v, note: e.target.value }))} placeholder="Add feedback about this result…" className={`${PARENT_INPUT} h-auto py-3`} /></label>
                <button disabled={savingEntry} className="sm:col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-60">
                  {savingEntry ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add score
                </button>
              </form>
              {entryMessage && <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">{entryMessage}</p>}
            </Panel>

            <Panel icon={Trophy} title="Score history">
              {!data.parent_scores?.length ? <EmptyState icon={Award} text="No scores added yet." /> : (
                <ul className="space-y-3">{data.parent_scores.map((item) => {
                  const pct = Math.round((Number(item.score) / Number(item.max_score)) * 100);
                  return <li key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{item.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.subject} · {new Date(item.created_at).toLocaleDateString()}</p></div><div className="shrink-0 text-end"><p className="font-mono text-xl font-black text-indigo-300">{item.score}/{item.max_score}</p><p className="text-[10px] font-bold text-muted-foreground">{pct}%</p></div></div>{item.note && <p className="mt-3 rounded-xl bg-[#111321]/80 p-3 text-sm text-muted-foreground">{item.note}</p>}</li>;
                })}</ul>
              )}
            </Panel>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-6">
            <Panel icon={NotebookPen} title="Notes">
              <form onSubmit={(event) => { event.preventDefault(); void saveParentEntry("add_note", { note_text: noteText }); }}>
                <label><span className="mb-1.5 block text-xs font-bold text-muted-foreground">New note about the student</span><textarea required maxLength={1000} rows={5} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Write an observation, encouragement, or reminder…" className={`${PARENT_INPUT} h-auto py-3`} /></label>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground"><span>Saved privately for this follow-up link</span><span>{noteText.length}/1000</span></div>
                <button disabled={savingEntry || !noteText.trim()} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-60">
                  {savingEntry ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add note
                </button>
              </form>
              {entryMessage && <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">{entryMessage}</p>}
            </Panel>
            <Panel icon={ListChecks} title="Previous notes">
              {!data.parent_notes?.length ? <EmptyState icon={NotebookPen} text="No parent notes yet." /> : <ul className="space-y-3">{data.parent_notes.map((item) => <li key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="whitespace-pre-wrap text-sm leading-relaxed">{item.note_text}</p><p className="mt-3 text-[10px] font-semibold text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p></li>)}</ul>}
            </Panel>
          </div>
        )}
      </div>

      {pdfUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Weekly report PDF preview">
          <div className="flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151624] shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">Weekly report PDF</p>
                <p className="mt-0.5 truncate text-[10px] text-slate-400">{pdfFileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={printPdf} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-white transition hover:bg-white/10">
                  <Printer className="h-4 w-4" /><span className="hidden sm:inline">Print</span>
                </button>
                <a href={pdfUrl} download={pdfFileName} className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110">
                  <Download className="h-4 w-4" /><span className="hidden sm:inline">Download</span>
                </a>
                <button type="button" onClick={closePdfViewer} aria-label="Close PDF preview" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 bg-[#222438] p-2 sm:p-4">
              <iframe ref={pdfFrameRef} src={pdfUrl} title="Weekly report PDF" className="h-full w-full rounded-xl border-0 bg-white" />
              <div className="pointer-events-none absolute inset-x-4 bottom-5 text-center sm:hidden">
                <span className="inline-flex rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-semibold text-white/80">If preview is unavailable, use Download above</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

type WeeklyDay = NonNullable<Snapshot["weekly_days"]>[number];

function WeeklyReport({
  reportRef, studentName, parentName, days, subjects, totalMinutes, sessions, missions, questions,
  todoDone, todoTotal, goalHours, goalPct, startDate, endDate, scores,
}: {
  reportRef: React.RefObject<HTMLDivElement>;
  studentName: string;
  parentName: string | null;
  days: WeeklyDay[];
  subjects: Array<{ subject: string; minutes: number }>;
  totalMinutes: number;
  sessions: number;
  missions: number;
  questions: number;
  todoDone: number;
  todoTotal: number;
  goalHours: number | null;
  goalPct: number | null;
  startDate?: string;
  endDate?: string;
  scores: NonNullable<Snapshot["parent_scores"]>;
}) {
  const strongestDay = days.reduce<WeeklyDay | null>((best, day) => !best || day.minutes > best.minutes ? day : best, null);
  const maxDayMinutes = Math.max(1, ...days.map((day) => day.minutes));
  const maxSubjectMinutes = Math.max(1, ...subjects.map((subject) => subject.minutes));
  const dateLabel = (date?: string, options?: Intl.DateTimeFormatOptions) => date
    ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, options ?? { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const periodScores = scores.filter((score) => {
    const date = score.created_at.slice(0, 10);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  });

  return (
    <div ref={reportRef} className="overflow-hidden rounded-[1.75rem] shadow-xl" style={{ background: "#f8fafc", color: "#172033", fontFamily: "Inter, Arial, sans-serif" }}>
      <header className="relative overflow-hidden px-6 py-7 sm:px-9 sm:py-9" style={{ background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 55%, #8b5cf6 100%)", color: "#ffffff" }}>
        <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full" style={{ border: "28px solid rgba(255,255,255,.09)" }} />
        <div className="relative flex items-start justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em]" style={{ background: "rgba(255,255,255,.14)", color: "#ffffff" }}>Tamyzak · Parent follow-up</div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#ddd6fe" }}>Weekly progress report</p>
            <h2 className="mt-1 text-3xl font-black sm:text-4xl" style={{ color: "#ffffff" }}>{studentName}</h2>
            <p className="mt-2 text-xs" style={{ color: "#ede9fe" }}>{dateLabel(startDate)} — {dateLabel(endDate)}</p>
          </div>
          <div className="rounded-2xl px-4 py-3 text-right" style={{ background: "rgba(255,255,255,.12)" }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: "#ddd6fe" }}>Prepared for</p>
            <p className="mt-1 text-sm font-black" style={{ color: "#ffffff" }}>{parentName || "Parent / guardian"}</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-8">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ReportMetric label="Study time" value={formatMinutes(totalMinutes)} color="#4f46e5" background="#eef2ff" />
          <ReportMetric label="Sessions" value={String(sessions)} color="#7c3aed" background="#f5f3ff" />
          <ReportMetric label="Missions completed" value={String(missions)} color="#059669" background="#ecfdf5" />
          <ReportMetric label="Questions / tools" value={String(questions)} color="#0284c7" background="#f0f9ff" />
        </section>

        <section className="rounded-2xl border p-5" style={{ background: "#ffffff", borderColor: "#e2e8f0" }}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-black">Study activity by day</p>
              <p className="mt-1 text-xs" style={{ color: "#64748b" }}>A complete view of the student's last seven days</p>
            </div>
            {strongestDay && strongestDay.minutes > 0 && <span className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: "#ecfdf5", color: "#047857" }}>Best day: {dateLabel(strongestDay.date, { weekday: "long" })}</span>}
          </div>
          <div className="grid grid-cols-7 items-end gap-2" style={{ height: 170 }}>
            {days.map((day) => (
              <div key={day.date} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                <span className="text-[9px] font-black" style={{ color: "#475569" }}>{day.minutes}</span>
                <div className="w-full max-w-12 rounded-t-lg" style={{ minHeight: 3, height: `${Math.max(2, (day.minutes / maxDayMinutes) * 112)}px`, background: "linear-gradient(180deg,#a78bfa,#4f46e5)" }} />
                <span className="text-[9px] font-bold" style={{ color: "#64748b" }}>{dateLabel(day.date, { weekday: "short" })}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border p-5" style={{ background: "#ffffff", borderColor: "#e2e8f0" }}>
            <p className="mb-4 text-sm font-black">Time by subject</p>
            {subjects.length ? <div className="space-y-3">{subjects.slice(0, 8).map((subject) => (
              <div key={subject.subject}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]"><span className="truncate font-bold capitalize">{subject.subject}</span><span className="font-black" style={{ color: "#4f46e5" }}>{formatMinutes(subject.minutes)}</span></div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "#eef2f7" }}><div className="h-full rounded-full" style={{ width: `${Math.max(3, (subject.minutes / maxSubjectMinutes) * 100)}%`, background: "linear-gradient(90deg,#4f46e5,#8b5cf6)" }} /></div>
              </div>
            ))}</div> : <ReportEmpty>No subject activity recorded this week.</ReportEmpty>}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border p-5" style={{ background: "#ffffff", borderColor: "#e2e8f0" }}>
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-black">Weekly goal</p><span className="text-lg font-black" style={{ color: "#7c3aed" }}>{goalPct == null ? "—" : `${goalPct}%`}</span></div>
              <p className="mt-1 text-[10px]" style={{ color: "#64748b" }}>{goalHours ? `${formatMinutes(totalMinutes)} of ${goalHours} hours` : "No weekly goal has been set."}</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full" style={{ background: "#ede9fe" }}><div className="h-full rounded-full" style={{ width: `${goalPct ?? 0}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} /></div>
            </div>
            <div className="rounded-2xl border p-5" style={{ background: "#ffffff", borderColor: "#e2e8f0" }}>
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-black">Planned tasks</p><span className="text-lg font-black" style={{ color: "#059669" }}>{todoDone}/{todoTotal}</span></div>
              <p className="mt-1 text-[10px]" style={{ color: "#64748b" }}>{todoTotal ? `${Math.round((todoDone / todoTotal) * 100)}% of the week's planned work completed` : "No tasks were planned for this week."}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-5" style={{ background: "#ffffff", borderColor: "#e2e8f0" }}>
          <p className="mb-4 text-sm font-black">Daily details</p>
          <div className="space-y-2">{days.map((day) => (
            <div key={day.date} className="grid grid-cols-[1.25fr_repeat(4,.75fr)] items-center gap-2 rounded-xl px-3 py-3 text-[10px]" style={{ background: day.minutes ? "#f5f3ff" : "#f8fafc" }}>
              <div><p className="font-black">{dateLabel(day.date, { weekday: "long" })}</p><p className="mt-0.5" style={{ color: "#64748b" }}>{dateLabel(day.date, { day: "numeric", month: "short" })}</p></div>
              <DailyValue label="Study" value={formatMinutes(day.minutes)} />
              <DailyValue label="Sessions" value={String(day.sessions)} />
              <DailyValue label="Missions" value={String(day.missions)} />
              <DailyValue label="Tasks" value={`${day.todo_done}/${day.todo_total}`} />
            </div>
          ))}</div>
        </section>

        {periodScores.length > 0 && <section className="rounded-2xl border p-5" style={{ background: "#ffffff", borderColor: "#e2e8f0" }}>
          <p className="mb-4 text-sm font-black">Scores added this week</p>
          <div className="grid gap-2 sm:grid-cols-2">{periodScores.map((score) => <div key={score.id} className="flex items-center justify-between gap-3 rounded-xl p-3" style={{ background: "#fffbeb" }}><div><p className="text-xs font-black">{score.title}</p><p className="mt-0.5 text-[9px]" style={{ color: "#78716c" }}>{score.subject}</p></div><p className="text-lg font-black" style={{ color: "#d97706" }}>{score.score}/{score.max_score}</p></div>)}</div>
        </section>}

        <footer className="flex items-center justify-between border-t pt-4 text-[9px]" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
          <span>Generated from the student's verified Tamyzak activity</span>
          <span>Generated {new Date().toLocaleDateString()}</span>
        </footer>
      </div>
    </div>
  );
}

function ReportMetric({ label, value, color, background }: { label: string; value: string; color: string; background: string }) {
  return <div className="rounded-2xl p-4" style={{ background }}><p className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: "#64748b" }}>{label}</p><p className="mt-2 text-xl font-black" style={{ color }}>{value}</p></div>;
}

function DailyValue({ label, value }: { label: string; value: string }) {
  return <div className="text-center"><p className="font-black" style={{ color: "#334155" }}>{value}</p><p className="mt-0.5 text-[8px]" style={{ color: "#94a3b8" }}>{label}</p></div>;
}

function ReportEmpty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed p-5 text-center text-xs" style={{ borderColor: "#cbd5e1", color: "#64748b" }}>{children}</div>;
}

function formatMinutes(minutes: number) {
  const safe = Math.max(0, Math.round(minutes || 0));
  if (safe < 60) return `${safe} min`;
  const hours = Math.floor(safe / 60);
  const remainder = safe % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

const MEASURE_TONES = {
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
} as const;

function Measure({ icon: Icon, tone, label, value, unit }: { icon: any; tone: keyof typeof MEASURE_TONES; label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1d1e31] to-[#171827] p-4 text-slate-100 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-400/30 hover:shadow-lg md:p-5">
      <span className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${MEASURE_TONES[tone]}`}><Icon className="h-5 w-5" /></span>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="font-mono text-3xl font-black tabular-nums leading-none text-slate-100 md:text-4xl">
        {value}
        {unit && <span className="text-base font-normal text-muted-foreground ms-1">{unit}</span>}
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#1d1e31] to-[#171827] p-5 text-slate-100 shadow-[0_14px_45px_-32px_rgba(0,0,0,0.65)] backdrop-blur-sm md:p-6">
      <header className="mb-5 inline-flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/15 text-indigo-600 dark:text-indigo-300"><Icon className="h-4 w-4" /></span>
        <h2 className="text-sm font-extrabold md:text-base">{title}</h2>
      </header>
      {children}
    </section>
  );
}

const MINI_TONES: Record<string, string> = { indigo: "bg-indigo-500/10", violet: "bg-violet-500/10", cyan: "bg-cyan-500/10", emerald: "bg-emerald-500/10" };

function Mini({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl p-4 ${MINI_TONES[tone] ?? "bg-muted/30"}`}>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">{label}</div>
      <div className="font-mono text-xl font-bold tabular-nums leading-none">{value}</div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-[0.22em] font-semibold text-muted-foreground mb-2">{children}</div>;
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <SubHeading>{title}</SubHeading>
      <ul className="space-y-1.5 text-sm">
        {items.map((x, i) => (
          <li key={i} className="flex items-start gap-3 rounded-xl bg-[#111321]/80 p-2.5">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 font-mono text-[10px] font-bold text-violet-600 dark:text-violet-300">{i + 1}</span>
            <span className="flex-1">{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label><span className="mb-1.5 block text-xs font-bold text-muted-foreground">{label}</span>{children}</label>;
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.035] p-7 text-center"><Icon className="mx-auto mb-2 h-7 w-7 text-muted-foreground/50" /><p className="text-sm font-semibold text-muted-foreground">{text}</p></div>;
}
