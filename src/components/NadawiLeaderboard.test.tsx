import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import NadawiLeaderboard from "./NadawiLeaderboard";
import type { NadawiRank } from "@/lib/nadawiContestApi";

const api = vi.hoisted(() => ({ ranks: vi.fn() }));
vi.mock("@/lib/nadawiContestApi", () => ({ getNadawiRankings: api.ranks, formatNadawiDuration: (ms: number) => String(ms) }));
beforeEach(() => { api.ranks.mockReset(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
const mine: NadawiRank = { rank: 37, display_name: "Ali", score: 28, elapsed_ms: 91234, is_me: true };

it("uses the server's own rank even outside the top 20, rather than its array position", async () => {
  api.ranks.mockResolvedValue([{ ...mine, rank: 1, display_name: "Sara", is_me: false }, mine]);
  render(<NadawiLeaderboard language="en" completed />);
  expect(await screen.findByText("#37")).toBeInTheDocument();
  expect(screen.getByText("Ali (you)")).toBeInTheDocument();
  expect(screen.queryByText("#2")).not.toBeInTheDocument();
});

it("explains an empty leaderboard without inventing a rank", async () => {
  api.ranks.mockResolvedValue([]);
  render(<NadawiLeaderboard language="ar" />);
  expect(await screen.findByText(/بعد ماكو نتائج مكتملة/)).toBeInTheDocument();
  expect(screen.queryByText("مركزك الحالي")).not.toBeInTheDocument();
});

it("asks an unfinished student to finish while still showing the leaders", async () => {
  api.ranks.mockResolvedValue([{ ...mine, is_me: false }]);
  render(<NadawiLeaderboard language="en" />);
  expect(await screen.findByText("Finish the competition to see your rank here.")).toBeInTheDocument();
  expect(screen.getByText("Ali")).toBeInTheDocument();
});

it("allows an explicit retry after a sign-in error", async () => {
  api.ranks.mockRejectedValueOnce(new Error("AUTH_REQUIRED")).mockResolvedValue([mine]);
  render(<NadawiLeaderboard language="en" />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Sign in");
  fireEvent.click(screen.getByRole("button", { name: "Retry leaderboard" }));
  expect(await screen.findByText("#37")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("refreshes the personal rank, preserves stale results on failure, and stops polling on close", async () => {
  vi.useFakeTimers();
  api.ranks.mockResolvedValueOnce([mine]).mockResolvedValueOnce([{ ...mine, rank: 38 }]).mockRejectedValue(new Error("offline"));
  const view = render(<NadawiLeaderboard language="en" completed />);
  await act(async () => {});
  expect(screen.getByText("#37")).toBeInTheDocument();
  await act(async () => { vi.advanceTimersByTime(15000); });
  expect(screen.getByText("#38")).toBeInTheDocument();
  await act(async () => { vi.advanceTimersByTime(15000); });
  expect(screen.getByRole("alert")).toHaveTextContent("last loaded standings");
  expect(screen.getByText("#38")).toBeInTheDocument();
  view.unmount();
  await act(async () => { vi.advanceTimersByTime(30000); });
  expect(api.ranks).toHaveBeenCalledTimes(3);
});

it("does not overlap refreshes while a request is pending", async () => {
  vi.useFakeTimers();
  let resolve!: (rows: NadawiRank[]) => void;
  api.ranks.mockReturnValue(new Promise<NadawiRank[]>((done) => { resolve = done; }));
  render(<NadawiLeaderboard language="en" />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading");
  await act(async () => { vi.advanceTimersByTime(45000); });
  expect(api.ranks).toHaveBeenCalledOnce();
  await act(async () => { resolve([mine]); });
  expect(screen.getByText("#37")).toBeInTheDocument();
});
