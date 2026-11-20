import { useEffect, useState } from "react";
import { ArrowUpLeft, ArrowUpRight, Clock3, Sparkles } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NadawiContest from "./NadawiContest";
import NadawiLeaderboardButton from "./NadawiLeaderboardButton";
import NadawiAdminTestButton from "./NadawiAdminTestButton";
import { canTestNadawiContest } from "@/lib/nadawiContestApi";
import { NADAWI_CONTEST_START } from "@/lib/nadawiContestSettings";
import englishIcon from "@/assets/english-contest-3d.svg";

const title = "مسابقة الأستاذ محمد النداوي";

export default function NadawiContestCard({ language }: { language: AppLanguage }) {
  const ar = language === "ar";
  const [open, setOpen] = useState(false);
  const [canTest, setCanTest] = useState(false);
  useEffect(() => {
    let active = true;
    setCanTest(false);
    if (open) void canTestNadawiContest().then((allowed) => { if (active) setCanTest(allowed); });
    return () => { active = false; };
  }, [open]);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    if (Date.now() >= NADAWI_CONTEST_START) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= NADAWI_CONTEST_START) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open]);
  const remaining = Math.max(0, Math.ceil((NADAWI_CONTEST_START - now) / 1000));
  const arrived = remaining === 0;
  const digits = new Intl.NumberFormat(ar ? "ar-IQ" : "en", { minimumIntegerDigits: 2, useGrouping: false });
  const units = [
    { value: Math.floor(remaining / 3600), label: ar ? "ساعة" : "Hours" },
    { value: Math.floor((remaining % 3600) / 60), label: ar ? "دقيقة" : "Minutes" },
    { value: remaining % 60, label: ar ? "ثانية" : "Seconds" },
  ];
  const appointment = ar ? "٢٠ نوفمبر · ٨:٣٠ مساءً بتوقيت بغداد" : "20 November · 8:30 PM Baghdad time";
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          dir={ar ? "rtl" : "ltr"}
          aria-label={title}
          className="group relative mb-5 flex w-full items-center gap-2 overflow-hidden rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-[#142650] via-[#192f66] to-[#2263a3] p-4 text-start text-white shadow-[0_18px_42px_-24px_rgba(18,59,117,0.8)] transition-shadow hover:shadow-[0_22px_46px_-20px_rgba(18,59,117,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 sm:gap-5 sm:p-6"
        >
          <span aria-hidden="true" className="pointer-events-none absolute -end-12 -top-20 h-60 w-60 rounded-full bg-cyan-300/15 blur-2xl" />
          <img src={englishIcon} width={240} height={240} alt="" className="relative h-24 w-24 shrink-0 drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none sm:h-32 sm:w-32" />
          <span className="relative min-w-0 flex-1">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200/25 bg-amber-100/10 px-2.5 py-1 text-[10px] font-bold text-amber-100 sm:text-xs">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {ar ? "تحدّي اللغة الإنكليزية" : "English challenge"}
            </span>
            <span dir="rtl" className="block text-base font-black leading-7 sm:text-2xl sm:leading-9">{title}</span>
            <span className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-cyan-100 sm:text-sm">
              <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {ar ? "اضغط لفتح المسابقة وموعدها" : "Open the challenge and its start time"}
            </span>
          </span>
          <Arrow aria-hidden="true" className="relative hidden h-9 w-9 shrink-0 rounded-full bg-white/10 p-2 sm:block" />
        </button>
      </DialogTrigger>
      <DialogContent dir={ar ? "rtl" : "ltr"} className="gap-5 rounded-3xl border-cyan-200/20 bg-[#101f42] p-6 text-center text-white sm:p-8">
        <img src={englishIcon} width={240} height={240} alt="" className={arrived ? "mx-auto h-20 w-20" : "mx-auto h-36 w-36"} />
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">{ar ? "استعد لتحدّي الإنكليزي" : "Get ready for English"}</p>
          <DialogTitle dir="rtl" className="text-xl font-black leading-9 sm:text-2xl">{title}</DialogTitle>
          <DialogDescription className="leading-6 text-blue-100">{appointment}</DialogDescription>
        </div>
        <NadawiLeaderboardButton language={language} />
        {canTest && <NadawiAdminTestButton language={language} />}
        {arrived ? (
          <div className="space-y-4">
            {<p role="status" className="text-sm font-bold text-cyan-100">{ar ? "حان موعد المسابقة!" : "It’s time!"}</p>}
            <NadawiContest language={language} />
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-blue-100">{ar ? "باقي على موعد المسابقة" : "Time until the competition"}</p>
            <div role="timer" aria-live="off" aria-label={ar ? "الوقت المتبقي للمسابقة" : "Competition countdown"} dir="ltr" className="grid grid-cols-3 gap-2 sm:gap-3">
              {units.map(({ value, label }) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/[0.06] px-2 py-5">
                  <span className="block text-4xl font-black tabular-nums text-white sm:text-5xl">{digits.format(value)}</span>
                  <span className="mt-2 block text-xs font-medium text-cyan-100">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-6 text-blue-200">{ar ? "جهّز نفسك… وخلّ معلوماتك تحچي!" : "Get ready to put your English to the test!"}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
