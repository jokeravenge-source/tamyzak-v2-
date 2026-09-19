import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, LoaderCircle } from "lucide-react";

const TRIGGER_DISTANCE = 82;
const MAX_PULL_DISTANCE = 118;

function isStandalonePwa() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

/** True when the touch started inside a scrollable pane that is not at its top. */
function insideScrolledContainer(target: HTMLElement | null) {
  let node: HTMLElement | null = target;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const scrollable = /(auto|scroll|overlay)/.test(`${style.overflowY} ${style.overflow}`);
    if (scrollable && node.scrollHeight > node.clientHeight) {
      if (node.scrollTop > 0) return true;
      // A scrollable pane at its top (dialogs, chat panes) still owns the gesture.
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

export default function PullToRefresh() {
  const [enabled, setEnabled] = useState(false);
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const startX = useRef(0);
  const tracking = useRef(false);
  const distanceRef = useRef(0);

  useEffect(() => {
    setEnabled(isStandalonePwa() && window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const reset = () => {
      tracking.current = false;
      distanceRef.current = 0;
      setDistance(0);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (refreshing || window.scrollY > 0 || event.touches.length !== 1) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], [data-pull-refresh-ignore]")) return;
      if (target?.closest("[role='dialog'], [data-radix-popper-content-wrapper]")) return;
      if (insideScrolledContainer(target)) return;

      startY.current = event.touches[0].clientY;
      startX.current = event.touches[0].clientX;
      tracking.current = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!tracking.current || event.touches.length !== 1) return;

      const deltaY = event.touches[0].clientY - startY.current;
      const deltaX = event.touches[0].clientX - startX.current;
      if (deltaY <= 0 || Math.abs(deltaX) > deltaY) {
        reset();
        return;
      }

      if (window.scrollY > 0) {
        reset();
        return;
      }

      event.preventDefault();
      const resistedDistance = Math.min(MAX_PULL_DISTANCE, Math.round(deltaY * 0.55));
      distanceRef.current = resistedDistance;
      setDistance(resistedDistance);
    };

    const onTouchEnd = () => {
      if (!tracking.current) return;
      tracking.current = false;

      if (distanceRef.current >= TRIGGER_DISTANCE) {
        setDistance(58);
        setRefreshing(true);
        window.setTimeout(() => window.location.reload(), 350);
      } else {
        distanceRef.current = 0;
        setDistance(0);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", reset, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", reset);
    };
  }, [enabled, refreshing]);

  if (!enabled) return null;

  const ready = distance >= TRIGGER_DISTANCE;
  const isArabic = document.documentElement.lang.toLowerCase().startsWith("ar");
  const label = refreshing
    ? (isArabic ? "جاري التحديث..." : "Refreshing...")
    : ready
      ? (isArabic ? "اترك للتحديث" : "Release to refresh")
      : (isArabic ? "اسحب للتحديث" : "Pull to refresh");

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[300] flex justify-center transition-transform duration-150 ease-out"
      style={{ transform: `translateY(${distance > 0 || refreshing ? distance - 48 : -64}px)` }}
    >
      <div className="flex h-11 items-center gap-2 rounded-full border border-border/80 bg-card/95 px-4 text-xs font-bold text-foreground shadow-xl backdrop-blur-xl">
        {refreshing ? (
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
        ) : ready ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <ArrowDown
            className="h-4 w-4 text-primary transition-transform"
            style={{ transform: `rotate(${Math.min(180, distance * 2)}deg)` }}
          />
        )}
        <span>{label}</span>
      </div>
    </div>
  );
}
