import { act, cleanup, render, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { displayedStudyTimerSeconds, STUDY_SESSION_STORAGE_KEY, type StudyTimerDisplay } from "@/lib/studyTimerDisplay";

type TimerPayload = StudyTimerDisplay & { user_id: string };
type FakeChannel = {
  state: Record<string, TimerPayload[]>;
  sync: () => void;
  status: (status: string) => void;
  on: (type: string, filter: unknown, callback: () => void) => FakeChannel;
  subscribe: (callback: (status: string) => void) => FakeChannel;
  presenceState: () => Record<string, TimerPayload[]>;
  track: (payload: TimerPayload) => Promise<string>;
  untrack: () => Promise<string>;
};

const backend = vi.hoisted(() => ({
  channels: [] as FakeChannel[],
  removed: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: "self" } } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    removeChannel: backend.removed,
    channel: () => {
      const ch: FakeChannel = {
        state: {},
        sync: (() => {}) as () => void,
        status: ((_status: string) => {}) as (status: string) => void,
        on: vi.fn((_type: string, _filter: unknown, callback: () => void) => { ch.sync = callback; return ch; }),
        subscribe: vi.fn((callback: (status: string) => void) => { ch.status = callback; callback("SUBSCRIBED"); return ch; }),
        presenceState: () => ch.state,
        track: vi.fn(async (payload: TimerPayload) => { ch.state.self = [payload]; ch.sync(); return "ok"; }),
        untrack: vi.fn(async () => { delete ch.state.self; ch.sync(); return "ok"; }),
      };
      backend.channels.push(ch);
      return ch;
    },
  },
}));

import { notifyStudyTimerChanged, StudyTimerPresenceSync, useStudyTimerPresence } from "./useStudyTimerPresence";

function RoomClock({ userId = "peer" }: { userId?: string }) {
  const timers = useStudyTimerPresence();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  return <output>{displayedStudyTimerSeconds(timers[userId], now) ?? "none"}</output>;
}

const now = 1_000_000;
const activeSession = {
  subject: "chemistry", started: true, running: true,
  accumulated: 0, startedAt: now - 20_000,
  pomodoro: true, pomodoroWorkMin: 50, phase: "work", phaseStartSeconds: 0,
};

async function mountPublisher() {
  render(<StudyTimerPresenceSync />);
  await act(async () => {});
}

function setPeerSnapshot(extra: Partial<TimerPayload> = {}) {
  const ch = backend.channels[0];
  ch.state.peer = [{ user_id: "peer", seconds: 3000, direction: "down", isRunning: true, sampledAt: now - 5000, ...extra }];
  act(() => ch.sync());
}

beforeEach(() => {
  localStorage.clear();
  backend.channels.length = 0;
  backend.removed.mockClear();
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("room timer synchronization", () => {
  it("does not open a socket when there is no active timer or room viewer", async () => {
    await mountPublisher();
    expect(backend.channels).toHaveLength(0);
  });

  it("publishes the focus countdown and applies pause immediately", async () => {
    localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify(activeSession));
    await mountPublisher();
    const ch = backend.channels[0];
    expect(ch.track).toHaveBeenLastCalledWith(expect.objectContaining({ user_id: "self", seconds: 2980, direction: "down", isRunning: true }));
    localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({ ...activeSession, running: false, accumulated: 20, startedAt: null }));
    act(() => notifyStudyTimerChanged());
    expect(ch.track).toHaveBeenLastCalledWith(expect.objectContaining({ seconds: 2980, isRunning: false }));
    act(() => vi.advanceTimersByTime(10_000));
    expect(ch.track).toHaveBeenLastCalledWith(expect.objectContaining({ seconds: 2980, isRunning: false }));
  });

  it("keeps a break countdown running without counting it as study time", async () => {
    localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({
      ...activeSession, running: false, accumulated: 3000, phase: "rest", restEndsAt: now + 600_000,
    }));
    await mountPublisher();
    act(() => vi.advanceTimersByTime(10_000));
    expect(backend.channels[0].track).toHaveBeenLastCalledWith(expect.objectContaining({ seconds: 590, isRunning: true }));
    expect(JSON.parse(localStorage.getItem(STUDY_SESSION_STORAGE_KEY)!).accumulated).toBe(3000);
  });

  it("keeps publishing when the room view unmounts and reuses its one channel", async () => {
    localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify(activeSession));
    await mountPublisher();
    const room = render(<RoomClock userId="self" />);
    expect(screen.getByRole("status").textContent).toBe("2980");
    room.unmount();
    act(() => vi.advanceTimersByTime(10_000));
    expect(backend.channels).toHaveLength(1);
    expect(backend.removed).not.toHaveBeenCalled();
    expect(backend.channels[0].track).toHaveBeenLastCalledWith(expect.objectContaining({ seconds: 2970 }));
  });

  it("gives a late joiner the countdown and ticks it down between heartbeats", () => {
    render(<RoomClock />);
    setPeerSnapshot();
    expect(screen.getByRole("status").textContent).toBe("2995");
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("status").textContent).toBe("2994");
  });

  it("does not restart a student's clock when another member synchronizes", () => {
    render(<RoomClock />);
    setPeerSnapshot();
    act(() => vi.advanceTimersByTime(1000));
    const ch = backend.channels[0];
    ch.state.other = [{ user_id: "other", seconds: 5, direction: "up", isRunning: true, sampledAt: Date.now() }];
    act(() => ch.sync());
    expect(screen.getByRole("status").textContent).toBe("2994");
  });

  it("anchors changed snapshots to local time when device clocks differ", () => {
    render(<RoomClock />);
    setPeerSnapshot();
    setPeerSnapshot({ seconds: 2980, sampledAt: now - 30_000 });
    expect(screen.getByRole("status").textContent).toBe("2980");
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("status").textContent).toBe("2979");
  });

  it("retains the countdown through a short remote socket disconnect", () => {
    render(<RoomClock />);
    setPeerSnapshot();
    const ch = backend.channels[0];
    ch.state = {};
    act(() => ch.sync());
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole("status").textContent).toBe("2985");
  });

  it("untracks a stopped session immediately", async () => {
    localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify(activeSession));
    await mountPublisher();
    render(<RoomClock />);
    localStorage.removeItem(STUDY_SESSION_STORAGE_KEY);
    act(() => notifyStudyTimerChanged());
    expect(backend.channels[0].untrack).toHaveBeenCalled();
  });
});
