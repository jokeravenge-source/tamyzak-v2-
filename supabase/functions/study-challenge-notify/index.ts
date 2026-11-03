import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";
import { protect } from "../_shared/guard.ts";

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const guard = await protect(req, "study-challenge-notify", { max: 10, windowSeconds: 60, maxBytes: 2048 });
  if (!guard.ok) return json({ error: guard.error }, guard.status);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey || !anonKey) return json({ error: "Server configuration is missing" }, 500);

    const authorization = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: auth, error: authError } = await userClient.auth.getUser();
    if (authError || !auth.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const challengeId = String(body.challengeId ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(challengeId)) return json({ error: "Invalid challenge" }, 400);

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: challenge, error: challengeError } = await admin.from("study_challenges")
      .select("id,title,creator_id,ends_at,status").eq("id", challengeId).maybeSingle();
    if (challengeError) return json({ error: challengeError.message }, 500);
    if (!challenge || challenge.creator_id !== auth.user.id) return json({ error: "Challenge not found" }, 404);
    if (challenge.status !== "active" || new Date(challenge.ends_at).getTime() <= Date.now()) return json({ error: "Challenge is not active" }, 409);

    const [{ data: creator }, { data: members, error: memberError }] = await Promise.all([
      admin.from("profiles").select("display_name").eq("user_id", auth.user.id).maybeSingle(),
      admin.from("study_challenge_members").select("user_id").eq("challenge_id", challengeId).eq("status", "pending"),
    ]);
    if (memberError) return json({ error: memberError.message }, 500);
    const inviteeIds = [...new Set((members ?? []).map((member) => String(member.user_id)).filter((id) => id !== auth.user.id))];
    if (inviteeIds.length === 0) return json({ sent: 0, reason: "no_pending_invitees" });

    const creatorName = String(creator?.display_name ?? "A friend").slice(0, 80);
    const challengeTitle = String(challenge.title).slice(0, 80);
    const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New study challenge ⚔️ | تحدي دراسة جديد",
        body: `${creatorName} invited you to “${challengeTitle}”. Open Tamayzak to accept or decline. | ${creatorName} دعاك لتحدي «${challengeTitle}». افتح تميزك للقبول أو الرفض.`,
        link: "/?menu=sessions",
        target_user_ids: inviteeIds,
        message_id: `study-challenge-${challengeId}`,
        replace_existing: true,
      }),
    });
    const result = await pushResponse.json().catch(() => ({}));
    if (!pushResponse.ok) return json({ error: "Push delivery failed", details: result }, 502);
    return json({ recipients: inviteeIds.length, ...result });
  } catch (error) {
    console.error("study-challenge-notify:", error instanceof Error ? error.message : error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
