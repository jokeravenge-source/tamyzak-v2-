import { supabase } from "@/integrations/supabase/client";

/**
 * Calls telegram-start only with a valid signed-in session.
 * Refreshes an expired token first; returns { data: null, signedOut: true }
 * instead of hitting the function (which would answer 401) when signed out.
 */
export async function invokeTelegramStart(body?: Record<string, unknown>) {
  let { data: { session } } = await supabase.auth.getSession();
  const expired = session?.expires_at ? session.expires_at * 1000 < Date.now() + 30_000 : false;
  if (!session || expired) {
    const { data } = await supabase.auth.refreshSession();
    session = data.session;
  }
  if (!session) return { data: null, error: null, signedOut: true as const };
  const res = await supabase.functions.invoke("telegram-start", {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  return { ...res, signedOut: false as const };
}
