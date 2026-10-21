import { useLayoutEffect, useRef, type ReactNode, Suspense } from "react";

const scrollPositions = new Map<string, number>();

function ScreenContent({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  const screenRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const heading = screenRef.current?.querySelector<HTMLElement>("h1");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      window.scrollTo({ top: scrollPositions.get(routeKey) ?? 0, behavior: "instant" });
    });
    return () => {
      cancelAnimationFrame(frame);
      scrollPositions.set(routeKey, window.scrollY);
      if (scrollPositions.size > 100) scrollPositions.delete(scrollPositions.keys().next().value!);
    };
  }, [routeKey]);
  return <div id="tmz-current-screen" ref={screenRef} tabIndex={-1}>{children}</div>;
}

/** Screen changes restore reading position and focus without entrance animations. */
const PageTransition = ({ routeKey, children }: { routeKey: string; children: ReactNode }) => (
  <Suspense fallback={
    <main className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/25 border-t-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">جارٍ فتح الصفحة… / Loading screen…</p>
      </div>
    </main>
  }>
    <ScreenContent key={routeKey} routeKey={routeKey}>{children}</ScreenContent>
  </Suspense>
);

export default PageTransition;
