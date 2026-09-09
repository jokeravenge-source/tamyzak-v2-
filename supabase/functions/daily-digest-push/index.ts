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

type Todo = { id?: string; text?: string; done?: boolean; day?: string };

const DAYS = [
  { key: "Sunday", alt: ["الأحد", "الاحد", "sunday"] },
  { key: "Monday", alt: ["الإثنين", "الاثنين", "monday"] },
  { key: "Tuesday", alt: ["الثلاثاء", "tuesday"] },
  { key: "Wednesday", alt: ["الأربعاء", "الاربعاء", "wednesday"] },
  { key: "Thursday", alt: ["الخميس", "thursday"] },
  { key: "Friday", alt: ["الجمعة", "friday"] },
  { key: "Saturday", alt: ["السبت", "saturday"] },
];

function normalizeDay(day?: string): string | null {
  if (!day) return null;
  const v = day.trim().toLowerCase();
  const hit = DAYS.find((d) => d.key.toLowerCase() === v || d.alt.includes(v));
  return hit ? hit.key : null;
}

/** Baghdad (UTC+3) helpers. */
function baghdadNow() {
  return new Date(Date.now() + 3 * 3600 * 1000);
}
function baghdadTodayKey() {
  return DAYS[baghdadNow().getUTCDay()].key;
}
/** UTC instant of Baghdad midnight for the current Baghdad day. */
function baghdadDayStartUtc(): string {
  const b = baghdadNow();
  return new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()) - 3 * 3600 * 1000)
    .toISOString();
}

function studyText(seconds: number) {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h > 0) return `${h} ساعة${m > 0 ? ` و${m} دقيقة` : ""}`;
  if (m > 0) return `${m} دقيقة`;
  return "0 دقيقة";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
  const cronToken = (req.headers.get("x-cron-token") ?? "").trim();
  const expectedCron = Deno.env.get("CRON_INTERNAL_TOKEN") ?? "";
  const authorized =
    (serviceRoleKey && bearer === serviceRoleKey) ||
    (expectedCron.length > 0 && cronToken === expectedCron);
  if (!authorized) return json({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const hour = baghdadNow().getUTCHours();
  const mode: "morning" | "evening" =
    body?.mode === "morning" || body?.mode === "evening"
      ? body.mode
      : hour < 14
      ? "morning"
      : "evening";

  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Only users with at least one registered device can receive a push.
    const { data: tokenRows, error: tokenError } = await admin
      .from("push_tokens")
      .select("user_id");
    if (tokenError) return json({ error: tokenError.message }, 500);
    const userIds = [...new Set((tokenRows ?? []).map((r: { user_id: string }) => r.user_id))];
    if (userIds.length === 0) return json({ sent: 0, reason: "no_devices" });

    const messages: Array<{ user_id: string; title: string; body: string; link: string }> = [];

    if (mode === "morning") {
      const todayKey = baghdadTodayKey();
      const { data: todoRows } = await admin
        .from("student_todos")
        .select("user_id, items")
        .in("user_id", userIds);
      const byUser = new Map<string, Todo[]>();
      for (const row of (todoRows ?? []) as Array<{ user_id: string; items: unknown }>) {
        byUser.set(row.user_id, Array.isArray(row.items) ? (row.items as Todo[]) : []);
      }

      for (const userId of userIds) {
        const items = byUser.get(userId) ?? [];
        const todays = items.filter(
          (t) => !t?.done && (normalizeDay(t?.day) === todayKey || !t?.day),
        );
        if (todays.length === 0) {
          messages.push({
            user_id: userId,
            title: "صباح الخير 🌞",
            body: "ماكو مهام مسجلة لليوم. افتح قائمة المهام وأضف خطتك حتى تبدأ يومك بترتيب!",
            link: "/todo",
          });
        } else {
          const preview = todays
            .slice(0, 3)
            .map((t) => `• ${String(t.text ?? "").slice(0, 60)}`)
            .join("\n");
          const extra = todays.length > 3 ? `\n+${todays.length - 3} مهمة أخرى` : "";
          messages.push({
            user_id: userId,
            title: `صباح الخير 🌞 عندك ${todays.length} مهمة اليوم`,
            body: `${preview}${extra}`,
            link: "/todo",
          });
        }
      }
    } else {
      const since = baghdadDayStartUtc();
      const [{ data: sessions }, { data: points }] = await Promise.all([
        admin
          .from("study_sessions")
          .select("user_id, duration_seconds")
          .gte("created_at", since)
          .in("user_id", userIds),
        admin
          .from("user_points")
          .select("user_id, points")
          .gte("created_at", since)
          .in("user_id", userIds),
      ]);

      const seconds = new Map<string, number>();
      for (const s of (sessions ?? []) as Array<{ user_id: string; duration_seconds: number }>) {
        seconds.set(s.user_id, (seconds.get(s.user_id) ?? 0) + (Number(s.duration_seconds) || 0));
      }
      const earned = new Map<string, number>();
      for (const p of (points ?? []) as Array<{ user_id: string; points: number }>) {
        earned.set(p.user_id, (earned.get(p.user_id) ?? 0) + (Number(p.points) || 0));
      }

      for (const userId of userIds) {
        const sec = seconds.get(userId) ?? 0;
        const pts = earned.get(userId) ?? 0;
        if (sec === 0 && pts === 0) {
          messages.push({
            user_id: userId,
            title: "ملخص يومك 🌙",
            body: "اليوم ما سجلت وقت دراسة ولا نقاط. خل نبدأ باچر بقوة — حتى 20 دقيقة تفرق!",
            link: "/",
          });
        } else {
          messages.push({
            user_id: userId,
            title: "ملخص يومك 🌙",
            body: `درست اليوم ${studyText(sec)} وجمعت ${pts} نقطة. استمر، تقدمك يتراكم!`,
            link: "/",
          });
        }
      }
    }

    const results: Array<Record<string, unknown>> = [];
    // Chunked so a large user base stays inside send-push limits.
    for (let i = 0; i < messages.length; i += 200) {
      const chunk = messages.slice(i, i + 200);
      const res = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: chunk }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) console.error("daily-digest-push send failed:", res.status, JSON.stringify(payload).slice(0, 300));
      results.push({ status: res.status, ...payload });
    }

    return json({ mode, recipients: messages.length, results });
  } catch (error) {
    console.error("daily-digest-push:", error instanceof Error ? error.message : error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
