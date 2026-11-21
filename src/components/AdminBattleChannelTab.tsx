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
    }).catch(() => { if (active) { setFailed(true); setMessage("تعذّر تحميل إعدادات الكروب. تأكد من تطبيق تحديث قاعدة البيانات ونشر الوظيفة."); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const save = async () => {
    setSaving(true); setMessage("");
    try {
      await saveBattleChannelConfig({ enabled, chat_id: chatId.trim(), invite_url: invite.trim() });
      setMessage(enabled ? "تم التحقق من صلاحيات البوت وتفعيل نشر التحدّيات بالكروب." : "تم إيقاف نشر تحدّيات جديدة بالكروب.");
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "";
      setMessage((code.includes("INVALID_GROUP_ID") || code.includes("INVALID_CHANNEL_ID")) ? "اكتب رابط الكروب العام أو @يوزره، أو معرّفه الرقمي السالب للكروب الخاص." : (code.includes("INVALID_GROUP_LINK") || code.includes("INVALID_CHANNEL_LINK")) ? "رابط الكروب لازم يكون رابط t.me صحيح." : (code.includes("BOT_GROUP_PERMISSION_REQUIRED") || code.includes("BOT_CHANNEL_PERMISSION_REQUIRED")) ? "أضف البوت للكروب واسمح له بإرسال الرسائل، أو اجعله أدمن، ثم احفظ مرة ثانية." : code.includes("GROUP_REQUIRED") ? "هذا الهدف مو كروب. اختَر كروب أو سوبركروب؛ النشر بالقنوات مو مفعّل هنا." : code.includes("GROUP_UNAVAILABLE") ? "البوت ما يگدر يوصل للكروب. تأكد من الرابط وإضافته للكروب." : "تعذّر الحفظ. تحقق من ربط بوت تميّزك بصلاحياته وإعدادات الكروب.");
    } finally { setSaving(false); }
  };
  return <section dir="rtl" className="max-w-2xl space-y-5 rounded-2xl border bg-card p-5">
    <h2 className="text-xl font-black">كروب تحدّيات تميّزك</h2>
    <p className="text-sm leading-7 text-muted-foreground">أضف @{bot} لكروب التحدّيات واسمح له بإرسال الرسائل، أو اجعله أدمن. يدعم الكروب العادي والسوبركروب. ربط البوت الموجود بالموقع يُستخدم كما هو؛ ما تحتاج تكتب توكن هنا.</p>
    {message && <p role="status" className="rounded-xl border bg-secondary p-3 text-sm leading-7">{message}</p>}
    {loading ? <p>جاري تحميل الإعدادات…</p> : failed ? <Button onClick={() => setRetry((n) => n + 1)}>إعادة تحميل الإعدادات</Button> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!saving) void save(); }}>
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={enabled} disabled={saving} onChange={(event) => setEnabled(event.target.checked)} />تفعيل النشر بكروب التحدّيات</label>
      <label className="block space-y-2 text-sm">معرّف الكروب أو اليوزر<Input dir="ltr" value={chatId} maxLength={100} placeholder="@tamayzak أو -1001234567890" disabled={saving} onChange={(event) => setChatId(event.target.value)} /></label>
      <p className="text-xs leading-6 text-muted-foreground">للكروب العام يكفي رابط الدعوة أدناه، أو اكتب @يوزره. للكروب الخاص أرسل /groupid داخل الكروب؛ البوت يرد بالمعرّف الرقمي حتى تنسخه هنا.</p>
      <label className="block space-y-2 text-sm">رابط دعوة الكروب<Input dir="ltr" value={invite} maxLength={160} placeholder="https://t.me/tamayzak" disabled={saving} onChange={(event) => setInvite(event.target.value)} /></label>
      <Button type="submit" disabled={saving || (enabled && !chatId.trim() && !invite.trim())}>{saving ? "جاري التحقق والحفظ…" : "تحقق من الربط واحفظ"}</Button>
      <p className="text-xs leading-6 text-muted-foreground">التحقق يفحص صلاحيات البوت بدون نشر رسالة تجريبية. تعطيل النشر يخفي خيار الكروب من الطلاب بعد تحديث الصفحة؛ باقي طرق التحدّي تبقى متاحة.</p>
    </form>}
  </section>;
}
