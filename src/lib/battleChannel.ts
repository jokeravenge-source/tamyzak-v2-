import { supabase } from "@/integrations/supabase/client";
import { isChannelBattleId } from "./battleChannelLink";

export type ChannelBattle = {
  id: string; host_name: string; subject: string; chapter: number; language: "ar" | "en";
  question_count: number; status: "waiting" | "claimed" | "started" | "cancelled" | "expired";
  expires_at: string; server_now: string; room_key: string; is_host: boolean;
};
export type BattleChannelConfig = { enabled: boolean; invite_url: string };
export type BattleChannelAdminConfig = BattleChannelConfig & { chat_id: string; bot_username: string };
export type ChannelBattleSettings = { subject: string; chapter: number; language: "ar" | "en"; question_count: number };
type Rpc = (name: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
const rpc: Rpc = (name, args) => (supabase.rpc as unknown as Rpc).call(supabase, name, args);
export function parseChannelBattle(value: unknown): ChannelBattle {
  const r = value as ChannelBattle;
  if (!r || !isChannelBattleId(r.id) || !isChannelBattleId(r.room_key) || typeof r.host_name !== "string" || typeof r.subject !== "string" || !Number.isInteger(r.chapter) || r.chapter < 0 || r.chapter > 12 || !["ar", "en"].includes(r.language) || !Number.isInteger(r.question_count) || r.question_count < 1 || r.question_count > 20 || !["waiting", "claimed", "started", "cancelled", "expired"].includes(r.status) || !Number.isFinite(Date.parse(r.expires_at)) || !Number.isFinite(Date.parse(r.server_now)) || typeof r.is_host !== "boolean") throw new Error("INVALID_ROOM");
  return r;
}
async function invoke(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("battle-channel", { body });
  if (error) {
    const context = (error as { context?: Response }).context;
    const details = context?.json ? await context.json().catch(() => null) : null;
    throw new Error(details?.error ?? "CHANNEL_REQUEST_FAILED");
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
export async function getBattleChannelConfig(): Promise<BattleChannelConfig> {
  const { data, error } = await rpc("get_battle_channel_config");
  if (error) return { enabled: false, invite_url: "" };
  const value = data as BattleChannelConfig;
  return { enabled: value?.enabled === true, invite_url: typeof value?.invite_url === "string" && /^https:\/\/t\.me\//.test(value.invite_url) ? value.invite_url : "" };
}
export async function publishChannelBattle(id: string, settings: ChannelBattleSettings) { return parseChannelBattle((await invoke({ action: "publish", id, ...settings })).room); }
export async function joinChannelBattle(id: string) { return parseChannelBattle((await invoke({ action: "join", id })).room); }
export async function getChannelBattle(id: string, heartbeat = false) {
  const { data, error } = await rpc("get_channel_battle", { _id: id, _heartbeat: heartbeat });
  if (error) throw new Error(error.message);
  return parseChannelBattle(data);
}
export async function closeChannelBattle(id: string, started = false) { return parseChannelBattle((await invoke({ action: "close", id, started })).room); }
export async function syncChannelBattle(id: string) { await invoke({ action: "sync", id }); }
export async function getBattleChannelAdminConfig(): Promise<BattleChannelAdminConfig> { return invoke({ action: "admin_get" }); }
export async function saveBattleChannelConfig(value: Omit<BattleChannelAdminConfig, "bot_username">) { await invoke({ action: "configure", ...value }); }
export function battleChannelError(error: unknown, ar: boolean) {
  const code = error instanceof Error ? error.message : "";
  if (/OWN_CHALLENGE/.test(code)) return ar ? "هذا تحدّيك. ارجع لصفحة الانتظار المفتوحة يمك." : "This is your challenge. Return to your waiting page.";
  if (/ROOM_EXPIRED|ROOM_TAKEN|ROOM_NOT_FOUND/.test(code)) return ar ? "هذا التحدّي امتلأ أو انتهى. اختَر تحدّي ثاني." : "This challenge is full or expired. Choose another one.";
  if (/CHANNEL_RATE_LIMIT|ALREADY_WAITING|RATE_LIMIT/.test(code)) return ar ? "انتظر دقيقة قبل نشر تحدّي جديد، وألغِ بحثك السابق إذا بعده مفتوح." : "Wait a minute before posting again and cancel any previous search.";
  if (/PUBLISH_UNCONFIRMED/.test(code)) return ar ? "ما گدرنا نؤكد النشر. أغلقنا الدعوة حتى ما تتكرر الرسالة؛ جرّب بعد دقيقة." : "Delivery could not be confirmed. The invite was closed to prevent duplicate posts. Retry in a minute.";
  if (/GROUP_REQUIRED/.test(code)) return ar ? "هدف النشر لازم يكون كروب، مو قناة. أبلغ الأدمن بتصحيح الربط." : "The publishing destination must be a group. Ask an admin to correct it.";
  if (/GROUP_UNAVAILABLE|BOT_GROUP_PERMISSION_REQUIRED/.test(code)) return ar ? "البوت ما يگدر يدز بالكروب حالياً. أبلغ الأدمن بفحص عضويته وصلاحية إرسال الرسائل." : "The bot cannot post to the group. Ask an admin to check its membership and send permission.";
  if (/AUTH_REQUIRED/.test(code)) return ar ? "سجّل دخولك بحساب تميّزك حتى تنضم للتحدّي." : "Sign in to Tamayzak to join the challenge.";
  return ar ? "تعذّر ربط التحدّي بالكروب. تگدر تستعمل رمز الغرفة أو تعيد المحاولة." : "Could not connect this challenge to the group. Use a room code or retry.";
}
