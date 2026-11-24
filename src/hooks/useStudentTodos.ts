import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pullTodos, pushTodos, type SyncedTodo } from "@/lib/todosSync";

const TODOS_KEY = "app_todos_v1";
const CHANGES_EVENT = "app:todos-changed";
const PENDING_KEY = "app_todos_pending_v1";
let saveQueue = Promise.resolve(false);

function readTodos(): SyncedTodo[] {
  try {
    const items = JSON.parse(localStorage.getItem(TODOS_KEY) ?? "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function readPending(): Set<string> | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? new Set(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Keep unsaved moves through a refresh and batch writes in the order the user made them. */
export function useStudentTodos() {
  const [todos, setTodos] = useState(readTodos);
  const [initialPending] = useState(readPending);
  const pending = useRef(initialPending);
  const latest = useRef(todos);
  const revision = useRef(0);
  const syncing = useRef(false);
  const mounted = useRef(false);

  const storePending = useCallback((ids: Set<string> | null) => {
    pending.current = ids;
    try {
      if (ids) sessionStorage.setItem(PENDING_KEY, JSON.stringify([...ids]));
      else sessionStorage.removeItem(PENDING_KEY);
    } catch { /* Keep the current request in memory. */ }
  }, []);

  const publish = useCallback((next: SyncedTodo[], broadcast = true) => {
    const serialized = JSON.stringify(next);
    if (serialized === JSON.stringify(latest.current)) return;
    latest.current = next;
    setTodos(next);
    try { localStorage.setItem(TODOS_KEY, serialized); } catch { /* Account sync can still save it. */ }
    if (broadcast) window.dispatchEvent(new Event(CHANGES_EVENT));
  }, []);

  const sync = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      await saveQueue;
      const { data } = await supabase.auth.getSession();
      const student = data.session?.user.id;
      if (!student || !mounted.current) return;
      const remote = await pullTodos(student);
      if (!mounted.current) return;
      if (pending.current) {
        const localIds = new Set(latest.current.map((item) => item.id));
        const known = pending.current;
        const incoming = remote?.filter((item) => !known.has(item.id) && !localIds.has(item.id)) ?? [];
        if (incoming.length) {
          for (const item of incoming) known.add(item.id);
          storePending(known);
          publish([...latest.current, ...incoming]);
        }
      } else {
        if (!remote) return;
        const remoteIds = new Set(remote.map((item) => item.id));
        const localOnly = latest.current.filter((item) => item.source !== "parent" && !remoteIds.has(item.id));
        publish([...remote, ...localOnly]);
        if (!localOnly.length) return;
        storePending(new Set([...remoteIds, ...localOnly.map((item) => item.id)]));
      }

      while (pending.current) {
        const version = revision.current;
        const known = new Set(pending.current);
        const items = latest.current;
        saveQueue = saveQueue.then(() => pushTodos(items, student, known));
        const saved = await saveQueue;
        if (!mounted.current) return;
        if (!saved && revision.current === version) return;
        if (saved && revision.current === version) storePending(null);
      }
    } catch {
      // The next connection or visibility change can retry the local changes.
    } finally {
      syncing.current = false;
    }
  }, [publish, storePending]);

  const update = useCallback((edit: (previous: SyncedTodo[]) => SyncedTodo[]) => {
    const previous = latest.current;
    const next = edit(previous);
    if (next === previous) return false;
    const known = pending.current ?? new Set<string>();
    for (const item of previous) known.add(item.id);
    storePending(known);
    revision.current++;
    publish(next);
    void sync();
    return true;
  }, [publish, storePending, sync]);

  useEffect(() => {
    let active = true;
    mounted.current = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const onLocalChange = () => publish(readTodos(), false);
    const onVisible = () => { if (!document.hidden) void sync(); };
    void sync();
    const poll = window.setInterval(onVisible, 15000);
    void supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      channel = supabase.channel(`todos:${data.user.id}`)
        .on("broadcast", { event: "todos-changed" }, onVisible)
        .subscribe();
    }).catch(() => {});
    window.addEventListener(CHANGES_EVENT, onLocalChange);
    window.addEventListener("storage", onLocalChange);
    window.addEventListener("online", onVisible);
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      mounted.current = false;
      window.clearInterval(poll);
      if (channel) void supabase.removeChannel(channel);
      window.removeEventListener(CHANGES_EVENT, onLocalChange);
      window.removeEventListener("storage", onLocalChange);
      window.removeEventListener("online", onVisible);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [publish, sync]);

  return { todos, update, sync };
}
