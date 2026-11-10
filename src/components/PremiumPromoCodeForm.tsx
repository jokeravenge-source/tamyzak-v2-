import { useState, type FormEvent } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";

type PromoResult = { ok?: boolean; expires_at?: string; reason?: "expired" | "invalid_code" | "unauthenticated" | "already_redeemed" };

export default function PremiumPromoCodeForm({
  language,
  onUnlocked = () => window.location.reload(),
}: {
  language: AppLanguage;
  onUnlocked?: () => void;
}) {
  const ar = language === "ar";
  const copy = ar ? {
    title: "فتح مجاني لوقت محدود",
    description: "اكتب كودك لتفعيل Premium للمدة المحددة له من أول استخدام، مرة واحدة لكل حساب.",
    label: "كلمة الحملة",
    placeholder: "اكتب الكلمة هنا",
    empty: "اكتب كلمة الحملة أولاً.",
    success: "تم تفعيل صلاحيات الكود لحسابك.",
    used: "استخدمت هذا الكود من قبل وانتهت مدته. إعادة إدخاله لا تبدأ مدة جديدة.",
    expired: "انتهت مدة هذه الحملة.",
    signedOut: "سجّل الدخول أولاً حتى نفتح الأدوات لحسابك.",
    invalid: "الكلمة غير صحيحة. تأكد منها وحاول مرة ثانية.",
    unavailable: "ما كدرنا نتحقق من الكلمة حالياً. حاول مرة ثانية.",
    submit: "افتح كل الأدوات",
    submitting: "جارٍ الفتح…",
  } : {
    title: "Limited-time free unlock",
    description: "Enter your code to activate Premium for its assigned duration from first use, once per account.",
    label: "Campaign code",
    placeholder: "Enter the code here",
    empty: "Enter the campaign code first.",
    success: "Your campaign access is now active.",
    used: "You already used this code and its access has ended. Entering it again does not restart its duration.",
    expired: "This campaign has ended.",
    signedOut: "Sign in first so we can unlock the tools for your account.",
    invalid: "The code is incorrect. Check it and try again.",
    unavailable: "We could not verify the code right now. Please try again.",
    submit: "Unlock all tools",
    submitting: "Unlocking…",
  };
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const redeemPromo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const enteredCode = code.trim();
    if (!enteredCode) {
      setMessage({ kind: "error", text: copy.empty });
      return;
    }
    setRedeeming(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.rpc("redeem_premium_promo", { _code: enteredCode });
      if (error) throw error;
      const result = (data ?? {}) as PromoResult;
      if (result.ok) {
        const deadline = result.expires_at ? new Date(result.expires_at) : null;
        const until = deadline && Number.isFinite(deadline.getTime()) ? deadline.toLocaleString(ar ? "ar-IQ" : "en-GB", { timeZone: "Asia/Baghdad" }) : null;
        setMessage({ kind: "success", text: until ? `${copy.success} ${ar ? "صالح لغاية" : "Valid until"} ${until} ${ar ? "بتوقيت بغداد" : "Baghdad time"}.` : copy.success });
        onUnlocked();
        return;
      }
      const text = result.reason === "already_redeemed" ? copy.used : result.reason === "expired"
        ? copy.expired
        : result.reason === "unauthenticated"
          ? copy.signedOut
          : copy.invalid;
      setMessage({ kind: "error", text });
    } catch {
      setMessage({ kind: "error", text: copy.unavailable });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <form dir={ar ? "rtl" : "ltr"} onSubmit={redeemPromo} className={`mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 ${ar ? "text-right" : "text-left"}`}>
      <p className="flex items-center gap-2 text-sm font-black text-foreground"><KeyRound className="h-4 w-4 text-primary" />{copy.title}</p>
      <p className="mt-1 text-xs leading-6 text-muted-foreground">{copy.description}</p>
      <label htmlFor="premium-promo-code" className="mt-3 block text-xs font-bold text-foreground">{copy.label}</label>
      <input
        id="premium-promo-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        autoComplete="off"
        disabled={redeeming}
        className={`mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${ar ? "text-right" : "text-left"}`}
        placeholder={copy.placeholder}
      />
      <button type="submit" disabled={redeeming} className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-black text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
        {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {redeeming ? copy.submitting : copy.submit}
      </button>
      {message && <p role="status" className={`mt-3 text-xs font-bold ${message.kind === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>{message.text}</p>}
    </form>
  );
}
