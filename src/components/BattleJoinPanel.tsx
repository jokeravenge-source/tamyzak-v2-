import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Plus, Search, Swords, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AppLanguage } from "./LanguageGate";
import { searchBattleStudents, type BattleStudent } from "@/lib/battleChallenges";
import { MAX_ROYALE_INVITEES } from "@/lib/sessionRoyale";

export default function BattleJoinPanel({ language, canCreate, sendingId, onCreate, onJoin, onChallenge, onGroupChallenge }: {
  language: AppLanguage; canCreate: boolean; sendingId: string | null;
  onCreate: () => void; onJoin: (code: string) => void; onChallenge: (student: BattleStudent) => void;
  onGroupChallenge?: (students: BattleStudent[]) => void;
}) {
  const ar = language === "ar";
  const [tab, setTab] = useState<"code" | "search">("code");
  const [code, setCode] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BattleStudent[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<BattleStudent[]>([]);
  const toggleStudent = (student: BattleStudent) => setSelected((previous) =>
    previous.some((item) => item.user_id === student.user_id)
      ? previous.filter((item) => item.user_id !== student.user_id)
      : previous.length < MAX_ROYALE_INVITEES ? [...previous, student] : previous);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    setResults([]); setError(false);
    if (tab !== "search" || query.trim().length < 2) { setSearching(false); return; }
    setSearching(true);
    const timer = setTimeout(() => {
      void searchBattleStudents(query, controller.signal).then((rows) => {
        if (!controller.signal.aborted) setResults(rows);
      }).catch(() => { if (!controller.signal.aborted) setError(true); })
        .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, tab]);
  return <section className="space-y-4 rounded-2xl border bg-card p-4">
    <h2 className="font-bold">{ar ? "العب ويا أصدقائك" : "Play with friends"}</h2>
    <div className="grid grid-cols-2 gap-2" aria-label={ar ? "طريقة الانضمام" : "Join method"}>
      <Button className="px-2 text-xs sm:px-4 sm:text-sm" variant={tab === "code" ? "default" : "outline"} aria-pressed={tab === "code"} disabled={!!sendingId} onClick={() => setTab("code")}>{ar ? "رمز الغرفة" : "Room code"}</Button>
      <Button className="px-2 text-xs sm:px-4 sm:text-sm" variant={tab === "search" ? "default" : "outline"} aria-pressed={tab === "search"} disabled={!!sendingId} onClick={() => { setTab("search"); setTimeout(() => searchInput.current?.focus(), 0); }}><Search className="me-1 h-4 w-4" />{ar ? "ابحث بالاسم" : "Search by name"}</Button>
    </div>
    {tab === "code" ? <>
      <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (/^\d{6}$/.test(code) && !sendingId) onJoin(code); }}>
        <label htmlFor="battle-code" className="block text-sm">{ar ? "عندك رمز من صديقك؟" : "Have a friend’s room code?"}</label>
        <div className="flex gap-2"><Input id="battle-code" value={code} placeholder="123456" inputMode="numeric" autoComplete="off" maxLength={6} dir="ltr" className="min-w-0 text-center font-mono tracking-widest" onChange={(e) => setCode(e.target.value.replace(/[٠-٩]/g, (n) => String(n.charCodeAt(0) - 1632)).replace(/\D/g, "").slice(0, 6))} /><Button type="submit" disabled={!/^\d{6}$/.test(code) || !!sendingId}>{ar ? "انضم" : "Join"}</Button></div>
      </form>
      <Button className="min-h-12 w-full gap-2 rounded-xl" disabled={!canCreate || !!sendingId} onClick={onCreate}><Users className="h-4 w-4" />{ar ? "أنشئ غرفة وشارك الرمز" : "Challenge a friend"}</Button>
    </> : <div className="space-y-3">
      <label htmlFor="battle-student-name" className="block text-sm">{ar ? "اسم الطالب" : "Student name"}</label>
      <Input ref={searchInput} id="battle-student-name" value={query} disabled={!!sendingId} maxLength={60} placeholder={ar ? "اكتب حرفين على الأقل…" : "Type at least two characters…"} autoComplete="off" onChange={(e) => setQuery(e.target.value)} />
      {searching && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{ar ? "جاري البحث…" : "Searching…"}</p>}
      {error && <p role="status" className="text-sm text-destructive">{ar ? "تعذّر البحث. تأكد من اتصالك وتسجيل دخولك، وجرّب مرة ثانية." : "Search failed. Check your connection and sign-in, then try again."}</p>}
      {!searching && !error && query.trim().length >= 2 && !results.length && <p role="status" className="text-sm text-muted-foreground">{ar ? "ما لكينا طالب بهذا الاسم. جرّب الاسم المسجّل بالموقع." : "No students found. Try their name as registered on Tamayzak."}</p>}
      {onGroupChallenge && <p role="status" className="text-sm text-muted-foreground">{ar ? `المختارين: ${selected.length} من ١٠` : `${selected.length} of 10 selected`}</p>}
      {selected.length > 0 && <ul className="flex flex-wrap gap-2">
        {selected.map((student) => <li key={student.user_id} className="max-w-full">
          <Button type="button" variant="secondary" disabled={!!sendingId} aria-label={ar ? `شيل ${student.display_name}` : `Remove ${student.display_name}`} onClick={() => toggleStudent(student)} className="h-auto min-h-11 max-w-full gap-2 whitespace-normal text-start"><span dir="auto" className="min-w-0 break-all">{student.display_name}</span><X className="h-4 w-4 shrink-0" /></Button>
        </li>)}
      </ul>}
      <ul className="space-y-2">{results.map((student) => {
        const picked = selected.some((item) => item.user_id === student.user_id);
        return <li key={student.user_id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
          <span dir="auto" className="min-w-0 break-words text-sm font-bold">{student.display_name}</span>
          {onGroupChallenge ? <Button size="sm" variant="outline" className="min-h-11 shrink-0 gap-1" aria-pressed={picked} aria-label={ar ? `اختيار ${student.display_name}` : `Select ${student.display_name}`}
            disabled={!canCreate || !!sendingId || (!picked && selected.length >= MAX_ROYALE_INVITEES)} onClick={() => toggleStudent(student)}>
            {picked ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{picked ? (ar ? "مختار" : "Selected") : (ar ? "اختار" : "Select")}
          </Button> : <Button size="sm" className="shrink-0 gap-1" aria-label={ar ? `تحدَّ ${student.display_name}` : `Challenge ${student.display_name}`} disabled={!canCreate || !!sendingId} onClick={() => onChallenge(student)}>{sendingId === student.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}{ar ? "تحدّي" : "Challenge"}</Button>}
        </li>;
      })}</ul>
      {onGroupChallenge && <Button className="min-h-12 w-full gap-2" disabled={!canCreate || !!sendingId || selected.length === 0}
        onClick={() => selected.length === 1 ? onChallenge(selected[0]) : onGroupChallenge(selected)}><Swords className="h-4 w-4" />{ar ? "ارسل دعوة التحدّي" : "Send battle invitations"}</Button>}
      <p className="text-xs leading-5 text-muted-foreground">{ar ? "توصله دعوة داخل تميّزك، ومن يقبل يدخل غرفتك مباشرة." : "They receive an invitation inside Tamayzak. Accepting takes them straight to your room."}</p>
    </div>}
  </section>;
}
