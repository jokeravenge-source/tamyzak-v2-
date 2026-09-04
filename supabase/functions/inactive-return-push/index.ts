import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
  if (!serviceRoleKey || bearer !== serviceRoleKey) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const batchId = crypto.randomUUID();

  try {
    // The SQL function atomically claims each inactive user, which prevents
    // duplicate reminders if the scheduler is invoked more than once.
    const { data, error } = await (admin as any).rpc("claim_inactive_push_recipients", {
      _batch_id: batchId,
      _limit: 500,
    });
    if (error) return json({ error: error.message }, 500);

    const recipients = (data ?? []) as Array<{ user_id: string }>;
    const userIds = recipients.map((row) => row.user_id);
    if (userIds.length === 0) return json({ sent: 0, reason: "no_eligible_users" });

    const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "اشتقنالك 💜",
        body: "صارلك أكثر من 24 ساعة ما فتحت تميزك. اشتقنالك — ارجع وكمل تقدمك، مكانك محفوظ!",
        link: "/",
        target_user_ids: userIds,
      }),
    });
    const pushResult = await pushResponse.json().catch(() => ({}));
    if (!pushResponse.ok) {
      await (admin as any).from("inactivity_push_log").delete().eq("batch_id", batchId);
      return json({ error: "push_delivery_failed", details: pushResult }, 502);
    }

    const sentUserIds = Array.isArray(pushResult?.sent_user_ids)
      ? pushResult.sent_user_ids.map(String)
      : [];
    const failedUserIds = userIds.filter((userId) => !sentUserIds.includes(userId));

    if (sentUserIds.length > 0) {
      await (admin as any)
        .from("inactivity_push_log")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("batch_id", batchId)
        .in("user_id", sentUserIds);
    }
    // Failed/no-token users must be eligible for the next hourly retry.
    if (failedUserIds.length > 0) {
      await (admin as any)
        .from("inactivity_push_log")
        .delete()
        .eq("batch_id", batchId)
        .in("user_id", failedUserIds);
    }

    return json({
      eligible_users: userIds.length,
      delivered_users: sentUserIds.length,
      retry_users: failedUserIds.length,
      ...pushResult,
    });
  } catch (error) {
    await (admin as any).from("inactivity_push_log").delete().eq("batch_id", batchId);
    console.error("inactive-return-push:", error instanceof Error ? error.message : error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
