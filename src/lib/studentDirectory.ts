import { supabase } from "@/integrations/supabase/client";

export type DirectoryStudent = { user_id: string; display_name: string };

export async function searchStudentDirectory(query: string, signal: AbortSignal): Promise<DirectoryStudent[]> {
  const clean = query.trim().replace(/[%_\\]/g, "").slice(0, 60);
  if (clean.length < 2) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (signal.aborted) return [];
  if (!auth.user) throw new Error("AUTH_REQUIRED");
  const { data, error } = await supabase.from("profiles").select("user_id,display_name")
    .neq("user_id", auth.user.id).ilike("display_name", `%${clean}%`).order("display_name").limit(8).abortSignal(signal);
  if (error) throw error;
  return data ?? [];
}
