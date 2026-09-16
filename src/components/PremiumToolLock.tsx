import { ArrowLeft, Crown, Loader2, LockKeyhole, Send } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { PREMIUM_TELEGRAM_URL } from "@/lib/premium";

export default function PremiumToolLock({ language, loading, onBack }: {
  language: AppLanguage; loading: boolean; onBack: () => void;
}) {
  const ar = language === "ar";
  return (
    <main dir={ar ? "rtl" : "ltr"} className="flex min-h-screen items-center justify-center bg-background px-4 py-12 pb-28" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      <section className="relative w-full max-w-md border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-7 text-center shadow-xl backdrop-blur-xl" style={{ clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}>
        <button type="button" onClick={onBack} className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm text-foreground hover:bg-secondary">
          <ArrowLeft className={`h-4 w-4 ${ar ? "rotate-180" : ""}`} /> {ar ? "رجوع" : "Back"}
        </button>
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300"><LockKeyhole className="h-7 w-7" /></div>
        {loading ? (
          <p role="status" className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{ar ? "جارٍ التحقق من اشتراكك…" : "Checking your membership…"}</p>
        ) : (
          <>
            <p className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-amber-700 dark:text-amber-300"><Crown className="h-4 w-4" />{ar ? "بريميوم" : "Premium"}</p>
            <h1 className="text-2xl font-black text-foreground">{ar ? "هذه الأداة للمشتركين" : "This tool is for Premium members"}</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{ar ? "راسلنا على تيليجرام لتفعيل اشتراكك، ثم ارجع إلى تميزك." : "Message us on Telegram to activate your membership, then return to Tamayzak."}</p>
            <a href={PREMIUM_TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 font-bold text-slate-950 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Send className="h-4 w-4" />{ar ? "افتح البريميوم عبر تيليجرام" : "Unlock via Telegram"}
            </a>
            <p className="mt-3 text-sm font-semibold text-muted-foreground" dir="ltr">@ias404</p>
          </>
        )}
      </section>
    </main>
  );
}
