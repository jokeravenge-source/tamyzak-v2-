import { useEffect, useState, type FormEvent } from "react";
import { Languages, Loader2, LogOut, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminFrenchFlashcardsTab from "@/components/AdminFrenchFlashcardsTab";

type Staff = { email: string; created_at: string };

export default function FrenchTeacherDashboard() {
  const [status, setStatus] = useState<"loading" | "login" | "denied" | "ready">("loading");
  const [owner, setOwner] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (!session) { setStatus("login"); return; }
        const { data, error: accessError } = await supabase.rpc("french_flashcard_access");
        if (!active) return;
        if (accessError) throw accessError;
        const access = data as { allowed: boolean; owner: boolean };
        setOwner(access.owner);
        setStatus(access.allowed ? "ready" : "denied");
        if (access.owner) {
          const result = await supabase.rpc("manage_french_flashcard_staff", { action: "list" });
          if (active) {
            if (result.error) setError(result.error.message);
            else setStaff(result.data ?? []);
          }
        }
      } catch (err) {
        if (active) { setError(err instanceof Error ? err.message : "Unable to check staff access. Please retry."); setStatus("denied"); }
      }
    };
    void check();
    // Run outside Supabase's auth callback to avoid awaiting another auth operation inside its lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { window.setTimeout(() => { if (active) void check(); }, 0); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const login = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (result.error) setError(result.error.message);
      setPassword("");
    } catch { setError("Unable to sign in. Please retry."); }
    finally { setBusy(false); }
  };
  const signOut = async () => {
    const result = await supabase.auth.signOut();
    if (result.error) { setError(result.error.message); return; }
    setOwner(false); setStaff([]); setStatus("login"); setError("");
  };
  const updateStaff = async (action: "add" | "remove", value: string) => {
    if (action === "remove" && !window.confirm(`Remove French flashcard access for ${value}?`)) return;
    setBusy(true); setError("");
    try {
      const result = await supabase.rpc("manage_french_flashcard_staff", { action, staff_email: value.trim().toLowerCase() });
      if (result.error) setError(result.error.message);
      else { setStaff(result.data ?? []); setStaffEmail(""); }
    } catch { setError("Unable to update teaching staff. Please retry."); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:py-12">
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3"><Languages className="h-8 w-8 text-primary" /><div>
          <p className="text-sm font-medium text-muted-foreground">Tamayzak · Teaching staff</p>
          <h1 className="text-2xl font-bold">French flashcard dashboard</h1>
        </div></div>
        {(status === "ready" || status === "denied") && <button onClick={() => void signOut()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4"><LogOut className="h-4 w-4" /> Sign out</button>}
      </header>
      {error && <p role="alert" className="mb-5 rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{error}</p>}
      {status === "loading" ? <div role="status" className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Checking staff access…</div>
        : status === "login" ? <section className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Teacher sign-in</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Use your Tamayzak account. The owner must enable French flashcard access for your email first.</p>
          <form onSubmit={login} className="mt-5 space-y-4">
            <label className="block text-sm font-medium">Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3" /></label>
            <label className="block text-sm font-medium">Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3" /></label>
            <button disabled={busy} className="min-h-11 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Signing in…" : "Open French flashcards"}</button>
          </form>
        </section> : status === "denied" ? <section className="rounded-2xl border border-border p-6"><h2 className="text-xl font-semibold">Staff access required</h2><p className="mt-2 text-muted-foreground">Ask the owner to enable French flashcard access for your account email, then refresh this page.</p></section>
        : <>
          {owner && <details className="mb-6 rounded-2xl border border-border bg-card p-5"><summary className="cursor-pointer font-semibold">Manage French teaching staff</summary>
            <p className="mt-3 text-sm text-muted-foreground">Add the email teachers use for their Tamayzak accounts. They receive access to French flashcards only.</p>
            <form onSubmit={e => { e.preventDefault(); void updateStaff("add", staffEmail); }} className="mt-4 flex flex-wrap gap-3">
              <input aria-label="Teacher email" type="email" required value={staffEmail} onChange={e => setStaffEmail(e.target.value)} placeholder="teacher@example.com" className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3" />
              <button disabled={busy} className="min-h-11 rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50">Grant French access</button>
            </form>
            <ul className="mt-4 divide-y divide-border">{staff.map(person => <li key={person.email} className="flex flex-wrap items-center justify-between gap-3 py-3"><span className="break-all text-sm">{person.email}</span><button disabled={busy} aria-label={`Remove access for ${person.email}`} onClick={() => void updateStaff("remove", person.email)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm"><Trash2 className="h-4 w-4" /> Remove access</button></li>)}</ul>
          </details>}
          <AdminFrenchFlashcardsTab />
        </>}
    </div>
  </main>;
}
