import { supabase } from "@/integrations/supabase/client";

type Session = { access_token: string; expires_at?: number } | null;

async function invokeWith(session: NonNullable<Session>, malzamaId: string) {
  return supabase.functions.invoke("malazam-download", {
    body: { malzamaId },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
}

function responseStatus(error: unknown) {
  return (error as { context?: { status?: number } } | null)?.context?.status;
}

/**
 * Invokes the protected download function with a fresh access token.
 * A tab can stay open long enough for its cached JWT to expire, so retry one
 * time after refreshing instead of showing a misleading Telegram error.
 */
export async function invokeMalazamDownload(malzamaId: string) {
  let { data: { session } } = await supabase.auth.getSession();
  const expired = session?.expires_at ? session.expires_at * 1000 < Date.now() + 30_000 : false;

  if (!session || expired) {
    const { data } = await supabase.auth.refreshSession();
    session = data.session;
  }
  if (!session) return { data: { error: "unauthenticated" }, error: null, signedOut: true as const };

  let result = await invokeWith(session, malzamaId);
  if (responseStatus(result.error) === 401) {
    const { data } = await supabase.auth.refreshSession();
    if (!data.session) return { data: { error: "unauthenticated" }, error: result.error, signedOut: true as const };
    result = await invokeWith(data.session, malzamaId);
    if (responseStatus(result.error) === 401) {
      return { data: { error: "unauthenticated" }, error: result.error, signedOut: true as const };
    }
  }

  return { ...result, signedOut: false as const };
}
