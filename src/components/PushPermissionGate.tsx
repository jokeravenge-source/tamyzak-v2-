import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enablePushNotifications, pushPermission } from "@/lib/firebase";

/**
 * Blocking gate shown on first entry: the user must enable notifications
 * before using the app. Disappears once permission is granted (or blocked
 * at browser level, where we can no longer ask).
 */
export function PushPermissionGate({ language }: { language: "ar" | "en" }) {
  const isAr = language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setOpen(pushPermission() === "default");
  }, []);

  const enable = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const token = await enablePushNotifications();
      if (token || pushPermission() === "granted") setOpen(false);
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-background/95 backdrop-blur p-4"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-sm rounded-3xl border border-primary/30 bg-secondary/60 p-6 text-center space-y-4 shadow-lg">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
          <BellRing className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">
          {t("Enable notifications", "فعّل التنبيهات")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t(
            "Tamayzak needs notifications to remind you about exams, mistakes review and new features. Please allow them to continue.",
            "يحتاج تميزك للتنبيهات لتذكيرك بالامتحانات ومراجعة أخطائك والميزات الجديدة. يرجى السماح بها للمتابعة.",
          )}
        </p>
        {failed && (
          <p className="text-sm text-destructive">
            {t(
              "Notifications were not allowed. Allow them from your browser settings, then try again.",
              "لم يتم السماح بالتنبيهات. اسمح بها من إعدادات المتصفح ثم أعد المحاولة.",
            )}
          </p>
        )}
        <Button onClick={enable} disabled={busy} className="w-full">
          {busy ? t("Enabling…", "جارٍ التفعيل…") : t("Allow notifications", "السماح بالتنبيهات")}
        </Button>
      </div>
    </div>
  );
}

export default PushPermissionGate;
