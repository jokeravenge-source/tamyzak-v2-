import { supabase } from "@/integrations/supabase/client";

/**
 * Makes sure a valid (non-expired) access token exists before calling an edge
 * function. Supabase refreshes automatically inside getSession(), but a token
 * that is about to expire mid-flight still gets rejected, so we force a
 * refresh when it expires in under a minute.
 */
export async function ensureFreshSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  let session = data.session;
  if (!session) return false;
  const expiresAt = (session.expires_at ?? 0) * 1000;
  if (expiresAt - Date.now() < 60_000) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    session = refreshed.session ?? null;
  }
  return !!session?.access_token;
}
