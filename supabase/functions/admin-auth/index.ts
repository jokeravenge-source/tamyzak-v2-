import { protect } from "../_shared/guard.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Admin credentials are loaded from the ADMIN_CREDENTIALS_JSON secret.
// Never hardcode credentials in source. Rotate by updating the secret.
function loadAdminCredentials(): Record<string, string> {
  const raw = Deno.env.get("ADMIN_CREDENTIALS_JSON") ?? "";
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string") out[k.trim().toLowerCase()] = v;
      }
      return out;
    }
  } catch (_e) { /* ignore */ }
  return {};
}

const FLASHCARD_ADMIN_EMAILS = new Set(["dania28hanna@gmail.com"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const guard = await protect(req, "admin-auth", { max: 5, windowSeconds: 60 });
  if (!guard.ok) return new Response(JSON.stringify({ error: guard.error }), { status: guard.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const email = rawEmail.trim().toLowerCase();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "invalid_credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isFlashcardAdmin = FLASHCARD_ADMIN_EMAILS.has(email);
    let userId: string | null = null;

    if (isFlashcardAdmin) {
      // Restricted flashcard admins authenticate against their existing Supabase
      // account. Their password is never stored in source or edge-function secrets.
      const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (verifyRes.ok) userId = verifyData?.user?.id ?? null;
    } else {
      const credentials = loadAdminCredentials();
      const expected = credentials[email];
      if (expected === password) userId = "provision-admin";
    }

    if (!userId) {
      // Small artificial delay to slow brute force
      await new Promise((r) => setTimeout(r, 400));
      return new Response(JSON.stringify({ error: "invalid_credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Full admins are provisioned from the protected credential secret. Restricted
    // flashcard admins already proved ownership of an existing Supabase account.
    if (!isFlashcardAdmin) {
      userId = null;
      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, email_confirm: true }),
      });
      const createData = await createRes.json().catch(() => ({}));
      userId = createData?.id ?? null;

      if (!userId) {
        // User likely exists — look it up and force password
        let page = 1;
        while (!userId && page <= 50) {
          const listRes = await fetch(
            `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`,
            { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
          );
          const listData = await listRes.json();
          const users: any[] = listData?.users ?? [];
          if (users.length === 0) break;
          const found = users.find((u: any) => u.email?.toLowerCase() === email);
          if (found) { userId = found.id; break; }
          page += 1;
        }
        if (userId) {
          await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
            method: "PUT",
            headers: {
              apikey: SERVICE_ROLE,
              Authorization: `Bearer ${SERVICE_ROLE}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password, email_confirm: true }),
          });
        }
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "provision_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Restricted accounts receive the least-privileged database role. The UI and
    // RLS policies expose only flashcard management to moderators.
    const role = isFlashcardAdmin ? "moderator" : "admin";
    if (isFlashcardAdmin) {
      await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&role=eq.admin`, {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
        },
      });
    }
    await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify({ user_id: userId, role }),
    });

    return new Response(JSON.stringify({ ok: true, email, scope: isFlashcardAdmin ? "flashcards" : "all" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
