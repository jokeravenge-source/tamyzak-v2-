import { useCallback, useEffect, useRef, useState } from "react";
import { BookMarked, Copy, ExternalLink, Eye, EyeOff, FileText, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { malzamaUrl } from "@/lib/malazamLinks";

type Malzama = {
  id: string;
  subject: string;
  topic: string;
  name: string;
  cover_path: string;
  file_path: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

const SUBJECTS = [
  ["physics", "الفيزياء"],
  ["chemistry", "الكيمياء"],
  ["biology", "الأحياء"],
  ["math", "الرياضيات"],
  ["arabic", "اللغة العربية"],
  ["english", "اللغة الإنكليزية"],
  ["french", "اللغة الفرنسية"],
  ["islamic", "التربية الإسلامية"],
  ["revision", "المراجعة المركزة"],
] as const;

const subjectName = (code: string) => SUBJECTS.find(([value]) => value === code)?.[1] ?? code;
const safeExtension = (file: File, fallback: string) => {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return extension && extension.length <= 5 ? extension : fallback;
};

export default function AdminMalazamTab() {
  const formRef = useRef<HTMLFormElement>(null);
  const [items, setItems] = useState<Malzama[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [coverName, setCoverName] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [form, setForm] = useState({ subject: "physics", topic: "", name: "", published: true });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("malazam")
      .select("id, subject, topic, name, cover_path, file_path, is_published, sort_order, created_at")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Malzama[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const cover = data.get("cover") as File | null;
    const pdf = data.get("pdf") as File | null;
    const topic = form.topic.trim();
    const name = form.name.trim();

    if (!name || !topic || !cover?.size || !pdf?.size) {
      toast.error("اكتب الاسم والموضوع واختر الغلاف وملف الـ PDF");
      return;
    }
    if (!cover.type.startsWith("image/") || cover.size > 5 * 1024 * 1024) {
      toast.error("الغلاف يجب أن يكون صورة وحجمه أقل من 5 MB");
      return;
    }
    if (pdf.type !== "application/pdf" && !pdf.name.toLowerCase().endsWith(".pdf")) {
      toast.error("ملف الملزمة يجب أن يكون PDF");
      return;
    }

    setSaving(true);
    const key = crypto.randomUUID();
    const coverPath = `${form.subject}/${key}.${safeExtension(cover, "webp")}`;
    const filePath = `${form.subject}/${key}.pdf`;
    let coverUploaded = false;
    let fileUploaded = false;
    try {
      const { error: coverError } = await supabase.storage
        .from("malazam-covers")
        .upload(coverPath, cover, { contentType: cover.type, upsert: false });
      if (coverError) throw coverError;
      coverUploaded = true;

      const { error: fileError } = await supabase.storage
        .from("malazam-files")
        .upload(filePath, pdf, { contentType: "application/pdf", upsert: false });
      if (fileError) throw fileError;
      fileUploaded = true;

      const { error: insertError } = await supabase.from("malazam").insert({
        subject: form.subject,
        topic,
        name,
        cover_path: coverPath,
        file_path: filePath,
        is_published: form.published,
      });
      if (insertError) throw insertError;

      toast.success("تمت إضافة الملزمة");
      setForm({ subject: "physics", topic: "", name: "", published: true });
      setCoverName("");
      setPdfName("");
      formRef.current?.reset();
      await load();
    } catch (error) {
      if (fileUploaded) await supabase.storage.from("malazam-files").remove([filePath]);
      if (coverUploaded) await supabase.storage.from("malazam-covers").remove([coverPath]);
      toast.error(error instanceof Error ? error.message : "تعذرت إضافة الملزمة");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item: Malzama) => {
    setActionId(item.id);
    const { error } = await supabase.from("malazam").update({ is_published: !item.is_published }).eq("id", item.id);
    if (error) toast.error(error.message);
    else {
      setItems((current) => current.map((row) => row.id === item.id ? { ...row, is_published: !row.is_published } : row));
      toast.success(item.is_published ? "تم إخفاء الملزمة" : "تم نشر الملزمة");
    }
    setActionId(null);
  };

  const remove = async (item: Malzama) => {
    if (!window.confirm(`حذف «${item.name}» نهائياً؟`)) return;
    setActionId(item.id);
    const { error } = await supabase.from("malazam").delete().eq("id", item.id);
    if (error) {
      toast.error(error.message);
      setActionId(null);
      return;
    }
    await Promise.all([
      supabase.storage.from("malazam-covers").remove([item.cover_path]),
      supabase.storage.from("malazam-files").remove([item.file_path]),
    ]);
    setItems((current) => current.filter((row) => row.id !== item.id));
    setActionId(null);
    toast.success("تم حذف الملزمة");
  };

  const coverUrl = (path: string) => supabase.storage.from("malazam-covers").getPublicUrl(path).data.publicUrl;

  const copyLink = async (item: Malzama) => {
    try {
      await navigator.clipboard.writeText(malzamaUrl(item));
      toast.success("تم نسخ رابط الملزمة");
    } catch {
      toast.error("تعذر نسخ الرابط");
    }
  };

  return (
    <section className="space-y-6" dir="rtl">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><BookMarked className="size-5" /></span>
          <div>
            <h2 className="text-xl font-black">إضافة ملزمة</h2>
            <p className="text-sm text-muted-foreground">حدد المادة والموضوع، ثم ارفع الغلاف وملف PDF.</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm font-semibold leading-7 text-amber-950">
          حتى يعمل التحقق من الاشتراك، لازم يكون بوت تميّزك مشرفاً في قناتي <span dir="ltr">@a6th_DHS</span> و<span dir="ltr">@sad6ths</span>.
        </div>

        <form ref={formRef} onSubmit={create} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-bold">
            <span>المادة</span>
            <select value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="min-h-12 w-full rounded-xl border border-border bg-background px-3">
              {SUBJECTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-bold">
            <span>الموضوع أو الفصل</span>
            <input value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))} maxLength={120} placeholder="مثال: الفصول الرابع إلى الثامن" className="min-h-12 w-full rounded-xl border border-border bg-background px-3" />
          </label>
          <label className="space-y-2 text-sm font-bold md:col-span-2">
            <span>اسم الملزمة</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} maxLength={180} placeholder="مثال: معلمي بالفيزياء — الأستاذ عمار الربيعي" className="min-h-12 w-full rounded-xl border border-border bg-background px-3" />
          </label>
          <label className="space-y-2 text-sm font-bold">
            <span>صورة الغلاف</span>
            <span className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 text-primary"><Upload className="size-4 shrink-0" /><span className="truncate">{coverName || "اختر صورة"}</span><input name="cover" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setCoverName(event.target.files?.[0]?.name ?? "")} className="sr-only" required /></span>
          </label>
          <label className="space-y-2 text-sm font-bold">
            <span>ملف الملزمة</span>
            <span className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 text-primary"><FileText className="size-4 shrink-0" /><span className="truncate">{pdfName || "اختر PDF"}</span><input name="pdf" type="file" accept="application/pdf,.pdf" onChange={(event) => setPdfName(event.target.files?.[0]?.name ?? "")} className="sr-only" required /></span>
          </label>
          <label className="flex items-center gap-2 text-sm font-bold md:col-span-2">
            <input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} className="size-4 accent-primary" /> نشرها للطلاب مباشرة
          </label>
          <button type="submit" disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground disabled:opacity-60 md:col-span-2">
            {saving ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
            {saving ? "جارٍ رفع الملزمة…" : "إضافة الملزمة"}
          </button>
        </form>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">الملازم المضافة</h2>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{items.length} ملزمة</span>
        </div>
        {loading ? (
          <div className="grid min-h-40 place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">ماكو ملازم مضافة حالياً.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <img src={coverUrl(item.cover_path)} alt={`غلاف ${item.name}`} className="aspect-[4/3] w-full bg-secondary object-cover" loading="lazy" />
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{subjectName(item.subject)}</span>
                    <span className={`rounded-full px-2.5 py-1 ${item.is_published ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{item.is_published ? "منشورة" : "مخفية"}</span>
                  </div>
                  <h3 className="mt-3 font-black leading-7">{item.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.topic}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => void copyLink(item)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-primary/30 px-3 text-xs font-bold text-primary hover:bg-primary/5">
                      <Copy className="size-4" />نسخ الرابط
                    </button>
                    <a href={malzamaUrl(item)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border px-3 text-xs font-bold hover:bg-secondary">
                      <ExternalLink className="size-4" />فتح الصفحة
                    </a>
                    <button type="button" disabled={actionId === item.id} onClick={() => void togglePublished(item)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border px-3 text-xs font-bold hover:bg-secondary disabled:opacity-50">
                      {item.is_published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{item.is_published ? "إخفاء" : "نشر"}
                    </button>
                    <button type="button" disabled={actionId === item.id} onClick={() => void remove(item)} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-destructive/30 px-3 text-destructive hover:bg-destructive/10 disabled:opacity-50" aria-label={`حذف ${item.name}`}><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
