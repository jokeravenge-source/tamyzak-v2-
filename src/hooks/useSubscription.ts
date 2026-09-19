import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hasActivePremiumSubscription, PREMIUM_ENVIRONMENT } from "@/lib/premium";

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
        const [{ data, error }, entitlement] = await Promise.all([
          supabase.from("subscriptions").select("*")
            .eq("user_id", uid).eq("environment", env)
            .in("status", ["active", "trialing", "past_due"])
            .order("created_at", { ascending: false }),
          supabase.rpc("can_use_premium_tools"),
        ]);
        if (active && version === requestVersion) {
          setServerEntitled(entitlement.error ? false : entitlement.data === true);
          setSub(error ? null : ((data as SubscriptionRow[] | null) ?? [])
            .find((row) => hasActivePremiumSubscription(row, env)) ?? null);
        }
      } catch {
        if (active && version === requestVersion) { setSub(null); setServerEntitled(false); }
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
    };
  }, []);

  // Re-lock an expired membership even when the student leaves the tab open.
  useEffect(() => {
    if (!sub?.current_period_end) return;
    const remaining = new Date(sub.current_period_end).getTime() - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) return;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(remaining, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [sub, now]);

  return { subscription: sub, isPremium: !loading && hasActivePremiumSubscription(sub, PREMIUM_ENVIRONMENT, now), loading, userId };
}
