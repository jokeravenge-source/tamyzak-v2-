import { useEffect, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let practiceCount = 0;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function notify() {
  listeners.forEach(listener => listener());
}

export function useCharacterPractice(active: boolean) {
  useEffect(() => {
    if (!active) return;
    practiceCount += 1;
    if (practiceCount === 1) notify();
    return () => {
      practiceCount -= 1;
      if (practiceCount === 0) notify();
    };
  }, [active]);
}

export function useIsCharacterPracticing() {
  return useSyncExternalStore(subscribe, () => practiceCount > 0, () => false);
}
