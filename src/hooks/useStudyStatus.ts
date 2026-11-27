import { useEffect, useSyncExternalStore } from "react";
import { STUDY_TIMER_CHANGED } from "@/hooks/useStudyTimerPresence";
import { STUDY_SESSION_STORAGE_KEY, timerDisplayFromPersistedSession } from "@/lib/studyTimerDisplay";

export type StudyStatus = "ready" | "studying" | "paused" | "rest";

const liveStatuses = new Map<string, { status: StudyStatus }>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(listener => listener());
}

// The open timer screen already knows its phase. Publish phase changes
// directly and use the persisted clock when that screen is closed.
export function useSessionStudyStatus(userId: string | null, status: StudyStatus) {
  useEffect(() => {
    if (!userId) return;
    const entry = { status };
    liveStatuses.set(userId, entry);
    notify();
    return () => {
      if (liveStatuses.get(userId) !== entry) return;
      liveStatuses.delete(userId);
      notify();
    };
  }, [userId, status]);
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STUDY_SESSION_STORAGE_KEY) listener();
  };
  listeners.add(listener);
  window.addEventListener(STUDY_TIMER_CHANGED, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener(STUDY_TIMER_CHANGED, listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readStatus(userId: string): StudyStatus {
  const live = liveStatuses.get(userId);
  if (live) return live.status;
  try {
    const session = JSON.parse(localStorage.getItem(STUDY_SESSION_STORAGE_KEY) ?? "null");
    if (typeof session?.userId === "string" && session.userId !== userId) return "ready";
    const timer = timerDisplayFromPersistedSession(session);
    if (!timer) return "ready";
    if (session.pomodoro === true && session.phase === "rest") return "rest";
    return timer.isRunning ? "studying" : "paused";
  } catch {
    return "ready";
  }
}

export function useStudyStatus(userId: string) {
  return useSyncExternalStore(subscribe, () => readStatus(userId), (): StudyStatus => "ready");
}
