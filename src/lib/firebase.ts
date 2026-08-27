import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported, logEvent } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported as messagingSupported } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";

// Firebase web config — these values are publishable by design.
export const firebaseConfig = {
  apiKey: "AIzaSyBXC8tV68PBGP7mSIXNtyQ1RUotGT2tEpM",
  authDomain: "tamyazak.firebaseapp.com",
  projectId: "tamyazak",
  storageBucket: "tamyazak.firebasestorage.app",
  messagingSenderId: "47376358660",
  appId: "1:47376358660:web:89ea8bc21c358e02bb4451",
  measurementId: "G-8GCXNJTXMY",
};

// Web Push certificate (VAPID public key) — also publishable.
const VAPID_KEY =
  "BJQ07swxhDuKP8uJXyIG5SbfGDo6y8HQZbGjTDjQys9HdTfSyDJrIa30yCU9kRvTNPY07GxckGVAdDmGFyg4cBM";

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

/** Initialise Firebase + Analytics. Safe to call once at startup. */
export async function initFirebase() {
  try {
    const instance = getFirebaseApp();
    if (await analyticsSupported()) getAnalytics(instance);
  } catch {
    /* analytics must never break the app */
  }
  // If the user already granted permission, make sure the messaging worker is
  // live and foreground messages surface as real OS notifications.
  try {
    if (pushSupported() && Notification.permission === "granted") {
      await messagingServiceWorker();
      await registerPushToken();
      await onPushMessage();
    }
  } catch {
    /* messaging must never break the app */
  }
}


/** Log a Firebase Analytics event (no-op when unsupported). */
export async function logFirebaseEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    if (!(await analyticsSupported())) return;
    logEvent(getAnalytics(getFirebaseApp()), name, params as never);
  } catch {
    /* ignore */
  }
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "Notification" in window &&
    "PushManager" in window
  );
}

export function pushPermission(): NotificationPermission | "unsupported" {
  if (!pushSupported()) return "unsupported";
  return Notification.permission;
}

/** Register the dedicated Firebase messaging service worker. */
async function messagingServiceWorker() {
  const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
  // Pull the newest worker so devices that cached an older version pick up
  // notification-display fixes without a manual unregister.
  try {
    await reg.update();
  } catch {
    /* ignore */
  }
  return reg;
}

/**
 * Ask for notification permission, fetch the FCM token and store it against the
 * signed-in user so the backend can send pushes later.
 * Returns the token, or null when unavailable / denied.
 */
export async function enablePushNotifications(): Promise<string | null> {
  if (!pushSupported() || !(await messagingSupported())) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  return registerPushToken();
}

/** Refresh and persist the device token whenever an already-authorized PWA
 * starts. This keeps background delivery working after FCM rotates a token. */
async function registerPushToken(): Promise<string | null> {
  if (!pushSupported() || !(await messagingSupported()) || Notification.permission !== "granted") return null;

  const registration = await messagingServiceWorker();
  const messaging = getMessaging(getFirebaseApp());
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) return null;

  try {
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("push_tokens").upsert(
        {
          user_id: u.user.id,
          token,
          platform: "web",
          user_agent: navigator.userAgent.slice(0, 300),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "token" },
      );
    }
  } catch {
    /* storing the token must not fail the flow */
  }

  return token;
}

/**
 * Subscribe to messages received while the app is in the foreground.
 * Foreground messages are NOT displayed by the browser automatically, so we
 * show a real OS notification through the messaging service worker as well.
 */
let foregroundBound = false;
export async function onPushMessage(handler?: (title: string, body: string) => void) {
  if (!pushSupported() || !(await messagingSupported())) return;
  if (foregroundBound && !handler) return;
  foregroundBound = true;
  try {
    onMessage(getMessaging(getFirebaseApp()), (payload) => {
      const title = payload.notification?.title ?? payload.data?.title ?? "تميزك";
      const body = payload.notification?.body ?? payload.data?.body ?? "";
      handler?.(title, body);
      void (async () => {
        try {
          const reg =
            (await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")) ??
            (await messagingServiceWorker());
          await reg.showNotification(title, {
            body,
            icon: "/app-icon-192.png",
            badge: "/app-icon-192.png",
            tag: "tamayzak-push",
            data: { url: payload.data?.url ?? "/" },
          });
        } catch {
          /* ignore */
        }
      })();
    });
  } catch {
    /* ignore */
  }

}
