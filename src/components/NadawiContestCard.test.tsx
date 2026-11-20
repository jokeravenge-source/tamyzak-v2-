import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import NadawiContestCard from "./NadawiContestCard";
const role = vi.hoisted(() => ({ allowed: vi.fn() }));
vi.mock("@/lib/nadawiContestApi", () => ({ canTestNadawiContest: role.allowed }));
vi.mock("./NadawiLeaderboard", () => ({ default: () => <div>Competition standings table</div> }));
vi.mock("./NadawiContest", () => ({ default: ({ adminTest }: { adminTest?: boolean }) => <div>{adminTest ? "Admin timed test" : "Timed challenge"}</div> }));

beforeEach(() => {
  role.allowed.mockResolvedValue(false);
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-20T17:29:58Z"));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const openCard = () => fireEvent.click(screen.getByRole("button", { name: "مسابقة الأستاذ محمد النداوي" }));

it("opens a countdown to 8:30 PM Baghdad and stops at the announced event time", () => {
  render(<NadawiContestCard language="en" />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  openCard();
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("20 November · 8:30 PM Baghdad time")).toBeInTheDocument();
  expect(screen.getByRole("timer")).toHaveTextContent("00Hours00Minutes02Seconds");
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByRole("timer")).toHaveTextContent("00Hours00Minutes01Seconds");
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("It’s time!");
  act(() => vi.advanceTimersByTime(86400000));
  expect(screen.getByRole("status")).toHaveTextContent("It’s time!");
});

it("shows Arabic and recomputes the real remaining time when reopened", () => {
  vi.setSystemTime(new Date("2026-11-20T16:30:00Z"));
  render(<NadawiContestCard language="ar" />);
  openCard();
  expect(screen.getByRole("dialog")).toHaveAttribute("dir", "rtl");
  expect(screen.getByRole("timer")).toHaveTextContent("٠١ساعة٠٠دقيقة٠٠ثانية");
  fireEvent.click(screen.getByRole("button", { name: "Close / إغلاق" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  act(() => { vi.setSystemTime(new Date("2026-11-20T17:00:00Z")); });
  openCard();
  expect(screen.getByRole("timer")).toHaveTextContent("٠٠ساعة٣٠دقيقة٠٠ثانية");
});

it("does not restart a passed competition as a new daily event", () => {
  vi.setSystemTime(new Date("2026-11-21T10:00:00Z"));
  render(<NadawiContestCard language="ar" />);
  openCard();
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("حان موعد المسابقة!");
});

it("opens the timed contest only after the start time", () => {
  render(<NadawiContestCard language="en" />);
  openCard();
  expect(screen.queryByText("Timed challenge")).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByText("Timed challenge")).toBeInTheDocument();
});

it("lets a verified admin open a test before the official countdown ends", async () => {
  role.allowed.mockResolvedValue(true);
  render(<NadawiContestCard language="en" />);
  await act(async () => openCard());
  expect(screen.getByRole("timer")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Test Nadawi competition" }));
  expect(screen.getByText("Admin timed test")).toBeInTheDocument();
  expect(screen.queryByText("Timed challenge")).not.toBeInTheDocument();
});

it("opens standings before participation without starting an attempt", () => {
  render(<NadawiContestCard language="en" />);
  openCard();
  fireEvent.click(screen.getByRole("button", { name: "Competition leaderboard" }));
  expect(screen.getByRole("dialog", { name: "Mohammed Al-Nadawi competition leaderboard" })).toBeInTheDocument();
  expect(screen.getByText("Competition standings table")).toBeInTheDocument();
  expect(screen.queryByText("Timed challenge")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Close / إغلاق" }));
  expect(screen.getByRole("timer")).toBeInTheDocument();
});
