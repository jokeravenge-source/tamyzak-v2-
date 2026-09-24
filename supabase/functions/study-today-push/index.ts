import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!serviceRoleKey || bearer !== serviceRoleKey) return json({ error: "Unauthorized" }, 401);
  if (!supabaseUrl) return json({ error: "SUPABASE_URL is missing" }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const batchId = crypto.randomUUID();
  try {
    const { data, error } = await (admin as any).rpc("claim_study_today_push", {
      _batch_id: batchId,
      _limit: 300,
    });
    if (error) return json({ error: error.message }, 500);
    const userIds = ((data ?? []) as Array<{ user_id: string }>).map(({ user_id }) => user_id);
    if (userIds.length === 0) return json({ sent: 0, reason: "no_due_recipients" });

    const response = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "خطة دراستك اليوم 📚",
        body: "افتح تميزك وشوف شنو مقترح إلك اليوم! Open Tamayzak to see what we suggest for you today.",
        link: "/?menu=basics&study=today",
        target_user_ids: userIds,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`send-push returned ${response.status}: ${JSON.stringify(result).slice(0, 300)}`);

    const sentIds = Array.isArray(result.sent_user_ids) ? result.sent_user_ids as string[] : [];
    const failedIds = userIds.filter((id) => !sentIds.includes(id));
    if (sentIds.length) {
      const { error: updateError } = await admin.from("scheduled_push_log")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("batch_id", batchId).in("user_id", sentIds);
      if (updateError) throw updateError;
    }
    if (failedIds.length) {
      const { error: deleteError } = await admin.from("scheduled_push_log")
        .delete().eq("batch_id", batchId).in("user_id", failedIds);
      if (deleteError) throw deleteError;
    }
    return json({ recipients: userIds.length, sent: sentIds.length, failed: failedIds.length });
  } catch (error) {
    await admin.from("scheduled_push_log").delete().eq("batch_id", batchId).eq("status", "pending");
    console.error("study-today-push:", error instanceof Error ? error.message : error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
