import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEnglishReadingAccess } from "./useEnglishReadingAccess";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mocks.rpc },
}));

describe("useEnglishReadingAccess", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mocks.rpc.mockReset();
  });

  it("starts and exposes an active three-day trial", async () => {
    mocks.rpc.mockResolvedValue({
      data: {
        access: true,
        premium: false,
        started_at: new Date(Date.now() - 1_000).toISOString(),
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1_000).toISOString(),
      },
      error: null,
    });
    const { result, unmount } = renderHook(() => useEnglishReadingAccess());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mocks.rpc).toHaveBeenCalledWith("claim_english_reading_access");
    expect(result.current.hasAccess).toBe(true);
    expect(result.current.premium).toBe(false);
    expect(result.current.remainingMs).toBeGreaterThan(71 * 60 * 60 * 1_000);
    unmount();
  });

  it("locks an expired trial", async () => {
    mocks.rpc.mockResolvedValue({
      data: {
        access: false,
        premium: false,
        started_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1_000).toISOString(),
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1_000).toISOString(),
      },
      error: null,
    });
    const { result, unmount } = renderHook(() => useEnglishReadingAccess());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasAccess).toBe(false);
    expect(result.current.remainingMs).toBe(0);
    unmount();
  });

  it("keeps paid members unlocked and can retry a failed lookup", async () => {
    mocks.rpc
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        data: { access: true, premium: true, started_at: null, expires_at: null },
        error: null,
      });
    const { result } = renderHook(() => useEnglishReadingAccess());
    await waitFor(() => expect(result.current.error).toBe(true));
    await act(async () => { await result.current.refresh(); });
    expect(result.current.error).toBe(false);
    expect(result.current.hasAccess).toBe(true);
    expect(result.current.premium).toBe(true);
  });
});
