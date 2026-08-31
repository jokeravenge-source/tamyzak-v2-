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

type Reminder = {
  user_id: string;
  reminder_type: "study_summary" | "flashcards_due" | "mistakes_due";
  due_count: number;
  study_seconds: number;
};

const summaryText = (seconds: number) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.round((safeSeconds % 3600) / 60);
  if (hours > 0) return `درست اليوم ${hours} ساعة${minutes > 0 ? ` و${minutes} دقيقة` : ""}. استمر، كل دقيقة تقربك من هدفك!`;
  if (minutes > 0) return `درست اليوم ${minutes} دقيقة. استمر، كل دقيقة تقربك من هدفك!`;
  return "ما سجلت وقت دراسة اليوم. باچر نبدأ بقوة ونحقق هدفنا!";
};

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
    const { data, error } = await (admin as any).rpc("claim_scheduled_study_reminders", {
      _batch_id: batchId,
      _limit: 500,
    });
    if (error) return json({ error: error.message }, 500);

    const reminders = (data ?? []) as Reminder[];
    if (reminders.length === 0) return json({ sent: 0, reason: "no_due_reminders" });

    const messages = reminders.map((reminder) => {
      if (reminder.reminder_type === "study_summary") {
        return {
          user_id: reminder.user_id,
          title: "حصيلة دراستك اليوم 📚",
          body: summaryText(reminder.study_seconds),
          link: "/",
        };
      }
      if (reminder.reminder_type === "flashcards_due") {
        return {
          user_id: reminder.user_id,
          title: `عندك ${reminder.due_count} بطاقة للمراجعة 🧠`,
          body: "راجع بطاقاتك هسه قبل لا تتراكم، وخلي معلوماتك ثابتة.",
          link: "/",
        };
      }
      return {
        user_id: reminder.user_id,
        title: `عندك ${reminder.due_count} أخطاء جاهزة للحل ✍️`,
        body: "ارجع حل أخطاءك وحوّل نقاط ضعفك إلى نقاط قوة.",
        link: "/",
      };
    });

    const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });
    const pushResult = await pushResponse.json().catch(() => ({}));
    if (!pushResponse.ok) {
      await (admin as any).from("scheduled_push_log").delete().eq("batch_id", batchId);
      return json({ error: "push_delivery_failed", details: pushResult }, 502);
    }

    await (admin as any)
      .from("scheduled_push_log")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("batch_id", batchId);

    return json({ reminders: reminders.length, ...pushResult });
  } catch (error) {
    await (admin as any).from("scheduled_push_log").delete().eq("batch_id", batchId);
    console.error("study-reminders-push:", error instanceof Error ? error.message : error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
