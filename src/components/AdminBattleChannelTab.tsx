import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { getBattleChannelAdminConfig, saveBattleChannelConfig } from "@/lib/battleChannel";

export default function AdminBattleChannelTab() {
  const [enabled, setEnabled] = useState(false);
  const [chatId, setChatId] = useState("");
  const [invite, setInvite] = useState("");
  const [bot, setBot] = useState("sovforcejoin_bot");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setMessage(""); setFailed(false);
    void getBattleChannelAdminConfig().then((value) => {
      if (!active) return;
      setEnabled(value.enabled); setChatId(value.chat_id); setInvite(value.invite_url); setBot(value.bot_username);
    }).catch(() => { if (active) { setFailed(true); setMessage("تعذّر تحميل إعدادات القناة. تأكد من تطبيق تحديث قاعدة البيانات ونشر الوظيفة."); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const save = async () => {
    setSaving(true); setMessage("");
    try {
      await saveBattleChannelConfig({ enabled, chat_id: chatId.trim(), invite_url: invite.trim() });
      setMessage(enabled ? "تم التحقق من صلاحيات البوت وتفعيل نشر التحدّيات بالقناة." : "تم إيقاف نشر تحدّيات جديدة بالقناة.");
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "";
      setMessage(code.includes("INVALID_CHANNEL_ID") ? "اكتب معرّف القناة الخاص، بصيغة -100…" : code.includes("INVALID_CHANNEL_LINK") ? "رابط القناة لازم يكون رابط t.me صحيح." : code.includes("BOT_CHANNEL_PERMISSION_REQUIRED") ? "أضف البوت أدمن بالقناة وفعّل صلاحية نشر الرسائل، ثم احفظ مرة ثانية." : "تعذّر الحفظ. تحقق من ربط بوت تميّزك بصلاحياته وإعدادات القناة.");
    } finally { setSaving(false); }
  };
  return <section dir="rtl" className="max-w-2xl space-y-5 rounded-2xl border bg-card p-5">
    <h2 className="text-xl font-black">قناة تحدّيات تميّزك</h2>
    <p className="text-sm leading-7 text-muted-foreground">أنشئ قناة خاصة بتليگرام، وأضف @{bot} أدمن مع صلاحية نشر وتعديل رسائله. ربط البوت الموجود بالموقع يُستخدم كما هو؛ ما تحتاج تكتب توكن هنا.</p>
    {message && <p role="status" className="rounded-xl border bg-secondary p-3 text-sm leading-7">{message}</p>}
    {loading ? <p>جاري تحميل الإعدادات…</p> : failed ? <Button onClick={() => setRetry((n) => n + 1)}>إعادة تحميل الإعدادات</Button> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!saving) void save(); }}>
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={enabled} disabled={saving} onChange={(event) => setEnabled(event.target.checked)} />تفعيل النشر بقناة التحدّيات</label>
      <label className="block space-y-2 text-sm">معرّف القناة الخاص<Input dir="ltr" value={chatId} maxLength={32} placeholder="-1001234567890" disabled={saving} onChange={(event) => setChatId(event.target.value)} /></label>
      <p className="text-xs leading-6 text-muted-foreground">المعرّف الرقمي غير رابط الدعوة. أعد توجيه أي منشور من القناة إلى @{bot} برسالة خاصة؛ البوت يرد عليك بالمعرّف حتى تنسخه هنا. إذا إعادة التوجيه محمية، خذ المعرّف من إعدادات القناة المرتبطة بالمشروع.</p>
      <label className="block space-y-2 text-sm">رابط دعوة القناة<Input dir="ltr" value={invite} maxLength={160} placeholder="https://t.me/+…" disabled={saving} onChange={(event) => setInvite(event.target.value)} /></label>
      <Button type="submit" disabled={saving || (enabled && !chatId.trim())}>{saving ? "جاري التحقق والحفظ…" : "تحقق من الربط واحفظ"}</Button>
      <p className="text-xs leading-6 text-muted-foreground">التحقق يفحص صلاحيات البوت بدون نشر رسالة تجريبية. تعطيل النشر يخفي خيار القناة من الطلاب بعد تحديث الصفحة؛ باقي طرق التحدّي تبقى متاحة.</p>
    </form>}
  </section>;
}
