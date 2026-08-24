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

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || "تميزك";
  const body = (payload.notification && payload.notification.body) || "";
  self.registration.showNotification(title, {
    body,
    icon: "/app-icon-192.png",
    badge: "/app-icon-192.png",
    data: { url: (payload.data && payload.data.url) || "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
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
