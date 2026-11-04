import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ReadingAccess = {
  access: boolean;
  premium: boolean;
  started_at: string | null;
  expires_at: string | null;
};

function isReadingAccess(value: unknown): value is ReadingAccess {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.access === "boolean" && typeof row.premium === "boolean" &&
    (row.started_at === null || typeof row.started_at === "string") &&
    (row.expires_at === null || typeof row.expires_at === "string");
}
export function useEnglishReadingAccess() {
  const [access, setAccess] = useState<ReadingAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());
  const lastRefresh = useRef(0);

  const refresh = useCallback(async () => {
    lastRefresh.current = Date.now();
    setLoading(true);
    setError(false);
    try {
      const { data, error: requestError } = await supabase.rpc("claim_english_reading_access");
      if (requestError || !isReadingAccess(data)) throw requestError ?? new Error("Invalid access response");
      setAccess(data);
      setNow(Date.now());
    } catch {
      setError(true);
      setAccess(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    const recheck = () => {
      if (document.hidden || Date.now() - lastRefresh.current < 30_000) return;
      void refresh();
    };
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [refresh]);

  useEffect(() => {
    if (!access?.expires_at || access.premium) return;
    const tick = () => setNow(Date.now());
    const interval = window.setInterval(tick, 60_000);
    const deadline = new Date(access.expires_at).getTime();
    const expiration = Number.isFinite(deadline)
      ? window.setTimeout(tick, Math.max(0, deadline - Date.now()))
      : undefined;
    return () => {
      window.clearInterval(interval);
      if (expiration !== undefined) window.clearTimeout(expiration);
    };
  }, [access?.expires_at, access?.premium]);

  const expiresAt = access?.expires_at ? new Date(access.expires_at).getTime() : null;
  const remainingMs = expiresAt === null || !Number.isFinite(expiresAt) ? 0 : Math.max(0, expiresAt - now);
  const hasAccess = Boolean(access?.premium || (access?.access && remainingMs > 0));

  return useMemo(() => ({
    hasAccess,
    premium: access?.premium ?? false,
    remainingMs,
    loading,
    error,
    refresh,
  }), [access?.premium, error, hasAccess, loading, refresh, remainingMs]);
}
