import { useEffect, useState } from "react";
import { Bell, BellRing, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { enablePushNotifications, pushPermission, onPushMessage } from "@/lib/firebase";

export function PushNotificationsCard({ language }: { language: "ar" | "en" }) {
  const isAr = language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const [state, setState] = useState<NotificationPermission | "unsupported">("default");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setState(pushPermission());
    void onPushMessage((title, body) => toast(title, { description: body }));
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const token = await enablePushNotifications();
      setState(pushPermission());
      if (token) toast.success(t("Notifications enabled", "تم تفعيل التنبيهات"));
      else toast.error(t("Notifications were not allowed", "لم يتم السماح بالتنبيهات"));
    } catch {
      toast.error(t("Could not enable notifications", "تعذّر تفعيل التنبيهات"));
    } finally {
      setBusy(false);
    }
  };

  if (state === "unsupported") return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        {state === "granted" ? (
          <BellRing className="h-5 w-5 text-primary" />
        ) : state === "denied" ? (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Bell className="h-5 w-5 text-primary" />
        )}
        <h2 className="text-base font-semibold">{t("Push notifications", "تنبيهات الهاتف")}</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        {state === "granted"
          ? t(
              "This device will receive Tamayzak reminders and announcements.",
              "سيستلم هذا الجهاز تنبيهات تميزك والتذكيرات.",
            )
          : state === "denied"
            ? t(
                "Notifications are blocked in your browser settings. Allow them there to receive reminders.",
                "التنبيهات محجوبة من إعدادات المتصفح. اسمح بها من هناك لاستلام التذكيرات.",
              )
            : t(
                "Get reminders for exams, mistakes review and new features.",
                "استلم تذكيرات الامتحانات ومراجعة الأخطاء والميزات الجديدة.",
              )}
      </p>
      {state !== "denied" && (
        <Button onClick={enable} disabled={busy || state === "granted"} className="w-full">
          {state === "granted"
            ? t("Enabled", "مُفعّل")
            : busy
              ? t("Enabling…", "جارٍ التفعيل…")
              : t("Enable notifications", "تفعيل التنبيهات")}
        </Button>
      )}
    </Card>
  );
}

export default PushNotificationsCard;
