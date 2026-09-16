import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Premium from "./Premium";

const state = vi.hoisted(() => ({ isPremium: false, loading: false }));
const success = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => state }));
vi.mock("sonner", () => ({ toast: { success } }));
beforeEach(() => { state.isPremium = false; state.loading = false; success.mockClear(); window.history.replaceState({}, "", "/"); });
afterEach(cleanup);
describe("Premium activation", () => {
  it.each(["en", "ar"] as const)("provides Telegram as the %s activation action", (language) => {
    render(<Premium language={language} onBack={vi.fn()} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://t.me/ias404");
    expect(screen.getByRole("link")).toHaveTextContent(language === "ar" ? "افتح البريميوم عبر تيليجرام" : "Unlock via Telegram");
    expect(screen.queryByText(/unlock with points|افتحه بالنقاط/)).not.toBeInTheDocument();
  });
  it("does not claim a membership just because the URL says success", () => {
    window.history.replaceState({}, "", "/?premium=success");
    render(<Premium language="en" onBack={vi.fn()} />);
    expect(success).not.toHaveBeenCalled();
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
  it("shows a verified active membership instead of another unlock action", () => {
    state.isPremium = true;
    render(<Premium language="en" onBack={vi.fn()} />);
    expect(screen.getByText("You're a Premium member")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
