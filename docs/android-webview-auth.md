# Android WebView browser sign-in

The native `com.tamayzak.app` wrapper needs a system-browser OAuth handoff because
the existing Lovable broker redirects cannot share a WebView session by opening
a Custom Tab alone. These public static files are the necessary compatibility
addition; the normal web login and existing app routes are unchanged.

`android-login.html` starts the existing `/~oauth/initiate` flow in a Custom Tab.
Its browser-only callback validates the returned access token at the existing
Supabase `/auth/v1/user` endpoint. It encrypts the session with a per-request
AES-GCM key wrapped in the app's ephemeral RSA-OAEP SHA-256 public key. The student
returns through an explicit-package `com.tamayzak.app` intent. The native app
accepts only its pending state/private key, expires requests after ten minutes,
and consumes successful requests once. No plaintext session tokens are sent
in the cross-app callback. `android-auth-config.js` contains only the existing
public Supabase URL and publishable/anon key, never a service-role key.

Publish all five `public/android-*` files together. The page is noindex and
removes token fragments before doing network work. Browser sessionStorage holds
only the pending public key and random request state, not tokens. The native
private request material is encrypted with Android Keystore and excluded from
backups; the APK signing key is separate and is not stored in this repository.

Tests: `node --test scripts/android-auth.test.mjs` covers initial broker routing,
valid encrypted return, mismatched state, expiry and rejected access tokens.
The delivered native project also tests Web Crypto/Java interoperability, native
callback replay/expiry, trusted origins and streamed downloads. Real Google or
Apple sign-in still needs an authorized account and Android device.

The adapter relies on the broker's existing implicit-token callback contract.
Re-test this route if the broker changes its response format. A repository push
is not evidence that the hosting service has published these files.
