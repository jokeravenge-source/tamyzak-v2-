import { supabase } from "@/integrations/supabase/client";

/**
 * Serve argument-less supabase.auth.getUser() from the locally cached session
 * (refreshed automatically by the client) instead of a ~2.5s round trip to the
 * auth server on every call. Server-side RLS still verifies every request.
 */
const auth = supabase.auth as unknown as {
  getUser: (jwt?: string) => Promise<unknown>;
};
const original = auth.getUser.bind(supabase.auth);

auth.getUser = async (jwt?: string) => {
  if (jwt) return original(jwt);
  const { data, error } = await supabase.auth.getSession();
  if (error) return { data: { user: null }, error };
  if (!data.session) return original();
  return { data: { user: data.session.user }, error: null };
};
