import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import NadawiContestCard from "./NadawiContestCard";

beforeEach(() => {
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

it("opens the prepared contest only after the start time and retains answers when the dialog closes", () => {
  vi.setSystemTime(new Date("2026-11-20T17:30:00Z"));
  render(<NadawiContestCard language="en" />);
  openCard();
  fireEvent.click(screen.getByRole("button", { name: "Start challenge" }));
  fireEvent.click(screen.getByRole("button", { name: "Because the law covers many different situations." }));
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByRole("heading", { name: "How can witnesses help the police?" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Close / إغلاق" }));
  openCard();
  expect(screen.getByRole("heading", { name: "How can witnesses help the police?" })).toBeInTheDocument();
});
