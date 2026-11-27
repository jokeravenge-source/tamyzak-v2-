import { useEffect, useRef, useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";
import { PREMIUM_ACCESS_CHANGED_EVENT, PREMIUM_ENVIRONMENT, PREMIUM_POINTS_COST, PREMIUM_POINTS_OFFER } from "@/lib/premium";

const copy = {
  ar: {
    title: "بريميوم بالنقاط",
    balance: "رصيدك المتاح",
    loading: "جارٍ تحميل رصيدك…",
    balanceError: "ما قدرنا نحمّل رصيدك.",
    retryBalance: "إعادة تحميل الرصيد",
    redeem: "استبدل ١٬٠٠٠ نقطة",
    retry: "أعد محاولة الاستبدال",
    redeeming: "جارٍ الاستبدال…",
    success: "تم الاستبدال وانضافت ٣ أيام لبريميومك.",
    insufficient: "رصيدك المتاح ما يكفي للاستبدال.",
    permanent: "عندك بريميوم دائم على حسابك.",
    signedOut: "سجّل دخول حتى تستبدل نقاطك.",
    unconfirmed: "ما قدرنا نأكد الاستبدال. عيد المحاولة حتى نتحقق من نفس الطلب.",
  },
  en: {
    title: "Premium with points",
    balance: "Available balance",
    loading: "Loading your balance…",
    balanceError: "We couldn't load your balance.",
    retryBalance: "Reload balance",
    redeem: "Redeem 1,000 points",
    retry: "Retry redemption",
    redeeming: "Redeeming…",
    success: "Redemption complete. 3 days of Premium added.",
    insufficient: "You don't have enough available points.",
    permanent: "Your account already has permanent Premium.",
    signedOut: "Sign in to redeem your points.",
    unconfirmed: "We couldn't confirm your redemption. Retry to check the same request.",
  },
} as const;

type RedemptionResult = {
  ok?: boolean;
  balance?: number;
  reason?: "not_enough_points" | "permanent_premium" | "unauthenticated";
};

export default function PremiumPointsRedemption({ language, userId }: { language: AppLanguage; userId: string }) {
  const t = copy[language];
  const storageKey = `app:premium-points-request:${userId}`;
  const [requestId, setRequestId] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey);
    } catch {
      return null;
    }
  });
  const [balance, setBalance] = useState<number | "unavailable" | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (balance !== null) return;
    let active = true;
    async function loadBalance() {
      try {
        const { data, error } = await supabase.rpc("points_balance");
        if (active) setBalance(!error && typeof data === "number" ? data : "unavailable");
      } catch {
        if (active) setBalance("unavailable");
      }
    }
    void loadBalance();
    return () => { active = false; };
  }, [balance]);

  // An unresolved request can be retried even when the first attempt used the last points.
  const canRedeem = balance !== null && (requestId !== null || (typeof balance === "number" && balance >= PREMIUM_POINTS_COST));
  const rememberRequest = (id: string | null) => {
    setRequestId(id);
    try {
      if (id) sessionStorage.setItem(storageKey, id);
      else sessionStorage.removeItem(storageKey);
    } catch {
      // State still retains the receipt while this form is open.
    }
  };

  async function redeem() {
    if (!canRedeem || inFlight.current) return;
    inFlight.current = true;
    setRedeeming(true);
    setMessage(null);
    try {
      const id = requestId ?? crypto.randomUUID();
      rememberRequest(id);
      const { data, error } = await supabase.rpc("redeem_premium_with_points", {
        _environment: PREMIUM_ENVIRONMENT,
        _request_id: id,
      });
      const result = data as RedemptionResult | null;
      if (error || typeof result?.ok !== "boolean") throw new Error("Redemption was not confirmed");

      rememberRequest(null);
      if (typeof result.balance === "number") setBalance(result.balance);
      if (result.ok) {
        toast.success(t.success);
        window.dispatchEvent(new Event(PREMIUM_ACCESS_CHANGED_EVENT));
        return;
      }
      setMessage(result.reason === "permanent_premium" ? t.permanent : result.reason === "unauthenticated" ? t.signedOut : t.insufficient);
    } catch {
      setMessage(t.unconfirmed);
    } finally {
      inFlight.current = false;
      setRedeeming(false);
    }
  }

  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-4 text-start shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
          <Coins className="size-5" />
        </div>
        <div>
          <h2 className="font-bold text-foreground">{t.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{PREMIUM_POINTS_OFFER[language]}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        {balance === null ? t.loading : balance === "unavailable" ? t.balanceError : (
          <>{t.balance} <strong className="text-foreground">{balance.toLocaleString(language === "ar" ? "ar-IQ" : "en-GB")}</strong></>
        )}
      </p>
      {balance === "unavailable" && !requestId ? (
        <button type="button" onClick={() => setBalance(null)} className="mt-3 min-h-11 w-full rounded-xl border border-border px-3 font-bold text-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary">
          {t.retryBalance}
        </button>
      ) : (
        <button type="button" onClick={redeem} disabled={!canRedeem || redeeming} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 font-bold text-primary-foreground transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60">
          {redeeming && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {redeeming ? t.redeeming : requestId ? t.retry : t.redeem}
        </button>
      )}
      {message && <p className="mt-3 text-sm font-semibold text-destructive" role="status">{message}</p>}
    </section>
  );
}
