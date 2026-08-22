import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export default function InstallAppPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

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
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    setInstalling(true);
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
    setInstalling(false);
  };

  if (installed || !promptEvent) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-sm flex items-center justify-center p-5" dir="rtl">
      <section className="w-full max-w-sm rounded-3xl border border-primary/40 bg-card p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex w-14 h-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Download className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground">ثبّت تطبيق تميزك</h2>
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
      </section>
    </div>
  );
}
