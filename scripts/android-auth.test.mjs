import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, webcrypto, privateDecrypt, constants, createDecipheriv } from 'node:crypto';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const state = Buffer.from(webcrypto.getRandomValues(new Uint8Array(32))).toString('base64url');
const publicSpki = publicKey.export({ type: 'spki', format: 'der' }).toString('base64url');
const access = 'fake-test-access-token', refresh = 'fake-test-refresh-token';
let counter = 0;
async function load({ query = '', hash = '', pending, status = 200 } = {}) {
  const originals = Object.getOwnPropertyDescriptors(globalThis);
  const stored = new Map(pending ? [['tamayzak.android.auth.v1', JSON.stringify(pending)]] : []);
  const elements = { title: { textContent: '' }, message: { textContent: '' }, return: { hidden: true, href: '' } };
  const requests = [], historyEntries = [], redirects = [], timers = [];
  const nativeSetTimeout = globalThis.setTimeout;
  const mocks = {
    window: {}, location: { origin: 'https://tamyazak.site', search: query, hash, replace(url) { redirects.push(url); } },
    document: { getElementById(id) { return elements[id]; } },
    sessionStorage: { getItem(key) { return stored.get(key) ?? null; }, setItem(key, value) { stored.set(key, value); }, removeItem(key) { stored.delete(key); } },
    history: { replaceState(...args) { historyEntries.push(args); } },
    fetch: async (...args) => { requests.push(args); return { ok: status === 200, json: async () => ({ id: 'test-user' }) }; },
    setTimeout(fn, delay) { const timer = nativeSetTimeout(fn, delay); timers.push(timer); timer.unref(); return timer; },
  };
  mocks.window.top = mocks.window; mocks.window.self = mocks.window;
  for (const [key, value] of Object.entries(mocks)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  try {
    await import('../public/android-login.js?test=' + counter++);
    for (let i = 0; i < 300 && !redirects.length && elements.return.hidden && elements.title.textContent !== 'ما اكتمل تسجيل الدخول'; i++)
      await new Promise(resolve => nativeSetTimeout(resolve, 2));
    return { elements, requests, historyEntries, redirects, stored };
  } finally {
    for (const timer of timers) clearTimeout(timer);
    for (const key of Object.keys(mocks)) {
      if (originals[key]) Object.defineProperty(globalThis, key, originals[key]); else delete globalThis[key];
    }
  }
}
test('native requests redirect to the existing broker with the same-origin callback', async () => {
  const result = await load({ query: '?' + new URLSearchParams({ state, key: publicSpki, provider: 'google' }) });
  const url = new URL(result.redirects[0]);
  assert.equal(url.origin, 'https://tamyazak.site'); assert.equal(url.pathname, '/~oauth/initiate');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://tamyazak.site/android-login.html');
  assert.equal(url.searchParams.get('state'), state); assert.equal(result.requests.length, 0);
  assert.equal(JSON.parse(result.stored.get('tamayzak.android.auth.v1')).key, publicSpki);
});
test('valid callbacks validate the session and produce only an encrypted explicit-package app intent', async () => {
  const result = await load({ pending: { state, key: publicSpki, created: Date.now() },
    hash: '#' + new URLSearchParams({ access_token: access, refresh_token: refresh, expires_in: '3600', state }) });
  assert.equal(result.requests[0][1].headers.Authorization, 'Bearer ' + access);
  assert.equal(result.requests[0][1].cache, 'no-store');
  assert.equal(result.requests[0][1].credentials, 'omit');
  assert.equal(result.historyEntries[0][2], '/android-login.html');
  assert.equal(result.elements.return.hidden, false);
  const href = result.elements.return.href;
  assert.match(href, /package=com\.tamayzak\.app/); assert.equal(href.includes(access), false);
  const callback = new URL(href.replace('intent://', 'com.tamayzak.app://').split('#Intent')[0]);
  const payload = JSON.parse(Buffer.from(callback.searchParams.get('payload'), 'base64url'));
  const key = privateDecrypt({ key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(payload.key, 'base64url'));
  const bytes = Buffer.from(payload.data, 'base64url');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64url'));
  decipher.setAAD(Buffer.from(state)); decipher.setAuthTag(bytes.subarray(-16));
  const session = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(0, -16)), decipher.final()]));
  assert.equal(session.access_token, access); assert.equal(session.refresh_token, refresh);
  assert.equal(result.stored.size, 0);
});
test('mismatched request states cannot hand over a session', async () => {
  const result = await load({ pending: { state, key: publicSpki, created: Date.now() },
    hash: '#' + new URLSearchParams({ access_token: access, refresh_token: refresh, state: 'other-state' }) });
  assert.equal(result.requests.length, 0); assert.equal(result.elements.return.hidden, true); assert.equal(result.stored.size, 0);
});
test('expired browser requests cannot hand over a session', async () => {
  const result = await load({ pending: { state, key: publicSpki, created: Date.now() - 600001 },
    hash: '#' + new URLSearchParams({ access_token: access, refresh_token: refresh }) });
  assert.equal(result.requests.length, 0); assert.equal(result.elements.return.hidden, true);
});
test('a server-rejected access token is never returned to the app', async () => {
  const result = await load({ pending: { state, key: publicSpki, created: Date.now() }, status: 401,
    hash: '#' + new URLSearchParams({ access_token: access, refresh_token: refresh }) });
  assert.equal(result.elements.return.hidden, true); assert.equal(result.stored.size, 0);
});
