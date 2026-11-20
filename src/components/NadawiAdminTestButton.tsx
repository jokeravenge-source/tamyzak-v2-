import { FlaskConical } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import type { AppLanguage } from "./LanguageGate";
import NadawiContest from "./NadawiContest";

export default function NadawiAdminTestButton({ language = "ar" }: { language?: AppLanguage }) {
  const ar = language === "ar";
  return <Dialog><DialogTrigger asChild><Button variant="outline" className="min-h-11 gap-2 border-amber-400/40 bg-amber-100 text-amber-950 hover:bg-amber-200"><FlaskConical className="h-4 w-4" />{ar ? "تجربة مسابقة محمد النداوي" : "Test Nadawi competition"}</Button></DialogTrigger>
    <DialogContent dir={ar ? "rtl" : "ltr"} className="rounded-3xl border-amber-200/30 bg-[#101f42] text-white"><DialogTitle>{ar ? "تجربة المسابقة للأدمن" : "Admin competition test"}</DialogTitle><DialogDescription className="text-blue-100">{ar ? "متاحة قبل الموعد، ونتيجتها خارج ترتيب الطلاب." : "Available before opening time; test results do not enter the leaderboard."}</DialogDescription><NadawiContest language={language} adminTest /></DialogContent>
  </Dialog>;
}
