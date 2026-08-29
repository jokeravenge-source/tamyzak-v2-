import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";

type Overview = {
  total_mistakes: number;
  unresolved: number;
  affected_users: number;
  by_subject: { subject: string; mistakes: number; users: number }[];
  by_source: { source: string; mistakes: number; users: number }[];
  top_questions: {
    question: string;
    subject: string;
    chapter: string;
    source: string;
    correct_answer: string;
    users: number;
    wrong_total: number;
    still_unresolved: number;
  }[];
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-4 shadow-[var(--shadow-card)] ${className}`}>{children}</div>
);

const Kpi = ({ label, value }: { label: string; value: string | number }) => (
  <Card>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold tabular-nums mt-1">{value}</p>
  </Card>
);

const AdminMistakesTab = () => {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const { data: res, error } = await (supabase as any).rpc("admin_common_mistakes", { _limit: 100 });
    if (error) toast.error(error.message);
    else setData(res as Overview);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }
  if (!data) return <p className="text-muted-foreground">No data.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" /> Common mistakes
        </h3>
        <button onClick={() => void load()} className="h-9 px-3 rounded-lg border border-white/10 text-sm inline-flex items-center gap-2 hover:bg-secondary/60">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Kpi label="Total wrong answers saved" value={data.total_mistakes} />
        <Kpi label="Still unresolved" value={data.unresolved} />
        <Kpi label="Students affected" value={data.affected_users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <p className="text-sm font-semibold mb-3">Mistakes by subject</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_subject}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="mistakes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold mb-3">Mistakes by tool</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_source}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="mistakes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-semibold mb-3">Most-missed questions</p>
        {data.top_questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No mistakes recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {data.top_questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-secondary/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium flex-1">{q.question}</p>
                  <span className="shrink-0 rounded-full bg-rose-500/15 text-rose-400 text-xs px-2 py-1 tabular-nums">
                    ×{q.wrong_total}
                  </span>
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {q.source}{q.subject ? ` · ${q.subject}` : ""}{q.chapter ? ` · ch ${q.chapter}` : ""}
                  {` · ${q.users} student(s) · ${q.still_unresolved} unresolved`}
                </p>
                {q.correct_answer && (
                  <p className="mt-1 text-xs text-emerald-400">Correct: {q.correct_answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminMistakesTab;
