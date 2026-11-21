import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { captureBattleChannelLink, clearBattleChannelLink, pendingBattleChannelId } from "./battleChannelLink";
const id = "10000000-0000-4000-8000-000000000001";
beforeEach(() => { localStorage.clear(); window.history.replaceState({}, "", "/"); });
afterEach(() => vi.useRealTimers());
it("preserves the challenge across an OAuth return to the root and selects Live Battle", () => {
  window.history.replaceState({}, "", `/?menu=liveBattle&battle=${id}`);
  captureBattleChannelLink();
  expect(new URL(window.location.href).searchParams.has("battle")).toBe(false);
  expect(localStorage.getItem("app_menu_choice_v1")).toBe("liveBattle");
  window.history.replaceState({}, "", "/");
  expect(pendingBattleChannelId()).toBe(id);
  clearBattleChannelLink(); expect(pendingBattleChannelId()).toBeNull();
});
it("ignores invalid ids and expires old pending invitations", () => {
  vi.useFakeTimers();
  window.history.replaceState({}, "", "/?battle=not-a-room"); captureBattleChannelLink(); expect(pendingBattleChannelId()).toBeNull();
  window.history.replaceState({}, "", `/?battle=${id}`); captureBattleChannelLink();
  vi.advanceTimersByTime(600001); expect(pendingBattleChannelId()).toBeNull();
});
