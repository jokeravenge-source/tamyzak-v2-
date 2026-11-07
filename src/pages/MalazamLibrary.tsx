import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AlertCircle, ArrowLeft, BookMarked, Bookmark, BookOpen, CheckCircle2, Download, FileText, FolderOpen, Link2, Loader2, LockKeyhole, RefreshCw, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { invokeTelegramStart } from "@/lib/telegramStart";
import { invokeMalazamDownload } from "@/lib/malazamDownload";
import { downloadMalzamaPdf, fetchMalzamaPdf, validateMalzamaPdf } from "@/lib/malazamPdf";
import { getSavedMalzama, listSavedMalazam, removeSavedMalzama, saveMalzama, saveMalzamaPage, type MalzamaMetadata, type SavedMalzama } from "@/lib/savedMalazam";
import SeoHead from "@/components/SeoHead";
import { malzamaPath, parseMalzamaId } from "@/lib/malazamLinks";
import { TAMAYZAK_BOT_USERNAME, tamayzakBotLink } from "@/lib/tamayzakTelegram";
import {
  MALAZAM_SEO_CATEGORIES,
  getMalazamSeoCategory,
  getMalazamSeoItem,
} from "@/data/malazamSeo";

const MalzamaReader = lazy(() => import("@/components/MalzamaReader"));
type FileAction = "open" | "download" | "save";

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

export default function MalazamLibrary({ onBack }: { onBack?: () => void } = {}) {
  const pathname = typeof window === "undefined" ? "/malazam/" : window.location.pathname;
  const dynamicItemId = parseMalzamaId(pathname);
  const slug = typeof window === "undefined" ? "" : decodeURIComponent(pathname.replace(/\/+$/, "").split("/")[2] ?? "");
  const requestedCategory = getMalazamSeoCategory(slug);
  const legacyItem = getMalazamSeoItem(slug);
  const activeSubject = requestedCategory?.slug ?? legacyItem?.subject ?? null;
  const [items, setItems] = useState<Malzama[]>([]);
  const [detailItem, setDetailItem] = useState<Malzama | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [gate, setGate] = useState<DownloadGate | null>(null);
  const [pendingItem, setPendingItem] = useState<MalzamaMetadata | null>(null);
  const [pendingAction, setPendingAction] = useState<FileAction>("download");
  const [userId, setUserId] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedMalzama[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");
  const [actionError, setActionError] = useState("");
  const [reader, setReader] = useState<{ item: MalzamaMetadata; blob: Blob; page: number } | null>(null);
  const currentOwner = useRef<string | null | undefined>(undefined);

  const refreshSaved = useCallback(async (owner: string) => {
    if (currentOwner.current !== owner) return;
    setSavedLoading(true); setSavedError("");
    try { const records = await listSavedMalazam(owner); if (currentOwner.current === owner) setSavedItems(records); }
    catch { if (currentOwner.current === owner) setSavedError("تعذر قراءة المحفوظات على هذا الجهاز. تأكد من السماح بتخزين بيانات الموقع."); }
    finally { if (currentOwner.current === owner) setSavedLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    const sync = (owner: string | null) => {
      if (!active || currentOwner.current === owner) return;
      currentOwner.current = owner;
      setUserId(owner); setSavedItems([]); setReader(null); setSavedLoading(false); setSavedError("");
    };
    void supabase.auth.getSession().then(({ data }) => sync(data.session?.user.id ?? null)).catch(() => sync(null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => sync(session?.user.id ?? null));
    return () => { active = false; currentOwner.current = undefined; subscription.unsubscribe(); };
  }, []);
  useEffect(() => { if (userId) void refreshSaved(userId); }, [userId, refreshSaved]);

  const title = detailItem
    ? `${detailItem.name} ${subjectName(detailItem.subject)} PDF | تميزك`
    : legacyItem
    ? `${legacyItem.title} PDF | تميزك`
    : requestedCategory
      ? `${requestedCategory.title} | تميزك`
      : "ملازم السادس العلمي 2027 PDF | تميزك";
  const description = detailItem
    ? `تحميل ${detailItem.name} ضمن ${subjectName(detailItem.subject)} — ${detailItem.topic} لطلاب السادس العلمي من منصة تميزك بعد التحقق من حساب تيليجرام.`
    : legacyItem?.description ?? requestedCategory?.description ??
    "تصفح ملازم السادس العلمي 2027 لجميع المواد والأساتذة في العراق، وحمّل الملفات بعد ربط حساب تيليجرام.";
  const canonicalPath = detailItem ? malzamaPath(detailItem) : dynamicItemId ? pathname : slug ? `/malazam/${slug}/` : "/malazam/";

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      if (dynamicItemId) {
        const { data, error } = await supabase
          .from("malazam")
          .select("id, subject, topic, name, cover_path, is_published, sort_order, created_at")
          .eq("id", dynamicItemId)
          .eq("is_published", true)
          .maybeSingle();
        if (error) throw error;
        const item = (data ?? null) as Malzama | null;
        setDetailItem(item);
        setItems(item ? [item] : []);
        return;
      }

      setDetailItem(null);
      let query = supabase
        .from("malazam")
        .select("id, subject, topic, name, cover_path, is_published, sort_order, created_at")
        .eq("is_published", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (activeSubject) query = query.eq("subject", activeSubject);
      const { data, error } = await query;
      if (error) throw error;
      setItems((data ?? []) as Malzama[]);
    } catch {
      setItems([]);
      setDetailItem(null);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [activeSubject, dynamicItemId]);

  useEffect(() => { void load(); }, [load]);

  const coverUrl = (path: string) => supabase.storage.from("malazam-covers").getPublicUrl(path).data.publicUrl;

  const startAction = async (item: MalzamaMetadata, action: FileAction) => {
    setPendingItem(item);
    setPendingAction(action);
    setDownloadId(item.id);
    setActionError("");
    try {
      const saved = savedItems.find((entry) => entry.id === item.id);
      if (userId && saved) {
        if (action === "save") {
          await removeSavedMalzama(userId, item.id);
          await refreshSaved(userId);
          return;
        }
        const blob = await getSavedMalzama(userId, item.id);
        if (currentOwner.current !== userId) return;
        if (blob) {
          if (action === "download") downloadMalzamaPdf(blob, item.name);
          setReader({ item, blob, page: saved.page });
          return;
        }
      }
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setGate({ type: "auth" });
        return;
      }

      const result = await invokeMalazamDownload(item.id);
      if (result.signedOut) {
        setGate({ type: "auth" });
        return;
      }
      const payload = await responsePayload(result.data, result.error);
      const downloadUrl = typeof payload.downloadUrl === "string" ? payload.downloadUrl : null;
      if (downloadUrl) {
        setGate(null);
        const blob = await fetchMalzamaPdf(downloadUrl);
        if (currentOwner.current !== sessionData.session.user.id) return;
        if (action === "save") {
          await saveMalzama(sessionData.session.user.id, item, blob);
          await refreshSaved(sessionData.session.user.id);
        }
        if (currentOwner.current !== sessionData.session.user.id) return;
        if (action === "download") downloadMalzamaPdf(blob, item.name);
        setReader({ item, blob, page: 1 });
        return;
      }

      const code = String(payload.error ?? "");
      if (code === "unauthenticated") {
        setGate({ type: "auth" });
      } else if (code === "not_linked") {
        const linkResult = await invokeTelegramStart({ source: "malazam-download" });
        if (linkResult.signedOut) {
          setGate({ type: "auth" });
        } else if (linkResult.error || !tamayzakBotLink(linkResult.data)) {
          setGate({ type: "error", message: "تعذّر فتح بوت تميّزك حالياً. حاول مرة ثانية بعد قليل." });
        } else {
          setGate({ type: "link", botUrl: tamayzakBotLink(linkResult.data) });
        }
      } else if (code === "not_joined") {
        const missingChannels = Array.isArray(payload.missingChannels) ? payload.missingChannels.map(String) : [];
        setGate({ type: "channels", missingChannels });
      } else if (code === "bot_not_channel_admin") {
        setGate({ type: "error", message: "بوت التحقق غير مهيّأ في إحدى القناتين حالياً. يجب إضافة بوت تميّزك كمشرف في القناتين ثم المحاولة مجدداً." });
      } else if (code === "wrong_bot_connection") {
        setGate({ type: "error", message: `اتصال تيليجرام في الخادم مرتبط ببوت آخر. يجب إعادة ربطه بالبوت الرسمي @${TAMAYZAK_BOT_USERNAME}.` });
      } else if (code === "telegram_not_configured" || code === "telegram_gateway_unavailable") {
        setGate({ type: "error", message: "اتصال بوت تميّزك بالخادم غير متاح حالياً. أعد ربط تكامل Telegram ثم حاول مجدداً." });
      } else if (code === "too_many_requests" || code.toLowerCase().includes("too many")) {
        setGate({ type: "error", message: "صارت محاولات كثيرة خلال دقيقة. انتظر دقيقة واحدة ثم جرّب مجدداً." });
      } else {
        setGate({ type: "error", message: "تعذّر التحقق من الاشتراك حالياً. حاول مرة ثانية بعد قليل." });
      }
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "تعذر فتح الملف أو حفظه. تحقق من الاتصال ومساحة الجهاز ثم حاول مجدداً.");
    } finally {
      setDownloadId(null);
    }
  };

  const visibleHeading = detailItem?.name ?? legacyItem?.title ?? requestedCategory?.title ?? "مكتبة ملازم السادس العلمي";
  const categoryLinks = useMemo(() => MALAZAM_SEO_CATEGORIES.filter((category) => category.slug !== "revision"), []);
  const displayedItems = savedOnly ? savedItems.filter((item) => !activeSubject || item.subject === activeSubject) : items;
  const actions = (item: MalzamaMetadata) => {
    const saved = savedItems.some((entry) => entry.id === item.id);
    return <div className="mt-5 space-y-2">
      <button type="button" disabled={!!downloadId} onClick={() => void startAction(item, "open")} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 font-bold text-primary disabled:opacity-50"><BookOpen className="size-5" />قراءة داخل تميّزك</button>
      <div className="flex gap-2">
        <button type="button" disabled={!!downloadId} onClick={() => void startAction(item, "download")} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 font-black text-primary-foreground disabled:opacity-50">{downloadId === item.id ? <Loader2 className="size-5 animate-spin" /> : <Download className="size-5" />}تحميل الملزمة</button>
        <button type="button" aria-pressed={saved} disabled={!!downloadId} onClick={() => void startAction(item, "save")} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-primary/30 px-3 font-bold text-primary disabled:opacity-50"><Bookmark className={`size-5 ${saved ? "fill-current" : ""}`} />{saved ? "إزالة الحفظ" : "حفظ الملزمة"}</button>
      </div>
    </div>;
  };

  return (
    <main dir="rtl" className="min-h-screen bg-background px-4 py-8 text-foreground md:py-14">
      <SeoHead title={title} description={description} path={canonicalPath} />
      <Helmet>
        <html lang="ar" dir="rtl" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": detailItem ? "LearningResource" : "CollectionPage",
          name: visibleHeading,
          description,
          url: `https://tamyazak.site${canonicalPath}`,
          inLanguage: "ar",
          educationalLevel: "السادس العلمي",
          ...(detailItem ? {
            learningResourceType: "ملزمة دراسية PDF",
            about: subjectName(detailItem.subject),
            image: coverUrl(detailItem.cover_path),
            provider: { "@type": "Organization", name: "تميزك", url: "https://tamyazak.site/" },
          } : {}),
        })}</script>
      </Helmet>

      <div className="mx-auto max-w-6xl">
        {onBack ? <button onClick={onBack} className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold hover:bg-secondary"><ArrowLeft className="size-4" />الرجوع للرئيسية</button> : <a href="/" onClick={() => localStorage.removeItem("app_menu_choice_v1")} className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold hover:bg-secondary"><ArrowLeft className="size-4" />الرجوع للرئيسية</a>}

        <header className="overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-6 shadow-sm md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary"><BookMarked className="size-4" />بنك الملازم</p>
              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight md:text-5xl">{visibleHeading}</h1>
              <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">{description}</p>
            </div>
            <div className="shrink-0 rounded-2xl border border-border bg-background/70 p-4 text-sm font-bold text-muted-foreground backdrop-blur">
              <LockKeyhole className="mb-2 size-6 text-primary" />
              تحميل آمن بعد التحقق من تيليجرام
            </div>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!dynamicItemId && <>
            <button aria-pressed={!savedOnly} onClick={() => setSavedOnly(false)} className={`min-h-11 rounded-xl border px-4 font-bold ${!savedOnly ? "bg-primary text-primary-foreground" : "bg-card"}`}>كل الملازم</button>
            <button aria-pressed={savedOnly} onClick={() => setSavedOnly(true)} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 font-bold ${savedOnly ? "bg-primary text-primary-foreground" : "bg-card"}`}><Bookmark className="size-4" />المحفوظة ({savedItems.length})</button>
          </>}
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border bg-card px-4 font-bold"><FolderOpen className="size-4" />فتح PDF من جهازي
            <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => {
              const file = event.target.files?.[0]; event.target.value = "";
              if (!file) return;
              setActionError("");
              void validateMalzamaPdf(file).then((blob) => setReader({ item: { id: "local", name: file.name.replace(/\.pdf$/i, ""), subject: "", topic: "", cover_path: "" }, blob, page: 1 })).catch((error) => setActionError(error.message));
            }} />
          </label>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">حفظ الملزمة يحتفظ بنسخة PDF وآخر صفحة على هذا الجهاز لهذا الحساب. المحفوظات لا تنتقل تلقائياً إلى جهاز آخر وقد تُحذف عند مسح بيانات المتصفح.</p>
        {actionError && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-4 text-destructive">{actionError}</p>}

        {!dynamicItemId && <nav className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="مواد الملازم">
          <a href="/malazam/" className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${!activeSubject ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>الكل</a>
          {categoryLinks.map((category) => (
            <a key={category.slug} href={`/malazam/${category.slug}/`} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${activeSubject === category.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}>{category.name}</a>
          ))}
        </nav>}

        <section className="mt-8" aria-live="polite">
          {(savedOnly ? savedLoading : loading) ? (
            <div className="grid min-h-72 place-items-center"><Loader2 className="size-8 animate-spin text-primary" /></div>
          ) : !savedOnly && loadError ? (
            <div role="alert" className="rounded-3xl border border-amber-500/40 bg-card p-10 text-center">
              <AlertCircle className="mx-auto size-10 text-amber-600" />
              <h2 className="mt-4 text-xl font-black">تعذّر تحميل الملازم من الخادم</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">صار خطأ بجلب القائمة. هذا لا يعني أن الملازم غير موجودة.</p>
              <button type="button" onClick={() => void load()} className="mx-auto mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-primary-foreground"><RefreshCw className="size-4" />إعادة المحاولة</button>
            </div>
          ) : savedOnly && savedError ? (
            <div role="alert" className="rounded-xl border p-4"><p>{savedError}</p><button onClick={() => { if (userId) void refreshSaved(userId); }} className="mt-2 min-h-11 font-bold text-primary">إعادة تحميل المحفوظات</button></div>
          ) : dynamicItemId && !detailItem ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <FileText className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-black">الملزمة غير متاحة حالياً</h2>
              <p className="mt-2 text-sm text-muted-foreground">تگدر ترجع للمكتبة وتختار ملزمة منشورة.</p>
              <a href="/malazam/" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 font-bold text-primary-foreground">الرجوع للمكتبة</a>
            </div>
          ) : savedOnly && !userId ? (
            <div className="rounded-3xl border p-8 text-center"><h2 className="text-xl font-black">سجّل دخولك لعرض محفوظاتك</h2><a href="/" onClick={() => sessionStorage.setItem("tamayzak_return_after_auth", window.location.pathname)} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-primary-foreground">تسجيل الدخول</a></div>
          ) : displayedItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <FileText className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-black">{savedOnly ? "ما عندك ملازم محفوظة بهذا القسم بعد" : "ماكو ملازم منشورة بهذا القسم حالياً"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{savedOnly ? "اضغط حفظ الملزمة بجانب زر التحميل حتى ترجع إلها هنا." : "راح تظهر هنا مباشرة من ينشرها الأدمن."}</p>
            </div>
          ) : detailItem ? (
            <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-lg">
              <div className="grid md:grid-cols-[minmax(280px,420px)_1fr]">
                <img src={coverUrl(detailItem.cover_path)} alt={`غلاف ${detailItem.name}`} className="h-full min-h-80 w-full bg-secondary object-cover" />
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <a href={`/malazam/${detailItem.subject}/`} className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{subjectName(detailItem.subject)}</a>
                  <p className="mt-5 text-sm font-black text-primary">{detailItem.topic}</p>
                  <h2 className="mt-2 text-3xl font-black leading-tight md:text-4xl">{detailItem.name}</h2>
                  <p className="mt-4 leading-8 text-muted-foreground">ملزمة دراسية لطلاب السادس العلمي. التحميل محمي ويتطلب تسجيل الدخول وربط حساب تيليجرام والانضمام إلى القنوات المطلوبة.</p>
                  {actions(detailItem)}
                </div>
              </div>
            </article>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayedItems.map((item) => (
                <article key={item.id} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <a href={malzamaPath(item)} aria-label={`فتح صفحة ${item.name}`}><img src={coverUrl(item.cover_path)} alt={`غلاف ${item.name}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" /></a>
                    <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-black text-foreground backdrop-blur">{subjectName(item.subject)}</span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black text-primary">{item.topic}</p>
                    <h2 className="mt-2 min-h-14 text-lg font-black leading-7"><a href={malzamaPath(item)} className="hover:text-primary">{item.name}</a></h2>
                    {actions(item)}
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
              {gate.type === "link" && `افتح البوت الرسمي @${TAMAYZAK_BOT_USERNAME} واضغط Start، وبعدها ارجع واضغط تحقق وتحميل.`}
              {gate.type === "channels" && "تحميل الملازم متاح لأعضاء 6th D’H’S ومفاتيح النجاح. انضم للقناتين ثم أعد التحقق."}
              {gate.type === "error" && gate.message}
            </p>

            {gate.type === "auth" && <a href="/" onClick={() => sessionStorage.setItem("tamayzak_return_after_auth", window.location.pathname + window.location.search)} className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 font-black text-primary-foreground">تسجيل الدخول</a>}
            {gate.type === "link" && (
              <a href={gate.botUrl ?? undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!gate.botUrl} className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 font-black text-white"><Link2 className="size-5" />فتح @{TAMAYZAK_BOT_USERNAME}</a>
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
              <button type="button" onClick={() => void startAction(pendingItem, pendingAction)} disabled={downloadId === pendingItem.id} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 px-4 font-black text-primary hover:bg-primary/5 disabled:opacity-60">
                {downloadId === pendingItem.id ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
                تحقق وتابع
              </button>
            )}
          </section>
        </div>
      )}
      {reader && <Suspense fallback={<div role="status" className="fixed inset-0 z-[110] grid place-items-center bg-background/95">جاري فتح القارئ…</div>}><MalzamaReader blob={reader.blob} name={reader.item.name} initialPage={reader.page} onClose={() => setReader(null)} onPage={(page) => {
        if (userId && savedItems.some((item) => item.id === reader.item.id)) {
          void saveMalzamaPage(userId, reader.item.id, page).then(() => setSavedItems((items) => items.map((item) => item.id === reader.item.id ? { ...item, page } : item))).catch(() => setActionError("تعذر حفظ آخر صفحة على الجهاز."));
        }
      }} /></Suspense>}
    </main>
  );
}
