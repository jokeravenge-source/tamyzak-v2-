import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PremiumToolLock from "./PremiumToolLock";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));

beforeEach(() => rpc.mockReset());
afterEach(cleanup);
describe("Premium lock screen", () => {
  it.each(["en", "ar"] as const)("links the %s unlock action directly to Telegram", (language) => {
    const onBack = vi.fn();
    render(<PremiumToolLock language={language} loading={false} onBack={onBack} />);
    expect(screen.getByRole("main")).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://t.me/ias404");
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("@ias404")).toHaveAttribute("dir", "ltr");
    fireEvent.click(screen.getByRole("button", { name: language === "ar" ? "رجوع" : "Back" }));
    expect(onBack).toHaveBeenCalledOnce();
  });
  it("does not show an upgrade action until membership has been checked", () => {
    render(<PremiumToolLock language="en" loading onBack={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Checking your membership");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
  it("redeems the Arabic campaign word and refreshes access", async () => {
    rpc.mockResolvedValue({ data: { ok: true, expires_at: "2026-11-08T07:00:00Z" }, error: null });
    const onUnlocked = vi.fn();
    render(<PremiumToolLock language="ar" loading={false} onBack={vi.fn()} onUnlocked={onUnlocked} />);
    fireEvent.change(screen.getByLabelText("كلمة الحملة"), { target: { value: "  المستقبل  " } });
    fireEvent.click(screen.getByRole("button", { name: "افتح كل الأدوات" }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("redeem_premium_promo", { _code: "المستقبل" }));
    expect(onUnlocked).toHaveBeenCalledOnce();
  });
  it("shows a useful error for an invalid campaign word", async () => {
    rpc.mockResolvedValue({ data: { ok: false, reason: "invalid_code" }, error: null });
    render(<PremiumToolLock language="ar" loading={false} onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("كلمة الحملة"), { target: { value: "خطأ" } });
    fireEvent.click(screen.getByRole("button", { name: "افتح كل الأدوات" }));
    expect(await screen.findByRole("status")).toHaveTextContent("الكلمة غير صحيحة");
  });
});
