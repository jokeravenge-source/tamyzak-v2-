const KEY = "tmz_channel_battle_link_v1";
export const isChannelBattleId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/** Capture before authentication: OAuth may return to / without its query string. */
export function captureBattleChannelLink() {
  try {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("battle");
    if (!isChannelBattleId(id)) return;
    localStorage.setItem(KEY, JSON.stringify({ id, until: Date.now() + 10 * 60 * 1000 }));
    localStorage.setItem("app_menu_choice_v1", "liveBattle");
    url.searchParams.delete("battle");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  } catch { /* A visible URL still lets the screen try the invite. */ }
}
export function pendingBattleChannelId(): string | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null");
    if (isChannelBattleId(value?.id) && Number.isFinite(value.until) && value.until > Date.now()) return value.id;
    localStorage.removeItem(KEY);
  } catch { /* no stored invite */ }
  return null;
}
export function clearBattleChannelLink() { try { localStorage.removeItem(KEY); } catch { /* optional storage */ } }
