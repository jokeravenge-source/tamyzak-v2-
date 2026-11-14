import { supabase } from "@/integrations/supabase/client";

export type SyncedTodo = {
  id: string;
  text: string;
  done: boolean;
  day?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
};

export function getISOWeek(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo}`;
}

export async function pushTodos(items: SyncedTodo[], expectedUserId?: string): Promise<boolean> {
  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user || (expectedUserId && u.user.id !== expectedUserId)) return false;

    // Parent-authored task text/day is authoritative. A student's device may
    // still hold an older local copy when it toggles completion; preserve the
    // parent's latest edit while accepting the student's `done` state.
    const { data: current, error: readError } = await supabase
      .from("student_todos")
      .select("items")
      .eq("user_id", u.user.id)
      .maybeSingle();
    // An assistant plan adds tasks; never replace an account copy we could not read.
    if (expectedUserId && readError) return false;
    const remoteItems = Array.isArray(current?.items) ? (current.items as unknown as SyncedTodo[]) : [];
    const remoteById = new Map(remoteItems.map((item) => [String(item.id), item]));
    const safeItems = items.map((item) => {
      const remote = remoteById.get(String(item.id));
      if (!remote || remote.source !== "parent") return item;
      return {
        ...item,
        text: remote.text,
        ...(remote.day ? { day: remote.day } : {}),
        ...(!remote.day ? { day: undefined } : {}),
        source: "parent",
        created_at: remote.created_at,
        updated_at: remote.updated_at,
      };
    });
    const sentIds = new Set(safeItems.map((item) => String(item.id)));
    const outgoingItems = expectedUserId
      ? [...remoteItems.filter((item) => !sentIds.has(String(item.id))), ...safeItems]
      : safeItems;
    const { error: writeError } = await supabase.from("student_todos").upsert(
      { user_id: u.user.id, items: outgoingItems as unknown as never, week_key: getISOWeek(), updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    if (writeError) return false;
    // Notify any parent dashboard listening on this user's channel.
    try {
      const ch = supabase.channel(`todos:${u.user.id}`);
      await ch.subscribe();
      await ch.send({ type: "broadcast", event: "todos-changed", payload: { at: Date.now() } });
      await supabase.removeChannel(ch);
    } catch { /* noop */ }
    return true;
  } catch { return false; }
}

export async function pullTodos(expectedUserId?: string): Promise<SyncedTodo[] | null> {
  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user || (expectedUserId && u.user.id !== expectedUserId)) return null;
    const { data, error } = await supabase
      .from("student_todos")
      .select("items")
      .eq("user_id", u.user.id)
      .maybeSingle();
    if (error || !data) return null;
    const items = (data as { items: unknown }).items;
    return Array.isArray(items) ? (items as SyncedTodo[]) : null;
  } catch {
    return null;
  }
}
