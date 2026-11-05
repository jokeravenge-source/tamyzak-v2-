import { supabase } from "@/integrations/supabase/client";

type Session = { access_token: string; expires_at?: number } | null;

async function callWith(session: NonNullable<Session>, body?: Record<string, unknown>) {
  return supabase.functions.invoke("telegram-start", {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
}

function isUnauthorized(error: unknown): boolean {
  const status = (error as { context?: { status?: number } } | null)?.context?.status;
  return status === 401;
}

function rejected(res: { data: unknown; error: unknown }): boolean {
  return isUnauthorized(res.error) || Boolean((res.data as { signedOut?: boolean } | null)?.signedOut);
}

/**
 * Calls telegram-start only with a valid signed-in session.
 * Refreshes an expired token first. If the server still rejects the token
 * (e.g. the session was revoked elsewhere), refreshes once and retries;
 * if that fails too, reports signedOut instead of surfacing a 401 error.
 */
export async function invokeTelegramStart(body?: Record<string, unknown>) {
  let { data: { session } } = await supabase.auth.getSession();
  const expired = session?.expires_at ? session.expires_at * 1000 < Date.now() + 30_000 : false;
  if (!session || expired) {
    const { data } = await supabase.auth.refreshSession();
    session = data.session;
  }
  if (!session) return { data: null, error: null, signedOut: true as const };

  let res = await callWith(session, body);
  if (rejected(res)) {
    const { data } = await supabase.auth.refreshSession();
    if (!data.session) return { data: null, error: null, signedOut: true as const };
    res = await callWith(data.session, body);
    if (rejected(res)) return { data: null, error: null, signedOut: true as const };
  }
  return { ...res, signedOut: false as const };
}
