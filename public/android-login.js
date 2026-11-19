import { encryptSession, toBase64Url } from './android-auth-crypto.js';
import { authConfig } from './android-auth-config.js';

const ORIGIN = 'https://tamyazak.site';
const STORAGE = 'tamayzak.android.auth.v1';
const title = document.getElementById('title');
const message = document.getElementById('message');
function fail() {
  title.textContent = 'ما اكتمل تسجيل الدخول';
  message.textContent = 'ارجع لتطبيق تميّزك وابدي تسجيل الدخول مرّة ثانية. Return to the app and start sign-in again.';
  sessionStorage.removeItem(STORAGE);
}
async function run() {
  if (location.origin !== ORIGIN || window.top !== window.self) throw new Error('Origin');
  const query = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.slice(1));
  // Remove tokens from the current history entry before any network requests.
  history.replaceState(null, '', '/android-login.html');
  if (query.has('key')) {
    const state = query.get('state'), key = query.get('key'), provider = query.get('provider');
    if (!/^[A-Za-z0-9_-]{43}$/.test(state || '') || !/^[A-Za-z0-9_-]{300,600}$/.test(key || '') ||
        !['google', 'apple', 'microsoft', 'lovable'].includes(provider)) throw new Error('Request');
    sessionStorage.setItem(STORAGE, JSON.stringify({ state, key, created: Date.now() }));
    const broker = new URL('/~oauth/initiate', ORIGIN);
    broker.search = new URLSearchParams({ provider, state, redirect_uri: ORIGIN + '/android-login.html' }).toString();
    location.replace(broker.toString()); return;
  }
  const pending = JSON.parse(sessionStorage.getItem(STORAGE) || 'null');
  if (!pending || Date.now() < pending.created || Date.now() - pending.created > 600000) throw new Error('Expired');
  const returnedState = fragment.get('state') || query.get('state');
  if (returnedState && returnedState !== pending.state) throw new Error('State');
  if (fragment.has('error') || query.has('error')) throw new Error('Provider');
  const access = fragment.get('access_token'), refresh = fragment.get('refresh_token');
  if (!access || !refresh || access.length > 20000 || refresh.length > 10000) throw new Error('Session');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  let response;
  try {
    response = await fetch(authConfig.url + '/auth/v1/user', {
      headers: { apikey: authConfig.publicKey, Authorization: 'Bearer ' + access },
      signal: controller.signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
    });
  } finally { clearTimeout(timer); }
  if (!response.ok || !(await response.json()).id) throw new Error('Session');
  const envelope = await encryptSession({ origin: ORIGIN, state: pending.state, access_token: access, refresh_token: refresh,
    expires_in: Number(fragment.get('expires_in')) || 3600 }, pending.key, pending.state);
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(envelope)));
  const callbackQuery = new URLSearchParams({ state: pending.state, payload }).toString();
  const button = document.getElementById('return');
  // Explicit package + a user tap deliver to the official app. The payload is encrypted to its pending private key.
  button.href = 'intent://auth/callback?' + callbackQuery + '#Intent;scheme=com.tamayzak.app;package=com.tamayzak.app;end';
  button.hidden = false;
  title.textContent = 'جاهز ترجع لدراستك';
  message.textContent = 'راح ينفتح تطبيق تميّزك تلقائياً. إذا ما انفتح، اضغط الزر ولا تسد المتصفح يدوياً. Tamayzak will open automatically. If it does not, tap the button instead of closing the browser.';
  sessionStorage.removeItem(STORAGE);
  // Android browsers may allow the explicit-package intent after the OAuth
  // redirect. Try it immediately so returning to the app cannot skip the
  // encrypted callback. Browsers that require a fresh user gesture simply
  // keep this page visible and the button remains the trusted fallback.
  try { location.assign(button.href); } catch { /* Keep the manual button available. */ }
  setTimeout(() => { button.hidden = true; fail(); }, 120000);
}
run().catch(fail);
