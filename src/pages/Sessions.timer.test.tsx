import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STUDY_SESSION_STORAGE_KEY } from "@/lib/studyTimerDisplay";
import { useStudyStatus } from "@/hooks/useStudyStatus";

const backend = vi.hoisted(() => ({ upsert: vi.fn(async () => ({ data: null, error: null })) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: "self" } } }) },
  rpc: async () => ({ data: [], error: null }),
  from: () => {
    const query = {
      select: () => query, eq: () => query, in: () => query, order: () => query, limit: () => query,
      upsert: backend.upsert,
      maybeSingle: async () => ({ data: { display_name: "Student" }, error: null }),
      then: (resolve: (result: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
    };
    return query;
  },
} }));
vi.mock("@/hooks/useStudyTimerPresence", async (original) => ({
  ...await original<typeof import("@/hooks/useStudyTimerPresence")>(),
  notifyStudyTimerChanged: vi.fn(),
}));
vi.mock("@/lib/todosSync", () => ({ pushTodos: vi.fn(), pullTodos: async () => [] }));
vi.mock("@/components/SpotifyPlayerBlock", () => ({ default: () => null }));
vi.mock("@/components/PrivateStudyRooms", () => ({
  default: ({ children, timerSeconds }: { children: ReactNode; timerSeconds: number }) =>
    <section><output data-testid="private-room-clock">{timerSeconds}</output>{children}</section>,
}));
vi.mock("@/components/StudyRoom", () => ({
  default: ({ timerSeconds }: { timerSeconds: number }) => <output data-testid="subject-room-clock">{timerSeconds}</output>,
}));

import Sessions from "./Sessions";

function StudyStatus() {
  return <output data-testid="character-status">{useStudyStatus("self")}</output>;
}

beforeEach(() => {
  localStorage.clear();
  backend.upsert.mockClear();
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
  localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({
    subject: "chemistry", started: true, running: true,
    accumulated: 0, startedAt: Date.now() - 20_000,
    pomodoro: true, pomodoroWorkMin: 50, pomodoroRestMin: 10,
    phase: "work", phaseStartSeconds: 0,
  }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("the session's one visible timer", () => {
  it("keeps the character in sync without local writes and ignores a previous account's timer", async () => {
    localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({ userId: "previous", subject: "chemistry", started: true, running: true }));
    const setItem = Storage.prototype.setItem;
    const storage = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === STUDY_SESSION_STORAGE_KEY) throw new Error("Storage unavailable");
      setItem.call(this, key, value);
    });
    try {
      render(<><StudyStatus /><Sessions language="en" onBack={vi.fn()} /></>);
      await act(async () => {});
      fireEvent.click(screen.getByRole("button", { name: /Join study rooms/i }));
      expect(screen.queryByRole("timer")).toBeNull();
      expect(screen.getByTestId("character-status")).toHaveTextContent("ready");
      await act(async () => fireEvent.click(screen.getByRole("button", { name: "Chemistry" })));
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      expect(screen.getByTestId("character-status")).toHaveTextContent("studying");
      act(() => vi.advanceTimersByTime(2000));
      expect(screen.getByRole("timer")).toHaveTextContent("00:00:02");
      fireEvent.click(screen.getByRole("button", { name: "Pause" }));
      expect(screen.getByTestId("character-status")).toHaveTextContent("paused");
      fireEvent.click(screen.getByRole("button", { name: "Resume" }));
      expect(screen.getByTestId("character-status")).toHaveTextContent("studying");
    } finally {
      storage.mockRestore();
    }
  });

  it("renders one Arabic focus timer, passes that value to both rooms, and keeps real study seconds", async () => {
    const { container } = render(<Sessions language="ar" onBack={vi.fn()} />);
    await act(async () => {});
    expect(screen.getByRole("heading", { name: "شلون تريد تدرس اليوم؟" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /الانضمام للغرف/ }));
    await act(async () => {});
    const mainClock = screen.getByRole("timer", { name: "وقت الجلسة" });
    expect(mainClock.textContent).toBe("00:49:40");
    expect(mainClock.getAttribute("dir")).toBe("ltr");
    expect(screen.queryByText(/إجمالي وقت الدراسة/)).toBeNull();
    expect(screen.getByTestId("private-room-clock").textContent).toBe("2980");
    expect(screen.getByTestId("subject-room-clock").textContent).toBe("2980");
    expect(backend.upsert).toHaveBeenCalledWith(expect.objectContaining({ elapsed_seconds: 20, is_running: true }), expect.anything());
    fireEvent.click(screen.getByRole("button", { name: "إيقاف مؤقت" }));
    act(() => vi.advanceTimersByTime(10_000));
    expect(mainClock.textContent).toBe("00:49:40");
    expect(screen.getByTestId("private-room-clock").textContent).toBe("2980");
    expect(screen.getByTestId("subject-room-clock").textContent).toBe("2980");
  });
});

describe("the hourly study check-in", () => {
  const title = "One hour completed!";
  const storedSession = () => JSON.parse(localStorage.getItem(STUDY_SESSION_STORAGE_KEY)!);

  async function openStudyRooms() {
    const view = render(<Sessions language="en" onBack={vi.fn()} />);
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: /Join study rooms/i }));
    return view;
  }

  it("keeps a pending check-in across reloads and waits for the next full hour after continuing", async () => {
    localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({
      subject: "chemistry", started: true, running: true,
      accumulated: 3598, startedAt: Date.now(), pomodoro: false,
    }));
    const initial = await openStudyRooms();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("alertdialog", { name: title })).toBeTruthy();
    expect(storedSession()).toMatchObject({ running: false, accumulated: 3600, lastCheckInSeconds: 0 });

    initial.unmount();
    const pending = await openStudyRooms();
    act(() => vi.advanceTimersByTime(5 * 60_000));
    expect(storedSession()).toMatchObject({ running: false, accumulated: 3600 });
    fireEvent.click(screen.getByRole("button", { name: "Continue session" }));
    expect(storedSession()).toMatchObject({ running: true, lastCheckInSeconds: 3600 });
    pending.unmount();

    await openStudyRooms();
    act(() => vi.advanceTimersByTime(5 * 60_000));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByRole("timer").textContent).toBe("01:05:00");

    act(() => {
      vi.setSystemTime(Date.now() + 55 * 60_000 - 2000);
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("timer").textContent).toBe("01:59:59");
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
    expect(screen.getByRole("alertdialog", { name: title })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue session" }));
    act(() => vi.advanceTimersByTime(5 * 60_000));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByRole("timer").textContent).toBe("02:05:00");
  });

  it("gives the student a full hour after a delayed check-in", async () => {
    localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({
      subject: "chemistry", started: true, running: true,
      accumulated: 0, startedAt: Date.now(), pomodoro: false, lastCheckInSeconds: 0,
    }));
    vi.setSystemTime(Date.now() + 115 * 60_000);
    await openStudyRooms();
    expect(storedSession()).toMatchObject({ running: false, accumulated: 6900 });
    fireEvent.click(screen.getByRole("button", { name: "Continue session" }));
    act(() => vi.advanceTimersByTime(5 * 60_000));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByRole("timer").textContent).toBe("02:00:00");
  });

  it("starts a Pomodoro break after the check-in when both fall at the same hour", async () => {
    localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({
      ...storedSession(), accumulated: 3599, startedAt: Date.now(),
      pomodoroWorkMin: 60, pomodoroRestMin: 15,
    }));
    await openStudyRooms();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("alertdialog", { name: title })).toBeTruthy();
    expect(storedSession()).toMatchObject({ running: false, accumulated: 3600, phase: "work" });
    fireEvent.click(screen.getByRole("button", { name: "Continue session" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByRole("timer").textContent).toBe("00:15:00");
    expect(storedSession()).toMatchObject({ running: false, accumulated: 3600, phase: "rest", lastCheckInSeconds: 3600 });
  });
});
