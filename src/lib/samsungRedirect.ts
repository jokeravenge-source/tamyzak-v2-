// Samsung Internet breaks some sign-in and AI features — send those visitors to Chrome.
if (typeof window !== "undefined" && /SamsungBrowser/i.test(navigator.userAgent) && /Android/i.test(navigator.userAgent)) {
  const { host, pathname, search, hash } = window.location;
  const fallback = encodeURIComponent("https://play.google.com/store/apps/details?id=com.android.chrome");
  const intent = `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;

  // Try automatically first.
  window.location.href = intent;

  // Samsung Internet often blocks automatic app switches, so cover the page
  // with a full-screen "Open in Chrome" button (a tap is always allowed).
  const show = () => {
    if (document.getElementById("samsung-chrome-gate")) return;
    const gate = document.createElement("div");
    gate.id = "samsung-chrome-gate";
    gate.setAttribute("dir", "rtl");
    gate.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center;background:hsl(var(--background,0 0% 4%));color:hsl(var(--foreground,0 0% 98%));font-family:inherit";
    gate.innerHTML = `
      <div style="font-size:22px;font-weight:800">افتح تميزك في Google Chrome</div>
      <div style="font-size:14px;opacity:.75;max-width:340px">متصفح سامسونج لا يدعم كل ميزات المنصة. اضغط الزر لفتح الموقع في كروم.</div>
      <a id="samsung-chrome-btn" href="${intent}" style="display:inline-block;padding:14px 28px;border-radius:999px;font-weight:800;font-size:16px;text-decoration:none;background:hsl(var(--primary,142 70% 45%));color:hsl(var(--primary-foreground,0 0% 100%))">فتح في Chrome</a>
      <div style="font-size:12px;opacity:.6">Open Tamayzak in Google Chrome</div>`;
    document.body.appendChild(gate);
  };
  if (document.body) show();
  else document.addEventListener("DOMContentLoaded", show);
}
export {};
