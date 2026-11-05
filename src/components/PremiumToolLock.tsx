import { useState, type FormEvent } from "react";
import { ArrowLeft, Crown, KeyRound, Loader2, LockKeyhole, Send } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { PREMIUM_TELEGRAM_URL } from "@/lib/premium";
import { supabase } from "@/integrations/supabase/client";

type PromoResult = { ok?: boolean; reason?: "expired" | "invalid_code" | "unauthenticated" };

export default function PremiumToolLock({ language, loading, onBack, onUnlocked = () => window.location.reload() }: {
  language: AppLanguage; loading: boolean; onBack: () => void; onUnlocked?: () => void;
}) {
  const ar = language === "ar";
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const redeemPromo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const enteredCode = code.trim();
    if (!enteredCode) {
      setPromoMessage({ kind: "error", text: "اكتب كلمة الحملة أولاً." });
      return;
    }
    setRedeeming(true);
    setPromoMessage(null);
    try {
      const { data, error } = await supabase.rpc("redeem_premium_promo", { _code: enteredCode });
      if (error) throw error;
      const result = (data ?? {}) as PromoResult;
      if (result.ok) {
        setPromoMessage({ kind: "success", text: "تم فتح كل الأدوات لغاية صباح الأحد." });
        onUnlocked();
        return;
      }
      const text = result.reason === "expired"
        ? "انتهت مدة هذه الحملة."
        : result.reason === "unauthenticated"
          ? "سجّل الدخول أولاً حتى نفتح الأدوات لحسابك."
          : "الكلمة غير صحيحة. تأكد منها وحاول مرة ثانية.";
      setPromoMessage({ kind: "error", text });
    } catch {
      setPromoMessage({ kind: "error", text: "ما كدرنا نتحقق من الكلمة حالياً. حاول مرة ثانية." });
    } finally {
      setRedeeming(false);
    }
  };

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
            {ar && (
              <form onSubmit={redeemPromo} className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-right">
                <p className="flex items-center gap-2 text-sm font-black text-foreground"><KeyRound className="h-4 w-4 text-primary" />فتح مجاني لوقت محدود</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">اكتب كلمة الحملة وافتح كل الأدوات لغاية الأحد 8 تشرين الثاني، الساعة 10 صباحاً بتوقيت بغداد.</p>
                <label htmlFor="premium-promo-code" className="mt-3 block text-xs font-bold text-foreground">كلمة الحملة</label>
                <input
                  id="premium-promo-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  autoComplete="off"
                  disabled={redeeming}
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-right text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  placeholder="اكتب الكلمة هنا"
                />
                <button type="submit" disabled={redeeming} className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-black text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                  {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  {redeeming ? "جارٍ الفتح…" : "افتح كل الأدوات"}
                </button>
                {promoMessage && <p role="status" className={`mt-3 text-xs font-bold ${promoMessage.kind === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>{promoMessage.text}</p>}
              </form>
            )}
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
