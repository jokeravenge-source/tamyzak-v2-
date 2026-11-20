import { NADAWI_CONTEST_CLOSED } from "@/lib/nadawiContestSettings";
import { Trophy } from "lucide-react";
import type { AppLanguage } from "./LanguageGate";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import NadawiLeaderboard from "./NadawiLeaderboard";

export default function NadawiLeaderboardButton({ language }: { language: AppLanguage }) {
  const ar = language === "ar";
  if (NADAWI_CONTEST_CLOSED) return null;
  return <Dialog>
    <DialogTrigger asChild><button type="button" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-200/40 bg-amber-100/10 px-4 py-3 text-sm font-bold text-amber-100 hover:bg-amber-100/20"><Trophy aria-hidden="true" className="h-5 w-5" />{ar ? "لوحة ترتيب المسابقة" : "Competition leaderboard"}</button></DialogTrigger>
    <DialogContent dir={ar ? "rtl" : "ltr"} className="rounded-3xl border-cyan-200/20 bg-[#101f42] text-white">
      <DialogTitle className="pe-8">{ar ? "ترتيب مسابقة الأستاذ محمد النداوي" : "Mohammed Al-Nadawi competition leaderboard"}</DialogTitle>
      <DialogDescription className="text-blue-100">{ar ? "تابع المتصدرين ومركزك بالمسابقة." : "See the leaders and your competition rank."}</DialogDescription>
      <NadawiLeaderboard language={language} />
    </DialogContent>
  </Dialog>;
}
