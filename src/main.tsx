import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import PullToRefresh from "./components/PullToRefresh";
import { initFirebase } from "./lib/firebase";
import "./index.css";

import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <PullToRefresh />
    <App />
  </HelmetProvider>,
);

void initFirebase();

// PWA: pick the install manifest that matches the phone's language.
if (typeof window !== "undefined") {
  const isArabic = (navigator.languages?.[0] ?? navigator.language ?? "en")
    .toLowerCase()
    .startsWith("ar");
  const link = document.getElementById("app-manifest") as HTMLLinkElement | null;
  const href = isArabic ? "/manifest-ar.webmanifest" : "/manifest-en.webmanifest";
  if (link) link.href = href;
  document.documentElement.setAttribute("lang", isArabic ? "ar" : "en");
}
