import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ChallengeInviteWatcher from "./ChallengeInviteWatcher";
const api = vi.hoisted(() => ({ load: vi.fn(), respond: vi.fn(), pending: vi.fn(), remove: vi.fn(), handler: null as null | (() => void), filter: vi.fn() }));
vi.mock("@/lib/battleInvite", () => ({ setPendingBattle: api.pending }));
vi.mock("@/lib/battleChallenges", () => ({ BATTLE_INVITE_LIFETIME: 180000, respondToBattleChallenge: api.respond }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: "recipient" } } }) },
  from: () => {
    const q = { select: () => q, eq: (...args: unknown[]) => { api.filter(...args); return q; }, gte: () => q, order: () => q, limit: api.load }; return q;
  },
  channel: () => { const c = { on: (_event: string, _filter: unknown, fn: () => void) => { api.handler = fn; return c; }, subscribe: () => c }; return c; }, removeChannel: api.remove,
} }));
const invite = () => ({ id: "invite-one", from_name: "Ali", room_code: "123456", subject: "english", chapter: 0, language: "en", question_count: 5, created_at: new Date().toISOString() });
beforeEach(() => { vi.clearAllMocks(); api.handler = null; api.load.mockResolvedValue({ data: [invite()], error: null }); api.respond.mockResolvedValue(undefined); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
it("shows the recipient's invitation and accepts into exactly the advertised room", async () => {
  const onAccept = vi.fn(); const event = vi.fn(); window.addEventListener("app:join-battle", event);
  render(<ChallengeInviteWatcher language="en" onAccept={onAccept} />);
  await screen.findByRole("region", { name: "New challenge invitation" });
  expect(screen.getByText(/All chapters/)).toBeInTheDocument();
  expect(api.filter).toHaveBeenCalledWith("to_user_id", "recipient");
  fireEvent.click(screen.getByRole("button", { name: "Accept & join" }));
  await waitFor(() => expect(onAccept).toHaveBeenCalledOnce());
  expect(api.pending).toHaveBeenCalledWith({ code: "123456", host: false, subject: "english", chapter: 0, lang: "en", count: 5 });
  expect(event).toHaveBeenCalledOnce(); window.removeEventListener("app:join-battle", event);
});
it("declines without navigating or opening a room", async () => {
  const onAccept = vi.fn(); render(<ChallengeInviteWatcher language="en" onAccept={onAccept} />);
  fireEvent.click(await screen.findByRole("button", { name: "Decline" }));
  await waitFor(() => expect(screen.queryByRole("region")).not.toBeInTheDocument());
  expect(api.respond).toHaveBeenCalledWith(expect.objectContaining({ id: "invite-one" }), "recipient", false);
  expect(api.pending).not.toHaveBeenCalled(); expect(onAccept).not.toHaveBeenCalled();
});
it("withdraws a cancelled invitation on a realtime database change", async () => {
  render(<ChallengeInviteWatcher language="en" onAccept={vi.fn()} />);
  await screen.findByRole("region");
  api.load.mockResolvedValue({ data: [], error: null });
  await act(async () => api.handler?.());
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});
it("does not leave a current battle to accept a new challenge", async () => {
  render(<ChallengeInviteWatcher language="en" onAccept={vi.fn()} />);
  await screen.findByRole("region");
  act(() => window.dispatchEvent(new CustomEvent("app:battle-lock", { detail: { locked: true } })));
  expect(screen.getByRole("button", { name: "Accept & join" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Accept & join" }));
  expect(api.respond).not.toHaveBeenCalled();
});
it("never joins when the database says the invite has expired or was withdrawn", async () => {
  api.respond.mockRejectedValue(new Error("INVITE_EXPIRED"));
  const onAccept = vi.fn(); render(<ChallengeInviteWatcher language="en" onAccept={onAccept} />);
  fireEvent.click(await screen.findByRole("button", { name: "Accept & join" }));
  await waitFor(() => expect(screen.queryByRole("region")).not.toBeInTheDocument());
  expect(onAccept).not.toHaveBeenCalled(); expect(api.pending).not.toHaveBeenCalled();
});
it("removes an expired notification without waiting for a new poll", async () => {
  vi.useFakeTimers();
  api.load.mockResolvedValue({ data: [{ ...invite(), created_at: new Date(Date.now() - 179000).toISOString() }], error: null });
  render(<ChallengeInviteWatcher language="en" onAccept={vi.fn()} />);
  await act(async () => {});
  expect(screen.getByRole("region")).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});
