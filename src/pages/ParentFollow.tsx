import { useEffect, useState } from "react";
import { CalendarDays, GraduationCap, Brain, ListChecks, CheckCircle2, Circle, Lock, Wrench, Clock3, Trophy, Target, RefreshCw, Eye, ShieldCheck, Activity } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;


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

  const PARCHMENT = "relative min-h-screen overflow-hidden bg-slate-950 text-white [&_.text-foreground]:text-white [&_.text-card-foreground]:text-white [&_.text-muted-foreground]:text-white/60 [&_.border-border]:border-white/10";
  const FONT_STYLE = { fontFamily: "Inter, 'IBM Plex Sans Arabic', system-ui, sans-serif" };

  if (!unlocked) {
    return (
      <main className={`${PARCHMENT} flex items-center justify-center p-5`} style={FONT_STYLE}>
        <div aria-hidden="true" className="absolute -top-24 -end-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -start-20 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
        <form onSubmit={submitCode} className="relative w-full max-w-md space-y-6 rounded-[2rem] border border-indigo-400/20 bg-slate-900/85 p-7 text-center text-white shadow-[0_28px_80px_-35px_rgba(99,102,241,0.65)] backdrop-blur-xl sm:p-9">
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
            className="h-16 w-full rounded-2xl border border-white/10 bg-white/5 text-center font-mono text-3xl font-bold tracking-[0.55em] text-white placeholder:text-white/35 outline-none transition focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10"
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
        <div className="max-w-md space-y-3 rounded-[2rem] border border-white/10 bg-slate-900/85 p-8 text-center text-white shadow-2xl">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}>Link not available</h1>
          <p className="text-muted-foreground text-sm">
            {err && err !== "invalid_or_revoked" ? err : "This follow-up link is invalid or has been revoked by the student."}
          </p>
          <button
            onClick={() => { sessionStorage.removeItem(`pf_code_${token}`); setErr(null); setUnlocked(false); }}
            className="h-10 rounded-xl border border-white/15 px-5 text-xs font-semibold text-white hover:bg-white/10"
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

  return (
    <main className={PARCHMENT} style={FONT_STYLE}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -end-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[42rem] -start-32 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-12">
        <header className="relative mb-6 overflow-hidden rounded-[2rem] border border-indigo-400/20 bg-gradient-to-br from-indigo-600/40 via-slate-900/95 to-violet-600/35 p-5 text-white shadow-[0_24px_70px_-35px_rgba(99,102,241,0.7)] md:p-8">
          <div aria-hidden="true" className="absolute -end-12 -top-16 h-48 w-48 rounded-full border-[30px] border-violet-500/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                <Eye className="h-3.5 w-3.5" /> Parent view · read-only
              </div>
              <p className="text-sm font-medium text-white/65">Today's progress for</p>
              <h1 className="mt-1 truncate text-3xl font-black tracking-tight md:text-5xl" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
                {data.student_name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60">
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

        <div className="space-y-6 md:space-y-8">
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
                    <li key={subj} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
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
                    <li key={t.feature} className="flex items-center justify-between rounded-xl bg-violet-400/10 px-3 py-2.5 text-sm">
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
            <div className="flex h-40 items-end justify-between gap-2 rounded-2xl bg-white/5 px-3 pt-4">
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
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
                <ListChecks className="mx-auto mb-2 h-7 w-7 text-muted-foreground/60" />
                <p className="text-sm font-semibold">No tasks planned for today</p>
                <p className="mt-1 text-xs text-muted-foreground">New tasks will appear here automatically.</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-4 rounded-2xl bg-emerald-500/10 p-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950/70 font-mono text-sm font-black text-emerald-300 shadow-sm">{todoPct}%</div>
                  <div className="min-w-0 flex-1"><p className="font-bold text-white">{todoDone} of {todoTotal} completed</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${todoPct}%` }} /></div></div>
                </div>
                <ul className="space-y-2">
                  {data.todays_todos.map((td, i) => (
                    <li key={td.id} className={`flex items-center gap-3 rounded-xl border p-3 ${td.done ? "border-emerald-400/20 bg-emerald-400/10" : "border-white/10 bg-white/5"}`}>
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
        </div>
      </div>
    </main>
  );
}

const MEASURE_TONES = {
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
} as const;

function Measure({ icon: Icon, tone, label, value, unit }: { icon: any; tone: keyof typeof MEASURE_TONES; label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-indigo-400/25 hover:bg-white/[0.09] hover:shadow-lg md:p-5">
      <span className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${MEASURE_TONES[tone]}`}><Icon className="h-5 w-5" /></span>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="font-mono text-3xl font-black tabular-nums leading-none text-foreground md:text-4xl">
        {value}
        {unit && <span className="text-base font-normal text-muted-foreground ms-1">{unit}</span>}
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 text-white shadow-[0_18px_55px_-32px_rgba(0,0,0,0.8)] backdrop-blur-sm md:p-6">
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
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <SubHeading>{title}</SubHeading>
      <ul className="space-y-1.5 text-sm">
        {items.map((x, i) => (
          <li key={i} className="flex items-start gap-3 rounded-xl bg-slate-950/40 p-2.5">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 font-mono text-[10px] font-bold text-violet-600 dark:text-violet-300">{i + 1}</span>
            <span className="flex-1">{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
