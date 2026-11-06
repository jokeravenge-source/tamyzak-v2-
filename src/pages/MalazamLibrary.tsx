import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, BookMarked, CheckCircle2, Download, FileText, Link2, Loader2, LockKeyhole, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { invokeTelegramStart } from "@/lib/telegramStart";
import SeoHead from "@/components/SeoHead";
import {
  MALAZAM_SEO_CATEGORIES,
  getMalazamSeoCategory,
  getMalazamSeoItem,
} from "@/data/malazamSeo";

type Malzama = {
  id: string;
  subject: string;
  topic: string;
  name: string;
  cover_path: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

type DownloadGate =
  | { type: "auth" }
  | { type: "link"; botUrl: string | null }
  | { type: "channels"; missingChannels: string[] }
  | { type: "error"; message: string };

const CHANNELS = [
  { username: "@a6th_DHS", name: "6th D’H’S", url: "https://t.me/a6th_DHS" },
  { username: "@sad6ths", name: "مفاتيح النجاح", url: "https://t.me/sad6ths" },
] as const;

const subjectName = (code: string) => MALAZAM_SEO_CATEGORIES.find((category) => category.slug === code)?.name ?? code;

async function responsePayload(data: unknown, error: unknown) {
  if (data && typeof data === "object") return data as Record<string, unknown>;
  const context = (error as { context?: unknown } | null)?.context;
  if (context instanceof Response) {
    try { return await context.clone().json() as Record<string, unknown>; } catch { /* ignore malformed error body */ }
  }
  return {} as Record<string, unknown>;
}

export default function MalazamLibrary() {
  const slug = typeof window === "undefined" ? "" : decodeURIComponent(window.location.pathname.replace(/\/+$/, "").split("/")[2] ?? "");
  const requestedCategory = getMalazamSeoCategory(slug);
  const legacyItem = getMalazamSeoItem(slug);
  const activeSubject = requestedCategory?.slug ?? legacyItem?.subject ?? null;
  const [items, setItems] = useState<Malzama[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [gate, setGate] = useState<DownloadGate | null>(null);
  const [pendingItem, setPendingItem] = useState<Malzama | null>(null);

  const title = legacyItem
    ? `${legacyItem.title} PDF | تميزك`
    : requestedCategory
      ? `${requestedCategory.title} | تميزك`
      : "ملازم السادس العلمي 2027 PDF | تميزك";
  const description = legacyItem?.description ?? requestedCategory?.description ??
    "تصفح ملازم السادس العلمي 2027 لجميع المواد والأساتذة في العراق، وحمّل الملفات بعد ربط حساب تيليجرام.";
  const canonicalPath = slug ? `/malazam/${slug}/` : "/malazam/";

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("malazam")
      .select("id, subject, topic, name, cover_path, is_published, sort_order, created_at")
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (activeSubject) query = query.eq("subject", activeSubject);
    const { data } = await query;
    setItems((data ?? []) as Malzama[]);
    setLoading(false);
  }, [activeSubject]);

  useEffect(() => { void load(); }, [load]);

  const coverUrl = (path: string) => supabase.storage.from("malazam-covers").getPublicUrl(path).data.publicUrl;

  const startDownload = async (item: Malzama) => {
    setPendingItem(item);
    setDownloadId(item.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setGate({ type: "auth" });
        return;
      }

      const result = await supabase.functions.invoke("malazam-download", { body: { malzamaId: item.id } });
      const payload = await responsePayload(result.data, result.error);
      const downloadUrl = typeof payload.downloadUrl === "string" ? payload.downloadUrl : null;
      if (downloadUrl) {
        setGate(null);
        window.location.assign(downloadUrl);
        return;
      }

      const code = String(payload.error ?? "");
      if (code === "unauthenticated") {
        setGate({ type: "auth" });
      } else if (code === "not_linked") {
        const linkResult = await invokeTelegramStart({ source: "malazam-download" });
        setGate({ type: "link", botUrl: linkResult.data?.deepLink ?? null });
      } else if (code === "not_joined") {
        const missingChannels = Array.isArray(payload.missingChannels) ? payload.missingChannels.map(String) : [];
        setGate({ type: "channels", missingChannels });
      } else {
        setGate({ type: "error", message: "تعذّر التحقق من الاشتراك حالياً. حاول مرة ثانية بعد قليل." });
      }
    } catch {
      setGate({ type: "error", message: "تعذّر تجهيز التحميل. تحقق من الإنترنت وحاول مجدداً." });
    } finally {
      setDownloadId(null);
    }
  };

  const visibleHeading = legacyItem?.title ?? requestedCategory?.title ?? "مكتبة ملازم السادس العلمي";
  const categoryLinks = useMemo(() => MALAZAM_SEO_CATEGORIES.filter((category) => category.slug !== "revision"), []);

  return (
    <main dir="rtl" className="min-h-screen bg-background px-4 py-8 text-foreground md:py-14">
      <SeoHead title={title} description={description} path={canonicalPath} />
      <Helmet>
        <html lang="ar" dir="rtl" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: visibleHeading,
          description,
          url: `https://tamyazak.site${canonicalPath}`,
          inLanguage: "ar",
        })}</script>
      </Helmet>

      <div className="mx-auto max-w-6xl">
        <a href="/" className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold hover:bg-secondary"><ArrowLeft className="size-4" />الرجوع للرئيسية</a>

        <header className="overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-6 shadow-sm md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary"><BookMarked className="size-4" />ملازم تميّزك</p>
              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight md:text-5xl">{visibleHeading}</h1>
              <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">{description}</p>
            </div>
            <div className="shrink-0 rounded-2xl border border-border bg-background/70 p-4 text-sm font-bold text-muted-foreground backdrop-blur">
              <LockKeyhole className="mb-2 size-6 text-primary" />
              تحميل آمن بعد التحقق من تيليجرام
            </div>
          </div>
        </header>

        <nav className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="مواد الملازم">
          <a href="/malazam/" className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${!activeSubject ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>الكل</a>
          {categoryLinks.map((category) => (
            <a key={category.slug} href={`/malazam/${category.slug}/`} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${activeSubject === category.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}>{category.name}</a>
          ))}
        </nav>

        <section className="mt-8" aria-live="polite">
          {loading ? (
            <div className="grid min-h-72 place-items-center"><Loader2 className="size-8 animate-spin text-primary" /></div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <FileText className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-black">ماكو ملازم مضافة بهذا القسم حالياً</h2>
              <p className="mt-2 text-sm text-muted-foreground">راح تظهر هنا مباشرة من يضيفها الأدمن.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <img src={coverUrl(item.cover_path)} alt={`غلاف ${item.name}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                    <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-black text-foreground backdrop-blur">{subjectName(item.subject)}</span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black text-primary">{item.topic}</p>
                    <h2 className="mt-2 min-h-14 text-lg font-black leading-7">{item.name}</h2>
                    <button type="button" disabled={downloadId === item.id} onClick={() => void startDownload(item)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-black text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
                      {downloadId === item.id ? <Loader2 className="size-5 animate-spin" /> : <Download className="size-5" />}
                      {downloadId === item.id ? "جارٍ التحقق…" : "تحميل الملزمة"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {gate && pendingItem && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="malazam-gate-title">
          <section className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#229ED9]/10 text-[#229ED9]"><Send className="size-6" /></span>
              <button type="button" onClick={() => setGate(null)} className="grid size-10 place-items-center rounded-xl border border-border hover:bg-secondary" aria-label="إغلاق"><X className="size-5" /></button>
            </div>
            <h2 id="malazam-gate-title" className="mt-5 text-2xl font-black">
              {gate.type === "auth" ? "سجّل دخولك أولاً" : gate.type === "link" ? "اربط حساب تيليجرام" : gate.type === "channels" ? "انضم إلى القناتين" : "تعذّر التحقق"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {gate.type === "auth" && "لازم تستخدم حساب تميّزك حتى نربطه بحساب تيليجرام ونحفظ صلاحية التحميل."}
              {gate.type === "link" && "افتح بوت تميّزك واضغط Start، وبعدها ارجع واضغط تحقق وتحميل."}
              {gate.type === "channels" && "تحميل الملازم متاح لأعضاء 6th D’H’S ومفاتيح النجاح. انضم للقناتين ثم أعد التحقق."}
              {gate.type === "error" && gate.message}
            </p>

            {gate.type === "auth" && <a href="/" onClick={() => sessionStorage.setItem("tamayzak_return_after_auth", window.location.pathname + window.location.search)} className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 font-black text-primary-foreground">تسجيل الدخول</a>}
            {gate.type === "link" && (
              <a href={gate.botUrl ?? undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!gate.botUrl} className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 font-black text-white"><Link2 className="size-5" />فتح بوت تميّزك</a>
            )}
            {gate.type === "channels" && (
              <div className="mt-5 space-y-3">
                {CHANNELS.map((channel) => {
                  const missing = gate.missingChannels.length === 0 || gate.missingChannels.includes(channel.username);
                  return (
                    <a key={channel.username} href={channel.url} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between rounded-xl border border-[#229ED9]/30 bg-[#229ED9]/5 px-4 font-bold text-[#229ED9]">
                      <span className="inline-flex items-center gap-2"><Send className="size-4" />{channel.name}</span>
                      {missing ? <span className="text-xs">انضم</span> : <CheckCircle2 className="size-5 text-emerald-500" />}
                    </a>
                  );
                })}
              </div>
            )}

            {gate.type !== "auth" && (
              <button type="button" onClick={() => void startDownload(pendingItem)} disabled={downloadId === pendingItem.id} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 px-4 font-black text-primary hover:bg-primary/5 disabled:opacity-60">
                {downloadId === pendingItem.id ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
                تحقق وحمّل
              </button>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
