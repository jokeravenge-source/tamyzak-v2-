import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STUDY_SESSION_STORAGE_KEY } from "@/lib/studyTimerDisplay";

const backend = vi.hoisted(() => ({ upsert: vi.fn(async () => ({ data: null, error: null })) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: "self" } } }) },
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
vi.mock("@/hooks/useStudyTimerPresence", () => ({ notifyStudyTimerChanged: vi.fn() }));
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
  it("renders one Arabic focus timer, passes that value to both rooms, and keeps real study seconds", async () => {
    const { container } = render(<Sessions language="ar" onBack={vi.fn()} />);
    await act(async () => {});
    const mainClock = container.querySelector(".text-5xl")!;
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
