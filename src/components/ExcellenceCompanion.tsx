import { useEffect, useState } from "react";
import type { AppLanguage } from "./LanguageGate";
import MutamayizMascot from "./MutamayizMascot";
import MutamayizChat from "@/pages/MutamayizChat";
/** Legacy embedded/floating entry points all mount the same account-scoped chat. */
export default function ExcellenceCompanion({ language, embedded = false }: { language: AppLanguage; embedded?: boolean }) {
  const [open, setOpen] = useState(embedded);
  useEffect(() => {
    const show = () => setOpen(true);
    const schedule = () => { sessionStorage.setItem("companion:autoSchedule", "1"); setOpen(true); };
    window.addEventListener("app:open-excellence-companion", show);
    window.addEventListener("app:welcome-excellence-companion", show);
    window.addEventListener("app:companion-auto-schedule", schedule);
    return () => {
      window.removeEventListener("app:open-excellence-companion", show);
      window.removeEventListener("app:welcome-excellence-companion", show);
      window.removeEventListener("app:companion-auto-schedule", schedule);
    };
  }, []);
  if (embedded) return <div className="h-[min(48rem,85dvh)] min-h-[32rem] overflow-hidden rounded-3xl border border-border"><MutamayizChat language={language} embedded /></div>;
  return <>
    {!open && <button onClick={() => setOpen(true)} className="fixed bottom-28 end-4 z-[55] flex min-h-12 items-center gap-2 rounded-full bg-blue-600 px-4 font-bold text-white shadow-lg"><MutamayizMascot className="size-8" />متميز</button>}
    {open && <div className="fixed inset-0 z-[92] bg-background"><MutamayizChat language={language} onBack={() => setOpen(false)} /></div>}
  </>;
}
