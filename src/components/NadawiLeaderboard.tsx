import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import type { AppLanguage } from "./LanguageGate";
import { formatNadawiDuration, getNadawiRankings, type NadawiRank } from "@/lib/nadawiContestApi";

export default function NadawiLeaderboard({ language, completed = false }: { language: AppLanguage; completed?: boolean }) {
  const ar = language === "ar";
  const [rankings, setRankings] = useState<NadawiRank[] | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    let busy = false;
    const load = async () => {
      if (busy || document.visibilityState === "hidden") return;
      busy = true;
      try {
        const result = await getNadawiRankings();
        if (active) { setRankings(result); setError(""); }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "UNAVAILABLE");
      } finally { busy = false; }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    document.addEventListener("visibilitychange", load);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", load); };
  }, [refresh]);

  const mine = rankings?.find((row) => row.is_me);
  return <section className="space-y-4 text-start" aria-label={ar ? "لوحة ترتيب المسابقة" : "Competition standings"}>
    {mine && <div role="status" className="rounded-2xl border border-amber-200/40 bg-amber-100/10 p-5 text-center">
      <Trophy aria-hidden="true" className="mx-auto mb-2 h-8 w-8 text-amber-200" />
      <p className="text-sm font-bold text-amber-100">{ar ? "مركزك الحالي" : "Your current rank"}</p>
      <p className="my-2 text-5xl font-black tabular-nums" dir="ltr">#{mine.rank}</p>
      <p className="text-sm text-blue-100">{ar ? "نقاطك" : "Your score"}: {mine.score} · {ar ? "وقتك" : "Your time"}: <span dir="ltr" className="inline-block font-mono">{formatNadawiDuration(mine.elapsed_ms, true)}</span></p>
    </div>}
    <h3 className="font-bold">{ar ? "ترتيب المتسابقين الحالي" : "Current leaderboard"}</h3>
    <p className="text-xs leading-6 text-blue-200">{ar ? "النقاط الأعلى أولاً، ثم الوقت الأقل. إذا تساوت النقاط والوقت تماماً يتشاركون المركز. الترتيب يتحدّث كل ١٥ ثانية ويتغيّر مع نتائج الطلاب." : "Score first, then faster time. Exactly equal score and time share the same rank. Standings refresh every 15 seconds and can change as students finish."}</p>
    {error ? <div role="alert" className="space-y-2 text-sm text-amber-100">
      <p>{error.includes("AUTH_REQUIRED") ? (ar ? "سجّل دخولك حتى تشوف ترتيب المسابقة." : "Sign in to view the competition leaderboard.") : (ar ? "تعذّر تحديث الترتيب. راح نعيد المحاولة تلقائياً." : "Could not update the standings. We will retry automatically.")}</p>
      {rankings !== null && <p>{ar ? "المعروض هو آخر ترتيب تم تحميله." : "Showing the last loaded standings."}</p>}
      <button type="button" className="min-h-11 rounded-xl border border-white/25 px-4 py-2 font-bold hover:bg-white/10" onClick={() => setRefresh((value) => value + 1)}>{ar ? "إعادة المحاولة" : "Retry leaderboard"}</button>
    </div> : rankings === null ? <p role="status" className="flex items-center gap-2 text-sm text-blue-100"><Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />{ar ? "جاري تحميل مركزك والترتيب…" : "Loading your rank and standings…"}</p> : null}
    {rankings !== null && !error && !mine && <p className="text-sm leading-7 text-blue-100">{completed ? (ar ? "نتيجتك محفوظة، ننتظر تحديث مركزك بالترتيب." : "Your result is saved. Waiting for your rank to update.") : (rankings.length === 0 ? (ar ? "بعد ماكو نتائج مكتملة. أول ما يكمل الطلاب تظهر مراكزهم هنا." : "No completed results yet. Students appear here once they finish.") : (ar ? "كمّل المسابقة حتى يظهر مركزك هنا." : "Finish the competition to see your rank here."))}</p>}
    {!!rankings?.length && <div className="overflow-x-auto"><table className="w-full text-start text-sm">
      <caption className="pb-2 text-start text-xs text-blue-200">{ar ? "أفضل ٢٠ متسابق، ونتيجتك حتى لو خارجهم" : "Top 20 students, plus your result even if outside the top 20"}</caption>
      <thead><tr className="border-b border-white/20"><th scope="col" className="p-2">#</th><th scope="col" className="p-2">{ar ? "الطالب" : "Student"}</th><th scope="col" className="p-2">{ar ? "النقاط" : "Score"}</th><th scope="col" className="p-2">{ar ? "الوقت" : "Time"}</th></tr></thead>
      <tbody>{rankings.map((row, index) => <tr key={index} className={`border-b border-white/10 ${row.is_me ? "bg-cyan-200/15 font-bold" : ""}`}>
        <td className="p-2">{row.rank}</td><td className="max-w-36 break-words p-2">{row.display_name}{row.is_me ? (ar ? " (أنت)" : " (you)") : ""}</td><td className="p-2">{row.score}</td><td dir="ltr" className="whitespace-nowrap p-2 font-mono text-xs">{formatNadawiDuration(row.elapsed_ms, true)}</td>
      </tr>)}</tbody>
    </table></div>}
  </section>;
}
