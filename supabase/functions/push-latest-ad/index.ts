const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

  const response = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
    method: "POST",
    headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "تحب تجرب شرح لدورة الهندسة قبل لا تسجل ؟",
      body: "استاذ احمد فتحي سوالكم شرح تجريبي للدورة وتكدرون تشوفونه قبل لا تسجلون. الحجز حينغلق خلال هاي الأيام فا استغل الفرصة وجيب المية بالهندسة ويه اشهر دورة للهندسة",
      link: "https://t.me/math_05_a/1073",
      message_id: "ann-e5bc748c-fcfa-488a-b587-be02a9f7334a",
    }),
  });
  const result = await response.json().catch(() => ({}));
  return json({ status: response.status, result }, response.ok ? 200 : 502);
});
