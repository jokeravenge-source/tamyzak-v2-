import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, FilePlus2, Layers3, PenLine } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import BiologySketchCanvas from "@/components/BiologySketchCanvas";
import { BLANK_BIOLOGY_SKETCH, BIOLOGY_SKETCH_CHAPTERS, getBiologySketch, getBiologySketchSections } from "@/data/biologySketches";
import { supabase } from "@/integrations/supabase/client";

const copy = {
  ar: {
    title: "الرسم الحر بالأحياء", badge: "سكتش الأحياء", back: "رجوع",
    intro: "ارسم بإصبعك على ورقة سكتش، أو اختار مخطط أحياء وأشّر عليه بخط إيدك.",
    blank: "ارسم من الصفر", template: "اختار مخططاً للتأشير", pick: "خلفية السكتش", chapter: "الفصل",
    paper: "ورقة فارغة", selected: "السكتش الحالي", tip: "كل جزء إله محاولته المحفوظة؛ تگدر تبدّل بين الأجزاء وترجع تكمل رسمك.",
    parts: "أجزاء الرسمة", part: "الجزء", of: "من", previousPart: "الجزء السابق", nextPart: "الجزء التالي",
    partTip: "قسّمنا الرسمة إلى خطوات قصيرة. الجزء الحالي واضح، وبقية الرسمة تظهر بخط خفيف حتى تعرف مكانه.",
    opening: "جارٍ فتح مساحة الرسم…", ownerError: "تعذّر فتح مساحة الرسم لحسابك. جرّب مرّة ثانية.", retry: "إعادة المحاولة",
  },
  en: {
    title: "Biology Sketchpad", badge: "Biology sketches", back: "Back",
    intro: "Draw with your finger on sketch paper, or choose a biology outline and add your own marks.",
    blank: "Draw from scratch", template: "Choose a biology outline", pick: "Sketch background", chapter: "Chapter",
    paper: "Blank paper", selected: "Current sketch", tip: "Each part keeps its own attempt. Switch between parts and return to continue drawing.",
    parts: "Drawing parts", part: "Part", of: "of", previousPart: "Previous part", nextPart: "Next part",
    partTip: "The drawing is split into short steps. The current part is clear while the rest stays faint for context.",
    opening: "Opening your sketchpad…", ownerError: "Could not open your account’s sketchpad. Please retry.", retry: "Retry",
  },
} as const;

export default function BiologySketchpad({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const t = copy[language];
  const [sketchId, setSketchId] = useState(BLANK_BIOLOGY_SKETCH.id);
  const [owner, setOwner] = useState<string | null>(null);
  const [ownerError, setOwnerError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [partIndex, setPartIndex] = useState(0);
  const sketch = getBiologySketch(sketchId);
  const sections = useMemo(() => getBiologySketchSections(sketchId), [sketchId]);
  const safePartIndex = Math.min(partIndex, sections.length - 1);
  const activeSection = sections[safePartIndex] ?? sketch;
  const blank = sketchId === BLANK_BIOLOGY_SKETCH.id;

  const chooseSketch = (id: string) => {
    setSketchId(id);
    setPartIndex(0);
  };

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
            <button type="button" aria-pressed={blank} onClick={() => chooseSketch(BLANK_BIOLOGY_SKETCH.id)}
              className={"hidden min-h-14 w-full lg:flex items-center gap-3 rounded-2xl border p-3 text-start text-sm font-semibold " + (blank ? "border-primary bg-primary/10 text-primary" : "border-border bg-background")}>
              <FilePlus2 className="h-6 w-6 shrink-0" aria-hidden="true" />{t.blank}
            </button>
            <label className="block space-y-2 text-sm font-semibold">
              <span>{t.template}</span>
              <select value={sketchId} onChange={(event) => chooseSketch(event.target.value)}
                className="min-h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm text-foreground">
                <option value={BLANK_BIOLOGY_SKETCH.id}>{t.paper}</option>
                {BIOLOGY_SKETCH_CHAPTERS.map((group) => <optgroup key={group.chapter} label={`${t.chapter} ${group.chapter}`}>
                  {group.sketches.map((item) => <option key={item.id} value={item.id}>{item.title[language]}</option>)}
                </optgroup>)}
              </select>
            </label>
            {!blank && <>
              <div className="space-y-3 rounded-2xl border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-bold"><Layers3 className="h-4 w-4 text-primary" aria-hidden="true" />{t.parts}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{safePartIndex + 1} {t.of} {sections.length}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-3" role="tablist" aria-label={t.parts}>
                  {sections.map((section, index) => <button key={section.id} type="button" role="tab" aria-selected={index === safePartIndex}
                    onClick={() => setPartIndex(index)}
                    className={"min-h-11 rounded-xl border px-2 text-xs font-bold transition " + (index === safePartIndex ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>
                    {t.part} {index + 1}
                  </button>)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={safePartIndex === 0} onClick={() => setPartIndex((value) => Math.max(0, value - 1))}
                    className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border border-border px-2 text-xs font-semibold disabled:opacity-40">
                    <ChevronRight className={"h-4 w-4 " + (language === "en" ? "rotate-180" : "")} aria-hidden="true" />{t.previousPart}
                  </button>
                  <button type="button" disabled={safePartIndex === sections.length - 1} onClick={() => setPartIndex((value) => Math.min(sections.length - 1, value + 1))}
                    className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border border-border px-2 text-xs font-semibold disabled:opacity-40">
                    {t.nextPart}<ChevronLeft className={"h-4 w-4 " + (language === "en" ? "rotate-180" : "")} aria-hidden="true" />
                  </button>
                </div>
                <p className="text-xs leading-6 text-muted-foreground">{t.partTip}</p>
              </div>
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white p-2 lg:block">
                <svg viewBox="0 0 100 75" className="h-36 w-full" aria-hidden="true">{activeSection.art}</svg>
              </div>
            </>}
            <p className="hidden text-xs leading-6 text-muted-foreground lg:block">{t.tip}</p>
          </aside>
          <div className="min-w-0">
            {owner ? <BiologySketchCanvas key={owner + ":" + activeSection.id} diagram={activeSection} language={language} ownerId={owner} /> : (
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
