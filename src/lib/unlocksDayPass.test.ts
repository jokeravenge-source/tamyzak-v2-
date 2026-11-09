import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchUnlockedKeys } from "./unlocks";
const mocks = vi.hoisted(() => ({ user: vi.fn(), rpc: vi.fn(), from: vi.fn(), rows: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: mocks.user }, rpc: mocks.rpc,
  from: (...args: unknown[]) => {
    mocks.from(...args);
    return { select: () => ({ eq: mocks.rows }) };
  },
} }));
beforeEach(() => {
  mocks.user.mockReset().mockResolvedValue({ data: { user: { id: "student" } } });
  mocks.rpc.mockReset().mockResolvedValue({ data: false, error: null });
  mocks.rows.mockReset().mockResolvedValue({ data: [{ feature_key: "canvas" }] });
  mocks.from.mockClear();
});
describe("temporary full-access point bypass", () => {
  it("opens all feature tiers only for a server-verified full pass without writing permanent unlocks", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    expect(await fetchUnlockedKeys()).toEqual(["mind_maps", "notebooks", "canvas", "math_tools_suite"]);
    expect(mocks.rpc).toHaveBeenCalledWith("has_full_access_promo");
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("returns only earned unlocks after the pass ends", async () => {
    expect(await fetchUnlockedKeys()).toEqual(["canvas"]);
  });
  it("preserves earned unlocks when the new RPC has not been deployed", async () => {
    mocks.rpc.mockRejectedValue(new Error("RPC unavailable"));
    expect(await fetchUnlockedKeys()).toEqual(["canvas"]);
  });
  it("never grants access from an RPC error or without sign-in", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: { message: "failed" } });
    expect(await fetchUnlockedKeys()).toEqual(["canvas"]);
    mocks.user.mockResolvedValue({ data: { user: null } });
    mocks.rpc.mockClear();
    expect(await fetchUnlockedKeys()).toEqual([]);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
