import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hasActivePremiumSubscription, PREMIUM_ENVIRONMENT, PREMIUM_PROMO_ENDS_AT } from "@/lib/premium";

export type SubscriptionRow = {
  id: string;
  status: string;
  product_id: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  environment: string;
};

export function useSubscription() {
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now);
  // Admins and the owner account are entitled server-side without a subscription row.
  const [serverEntitled, setServerEntitled] = useState(false);
  const [serverExpiresAt, setServerExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const env = PREMIUM_ENVIRONMENT;
    let uid: string | null = null;
    let requestVersion = 0;
    let authVersion = 0;
    let lastFetch = 0;

    const fetchSub = async (uid: string) => {
      const version = ++requestVersion;
      try {
        const [{ data, error }, status] = await Promise.all([
          supabase.from("subscriptions").select("*")
            .eq("user_id", uid).eq("environment", env)
            .in("status", ["active", "trialing", "past_due"])
            .order("created_at", { ascending: false }),
          // The RPC is introduced by the day-pass migration; tolerate the
          // previous schema while frontend/database releases are being synced.
          supabase.rpc("premium_access_status" as never) as unknown as PromiseLike<{ data: unknown; error: unknown }>,
        ]);
        const details = !status.error && status.data && typeof status.data === "object" && !Array.isArray(status.data)
          ? status.data as { is_premium?: boolean; expires_at?: string | null } : null;
        const legacy = details ? null : await supabase.rpc("can_use_premium_tools");
        if (active && version === requestVersion) {
          const validDeadline = details?.expires_at == null || Number.isFinite(Date.parse(details.expires_at));
          setServerEntitled(details ? details.is_premium === true && validDeadline : !legacy?.error && legacy?.data === true);
          setServerExpiresAt(details?.expires_at ?? null);
          setSub(error ? null : ((data as SubscriptionRow[] | null) ?? [])
            .find((row) => hasActivePremiumSubscription(row, env)) ?? null);
        }
      } catch {
        if (active && version === requestVersion) { setSub(null); setServerEntitled(false); setServerExpiresAt(null); }
      } finally {
        if (active && version === requestVersion) {
          setNow(Date.now());
          setLoading(false);
        }
      }
    };
    const changeUser = (nextUid: string | null) => {
      if (!active || nextUid === uid) return;
      uid = nextUid;
      ++requestVersion;
      setUserId(uid);
      setSub(null);
      setServerEntitled(false);
      setServerExpiresAt(null);
      setLoading(Boolean(uid));
      if (uid) {
        lastFetch = Date.now();
        void fetchSub(uid);
      }
    };
    const onFocus = () => {
      if (!uid || document.hidden) return;
      setNow(Date.now());
      if (Date.now() - lastFetch < 30000) return;
      lastFetch = Date.now();
      void fetchSub(uid);
    };
    const promoRemaining = PREMIUM_PROMO_ENDS_AT - Date.now();
    const promoTimer = promoRemaining > 0
      ? window.setTimeout(() => {
          if (!uid) return;
          lastFetch = Date.now();
          void fetchSub(uid);
        }, Math.min(promoRemaining + 250, 2_147_483_647))
      : null;
    // A root-level gate stays mounted across sign-in and sign-out.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      ++authVersion;
      changeUser(session?.user.id ?? null);
      if (!session) setLoading(false);
    });
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    (async () => {
      const version = authVersion;
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!active || version !== authVersion) return;
        changeUser(u.user?.id ?? null);
        if (!u.user) setLoading(false);
      } catch {
        if (active && version === authVersion) { changeUser(null); setLoading(false); }
      }
    })();

    return () => {
      active = false;
      ++requestVersion;
      authListener.subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      if (promoTimer !== null) window.clearTimeout(promoTimer);
    };
  }, []);

  // Re-lock an expired membership even when the student leaves the tab open.
  useEffect(() => {
    const deadlines = [sub?.current_period_end, serverExpiresAt].filter(Boolean).map((date) => Date.parse(date!)).filter((date) => Number.isFinite(date) && date > Date.now());
    if (!deadlines.length) return;
    const remaining = Math.min(...deadlines) - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) return;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(remaining, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [sub, serverExpiresAt, now]);

  return {
    subscription: sub,
    isPremium: !loading && ((serverEntitled && (serverExpiresAt === null || Date.parse(serverExpiresAt) > now)) || hasActivePremiumSubscription(sub, PREMIUM_ENVIRONMENT, now)),
    premiumExpiresAt: serverEntitled ? serverExpiresAt : sub?.current_period_end ?? null,
    loading,
    userId,
  };
}
