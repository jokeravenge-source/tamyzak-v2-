import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import FeatureIcon3D from "@/components/ui/FeatureIcon3D";
import { Button } from "@/components/ui/button";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";
import { describeStudyStartTopics, isStudyStartSubject, normalizeStudyFocus, STUDY_FOCUS_LIMIT, STUDY_START_KEY } from "@/lib/studyStart";
import { toast } from "sonner";

type Props = { subject: string; language: AppLanguage; onStart: () => void };

export default function StudyStartIntake({ subject, language, onStart }: Props) {
  const ar = language === "ar";
  const options = useMemo(() => describeStudyStartTopics(subject, language), [subject, language]);
  const selectionEdited = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const panelId = useId();

  useEffect(() => {
    selectionEdited.current = false;
    setSelected([]); setQuery(""); setExpanded(false);
  }, [subject]);
  useEffect(() => {
    if (!expanded || !isStudyStartSubject(subject)) return;
    let disposed = false;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || disposed) return;
      const { data: row } = await supabase.from("student_study_focus").select("topic_keys")
        .eq("user_id", data.user.id).eq("subject", subject).maybeSingle();
      if (!disposed && !selectionEdited.current && row) setSelected(normalizeStudyFocus(subject, row.topic_keys));
    }).catch(() => {});
    return () => { disposed = true; };
  }, [expanded, subject]);

  if (!isStudyStartSubject(subject)) return null;

  const launch = async (requested: string[]) => {
    if (saving) return;
    const topicKeys = normalizeStudyFocus(subject, requested);
    setSaving(true);
    try {
      if (topicKeys.length) {
        try {
          const { data } = await supabase.auth.getUser();
          if (!data.user) throw new Error("no current user");
          const { error } = await supabase.from("student_study_focus").upsert({
            user_id: data.user.id, subject, topic_keys: topicKeys, updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,subject" });
          if (error) throw error;
        } catch {
          toast.warning(ar ? "ما انحفظت المواضيع بحسابك، بس تگدر تتدرّب عليها هسه." : "Topics could not be saved to your account, but you can still practise them now.");
        }
      }
      sessionStorage.setItem(STUDY_START_KEY, JSON.stringify({ subject, topicKeys }));
      onStart();
    } catch {
      toast.error(ar ? "ما قدرنا نفتح التدريب. جرّب مرة ثانية." : "Couldn't open practice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const search = query.trim().toLocaleLowerCase();
  const matches = options.filter(option => [option.title, option.group].some(text => text.toLocaleLowerCase().includes(search)));
  return <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm">
    <div data-home-tone="continue" className="home-illustrated-card group flex items-center justify-between gap-3 border-b p-4">
      <div className="min-w-0 flex-1">
        <p className="home-card-muted text-xs font-bold">{ar ? "ابدأ الدراسة" : "Start studying"}</p>
        <h2 className="mt-1 text-base font-black leading-snug sm:text-lg">{ar ? "أول مرة تدرس هاي المادة؟" : "New to studying this subject?"}</h2>
        <p className="home-card-muted mt-1 text-xs leading-relaxed sm:text-sm">{ar ? "ابدأ بتدريب قصير من ٥ أسئلة متاحة، أو اختار المواضيع اللي تحسها صعبة عليك." : "Start with up to five available questions, or choose the topics you find difficult."}</p>
      </div>
      <span className="block w-16 shrink-0 p-1 sm:w-20"><FeatureIcon3D icon={BookOpen} /></span>
    </div>
    <div className="p-4">
    <div className="mt-3 flex flex-wrap gap-2">
      <Button type="button" disabled={saving} onClick={() => void launch([])}>{ar ? "ابدأ بـ٥ أسئلة" : "Start five questions"}</Button>
      {options.length > 0 && <Button type="button" variant="outline" disabled={saving} aria-expanded={expanded} aria-controls={panelId}
        onClick={() => setExpanded(value => !value)}>{ar ? "اختار المواضيع الصعبة" : "Choose difficult topics"}<ChevronDown className="ms-1 size-4" aria-hidden="true" /></Button>}
    </div>
    {expanded && <fieldset id={panelId} className="mt-4 min-w-0 space-y-2">
      <legend className="text-sm font-semibold">{ar ? "مواضيع تختارها بنفسك" : "Topics you choose yourself"}</legend>
      <p className="text-xs text-muted-foreground">{ar ? "اختيارك ينحفظ بحسابك، وهو غير الأخطاء اللي يسجلها التدريب." : "Your choices are saved to your account, separately from recorded mistakes."}</p>
      <label className="block text-sm font-medium">{ar ? "ابحث عن موضوع" : "Find a topic"}
        <input className="mt-1 block min-h-11 w-full rounded-lg border border-input bg-background px-3" value={query} disabled={saving} onChange={event => setQuery(event.target.value)} />
      </label>
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {matches.map(option => <label key={option.key} className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-muted/50">
          <input type="checkbox" className="size-4 shrink-0 accent-primary" checked={selected.includes(option.key)}
            disabled={saving || (selected.length >= STUDY_FOCUS_LIMIT && !selected.includes(option.key))}
            onChange={event => { selectionEdited.current = true; const checked = event.target.checked; setSelected(current => checked ? [...current, option.key] : current.filter(key => key !== option.key)); }} />
          <span className="min-w-0">{option.title}{option.group && <span className="block text-xs text-muted-foreground">{option.group}</span>}</span>
        </label>)}
        {!matches.length && <p className="p-2 text-sm text-muted-foreground">{ar ? "ما لكينا موضوع مطابق." : "No matching topics."}</p>}
      </div>
      <Button type="button" variant="secondary" disabled={saving || !selected.length} onClick={() => void launch(selected)}>
        {ar ? "احفظ اختياري وابدأ التدريب" : "Save choices and start practice"}
      </Button>
    </fieldset>}
    </div>
  </section>;
}
