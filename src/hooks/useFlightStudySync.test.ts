import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFlightStudySync } from "./useFlightStudySync";
const backend = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: backend.rpc } }));
beforeEach(() => backend.rpc.mockReset());
afterEach(() => vi.restoreAllMocks());

describe("flight study account sync", () => {
  it("does not request rewards for signed-out users", () => {
    const view = renderHook(() => useFlightStudySync(false));
    expect(backend.rpc).not.toHaveBeenCalled();
    view.unmount();
  });
  it("syncs authenticated hours and notifies progress without sending a points amount", async () => {
    backend.rpc.mockResolvedValue({ data: { pointsAdded: 100, studySecondsAdded: 900 }, error: null });
    const update = vi.fn();
    window.addEventListener("app:progress-updated", update);
    const view = renderHook(() => useFlightStudySync(true));
    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    expect(backend.rpc).toHaveBeenCalledWith("sync_my_study_flights");
    view.unmount();
    window.removeEventListener("app:progress-updated", update);
  });
  it("prevents overlapping requests and removes focus listeners on unmount", async () => {
    let finish!: (result: unknown) => void;
    backend.rpc.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const view = renderHook(() => useFlightStudySync(true));
    act(() => { window.dispatchEvent(new Event("focus")); window.dispatchEvent(new Event("focus")); });
    expect(backend.rpc).toHaveBeenCalledOnce();
    await act(async () => finish({ data: { pointsAdded: 0, studySecondsAdded: 0 }, error: null }));
    view.unmount();
    window.dispatchEvent(new Event("focus"));
    expect(backend.rpc).toHaveBeenCalledOnce();
  });
});
