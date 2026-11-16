import { useEffect, useState } from "react";
import { ArrowLeft, FilePlus2, PenLine } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import BiologySketchCanvas from "@/components/BiologySketchCanvas";
import { BLANK_BIOLOGY_SKETCH, BIOLOGY_SKETCH_CHAPTERS, getBiologySketch } from "@/data/biologySketches";
import { supabase } from "@/integrations/supabase/client";

const copy = {
  ar: {
    title: "الرسم الحر بالأحياء", badge: "سكتش الأحياء", back: "رجوع",
    intro: "ارسم بإصبعك على ورقة سكتش، أو اختار مخطط أحياء وأشّر عليه بخط إيدك.",
    blank: "ارسم من الصفر", template: "اختار مخططاً للتأشير", pick: "خلفية السكتش", chapter: "الفصل",
    paper: "ورقة فارغة", selected: "السكتش الحالي", tip: "كل ورقة إلها محاولتها المحفوظة؛ تگدر تبدّل بينها وترجع تكمل رسمك.",
    opening: "جارٍ فتح مساحة الرسم…", ownerError: "تعذّر فتح مساحة الرسم لحسابك. جرّب مرّة ثانية.", retry: "إعادة المحاولة",
  },
  en: {
    title: "Biology Sketchpad", badge: "Biology sketches", back: "Back",
    intro: "Draw with your finger on sketch paper, or choose a biology outline and add your own marks.",
    blank: "Draw from scratch", template: "Choose a biology outline", pick: "Sketch background", chapter: "Chapter",
    paper: "Blank paper", selected: "Current sketch", tip: "Each paper keeps its own attempt. Switch between sketches and return to continue drawing.",
    opening: "Opening your sketchpad…", ownerError: "Could not open your account’s sketchpad. Please retry.", retry: "Retry",
  },
} as const;

export default function BiologySketchpad({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const t = copy[language];
  const [sketchId, setSketchId] = useState(BLANK_BIOLOGY_SKETCH.id);
  const [owner, setOwner] = useState<string | null>(null);
  const [ownerError, setOwnerError] = useState(false);
  const [retry, setRetry] = useState(0);
  const sketch = getBiologySketch(sketchId);
  const blank = sketchId === BLANK_BIOLOGY_SKETCH.id;

  useEffect(() => {
    let live = true, revision = 0;
    setOwner(null); setOwnerError(false);
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      revision++;
      if (live) { setOwner(session?.user?.id ? "user:" + session.user.id : "guest"); setOwnerError(false); }
    });
    const initialRevision = revision;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!live || revision !== initialRevision) return;
      if (error) { setOwnerError(true); return; }
      setOwner(data.session?.user?.id ? "user:" + data.session.user.id : "guest");
    }, () => { if (live && revision === initialRevision) setOwnerError(true); });
    return () => { live = false; listener.subscription.unsubscribe(); };
  }, [retry]);

  return (
    <main className="min-h-screen bg-background px-3 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:px-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl space-y-6">
        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold">
          <ArrowLeft className={"h-4 w-4 " + (language === "ar" ? "rotate-180" : "")} aria-hidden="true" />{t.back}
        </button>
        <header className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"><PenLine className="h-4 w-4" aria-hidden="true" />{t.badge}</span>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{t.title}</h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">{t.intro}</p>
        </header>
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-4 rounded-3xl border border-border bg-card p-4">
            <h2 className="hidden text-base font-bold lg:block">{t.pick}</h2>
            <button type="button" aria-pressed={blank} onClick={() => setSketchId(BLANK_BIOLOGY_SKETCH.id)}
              className={"hidden min-h-14 w-full lg:flex items-center gap-3 rounded-2xl border p-3 text-start text-sm font-semibold " + (blank ? "border-primary bg-primary/10 text-primary" : "border-border bg-background")}>
              <FilePlus2 className="h-6 w-6 shrink-0" aria-hidden="true" />{t.blank}
            </button>
            <label className="block space-y-2 text-sm font-semibold">
              <span>{t.template}</span>
              <select value={sketchId} onChange={(event) => setSketchId(event.target.value)}
                className="min-h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm text-foreground">
                <option value={BLANK_BIOLOGY_SKETCH.id}>{t.paper}</option>
                {BIOLOGY_SKETCH_CHAPTERS.map((group) => <optgroup key={group.chapter} label={`${t.chapter} ${group.chapter}`}>
                  {group.sketches.map((item) => <option key={item.id} value={item.id}>{item.title[language]}</option>)}
                </optgroup>)}
              </select>
            </label>
            {!blank && <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white p-2 lg:block">
              <svg viewBox="0 0 100 75" className="h-36 w-full" aria-hidden="true">{sketch.art}</svg>
            </div>}
            <p className="hidden text-xs leading-6 text-muted-foreground lg:block">{t.tip}</p>
          </aside>
          <div className="min-w-0">
            {owner ? <BiologySketchCanvas key={owner + ":" + sketch.id} diagram={sketch} language={language} ownerId={owner} /> : (
              <div className="rounded-3xl border border-border bg-card p-6" role={ownerError ? "alert" : "status"}>
                <p>{ownerError ? t.ownerError : t.opening}</p>
                {ownerError && <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 min-h-11 rounded-xl border border-primary px-4 py-2">{t.retry}</button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
