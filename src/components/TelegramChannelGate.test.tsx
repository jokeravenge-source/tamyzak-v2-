import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TelegramChannelGate from "./TelegramChannelGate";

type Response = { ok?: boolean; joined?: boolean; error?: string };
const mocks = vi.hoisted(() => ({ invoke: vi.fn(), start: vi.fn(), refresh: vi.fn(), responses: {} as Record<string, Response> }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: {
    getSession: vi.fn(async () => ({ data: { session: { expires_at: Date.now() / 1000 + 3600 } } })),
    refreshSession: mocks.refresh,
    signOut: vi.fn(),
  },
  functions: { invoke: mocks.invoke },
} }));
vi.mock("@/lib/telegramStart", () => ({ invokeTelegramStart: mocks.start }));
beforeEach(() => {
  mocks.responses = { default: { ok: true, joined: true }, dhs: { ok: true, joined: true } };
  mocks.invoke.mockReset().mockImplementation(async (_name: string, options: { body: { scope: string } }) => ({ data: mocks.responses[options.body.scope], error: null }));
  mocks.start.mockReset().mockResolvedValue({ data: { token: "a".repeat(48) }, error: null });
  mocks.refresh.mockReset().mockResolvedValue({ data: { session: { expires_at: Date.now() / 1000 + 3600 } }, error: null });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("required Telegram memberships", () => {
  it("shows both exact channel links and unlocks after both server checks succeed", async () => {
    const verified = vi.fn();
    render(<TelegramChannelGate language="ar" onVerified={verified} />);
    expect(screen.getByRole("link", { name: /@Tamayuzak/ })).toHaveAttribute("href", "https://t.me/Tamayuzak");
    expect(screen.getByRole("link", { name: /@a6th_DHS/ })).toHaveAttribute("href", "https://t.me/a6th_DHS");
    await waitFor(() => expect(verified).toHaveBeenCalledOnce());
    expect(mocks.invoke).toHaveBeenCalledWith("telegram-channel-check", { body: { scope: "default" } });
    expect(mocks.invoke).toHaveBeenCalledWith("telegram-channel-check", { body: { scope: "dhs" } });
  });
  it.each([["default", "Tamayuzak"], ["dhs", "a6th_DHS"]])("stays locked when %s membership is missing", async (scope, username) => {
    mocks.responses[scope] = { ok: true, joined: false };
    const verified = vi.fn();
    render(<TelegramChannelGate language="ar" onVerified={verified} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(`@${username}`);
    expect(verified).not.toHaveBeenCalled();
  });
  it("rechecks both memberships on every verification attempt", async () => {
    mocks.responses.dhs = { ok: true, joined: false };
    const verified = vi.fn();
    render(<TelegramChannelGate language="en" onVerified={verified} />);
    await screen.findByRole("alert");
    mocks.responses.default = { ok: true, joined: false };
    mocks.responses.dhs = { ok: true, joined: true };
    fireEvent.click(screen.getByRole("button", { name: "Verify my membership" }));
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(4));
    expect(await screen.findByRole("alert")).toHaveTextContent("@Tamayuzak");
    expect(verified).not.toHaveBeenCalled();
    mocks.responses.default = { ok: true, joined: true };
    fireEvent.click(screen.getByRole("button", { name: "Verify my membership" }));
    await waitFor(() => expect(verified).toHaveBeenCalledOnce());
    expect(mocks.invoke).toHaveBeenCalledTimes(6);
  });
  it("waits for both server responses before granting access", async () => {
    let finishDhs!: (result: { data: Response; error: null }) => void;
    mocks.invoke.mockImplementation(async (_name: string, options: { body: { scope: string } }) => options.body.scope === "dhs"
      ? new Promise<{ data: Response; error: null }>(resolve => { finishDhs = resolve; })
      : { data: { ok: true, joined: true }, error: null });
    const verified = vi.fn();
    render(<TelegramChannelGate language="en" onVerified={verified} />);
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(2));
    expect(verified).not.toHaveBeenCalled();
    await act(async () => { finishDhs({ data: { ok: true, joined: true }, error: null }); });
    expect(verified).toHaveBeenCalledOnce();
  });
  it.each(["bot_not_channel_admin", "wrong_bot_connection", "telegram_not_configured", "telegram_gateway_unavailable"])("does not unlock for a configuration error: %s", async error => {
    mocks.responses.default = { ok: false, joined: false, error };
    const verified = vi.fn();
    render(<TelegramChannelGate language="en" onVerified={verified} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't verify right now");
    expect(verified).not.toHaveBeenCalled();
  });
  it("does not treat an unauthenticated joined flag as verified membership", async () => {
    vi.useFakeTimers();
    mocks.responses.default = { ok: false, joined: true, error: "unauthenticated" };
    const verified = vi.fn();
    render(<TelegramChannelGate language="en" onVerified={verified} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(801); });
    expect(verified).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't verify right now");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
  it("offers the existing bot connection when the account is not linked", async () => {
    mocks.responses.default = mocks.responses.dhs = { ok: false, joined: false, error: "not_linked" };
    const verified = vi.fn();
    render(<TelegramChannelGate language="ar" onVerified={verified} />);
    await waitFor(() => expect(screen.getByRole("link", { name: "اربط تلغرام بتميّزك" })).toHaveAttribute("href", `https://t.me/sovforcejoin_bot?start=${"a".repeat(48)}`));
    expect(mocks.start).toHaveBeenCalledWith({ source: "site-gate" });
    expect(verified).not.toHaveBeenCalled();
  });
});
