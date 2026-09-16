import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSubscription } from "./useSubscription";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), order: vi.fn(), unsubscribe: vi.fn(),
  callback: undefined as undefined | ((event: string, session: { user: { id: string } } | null) => void),
}));
vi.mock("@/integrations/supabase/client", () => {
  const query = { select: vi.fn(), eq: vi.fn(), in: vi.fn(), order: mocks.order };
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query); query.in.mockReturnValue(query);
  return { supabase: {
    from: () => query,
    auth: {
      getUser: mocks.getUser,
      onAuthStateChange: (callback: typeof mocks.callback) => {
        mocks.callback = callback;
        return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
      },
    },
  } };
});
const row = { id: "sub1", status: "active", environment: "live", current_period_end: null };
beforeEach(() => {
  mocks.getUser.mockReset().mockResolvedValue({ data: { user: { id: "user1" } } });
  mocks.order.mockReset().mockResolvedValue({ data: [], error: null });
  mocks.unsubscribe.mockReset();
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe("subscription membership", () => {
  it("locks while loading and for a signed-in user without Premium", async () => {
    const { result } = renderHook(useSubscription);
    expect(result.current.isPremium).toBe(false);
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isPremium).toBe(false);
  });
  it("accepts an active subscription even if a newer row has expired", async () => {
    mocks.order.mockResolvedValue({ data: [{ ...row, current_period_end: "2000-01-01" }, row], error: null });
    const { result } = renderHook(useSubscription);
    await waitFor(() => expect(result.current.isPremium).toBe(true));
    expect(result.current.subscription?.id).toBe("sub1");
  });
  it("clears access immediately on sign-out and checks the next user's membership", async () => {
    mocks.order.mockResolvedValueOnce({ data: [row], error: null });
    const { result, unmount } = renderHook(useSubscription);
    await waitFor(() => expect(result.current.isPremium).toBe(true));
    act(() => mocks.callback?.("SIGNED_OUT", null));
    expect(result.current.isPremium).toBe(false);
    expect(result.current.userId).toBeNull();
    act(() => mocks.callback?.("SIGNED_IN", { user: { id: "user2" } }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.userId).toBe("user2");
    expect(result.current.isPremium).toBe(false);
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });
  it("does not let a late lookup restore the previous user's membership", async () => {
    let resolveFirst: (value: { data: typeof row[]; error: null }) => void = () => {};
    mocks.order.mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }));
    const { result } = renderHook(useSubscription);
    await waitFor(() => expect(mocks.order).toHaveBeenCalledOnce());
    act(() => mocks.callback?.("SIGNED_IN", { user: { id: "user2" } }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => resolveFirst({ data: [row], error: null }));
    expect(result.current.userId).toBe("user2");
    expect(result.current.isPremium).toBe(false);
  });
  it.each(["error", "throw"])("fails closed on a lookup %s", async (failure) => {
    if (failure === "error") mocks.order.mockResolvedValue({ data: [row], error: { message: "offline" } });
    else mocks.order.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(useSubscription);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isPremium).toBe(false);
  });
  it("re-locks when the membership expires in an open tab", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-16T12:00:00Z"));
    mocks.order.mockResolvedValue({ data: [{ ...row, current_period_end: "2026-09-16T12:00:01Z" }], error: null });
    const { result } = renderHook(useSubscription);
    await act(async () => {});
    expect(result.current.isPremium).toBe(true);
    act(() => vi.advanceTimersByTime(1001));
    expect(result.current.isPremium).toBe(false);
  });
});
