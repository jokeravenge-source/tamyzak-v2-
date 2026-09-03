/* Firebase Cloud Messaging service worker — handles background notifications.
   This is a messaging worker only: it does not cache or serve the app shell. */
importScripts("https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBXC8tV68PBGP7mSIXNtyQ1RUotGT2tEpM",
  authDomain: "tamyazak.firebaseapp.com",
  projectId: "tamyazak",
  storageBucket: "tamyazak.firebasestorage.app",
  messagingSenderId: "47376358660",
  appId: "1:47376358660:web:89ea8bc21c358e02bb4451",
  measurementId: "G-8GCXNJTXMY",
});

const messaging = firebase.messaging();

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

function show(title, body, url, messageId) {
  return self.registration.showNotification(title || "تميزك", {
    body: body || "",
    icon: "/app-icon-192.png",
    badge: "/app-icon-192.png",
    tag: messageId ? `tamayzak-push-${messageId}` : "tamayzak-push",
    renotify: true,
    data: { url: url || "/" },
  });
}

function showOnce(title, body, url, messageId) {
  const tag = messageId ? `tamayzak-push-${messageId}` : "tamayzak-push";
  return self.registration.getNotifications({ tag }).then((existing) => {
    if (existing.length > 0) return;
    return show(title, body, url, messageId);
  });
}

// Data-only messages arrive here; we display them ourselves.
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  const n = payload.notification || {};
  return showOnce(n.title || d.title, n.body || d.body, d.url, d.messageId);
});

// Raw fallback: fires even if the FCM SDK handler is skipped, and guarantees
// the browser always sees a notification for the push it delivered.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }
  const d = payload.data || {};
  const n = payload.notification || {};
  const title = n.title || d.title;
  const body = n.body || d.body;
  if (!title && !body) return;
  event.waitUntil(
    showOnce(title, body, d.url, d.messageId),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const url = notificationData.url || notificationData.FCM_MSG?.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
