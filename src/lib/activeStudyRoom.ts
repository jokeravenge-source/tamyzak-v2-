import { useSyncExternalStore } from "react";

const ACTIVE_ROOM_KEY = "study_room_active_v1";
const ACTIVE_ROOM_EVENT = "active-study-room-changed";

export function getActiveStudyRoomId() {
  try { return localStorage.getItem(ACTIVE_ROOM_KEY) ?? undefined; } catch { return undefined; }
}

export function setActiveStudyRoomId(room: string | undefined) {
  if (room) localStorage.setItem(ACTIVE_ROOM_KEY, room);
  else localStorage.removeItem(ACTIVE_ROOM_KEY);
  window.dispatchEvent(new Event(ACTIVE_ROOM_EVENT));
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === ACTIVE_ROOM_KEY || event.key === null) listener();
  };
  window.addEventListener(ACTIVE_ROOM_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(ACTIVE_ROOM_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useActiveStudyRoomId() {
  return useSyncExternalStore(subscribe, getActiveStudyRoomId, () => undefined);
}
