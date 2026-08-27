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

function show(title, body, url) {
  return self.registration.showNotification(title || "تميزك", {
    body: body || "",
    icon: "/app-icon-192.png",
    badge: "/app-icon-192.png",
    tag: "tamayzak-push",
    renotify: true,
    data: { url: url || "/" },
  });
}

// Data-only messages arrive here; we display them ourselves.
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  const n = payload.notification || {};
  // Notification payloads are displayed automatically by FCM. Only render
  // legacy data-only messages here to avoid duplicate notifications.
  if (n.title || n.body) return;
  return show(n.title || d.title, n.body || d.body, d.url);
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
  // FCM handles notification payloads even when the PWA has no open window.
  // This listener remains as a fallback for older data-only messages.
  if (n.title || n.body) return;
  const title = n.title || d.title;
  const body = n.body || d.body;
  if (!title && !body) return;
  event.waitUntil(
    self.registration.getNotifications({ tag: "tamayzak-push" }).then((existing) => {
      // The SDK handler may have already displayed this one.
      if (existing.some((x) => x.title === (title || "تميزك") && x.body === (body || ""))) return;
      return show(title, body, d.url);
    }),
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
