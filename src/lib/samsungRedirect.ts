// Samsung Internet breaks some sign-in and AI features — send those visitors to Chrome.
if (typeof window !== "undefined" && /SamsungBrowser/i.test(navigator.userAgent) && /Android/i.test(navigator.userAgent)) {
  const { host, pathname, search, hash } = window.location;
  const fallback = encodeURIComponent("https://play.google.com/store/apps/details?id=com.android.chrome");
  const intent = `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
  window.location.href = intent;
}
export {};
