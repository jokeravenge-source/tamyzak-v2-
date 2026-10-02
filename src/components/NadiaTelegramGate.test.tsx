import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NadiaTelegramGate, { NADIA_TELEGRAM_CHANNEL } from "./NadiaTelegramGate";

const mocks = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: mocks.invoke } },
}));

beforeEach(() => {
  mocks.invoke.mockReset();
});

afterEach(cleanup);

const renderGate = (language: "ar" | "en", onVerified = vi.fn()) => {
  render(
    <MemoryRouter>
      <NadiaTelegramGate language={language} onVerified={onVerified} />
    </MemoryRouter>,
  );
  return onVerified;
};

describe("NadiaTelegramGate", () => {
  it("unlocks only after the server verifies channel membership", async () => {
    mocks.invoke.mockResolvedValue({ data: { ok: true, joined: true }, error: null });
    const onVerified = renderGate("ar");

    await waitFor(() => expect(onVerified).toHaveBeenCalledOnce());
    expect(mocks.invoke).toHaveBeenCalledWith("telegram-channel-check", { body: { scope: "nadia" } });
  });

  it("keeps flashcards locked when the student is not a member", async () => {
    mocks.invoke.mockResolvedValue({ data: { ok: true, joined: false }, error: null });
    const onVerified = renderGate("en");

    expect(await screen.findByRole("alert")).toHaveTextContent(/membership was not found/i);
    expect(onVerified).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /verify membership/i }));
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(2));
    expect(onVerified).not.toHaveBeenCalled();
  });

  it("offers account linking when Telegram is not linked", async () => {
    mocks.invoke
      .mockResolvedValueOnce({ data: { ok: false, joined: false, error: "not_linked" }, error: null })
      .mockResolvedValueOnce({ data: { deepLink: "https://t.me/sovforcejoin_bot?start=test-token" }, error: null });
    renderGate("ar");

    expect(await screen.findByRole("link", { name: /اربط حساب تلغرام/ })).toHaveAttribute(
      "href",
      "https://t.me/sovforcejoin_bot?start=test-token",
    );
  });

  it("uses Nadia's exact public channel", async () => {
    mocks.invoke.mockResolvedValue({ data: { ok: true, joined: false }, error: null });
    renderGate("ar");

    await screen.findByRole("alert");
    expect(screen.getByRole("link", { name: /انضم إلى قناة نادية/ })).toHaveAttribute(
      "href",
      `https://t.me/${NADIA_TELEGRAM_CHANNEL}`,
    );
  });
});
