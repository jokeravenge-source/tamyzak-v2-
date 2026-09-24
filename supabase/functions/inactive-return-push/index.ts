import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-token",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const STAGES = [
  {
    stage: "3d",
    title: "وينك؟ 📚",
    body: "صارلك 3 أيام ما فتحت تميزك. افتح الموقع وابدأ دراستك هسه — كل يوم يفرق!",
  },
  {
    stage: "7d",
    title: "اشتقنالك 💜",
    body: "صارلك أسبوع غايب! اشتقنالك، وأكو هواية تغييرات وميزات جديدة نريدك تشوفها. ارجع وشوف!",
  },
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
  const cronToken = (req.headers.get("x-cron-token") ?? "").trim();
  const expectedCron = Deno.env.get("CRON_INTERNAL_TOKEN") ?? "";
  const authorized = (serviceRoleKey && bearer === serviceRoleKey) ||
    (expectedCron.length > 0 && cronToken === expectedCron);
  if (!authorized) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const results: Record<string, unknown> = {};

  for (const s of STAGES) {
    const batchId = crypto.randomUUID();
    try {
      const { data, error } = await (admin as any).rpc("claim_inactive_push_recipients_stage", {
        _batch_id: batchId, _stage: s.stage, _limit: 500,
      });
      if (error) { results[s.stage] = { error: error.message }; continue; }
      const userIds = ((data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id);
      if (userIds.length === 0) { results[s.stage] = { sent: 0 }; continue; }

      const res = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: s.title, body: s.body, link: "/", target_user_ids: userIds }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        await (admin as any).from("inactivity_push_log").delete().eq("batch_id", batchId);
        results[s.stage] = { error: "push_delivery_failed" };
        continue;
      }
      const sent: string[] = Array.isArray(out?.sent_user_ids) ? out.sent_user_ids.map(String) : [];
      const failed = userIds.filter((id) => !sent.includes(id));
      if (sent.length) {
        await (admin as any).from("inactivity_push_log")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("batch_id", batchId).in("user_id", sent);
      }
      if (failed.length) {
        await (admin as any).from("inactivity_push_log").delete().eq("batch_id", batchId).in("user_id", failed);
      }
      results[s.stage] = { eligible: userIds.length, delivered: sent.length };
    } catch (e) {
      await (admin as any).from("inactivity_push_log").delete().eq("batch_id", batchId);
      results[s.stage] = { error: e instanceof Error ? e.message : String(e) };
    }
  }
  return json(results);
});
