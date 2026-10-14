import { useEffect, useSyncExternalStore } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  STUDY_SESSION_STORAGE_KEY,
  displayedStudyTimerSeconds,
  timerDisplayFromPersistedSession,
  type StudyTimerDisplay,
} from "@/lib/studyTimerDisplay";

const CHANGED_EVENT = "study-session-timer-changed";
const HEARTBEAT_MS = 10_000;
const listeners = new Set<() => void>();
const emptyTimers: Readonly<Record<string, StudyTimerDisplay>> = {};
let timers = emptyTimers;
let channel: RealtimeChannel | null = null;
let subscribed = false;
let ownerId: string | null = null;
let localTimer: StudyTimerDisplay | null = null;
let lastTracked: StudyTimerDisplay | null = null;

export function notifyStudyTimerChanged() {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function notifyViewers() {
  listeners.forEach((listener) => listener());
}

function publishTimer() {
  if (!channel || !subscribed) return;
  if (!ownerId || !localTimer) {
    if (lastTracked) void channel.untrack();
    lastTracked = null;
    return;
  }
  const previousSeconds = displayedStudyTimerSeconds(lastTracked ?? undefined, localTimer.sampledAt);
  // Extrapolate locally between heartbeats. Publish controls/phase changes at once,
  // rather than sending a network update for every second on the screen.
  if (lastTracked && localTimer.sampledAt - lastTracked.sampledAt < HEARTBEAT_MS &&
    lastTracked.direction === localTimer.direction && lastTracked.isRunning === localTimer.isRunning &&
    previousSeconds !== null && Math.abs(previousSeconds - localTimer.seconds) <= 1) return;
  lastTracked = localTimer;
  void channel.track({ user_id: ownerId, ...localTimer });
}

function reconcileChannel() {
  // Active timers keep publishing across route changes and background tabs.
  // View-only subscriptions can sleep when the page is hidden.
  const needed = !!localTimer || listeners.size > 0 && !document.hidden;
  if (!needed) {
    if (channel) void supabase.removeChannel(channel);
    channel = null;
    subscribed = false;
    lastTracked = null;
    timers = emptyTimers;
    notifyViewers();
    return;
  }
  if (channel) { publishTimer(); return; }
  const nextChannel = supabase.channel("study_timer_display_v1");
  channel = nextChannel;
  nextChannel.on("presence", { event: "sync" }, () => {
    if (channel !== nextChannel) return;
    // Keep the last clock through short socket disconnects, just like the
    // existing database presence. Room membership still comes from the database.
    const nextTimers: Record<string, StudyTimerDisplay> = {};
    const now = Date.now();
    for (const [userId, timer] of Object.entries(timers)) {
      if (displayedStudyTimerSeconds(timer, now) !== null) nextTimers[userId] = timer;
    }
    const incoming: Record<string, StudyTimerDisplay> = {};
    for (const payloads of Object.values(nextChannel.presenceState<StudyTimerDisplay & { user_id: string }>())) {
      for (const payload of payloads) {
        if (typeof payload.user_id !== "string") continue;
        const current = incoming[payload.user_id];
        if (current && current.sampledAt > payload.sampledAt) continue;
        const previous = timers[payload.user_id];
        const unchanged = previous?.sampledAt === payload.sampledAt &&
          previous.seconds === payload.seconds && previous.direction === payload.direction &&
          previous.isRunning === payload.isRunning;
        const timer: StudyTimerDisplay = {
          seconds: payload.seconds,
          direction: payload.direction,
          isRunning: payload.isRunning,
          sampledAt: payload.sampledAt,
          // Changed snapshots get a local anchor to avoid device clock skew.
          // A late joiner first advances from the sender's snapshot timestamp.
          observedAt: unchanged ? previous.observedAt : previous ? now : undefined,
        };
        if (displayedStudyTimerSeconds(timer, now) !== null) incoming[payload.user_id] = timer;
      }
    }
    Object.assign(nextTimers, incoming);
    timers = nextTimers;
    notifyViewers();
  }).subscribe((status) => {
    if (channel !== nextChannel) return;
    subscribed = status === "SUBSCRIBED";
    lastTracked = null;
    if (subscribed) publishTimer();
  });
}

function refreshLocalTimer() {
  try {
    localTimer = ownerId
      ? timerDisplayFromPersistedSession(JSON.parse(localStorage.getItem(STUDY_SESSION_STORAGE_KEY) ?? "null"))
      : null;
  } catch { localTimer = null; }
  reconcileChannel();
}

/** Mounted once at the app root so the room clock survives leaving Sessions. */
export function StudyTimerPresenceSync() {
  useEffect(() => {
    let mounted = true;
    const setOwner = (userId: string | null) => {
      if (!mounted) return;
      if (ownerId !== userId) {
        if (lastTracked && channel) void channel.untrack();
        lastTracked = null;
      }
      ownerId = userId;
      refreshLocalTimer();
    };
    void supabase.auth.getSession().then(({ data }) => setOwner(data.session?.user.id ?? null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => setOwner(session?.user.id ?? null));
    const heartbeat = window.setInterval(refreshLocalTimer, HEARTBEAT_MS);
    window.addEventListener(CHANGED_EVENT, refreshLocalTimer);
    window.addEventListener("storage", refreshLocalTimer);
    window.addEventListener("focus", refreshLocalTimer);
    document.addEventListener("visibilitychange", refreshLocalTimer);
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      window.clearInterval(heartbeat);
      window.removeEventListener(CHANGED_EVENT, refreshLocalTimer);
      window.removeEventListener("storage", refreshLocalTimer);
      window.removeEventListener("focus", refreshLocalTimer);
      document.removeEventListener("visibilitychange", refreshLocalTimer);
      ownerId = null;
      refreshLocalTimer();
    };
  }, []);
  return null;
}

function subscribeToTimers(listener: () => void) {
  listeners.add(listener);
  reconcileChannel();
  return () => { listeners.delete(listener); reconcileChannel(); };
}

export function useStudyTimerPresence() {
  return useSyncExternalStore(subscribeToTimers, () => timers, () => emptyTimers);
}
