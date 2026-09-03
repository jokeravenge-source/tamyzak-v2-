import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { requireAdmin } from "../_shared/auth.ts";

/**
 * Mints a short-lived OAuth2 access token for the Firebase service account so
 * we can call the FCM HTTP v1 API. The JWT is signed with RS256 using Web Crypto.
 */
async function getFcmAccessToken(sa: {
  client_email: string;
  private_key: string;
  project_id: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Build the JWT header + payload.
  const header = { alg: "RS256", typ: "JWT", kid: "" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = new TextEncoder();
  const toB64Url = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

  const unsigned = `${toB64Url(header)}.${toB64Url(payload)}`;

  // Import the PEM private key for signing.
  const pemContents = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, enc.encode(unsigned)),
  );
  const sigB64 = btoa(String.fromCharCode(...signature))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const assertion = `${unsigned}.${sigB64}`;

  // Exchange the assertion for an access token.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`oauth_token_failed: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token as string;
}

async function sendFcm(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
  link?: string | null,
): Promise<boolean> {
  const messageId = crypto.randomUUID();
  // Send a data message and let our service worker display it. This produces
  // one consistent notification path on iOS Home Screen apps and Chromium.
  const message: Record<string, unknown> = {
    token,
    data: {
      title: title ?? "",
      body: body ?? "",
      url: link ?? "/",
      messageId,
    },
    android: { priority: "high" },
    webpush: {
      headers: { Urgency: "high", TTL: "86400" },
      fcm_options: { link: link ?? "/" },
    },
  };

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    },
  );
  if (!res.ok) {
    const errText = await res.text();
    console.error(`FCM send failed [${res.status}] for token ${token.slice(0, 16)}…: ${errText.slice(0, 300)}`);
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), {
      status: s,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    const isInternal = bearer.length > 0 && bearer === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!isInternal) {
      const adminAuth = await requireAdmin(req);
      if (!adminAuth.ok) {
        console.error("send-push auth rejected:", adminAuth.status, adminAuth.error);
        return json({ error: adminAuth.error }, adminAuth.status);
      }
    }

    const rawSa = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!rawSa) return json({ error: "FIREBASE_SERVICE_ACCOUNT secret is not set" }, 500);

    let sa: { client_email: string; private_key: string; project_id: string };
    try {
      sa = JSON.parse(rawSa);
    } catch {
      return json({ error: "FIREBASE_SERVICE_ACCOUNT is not valid JSON" }, 500);
    }
    if (!sa.private_key || !sa.client_email || !sa.project_id) {
      return json({ error: "Service account JSON is missing required fields" }, 400);
    }

    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? "").slice(0, 200).trim();
    const text = String(body.body ?? "").slice(0, 3500).trim();
    const link = body.link ? String(body.link).slice(0, 500) : null;
    const targetUserId = body.target_user_id ? String(body.target_user_id) : null;
    const targetUserIds = Array.isArray(body.target_user_ids)
      ? [...new Set(body.target_user_ids.map(String).filter(Boolean))].slice(0, 500)
      : [];
    const personalizedMessages = Array.isArray(body.messages)
      ? body.messages.slice(0, 500).map((message: any) => ({
        user_id: String(message?.user_id ?? ""),
        title: String(message?.title ?? "").slice(0, 200).trim(),
        body: String(message?.body ?? "").slice(0, 3500).trim(),
        link: message?.link ? String(message.link).slice(0, 500) : "/",
      })).filter((message: { user_id: string; title: string; body: string }) =>
        message.user_id && (message.title || message.body)
      )
      : [];
    if (!title && !text && personalizedMessages.length === 0) return json({ error: "Title or body is required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let tokenQuery = admin.from("push_tokens").select("token, user_id");
    if (targetUserId) tokenQuery = tokenQuery.eq("user_id", targetUserId);
    else if (targetUserIds.length > 0) tokenQuery = tokenQuery.in("user_id", targetUserIds);
    else if (personalizedMessages.length > 0) tokenQuery = tokenQuery.in("user_id", personalizedMessages.map((message: { user_id: string }) => message.user_id));
    const { data: tokenRows, error: tErr } = await tokenQuery;
    if (tErr) return json({ error: tErr.message }, 500);

    const tokens = (tokenRows ?? []) as Array<{ token: string; user_id: string }>;
    console.log(`send-push: found ${tokens.length} token(s)`);
    if (tokens.length === 0) {
      return json({ sent: 0, failed: 0, total: 0, reason: "no_tokens" });
    }

    const accessToken = await getFcmAccessToken(sa);

    let sent = 0;
    let failed = 0;
    const deadTokens: string[] = [];

    const deliveries = personalizedMessages.length > 0
      ? tokens.flatMap((row) => personalizedMessages
        .filter((message: { user_id: string }) => message.user_id === row.user_id)
        .map((message: { title: string; body: string; link: string }) => ({ token: row.token, personalized: message })))
      : tokens.map((row) => ({ token: row.token, personalized: undefined }));

    for (const delivery of deliveries) {
      const { token, personalized } = delivery;
      let ok = false;
      try {
        ok = await sendFcm(
          accessToken,
          sa.project_id,
          token,
          personalized?.title || title || "تميزك",
          personalized?.body ?? text,
          personalized?.link ?? link,
        );
      } catch (e) {
        console.error("FCM send error", e instanceof Error ? e.message : e);
      }
      if (ok) {
        sent++;
      } else {
        failed++;
        // Token is likely invalid/expired — collect for cleanup.
        deadTokens.push(token);
      }
      await new Promise((r) => setTimeout(r, 30));
    }

    // Clean up invalid tokens so we don't keep retrying them.
    if (deadTokens.length > 0) {
      await admin.from("push_tokens").delete().in("token", [...new Set(deadTokens)]);
    }

    console.log(`send-push result: sent=${sent} failed=${failed} total=${deliveries.length}`);
    return json({
      sent,
      failed,
      cleaned: deadTokens.length,
      total: deliveries.length,
    });
  } catch (e) {
    console.error("send-push fatal:", e instanceof Error ? e.message : e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
