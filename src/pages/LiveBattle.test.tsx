import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import LiveBattle from "./LiveBattle";
import type { RaceQuestion } from "@/lib/raceQuestionBank";
const api = vi.hoisted(() => ({ bank: vi.fn(), channel: vi.fn(), remove: vi.fn(), invoke: vi.fn(), pending: vi.fn(), rpc: vi.fn(), search: vi.fn(), send: vi.fn(), cancel: vi.fn() }));
vi.mock("@/lib/battleChallenges", () => ({ BATTLE_INVITE_LIFETIME: 180000, searchBattleStudents: api.search, sendBattleChallenge: api.send, cancelBattleChallenge: api.cancel, battleChallengeStatus: async () => "pending" }));
vi.mock("@/hooks/useFeatureUsed", () => ({ useFeatureUsed: vi.fn() }));
vi.mock("@/lib/raceQuestionBank", () => ({ loadRaceQuestionBank: api.bank }));
vi.mock("@/lib/battleInvite", () => ({ consumePendingBattle: api.pending, newRoomCode: () => "123456" }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { channel: api.channel, removeChannel: api.remove, functions: { invoke: api.invoke }, auth: { getUser: async () => ({ data: { user: { id: "student" } } }) }, rpc: api.rpc } }));
const rows: RaceQuestion[] = [
  { id: "physics-1", subject: "physics", chapter: 1, question: "Physics one from bank", choices: ["P1 correct", "P1 wrong"], answer_index: 0, explanation: "Original explanation" },
  { id: "physics-2", subject: "physics", chapter: 2, question: "Physics two from bank", choices: ["P2 wrong", "P2 correct"], answer_index: 1, explanation: "P2 explanation" },
  { id: "biology-1", subject: "biology", chapter: 1, question: "Biology from bank", choices: ["B correct", "B wrong"], answer_index: 0, explanation: null },
];
beforeEach(() => {
  vi.clearAllMocks(); api.pending.mockReturnValue(null); localStorage.clear();
  api.bank.mockResolvedValue({ questions: rows, partial: false });
  api.rpc.mockResolvedValue({ error: null });
  api.send.mockResolvedValue("invite-one"); api.cancel.mockResolvedValue(undefined); api.search.mockResolvedValue([{ user_id: "friend", display_name: "Ali" }]);
  api.channel.mockImplementation(() => {
    const channel = { on: vi.fn(() => channel), subscribe: vi.fn((fn) => { void fn?.("SUBSCRIBED"); return channel; }), track: vi.fn().mockResolvedValue("ok"), send: vi.fn().mockResolvedValue("ok"), presenceState: () => ({}) };
    return channel;
  });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
const view = () => render(<LiveBattle language="en" onBack={vi.fn()} />);

it("starts bank practice directly and respects the selected subject and chapter", async () => {
  view();
  await waitFor(() => expect(screen.getByRole("button", { name: "Practise solo" })).toBeEnabled());
  expect(document.querySelector('input[type="file"]')).toBeNull();
  fireEvent.change(screen.getByLabelText("Chapter"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: "Practise solo" }));
  expect(screen.getByText("Physics two from bank")).toBeInTheDocument();
  expect(screen.queryByText("Physics one from bank")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "P2 correct" }));
  expect(screen.getByText("P2 explanation")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "See result" }));
  expect(screen.getByText("Round complete!")).toBeInTheDocument();
  await waitFor(() => expect(api.rpc).toHaveBeenCalledWith("award_points_safe", expect.objectContaining({ _source: "mcq", _points: 1 })));
  expect(api.invoke).not.toHaveBeenCalled();
});
it("creates a friend room in one click and joins a code without bank dependencies", async () => {
  view();
  await waitFor(() => expect(screen.getByRole("button", { name: "Challenge a friend" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Challenge a friend" }));
  expect(screen.getByText("123456")).toBeInTheDocument();
  expect(api.channel).toHaveBeenCalledWith("battle:123456", expect.anything());
  fireEvent.click(screen.getByRole("button", { name: "Cancel room" }));
  api.bank.mockResolvedValue({ questions: [], partial: true });
  fireEvent.change(screen.getByLabelText("Question language"), { target: { value: "ar" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Challenge a friend" })).toBeDisabled());
  fireEvent.change(screen.getByLabelText("Have a friend’s room code?"), { target: { value: "٦٥٤٣٢١" } });
  fireEvent.click(screen.getByRole("button", { name: "Join" }));
  expect(api.channel).toHaveBeenLastCalledWith("battle:654321", expect.anything());
});
it("matches only the selected bank language, subject, chapter and round size", async () => {
  view();
  await waitFor(() => expect(screen.getByRole("button", { name: "Random opponent" })).toBeEnabled());
  fireEvent.change(screen.getByLabelText("Question language"), { target: { value: "ar" } });
  await waitFor(() => expect(api.bank).toHaveBeenLastCalledWith("ar", expect.any(AbortSignal)));
  fireEvent.change(screen.getByLabelText("Chapter"), { target: { value: "2" } });
  fireEvent.change(screen.getByLabelText("Questions", { exact: true }), { target: { value: "5" } });
  fireEvent.click(screen.getByRole("button", { name: "Random opponent" }));
  expect(api.channel).toHaveBeenLastCalledWith("battle:lobby:ar:physics:2:5", expect.anything());
  fireEvent.click(screen.getByRole("button", { name: "Cancel search" }));
  expect(screen.getByRole("button", { name: "Random opponent" })).toBeInTheDocument();
  expect(api.remove).toHaveBeenCalled();
});
it("does not fall back to generated flashcard choices for an empty profile challenge", async () => {
  api.pending.mockReturnValue({ code: "123456", host: true, subject: "chemistry", chapter: 6, lang: "en", count: 10 });
  view();
  await screen.findByText("No bank questions for this chapter and curriculum. Choose another chapter.");
  expect(api.channel).not.toHaveBeenCalled(); expect(api.invoke).not.toHaveBeenCalled();
});
it("keeps a no-opponent outcome actionable and clears the queue", async () => {
  vi.useFakeTimers();
  view();
  await act(async () => {});
  fireEvent.click(screen.getByRole("button", { name: "Random opponent" }));
  act(() => vi.advanceTimersByTime(60000));
  expect(screen.getByRole("status")).toHaveTextContent("No opponent right now");
  expect(screen.getByRole("button", { name: "Challenge a friend" })).toBeEnabled();
});

it("searches by name, sends the selected bank settings and hosts the invited room", async () => {
  view();
  await waitFor(() => expect(screen.getByRole("button", { name: "Challenge a friend" })).toBeEnabled());
  fireEvent.change(screen.getByLabelText("Chapter"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: "Search by name" }));
  fireEvent.change(screen.getByLabelText("Student name"), { target: { value: "Ali" } });
  fireEvent.click(await screen.findByRole("button", { name: "Challenge Ali" }));
  await screen.findByText("Invitation sent to Ali. Waiting for acceptance…");
  expect(api.send).toHaveBeenCalledWith("friend", { code: "123456", subject: "physics", chapter: 2, language: "en", count: 1 });
  expect(api.channel).toHaveBeenCalledWith("battle:123456", expect.anything());
  fireEvent.click(screen.getByRole("button", { name: "Cancel room" }));
  expect(api.cancel).toHaveBeenCalledWith("invite-one");
});
it("accepts a challenge while Live Battle is already mounted", async () => {
  view();
  await waitFor(() => expect(screen.getByRole("button", { name: "Challenge a friend" })).toBeEnabled());
  api.pending.mockReturnValueOnce({ code: "654321", host: false, subject: "biology", chapter: 1, lang: "en", count: 5 });
  act(() => window.dispatchEvent(new Event("app:join-battle")));
  expect(api.channel).toHaveBeenLastCalledWith("battle:654321", expect.anything());
  expect(screen.getByText("654321")).toBeInTheDocument();
});

it("posts the chosen round to the channel, connects only after a claim, and cancels the same invitation", async () => {
  vi.useFakeTimers();
  let room: import("@/lib/battleChannel").ChannelBattle;
  api.rpc.mockImplementation(async (name) => name === "get_battle_channel_config" ? { data: { enabled: true, invite_url: "https://t.me/+test" }, error: null } : name === "get_channel_battle" ? { data: room, error: null } : { error: null });
  api.invoke.mockImplementation(async (_, { body }) => {
    if (body.action === "publish") room = { id: body.id, host_name: "Student", room_key: "20000000-0000-4000-8000-000000000001", ...body, status: "waiting", is_host: true, expires_at: new Date(Date.now() + 180000).toISOString(), server_now: new Date().toISOString() };
    return { data: { room }, error: null };
  });
  view(); await act(async () => {});
  fireEvent.change(screen.getByLabelText("Chapter"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: "Find an opponent in the group" }));
  await act(async () => {});
  expect(api.invoke).toHaveBeenCalledWith("battle-channel", { body: expect.objectContaining({ action: "publish", subject: "physics", chapter: 2, language: "en", question_count: 1 }) });
  expect(screen.getByText("Your challenge is posted — waiting for an opponent")).toBeInTheDocument();
  expect(api.channel).not.toHaveBeenCalledWith("battle:tg:20000000-0000-4000-8000-000000000001", expect.anything());
  room!.status = "claimed";
  await act(async () => vi.advanceTimersByTimeAsync(5000));
  expect(api.channel).toHaveBeenCalledWith("battle:tg:20000000-0000-4000-8000-000000000001", expect.anything());
  fireEvent.click(screen.getByRole("button", { name: "Cancel room" }));
  await act(async () => {});
  expect(api.invoke).toHaveBeenCalledWith("battle-channel", { body: { action: "close", id: room!.id, started: false } });
});
