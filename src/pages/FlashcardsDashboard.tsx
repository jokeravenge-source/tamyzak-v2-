import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type FC = { id?: string; subject: string; chapter: string; language: string; question: string; answer: string; approved: boolean };
type Stats = { cards: number; pending: number; reviews: number; decks: { deck: string; count: number }[]; students: { subject: string; students: number }[] };

const empty: FC = { subject: "", chapter: "", language: "ar", question: "", answer: "", approved: true };
const PW_KEY = "fc_dash_pw";

export default function FlashcardsDashboard() {
  const [pw, setPw] = useState(() => sessionStorage.getItem(PW_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cards, setCards] = useState<FC[]>([]);
  const [filter, setFilter] = useState({ subject: "", chapter: "", search: "", pendingOnly: false });
  const [form, setForm] = useState<FC>(empty);

  const call = useCallback(async (action: string, extra: Record<string, unknown> = {}, password = pw) => {
    const { data, error } = await supabase.functions.invoke("flashcards-dashboard", { body: { password, action, ...extra } });
    if (error) throw error;
    return data;
  }, [pw]);

  const refresh = useCallback(async () => {
    const [s, l] = await Promise.all([call("stats"), call("list", filter)]);
    setStats(s); setCards(l.cards ?? []);
  }, [call, filter]);

  const login = async (password = pw) => {
    setBusy(true); setErr("");
    try {
      await call("login", {}, password);
      sessionStorage.setItem(PW_KEY, password);
      setAuthed(true);
    } catch { setErr("كلمة المرور غير صحيحة / Wrong password"); sessionStorage.removeItem(PW_KEY); }
    setBusy(false);
  };

  useEffect(() => { if (pw) login(pw); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (authed) refresh().catch(() => setErr("Failed to load")); }, [authed, refresh]);

  const save = async () => {
    setBusy(true); setErr("");
    try { await call(form.id ? "update" : "create", { card: form }); setForm(empty); await refresh(); }
    catch { setErr("Save failed — fill all fields"); }
    setBusy(false);
  };
  const remove = async (id?: string) => {
    if (!id || !confirm("Delete this card?")) return;
    await call("delete", { id }); await refresh();
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-6 w-full max-w-sm space-y-3">
          <h1 className="text-xl font-bold">Flashcards Dashboard</h1>
          <Input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()} />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button className="w-full" disabled={busy || !pw} onClick={() => login()}>Enter</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Flashcards Dashboard</h1>
        <Button variant="outline" onClick={() => { sessionStorage.removeItem(PW_KEY); setAuthed(false); setPw(""); }}>Log out</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4"><p className="text-sm text-muted-foreground">Added cards</p><p className="text-3xl font-bold">{stats.cards}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Waiting approval</p><p className="text-3xl font-bold">{stats.pending}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Student reviews</p><p className="text-3xl font-bold">{stats.reviews}</p></Card>
          <Card className="p-4 md:col-span-2 max-h-64 overflow-auto">
            <p className="font-semibold mb-2">Decks</p>
            {stats.decks.map((d) => <div key={d.deck} className="flex justify-between text-sm py-0.5"><span>{d.deck}</span><span>{d.count}</span></div>)}
          </Card>
          <Card className="p-4 max-h-64 overflow-auto">
            <p className="font-semibold mb-2">Students per subject</p>
            {stats.students.map((s) => <div key={s.subject} className="flex justify-between text-sm py-0.5"><span>{s.subject}</span><span>{s.students}</span></div>)}
          </Card>
        </div>
      )}

      <Card className="p-4 space-y-3">
        <p className="font-semibold">{form.id ? "Edit card" : "Add card"}</p>
        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Subject (e.g. biology)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Input placeholder="Chapter" value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} />
          <select className="border border-input rounded-md bg-background px-3" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            <option value="ar">Arabic</option><option value="en">English</option>
          </select>
        </div>
        <Textarea placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        <Textarea placeholder="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><Switch checked={form.approved} onCheckedChange={(v) => setForm({ ...form, approved: v })} /> Visible to students</label>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex gap-2">
          <Button disabled={busy} onClick={save}>{form.id ? "Save changes" : "Add card"}</Button>
          {form.id && <Button variant="outline" onClick={() => setForm(empty)}>Cancel</Button>}
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="grid gap-2 md:grid-cols-4">
          <Input placeholder="Filter subject" value={filter.subject} onChange={(e) => setFilter({ ...filter, subject: e.target.value })} />
          <Input placeholder="Filter chapter" value={filter.chapter} onChange={(e) => setFilter({ ...filter, chapter: e.target.value })} />
          <Input placeholder="Search question" value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><Switch checked={filter.pendingOnly} onCheckedChange={(v) => setFilter({ ...filter, pendingOnly: v })} /> Waiting only</label>
        </div>
        <div className="space-y-2">
          {cards.map((c) => (
            <div key={c.id} className="border border-border rounded-md p-3 flex gap-3 justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{c.subject} · {c.chapter} · {c.language}{!c.approved && " · waiting"}</p>
                <p className="font-medium break-words">{c.question}</p>
                <p className="text-sm text-muted-foreground break-words">{c.answer}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button size="sm" variant="outline" onClick={() => { setForm(c); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</Button>
                {!c.approved && <Button size="sm" onClick={async () => { await call("update", { card: { ...c, approved: true } }); refresh(); }}>Approve</Button>}
                <Button size="sm" variant="destructive" onClick={() => remove(c.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {cards.length === 0 && <p className="text-sm text-muted-foreground">No cards.</p>}
        </div>
      </Card>
    </div>
  );
}
