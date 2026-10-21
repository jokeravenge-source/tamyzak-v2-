import { useLayoutEffect, useRef } from "react";

type StudyLocation = { menu: string | null; subject: string | null; category: string | null };
type Visit<T> = { location: T; url: string };

/** Keep section-level Back separate from the flashcard router's own history. */
export function useStudyBackHistory<T extends StudyLocation>(location: T, restore: (location: T) => void) {
  const visits = useRef<Visit<T>[]>([]);
  const current = useRef<Visit<T>>({ location, url: window.location.pathname + window.location.search });
  const restoring = useRef(false);

  useLayoutEffect(() => {
    const previous = current.current;
    const menuChanged = (previous.location.menu ?? "basics") !== (location.menu ?? "basics");
    if (menuChanged && !restoring.current) {
      visits.current.push(previous);
      if (visits.current.length > 30) visits.current.shift();
    }
    restoring.current = false;
    current.current = { location, url: window.location.pathname + window.location.search };
  }, [location]);

  const goBack = () => {
    const visit = visits.current.pop();
    if (!visit) return false;
    restoring.current = true;
    window.history.replaceState(window.history.state, "", visit.url);
    restore(visit.location);
    return true;
  };

  return { goBack, clear: () => { visits.current = []; } };
}
