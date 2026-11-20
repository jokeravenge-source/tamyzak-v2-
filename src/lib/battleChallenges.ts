import { supabase } from "@/integrations/supabase/client";
export type BattleStudent = { user_id: string; display_name: string };
export type BattleInvitation = {
  id: string; from_name: string; room_code: string; created_at: string;
  subject: string; chapter: number; language: "ar" | "en"; question_count: number;
};
export const BATTLE_INVITE_LIFETIME = 180000;

export async function searchBattleStudents(query: string, signal: AbortSignal): Promise<BattleStudent[]> {
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

export async function sendBattleChallenge(to: string, settings: { code: string; subject: string; chapter: number; language: "ar" | "en"; count: number }) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user || auth.user.id === to) throw new Error("AUTH_REQUIRED");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("display_name").eq("user_id", auth.user.id).maybeSingle();
  if (profileError) throw profileError;
  const { data, error } = await supabase.from("battle_invites").insert({
    from_user_id: auth.user.id, to_user_id: to, from_name: (profile?.display_name || "Student").slice(0, 40),
    room_code: settings.code, subject: settings.subject, chapter: settings.chapter, language: settings.language,
    question_count: settings.count, status: "pending",
  }).select("id").single();
  if (error || !data) throw error ?? new Error("INVITE_FAILED");
  return data.id;
}

export async function cancelBattleChallenge(id: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from("battle_invites").update({ status: "cancelled" }).eq("id", id).eq("from_user_id", auth.user.id).eq("status", "pending");
}
export async function battleChallengeStatus(id: string) {
  const { data, error } = await supabase.from("battle_invites").select("status").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.status;
}
export async function respondToBattleChallenge(invite: BattleInvitation, userId: string, accepted: boolean) {
  const { data, error } = await supabase.from("battle_invites").update({ status: accepted ? "accepted" : "declined" })
    .eq("id", invite.id).eq("to_user_id", userId).eq("status", "pending")
    .gte("created_at", new Date(Date.now() - BATTLE_INVITE_LIFETIME).toISOString()).select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("INVITE_EXPIRED");
}
