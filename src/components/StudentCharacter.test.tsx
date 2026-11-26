import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StudentCharacter from "./StudentCharacter";
import { notifyStudyTimerChanged } from "@/hooks/useStudyTimerPresence";
import { STUDY_SESSION_STORAGE_KEY } from "@/lib/studyTimerDisplay";

type Row = { gender: string | null; character: { variant: number } | null };
const backend = vi.hoisted(() => ({ row: null as Row | null, failSave: false, failRead: false, insert: vi.fn(), update: vi.fn() }));

vi.mock("./UsageIntroGate", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  from: () => {
    let data: Row | null = backend.row;
    let error: unknown = backend.failRead ? new Error("load rejected") : null;
    const query = {
      select: () => query,
      eq: () => query,
      is: () => query,
      or: () => query,
      upsert: (row: Row) => {
        backend.insert(row);
        if (backend.failSave) error = new Error("save rejected");
        else data = backend.row ? null : (backend.row = row);
        return query;
      },
      update: (row: Row) => {
        backend.update(row);
        data = backend.row && !backend.row.gender && !backend.row.character ? (backend.row = row) : null;
        return query;
      },
      maybeSingle: async () => ({ data, error }),
    };
    return query;
  },
} }));

function open() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return { client, ...render(<QueryClientProvider client={client}><StudentCharacter userId="student" language="en" visible onNeedHelp={vi.fn()} /></QueryClientProvider>) };
}

beforeEach(() => {
  vi.clearAllMocks();
  backend.row = null;
  backend.failSave = false;
  backend.failRead = false;
  localStorage.clear();
});
afterEach(cleanup);

it.each([false, true])("saves and skips the dialog next visit (existing profile: %s)", async (hasProfile) => {
  backend.row = hasProfile ? { gender: null, character: null } : null;
  const visit = open();
  const picker = within(await screen.findByRole("dialog", { name: "Choose your character" }));
  expect(picker.getByRole("button", { name: "Use this character" })).toBeDisabled();
  fireEvent.click(picker.getByRole("button", { name: "Girl" }));
  expect(picker.queryByRole("button", { name: "Character 16" })).toBeNull();
  fireEvent.click(picker.getByRole("button", { name: "Character 4" }));
  fireEvent.click(picker.getByRole("button", { name: "Use this character" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Ready to study");
  const write = hasProfile ? backend.update : backend.insert;
  expect(write).toHaveBeenCalledWith(expect.objectContaining({ gender: "female", character: expect.objectContaining({ variant: 4 }) }));
  visit.unmount();

  open();
  expect(await screen.findByRole("button", { name: "Your study status" })).toBeVisible();
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("only closes permanently after a confirmed save", async () => {
  backend.failSave = true;
  const visit = open();
  const picker = within(await screen.findByRole("dialog"));
  fireEvent.click(picker.getByRole("button", { name: "Character 1" }));
  fireEvent.click(picker.getByRole("button", { name: "Use this character" }));
  expect(await picker.findByRole("alert")).toHaveTextContent("Could not save your character");
  fireEvent.click(picker.getByRole("button", { name: "Later" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  visit.unmount();
  open();
  expect(await screen.findByRole("dialog")).toBeVisible();
});

it("keeps existing gender-only characters and updates the status from the signed-in user's timer", async () => {
  backend.row = { gender: "male", character: null };
  const setTimer = (userId: string, state: object) => {
    act(() => {
      localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({ userId, subject: "physics", started: true, ...state }));
      notifyStudyTimerChanged();
    });
  };
  setTimer("someone-else", { running: true });
  open();
  expect(await screen.findByRole("status")).toHaveTextContent("Ready to study");
  expect(screen.queryByRole("dialog")).toBeNull();
  setTimer("student", { running: true });
  expect(screen.getByRole("status")).toHaveTextContent("Studying now");
  setTimer("student", { running: false });
  expect(screen.getByRole("status")).toHaveTextContent("Study paused");
  setTimer("student", { pomodoro: true, phase: "rest", restEndsAt: Date.now() + 30_000 });
  expect(screen.getByRole("status")).toHaveTextContent("On a break");
  fireEvent.click(screen.getByRole("button", { name: "Your study status" }));
  expect(screen.queryByRole("status")).toBeNull();
});

it("does not interpret a failed profile read as a missing character", async () => {
  backend.failRead = true;
  const { client } = open();
  await waitFor(() => expect(client.getQueryState(["profile-character", "student"])?.status).toBe("error"));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(backend.insert).not.toHaveBeenCalled();
});
