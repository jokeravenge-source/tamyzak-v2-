import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StudyChallengeHub from "./StudyChallengeHub";
import type { StudyChallenge } from "@/lib/studyChallenges";
import type { StudyTimerDisplay } from "@/lib/studyTimerDisplay";

const backend = vi.hoisted(() => ({
  rpc: vi.fn(),
  notify: vi.fn(async () => ({ error: null })),
  room: null as StudyChallenge | null,
  timers: {} as Record<string, StudyTimerDisplay>,
}));
vi.mock("@/hooks/useStudyTimerPresence", () => ({ useStudyTimerPresence: (enabled: boolean) => enabled ? backend.timers : {} }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: { id: "owner" } } }) },
    rpc: (name: string, args?: unknown) => backend.rpc(name, args),
    functions: { invoke: backend.notify },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  backend.room = null;
  backend.timers = {};
  backend.rpc.mockImplementation(async (name: string) => ({
    error: null,
    data: name === "get_my_study_challenges" ? (backend.room ? [backend.room] : [])
      : name === "points_balance" ? 1000
      : name === "create_all_or_nothing_challenge" ? "new-room" : null,
  }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

const hub = () => <StudyChallengeHub language="en" view="all_or_nothing" onBack={vi.fn()} onStudy={vi.fn()} />;
const open = () => render(hub());

it("lets the host choose days and hours and rejects durations outside the allowed range", async () => {
  open();
  fireEvent.click(screen.getAllByRole("button", { name: "Create my room" })[0]);
  const dialog = within(screen.getByRole("dialog", { name: "Create my room" }));
  const days = dialog.getByRole("spinbutton", { name: "Days" });
  const hours = dialog.getByRole("spinbutton", { name: "Hours" });
  const submit = dialog.getByRole("button", { name: "Create challenge" });
  fireEvent.change(days, { target: { value: "0" } });
  expect(submit).toBeDisabled();
  fireEvent.change(hours, { target: { value: "4" } });
  await waitFor(() => expect(submit).toBeEnabled());
  fireEvent.change(days, { target: { value: "30" } });
  expect(submit).toBeDisabled();
  fireEvent.change(days, { target: { value: "1" } });
  fireEvent.change(hours, { target: { value: "5" } });
  fireEvent.click(submit);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(backend.rpc).toHaveBeenCalledWith("create_all_or_nothing_challenge", {
    _title: "All or Nothing", _invitee_ids: [], _duration_days: 1, _duration_hours: 5, _wager_points: 100,
  });
  expect(backend.notify).toHaveBeenCalledWith("study-challenge-notify", { body: { challengeId: "new-room" } });
});

it("ticks local seconds and refreshes saved standings once when the other student's timer ends", async () => {
  vi.useFakeTimers();
  const now = Date.parse("2026-11-27T12:02:00.000Z");
  vi.setSystemTime(now);
  const since = (seconds: number) => now + seconds * 1000;
  const start = new Date(since(-120)).toISOString();
  backend.room = {
    id: "room", title: "Live study sprint", creatorId: "owner", creatorName: "Owner", status: "active", myStatus: "accepted",
    roomState: "running", challengeType: "all_or_nothing", startsAt: start, endsAt: new Date(since(3600)).toISOString(),
    participants: [
      { userId: "other", displayName: "Sara", status: "accepted", joinedAt: start, totalSeconds: 60, savedFocus: [[since(-100), since(-40)]] },
    ],
  };
  backend.timers = { other: {
    seconds: 45, direction: "down", isRunning: true, sampledAt: now,
    focus: { periods: [], run: [since(-15), since(45)] },
  } };

  const view = open();
  await act(async () => {});
  expect(screen.getByText("00:01:15")).toBeVisible();
  expect(screen.getByText("Studying")).toBeVisible();
  await act(async () => vi.advanceTimersByTime(2000));
  expect(screen.getByText("00:01:17")).toBeVisible();
  const reads = () => backend.rpc.mock.calls.filter(([name]) => name === "get_my_study_challenges").length;
  expect(reads()).toBe(1);

  backend.timers = { other: { ...backend.timers.other, focusEndedAt: Date.now() } };
  backend.room = { ...backend.room, participants: [{
    ...backend.room.participants[0], totalSeconds: 77, savedFocus: [[since(-100), since(-40)], [since(-15), since(2)]],
  }] };
  view.rerender(hub());
  expect(screen.getByText("00:01:17")).toBeVisible();
  expect(screen.queryByText("Studying")).toBeNull();
  await act(async () => vi.advanceTimersByTime(180));
  expect(reads()).toBe(2);
  expect(screen.getByText("00:01:17")).toBeVisible();
  expect(backend.rpc.mock.calls.filter(([name]) => name === "points_balance")).toHaveLength(1);
});

it.each([2, 3])("uses %s accepted participants to determine whether the host can start", async (accepted) => {
  const now = Date.now();
  backend.room = {
    id: "room", title: "Study sprint", creatorId: "owner", creatorName: "Owner",
    status: "active", myStatus: "accepted", roomState: "lobby", challengeType: "all_or_nothing",
    startsAt: new Date(now).toISOString(), endsAt: new Date(now + 24 * 3600_000).toISOString(),
    lobbyExpiresAt: new Date(now + 3600_000).toISOString(), wagerPoints: 100, minimumPlayers: 3,
    durationDays: 1, durationHours: 5,
    participants: Array.from({ length: 3 }, (_, index) => ({
      userId: index === 0 ? "owner" : `student-${index}`, displayName: `Student ${index + 1}`,
      totalSeconds: 0, status: index < accepted ? "accepted" : "pending",
    })),
  };
  open();
  const start = await screen.findByRole("button", { name: "Start challenge" });
  expect(screen.getByText("Duration · 1d 5h")).toBeInTheDocument();
  if (accepted === 3) {
    expect(start).toBeEnabled();
    fireEvent.click(start);
    await waitFor(() => expect(backend.rpc).toHaveBeenCalledWith("start_all_or_nothing_challenge", { _challenge_id: "room" }));
  } else {
    expect(start).toBeDisabled();
  }
});
