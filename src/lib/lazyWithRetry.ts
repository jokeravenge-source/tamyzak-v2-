import { createElement, lazy as reactLazy, type ComponentType } from "react";

const RELOAD_KEY = "chunk-reload-at";

/**
 * Lazy import that survives stale build chunks after a deploy.
 * When a dynamic import fails (old hashed file no longer exists),
 * we hard-reload once to pick up the new index.html/asset map.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return reactLazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem(RELOAD_KEY);
      return mod;
    } catch (err) {
      // one silent retry: transient network blips shouldn't reload the page
      try {
        const mod = await factory();
        sessionStorage.removeItem(RELOAD_KEY);
        return mod;
      } catch { /* fall through to reload */ }
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      // only reload once per 10s to avoid infinite loops
      if (Date.now() - last > 10_000) {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        window.location.reload();
        // keep the promise pending while the page reloads
        return new Promise<{ default: T }>(() => {});
      }
      console.warn("Chunk failed to load after reload", err);
      const Fallback = () =>
        createElement(
          "div",
          { className: "min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-background text-foreground" },
          createElement("p", { className: "text-base" }, "تم تحديث الموقع · The site was updated"),
          createElement(
            "button",
            {
              className: "h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold",
              onClick: () => {
                sessionStorage.removeItem(RELOAD_KEY);
                window.location.reload();
              },
            },
            "تحديث الصفحة · Refresh",
          ),
        );
      return { default: Fallback as unknown as T };
    }
  });
}
