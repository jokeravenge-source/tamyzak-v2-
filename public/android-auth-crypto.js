/** Browser half of the native login envelope. No server secret is used. */
export function fromBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid encoding');
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
export function toBase64Url(value) {
  let binary = ''; for (const byte of new Uint8Array(value)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function encryptSession(session, publicKey, state) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(state) || publicKey.length > 600) throw new Error('Invalid request');
  const rsa = await crypto.subtle.importKey('spki', fromBase64Url(publicKey), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  if (rsa.algorithm.modulusLength !== 2048) throw new Error('Invalid key');
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const rawKey = await crypto.subtle.exportKey('raw', key);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(state), tagLength: 128 }, key,
    new TextEncoder().encode(JSON.stringify(session)));
  const wrapped = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsa, rawKey);
  return { v: 1, key: toBase64Url(wrapped), iv: toBase64Url(iv), data: toBase64Url(data) };
}
