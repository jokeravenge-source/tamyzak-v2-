import { useState, type FormEvent } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";

type PromoResult = { ok?: boolean; reason?: "expired" | "invalid_code" | "unauthenticated" };

export default function PremiumPromoCodeForm({
  language,
  onUnlocked = () => window.location.reload(),
}: {
  language: AppLanguage;
  onUnlocked?: () => void;
}) {
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  if (language !== "ar") return null;

  const redeemPromo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const enteredCode = code.trim();
    if (!enteredCode) {
      setMessage({ kind: "error", text: "اكتب كلمة الحملة أولاً." });
      return;
    }
    setRedeeming(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.rpc("redeem_premium_promo", { _code: enteredCode });
      if (error) throw error;
      const result = (data ?? {}) as PromoResult;
      if (result.ok) {
        setMessage({ kind: "success", text: "تم فتح كل الأدوات لغاية صباح الأحد." });
        onUnlocked();
        return;
      }
      const text = result.reason === "expired"
        ? "انتهت مدة هذه الحملة."
        : result.reason === "unauthenticated"
          ? "سجّل الدخول أولاً حتى نفتح الأدوات لحسابك."
          : "الكلمة غير صحيحة. تأكد منها وحاول مرة ثانية.";
      setMessage({ kind: "error", text });
    } catch {
      setMessage({ kind: "error", text: "ما كدرنا نتحقق من الكلمة حالياً. حاول مرة ثانية." });
    } finally {
      setRedeeming(false);
    }
  };

  return (
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
      {message && <p role="status" className={`mt-3 text-xs font-bold ${message.kind === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>{message.text}</p>}
    </form>
  );
}
