import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleAiError } from "./upgradeToast";

const mocks = vi.hoisted(() => ({ error: vi.fn(), telegram: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: mocks.error } }));
vi.mock("@/lib/premium", () => ({ openPremiumTelegram: mocks.telegram }));
beforeEach(() => vi.clearAllMocks());
describe("AI error actions", () => {
  it("opens Telegram for a Premium requirement", () => {
    handleAiError({ message: "Premium membership required" });
    const action = mocks.error.mock.calls[0][1].action;
    expect(action.label).toBe("Unlock via Telegram");
    action.onClick();
    expect(mocks.telegram).toHaveBeenCalledOnce();
  });
  it("does not offer Premium to fix short-term throttling", () => {
    handleAiError({ status: 429, upgrade: true });
    expect(mocks.error).toHaveBeenCalledExactlyOnceWith("Too many requests right now. Please try again shortly.");
    expect(mocks.telegram).not.toHaveBeenCalled();
  });
});
