import type { AppLanguage } from "./LanguageGate";

export default function NadawiContestClosedNotice({ language }: { language: AppLanguage }) {
  const ar = language === "ar";
  return <div className="space-y-3 rounded-2xl border border-white/20 bg-white/5 p-5 text-center">
    <h2 className="text-xl font-black">{ar ? "المسابقة مغلقة حالياً" : "The competition is currently closed"}</h2>
    <p className="text-sm leading-7 text-blue-100">{ar ? "المشاركة ولوحة الترتيب متوقفة مؤقتاً. نتائجك محفوظة." : "Participation and the leaderboard are temporarily unavailable. Your results are saved."}</p>
  </div>;
}
