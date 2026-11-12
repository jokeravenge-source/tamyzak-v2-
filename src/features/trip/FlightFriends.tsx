import { useEffect, useState } from "react";
import { Check, Loader2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import type { FlightInvitation, FlightStudent, Journey, JourneyRepository } from "./journeys";
import { MAX_FLIGHT_FRIENDS } from "./itinerary";
import { FLIGHT_COPY, flightError } from "./flightCopy";
import type { Lang } from "./i18n";

export function FlightFriends({ journey, repository, studentId, lang, onChanged }: {
  journey: Journey; repository: JourneyRepository; studentId: string; lang: Lang; onChanged: () => Promise<unknown>;
}) {
  const t = FLIGHT_COPY[lang];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FlightStudent[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const host = !journey.hostId || journey.hostId === studentId;
  const invited = (journey.passengers ?? []).filter((person) => person.userId !== journey.hostId);
  useEffect(() => {
    let live = true;
    if (!host || !repository.searchStudents || query.trim().length < 2) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const timer = window.setTimeout(() => {
      repository.searchStudents!(query).then((rows) => {
        if (live) setResults(rows.filter((row) => row.userId !== studentId && !invited.some((person) => person.userId === row.userId)));
      }).catch((error) => { if (live) toast.error(flightError(error, lang)); })
        .finally(() => { if (live) setSearching(false); });
    }, 300);
    return () => { live = false; window.clearTimeout(timer); };
  }, [query, repository, studentId, host, journey.passengers, lang]);

  const invite = async (userId: string) => {
    if (!repository.invite || busy) return;
    setBusy(userId);
    try { await repository.invite(journey.id, userId); setQuery(""); await onChanged(); toast.success(t.sent); }
    catch (error) { toast.error(flightError(error, lang)); }
    finally { setBusy(null); }
  };
  return <section className="rounded-2xl border-2 border-trip-ink/20 bg-trip-cream p-4" aria-label={t.friends}>
    <div className="flex items-center gap-2"><Users className="h-5 w-5" /><h3 className="flex-1 font-bold">{t.friends}</h3><span className="text-sm font-black" dir="ltr">{invited.length} / {MAX_FLIGHT_FRIENDS}</span></div>
    <p className="mt-2 text-xs leading-6 text-trip-ink/70">{repository.accountBacked ? t.limit : t.account}</p>
    {host && repository.invite && invited.length < MAX_FLIGHT_FRIENDS && <div className="mt-3">
      <input aria-label={t.search} placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-11 w-full rounded-xl border-2 bg-white px-3 text-sm" />
      {searching && <Loader2 className="mt-2 h-4 w-4 animate-spin" aria-label="Loading" />}
      {results.map((student) => <button key={student.userId} type="button" disabled={busy !== null} onClick={() => void invite(student.userId)} className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-xl border-2 bg-white px-3 text-start text-sm font-bold disabled:opacity-50">
        <CharacterAvatar gender={student.gender ?? "male"} traits={student.character} size={36} /><span className="flex-1">{student.displayName}</span>{busy === student.userId ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}<span>{t.invite}</span>
      </button>)}
      {query.trim().length >= 2 && !searching && !results.length && <p className="mt-2 text-xs">{t.noStudents}</p>}
    </div>}
    {invited.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">{invited.map((person) => <li key={person.userId} className="rounded-full border border-trip-ink/20 bg-white px-3 py-1.5 text-xs font-bold">{person.displayName} · {person.status === "accepted" ? t.accepted : person.status === "pending" ? t.pending : t.declined}</li>)}</ul>}
  </section>;
}

export function FlightInvitations({ repository, lang, onAccepted }: {
  repository: JourneyRepository; lang: Lang; onAccepted: (id: string) => void | Promise<void>;
}) {
  const t = FLIGHT_COPY[lang];
  const [invites, setInvites] = useState<FlightInvitation[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const check = async () => {
      if (document.visibilityState === "hidden" || !repository.invitations) return;
      try { const rows = await repository.invitations(); if (live) setInvites(rows); } catch { /* Main flight page reports setup errors. */ }
    };
    void check();
    const id = window.setInterval(() => void check(), 20000);
    window.addEventListener("focus", check);
    return () => { live = false; window.clearInterval(id); window.removeEventListener("focus", check); };
  }, [repository]);
  const respond = async (id: string, accept: boolean) => {
    if (busy || !repository.respondInvitation) return;
    setBusy(id);
    try { await repository.respondInvitation(id, accept); setInvites((rows) => rows.filter((row) => row.flightId !== id)); if (accept) await onAccepted(id); }
    catch (error) { toast.error(flightError(error, lang)); }
    finally { setBusy(null); }
  };
  if (!invites.length) return null;
  return <section className="space-y-3 rounded-2xl border-2 border-sky-400/40 bg-sky-50 p-4 text-slate-900" dir={lang === "ar" ? "rtl" : "ltr"} aria-label={t.incoming}>
    <h2 className="flex items-center gap-2 font-black"><UserPlus className="h-5 w-5" />{t.incoming}</h2>
    {invites.map((invite) => <article key={invite.flightId} className="rounded-xl border bg-white p-3">
      <p className="text-sm font-bold">{invite.hostName} {t.invited} {lang === "ar" ? invite.cityAr ?? invite.city : invite.city}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={busy !== null} onClick={() => void respond(invite.flightId, true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-sky-800 px-4 text-sm font-bold text-white disabled:opacity-50">{busy === invite.flightId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{t.join}</button>
        <button disabled={busy !== null} onClick={() => void respond(invite.flightId, false)} className="min-h-10 rounded-lg border px-4 text-sm font-bold disabled:opacity-50">{t.decline}</button>
      </div>
    </article>)}
  </section>;
}
