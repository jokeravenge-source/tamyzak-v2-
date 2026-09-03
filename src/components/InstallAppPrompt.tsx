import { useEffect, useState } from "react";
import { Download, MoreHorizontal, Share, SquarePlus } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isSafari = () =>
  /Safari/i.test(navigator.userAgent) &&
  !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);

export default function InstallAppPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [ios] = useState(() => isIOS());
  const [safari] = useState(() => isSafari());

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("pageshow", onInstalledCheck);
    document.addEventListener("visibilitychange", onInstalledCheck);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("pageshow", onInstalledCheck);
      document.removeEventListener("visibilitychange", onInstalledCheck);
    };
  }, []);

  function onInstalledCheck() {
    if (isStandalone()) setInstalled(true);
  }

  const install = async () => {
    if (!promptEvent) return;
    setInstalling(true);
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
    setInstalling(false);
  };

  if (installed || (!ios && !promptEvent)) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-sm flex items-center justify-center p-5" dir="rtl">
      <section className="w-full max-w-sm rounded-3xl border border-primary/40 bg-card p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex w-14 h-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          {ios ? <Share className="w-7 h-7" /> : <Download className="w-7 h-7" />}
        </div>
        <h2 className="text-xl font-bold text-foreground">ثبّت تطبيق تميزك</h2>
        {ios ? (
          <>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              حتى تعمل التنبيهات على الآيفون، لازم تضيف تميزك إلى الشاشة الرئيسية.
            </p>
            <div className="mt-5 space-y-3 text-start">
              {!safari && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                  <MoreHorizontal className="h-5 w-5 shrink-0 text-amber-500" />
                  <span>افتح هذه الصفحة في Safari أولاً.</span>
                </div>
              )}
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3 text-sm">
                <Share className="h-5 w-5 shrink-0 text-primary" />
                <span><strong>1.</strong> اضغط زر المشاركة بأسفل Safari.</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3 text-sm">
                <SquarePlus className="h-5 w-5 shrink-0 text-primary" />
                <span><strong>2.</strong> اختر «إضافة إلى الشاشة الرئيسية».</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3 text-sm">
                <Download className="h-5 w-5 shrink-0 text-primary" />
                <span><strong>3.</strong> اضغط «إضافة»، ثم افتح تميزك من الأيقونة.</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ثبّت التطبيق للوصول إليه بسرعة من الشاشة الرئيسية.
            </p>
            <button
              type="button"
              onClick={install}
              disabled={installing}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {installing ? "جارٍ فتح التثبيت..." : "تثبيت التطبيق"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
