import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StudentCharacter from "./StudentCharacter";
import { notifyStudyTimerChanged } from "@/hooks/useStudyTimerPresence";
import { STUDY_ROOM_CHEER_RECEIVED, useStudyRoomActivity, type RoomActivity } from "@/hooks/useStudyRoomActivity";
import { STUDY_SESSION_STORAGE_KEY } from "@/lib/studyTimerDisplay";

type Row = { gender: string | null; character: { variant: number; accessory?: "crown" } | null };
const backend = vi.hoisted(() => ({ row: null as Row | null, failSave: false, failRead: false, insert: vi.fn(), update: vi.fn(), roomActivity: null as RoomActivity | null }));

vi.mock("./UsageIntroGate", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  rpc: async () => ({ data: backend.roomActivity, error: null }),
  channel: () => {
    const channel = { on: () => channel, subscribe: () => channel };
    return channel;
  },
  removeChannel: async () => {},
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

function JoinedRoom() {
  useStudyRoomActivity("room", "student");
  return null;
}

function open(inRoom = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return { client, ...render(<QueryClientProvider client={client}>
    <StudentCharacter userId="student" language="en" visible onNeedHelp={vi.fn()} />
    {inRoom && <JoinedRoom />}
  </QueryClientProvider>) };
}

beforeEach(() => {
  vi.clearAllMocks();
  backend.row = null;
  backend.failSave = false;
  backend.failRead = false;
  backend.roomActivity = null;
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

it.each([
  { gender: "male", character: null } as Row,
  { gender: "female", character: { variant: 16, accessory: "crown" } } as Row,
])("uses the same study animation and status for the $gender character", async (row) => {
  backend.row = row;
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
  const avatar = screen.getByRole("button", { name: "Your study status" });
  const widget = avatar.closest("aside");
  const sprite = avatar.querySelector(".student-character__sprite");
  const book = () => avatar.querySelector<HTMLElement>(".student-character__book");
  expect(book()).toBeNull();
  setTimer("student", { running: true });
  expect(screen.getByRole("status")).toHaveTextContent("Studying now");
  expect(widget).toHaveAttribute("data-study-status", "studying");
  expect(sprite).toContainElement(book());
  expect(book()?.querySelector(".student-character__page--turning")).toBeInTheDocument();
  expect(avatar.querySelector(".student-character__sprite")).toBe(sprite);
  setTimer("student", { running: false });
  expect(screen.getByRole("status")).toHaveTextContent("Study paused");
  expect(widget).toHaveAttribute("data-study-status", "paused");
  expect(book()).toBeNull();
  setTimer("student", { pomodoro: true, phase: "rest", restEndsAt: Date.now() + 30_000 });
  expect(screen.getByRole("status")).toHaveTextContent("On a break");
  expect(book()).toBeNull();
  fireEvent.click(avatar);
  expect(screen.queryByRole("status")).toBeNull();
});

it("does not interpret a failed profile read as a missing character", async () => {
  backend.failRead = true;
  const { client } = open();
  await waitFor(() => expect(client.getQueryState(["profile-character", "student"])?.status).toBe("error"));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(backend.insert).not.toHaveBeenCalled();
});

it("reacts to a new room cheer without replaying older notifications or interrupting study", async () => {
  backend.row = { gender: "female", character: { variant: 16, accessory: "crown" } };
  localStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({ userId: "student", subject: "physics", started: true, running: true }));
  const oldCheer = { sender_id: "friend", sender_name: "Friend", created_at: "2026-11-27T00:00:00.000Z" };
  const newCheer = { ...oldCheer, created_at: "2026-11-27T00:01:00.000Z" };
  const activity = { owner: false, inbox: [oldCheer], mic: null, requests: [], speaker: null } satisfies RoomActivity;
  backend.roomActivity = activity;

  const { client } = open(true);
  const activityKey = ["study-room-activity", "room", "student"];
  const avatar = await screen.findByRole("button", { name: "Your study status" });
  const badge = () => avatar.querySelector(".student-character__cheer");
  const book = avatar.querySelector(".student-character__book");
  expect(book).toBeInTheDocument();
  await waitFor(() => expect(client.getQueryData(activityKey)).toEqual(activity));
  act(() => window.dispatchEvent(new CustomEvent(STUDY_ROOM_CHEER_RECEIVED, { detail: "someone-else" })));
  expect(badge()).toBeNull();

  act(() => { client.setQueryData(activityKey, { ...activity, inbox: [newCheer, oldCheer] }); });
  await waitFor(() => expect(badge()).toBeInTheDocument());
  expect(badge()).toHaveAttribute("aria-hidden", "true");
  expect(avatar.querySelector(".student-character__book")).toBe(book);
  expect(screen.getByRole("status")).toHaveTextContent("Studying now");
  await waitFor(() => expect(badge()).toBeNull(), { timeout: 1500 });

  act(() => { client.setQueryData(activityKey, activity); });
  await act(async () => {});
  expect(badge()).toBeNull();
});
