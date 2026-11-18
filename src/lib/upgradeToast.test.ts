import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleAiError } from "./upgradeToast";

const mocks = vi.hoisted(() => ({ error: vi.fn(), instagram: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: mocks.error } }));
vi.mock("@/lib/premium", () => ({ openPremiumInstagram: mocks.instagram }));
beforeEach(() => vi.clearAllMocks());
describe("AI error actions", () => {
  it("opens Instagram for a Premium requirement", () => {
    handleAiError({ message: "Premium membership required" });
    const action = mocks.error.mock.calls[0][1].action;
    expect(action.label).toBe("Contact on Instagram");
    action.onClick();
    expect(mocks.instagram).toHaveBeenCalledOnce();
  });
  it("does not offer Premium to fix short-term throttling", () => {
    handleAiError({ status: 429, upgrade: true });
    expect(mocks.error).toHaveBeenCalledExactlyOnceWith("Too many requests right now. Please try again shortly.");
    expect(mocks.instagram).not.toHaveBeenCalled();
  });
});
