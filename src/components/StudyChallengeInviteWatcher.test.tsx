import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({ rpc: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: "invitee" } } }) },
  rpc: backend.rpc,
} }));
vi.mock("sonner", () => ({ toast: { success: backend.success, error: backend.error } }));

import StudyChallengeInviteWatcher from "./StudyChallengeInviteWatcher";

let answered = false;

const invite = {
  id: "challenge-1", title: "Finals sprint", creatorId: "creator", creatorName: "Ahmed",
  startsAt: "2026-10-29T00:00:00.000Z", endsAt: "2099-11-05T00:00:00.000Z",
  status: "active", myStatus: "pending",
  participants: [
    { userId: "creator", displayName: "Ahmed", status: "accepted", totalSeconds: 0 },
    { userId: "invitee", displayName: "Sara", status: "pending", totalSeconds: 0 },
  ],
};

beforeEach(() => {
  answered = false;
  backend.rpc.mockReset(); backend.success.mockReset(); backend.error.mockReset();
  backend.rpc.mockImplementation(async (name: string) => {
    if (name === "get_my_study_challenges") return { data: answered ? [] : [invite], error: null };
    answered = true;
    return { data: null, error: null };
  });
});
afterEach(cleanup);

describe("StudyChallengeInviteWatcher", () => {
  it("blocks the website with the invitation until the student accepts", async () => {
    render(<StudyChallengeInviteWatcher language="en" />);
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Ahmed invited you to study")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Accept challenge" }));
    await waitFor(() => expect(backend.rpc).toHaveBeenCalledWith("respond_study_challenge", { _challenge_id: "challenge-1", _accept: true }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("allows the student to decline and continue", async () => {
    render(<StudyChallengeInviteWatcher language="ar" />);
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "رفض" }));
    await waitFor(() => expect(backend.rpc).toHaveBeenCalledWith("respond_study_challenge", { _challenge_id: "challenge-1", _accept: false }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
