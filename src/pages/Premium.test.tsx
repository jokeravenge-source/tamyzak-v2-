import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PREMIUM_ACCESS_CHANGED_EVENT } from "@/lib/premium";
import Premium from "./Premium";

const state = vi.hoisted(() => ({ isPremium: false, loading: false, userId: null as string | null }));
const success = vi.hoisted(() => vi.fn());
const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => state }));
vi.mock("sonner", () => ({ toast: { success } }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
beforeEach(() => {
  state.isPremium = false;
  state.loading = false;
  state.userId = null;
  success.mockClear();
  rpc.mockReset();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});
afterEach(cleanup);
describe("Premium activation", () => {
  it.each(["en", "ar"] as const)("provides Instagram as the %s activation action", (language) => {
    render(<Premium language={language} onBack={vi.fn()} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://www.instagram.com/s_o_v_e0/");
    expect(screen.getByRole("link")).toHaveTextContent(language === "ar" ? "تواصل للاشتراك عبر إنستغرام" : "Contact on Instagram");
    expect(screen.queryByRole("heading", { name: /premium with points|بريميوم بالنقاط/i })).not.toBeInTheDocument();
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
    expect(screen.getByLabelText("Campaign code")).toBeInTheDocument();
  });
  it("disables points redemption below the price", async () => {
    state.userId = "student";
    rpc.mockResolvedValue({ data: 999, error: null });
    render(<Premium language="ar" onBack={vi.fn()} />);
    expect(await screen.findByText((999).toLocaleString("ar-IQ"))).toBeInTheDocument();
    expect(screen.getByText("كل ١٬٠٠٠ نقطة تفتح لك ٣ أيام بريميوم.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "استبدل ١٬٠٠٠ نقطة" })).toBeDisabled();
    expect(rpc).toHaveBeenCalledExactlyOnceWith("points_balance");
  });
  it("redeems and refreshes membership even when Premium is already active", async () => {
    state.userId = "student";
    state.isPremium = true;
    rpc.mockResolvedValueOnce({ data: 1500, error: null });
    rpc.mockResolvedValueOnce({ data: { ok: true, balance: 500 }, error: null });
    const refreshed = vi.fn();
    window.addEventListener(PREMIUM_ACCESS_CHANGED_EVENT, refreshed, { once: true });
    render(<Premium language="en" onBack={vi.fn()} />);
    expect(await screen.findByText("1,500")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Redeem 1,000 points" }));
    expect(await screen.findByText("500")).toBeInTheDocument();
    expect(rpc).toHaveBeenLastCalledWith("redeem_premium_with_points", { _environment: "live", _request_id: expect.any(String) });
    expect(refreshed).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Redeem 1,000 points" })).toBeDisabled();
  });
  it("reuses the same request after an unconfirmed response and a page remount", async () => {
    state.userId = "student";
    rpc.mockResolvedValueOnce({ data: 1000, error: null });
    rpc.mockResolvedValueOnce({ data: null, error: { message: "Connection lost" } });
    const { unmount } = render(<Premium language="en" onBack={vi.fn()} />);
    await screen.findByText("1,000");
    fireEvent.click(screen.getByRole("button", { name: "Redeem 1,000 points" }));
    expect(await screen.findByRole("status")).toHaveTextContent("We couldn't confirm your redemption.");
    const firstRequest = rpc.mock.lastCall;
    unmount();

    rpc.mockResolvedValueOnce({ data: 0, error: null });
    rpc.mockResolvedValueOnce({ data: { ok: true, balance: 0 }, error: null });
    render(<Premium language="en" onBack={vi.fn()} />);
    expect(await screen.findByText("0")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry redemption" }));
    await waitFor(() => expect(success).toHaveBeenCalledOnce());
    expect(rpc.mock.lastCall).toEqual(firstRequest);
  });
});
