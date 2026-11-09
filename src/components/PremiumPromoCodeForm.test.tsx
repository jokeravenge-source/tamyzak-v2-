import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PremiumPromoCodeForm from "./PremiumPromoCodeForm";
const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
beforeEach(() => rpc.mockReset());
afterEach(cleanup);
describe("Ibn Al-Baytar campaign activation", () => {
  it("submits the requested code and displays the exact returned expiry", async () => {
    rpc.mockResolvedValue({ data: { ok: true, expires_at: "2026-11-10T10:00:00Z" }, error: null });
    const unlocked = vi.fn();
    render(<PremiumPromoCodeForm language="ar" onUnlocked={unlocked} />);
    fireEvent.change(screen.getByLabelText("كلمة الحملة"), { target: { value: "  ابن البيطار  " } });
    fireEvent.click(screen.getByRole("button", { name: "افتح كل الأدوات" }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("redeem_premium_promo", { _code: "ابن البيطار" }));
    expect(await screen.findByRole("status")).toHaveTextContent("صالح لغاية");
    expect(screen.getByRole("status")).toHaveTextContent("بتوقيت بغداد");
    expect(unlocked).toHaveBeenCalledOnce();
    expect(screen.queryByText(/8 تشرين|Sunday morning/)).not.toBeInTheDocument();
  });
  it("explains that an expired redemption cannot be restarted", async () => {
    rpc.mockResolvedValue({ data: { ok: false, reason: "already_redeemed" }, error: null });
    const unlocked = vi.fn();
    render(<PremiumPromoCodeForm language="ar" onUnlocked={unlocked} />);
    fireEvent.change(screen.getByLabelText("كلمة الحملة"), { target: { value: "ابن البيطار" } });
    fireEvent.click(screen.getByRole("button", { name: "افتح كل الأدوات" }));
    expect(await screen.findByRole("status")).toHaveTextContent("لا تبدأ يوماً جديداً");
    expect(unlocked).not.toHaveBeenCalled();
  });
  it("does not claim success when the backend is unavailable", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "Database unavailable" } });
    const unlocked = vi.fn();
    render(<PremiumPromoCodeForm language="en" onUnlocked={unlocked} />);
    fireEvent.change(screen.getByLabelText("Campaign code"), { target: { value: "ابن البيطار" } });
    fireEvent.click(screen.getByRole("button", { name: "Unlock all tools" }));
    expect(await screen.findByRole("status")).toHaveTextContent("could not verify");
    expect(unlocked).not.toHaveBeenCalled();
  });
});
