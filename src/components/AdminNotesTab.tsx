import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Loader2, Eye, EyeOff, Save, X, FileText, ArrowUp, ArrowDown, Layout, Sparkles, Image as ImageIcon, Upload, BookOpen, ArrowLeft, Search, Sigma, WandSparkles, LibraryBig, CircleCheck, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AdminNoteRenderer,
  STUDY_GUIDE_TEMPLATE,
  type AdminNoteBlock,
} from "@/components/AdminNoteRenderer";
import { normalizeScientificText, SCIENTIFIC_SYMBOL_GROUPS } from "@/lib/scientificNotation";

type NoteRow = {
  id: string;
  title: string;
  template: string;
  blocks: AdminNoteBlock[];
  cover_emoji: string | null;
  published: boolean;
  background_image_url: string | null;
  notebook_id: string | null;
  created_at: string;
  updated_at: string;
};

type NotebookRow = {
  id: string;
  title: string;
  description: string | null;
  cover_emoji: string | null;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `note-covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("news").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("news").getPublicUrl(path).data.publicUrl;
}

const TEMPLATES: Record<string, { label: string; blocks: AdminNoteBlock[] }> = {
  "study-guide": { label: "Study guide", blocks: STUDY_GUIDE_TEMPLATE },
  blank: { label: "Blank", blocks: [{ type: "heading", level: 1, text: "Untitled" }] },
};

const BLOCK_ADDERS: Array<{ label: string; make: () => AdminNoteBlock }> = [
  { label: "Callout", make: () => ({ type: "callout", emoji: "💡", text: "" }) },
  { label: "Heading 1", make: () => ({ type: "heading", level: 1, text: "" }) },
  { label: "Heading 2", make: () => ({ type: "heading", level: 2, text: "" }) },
  { label: "Heading 3", make: () => ({ type: "heading", level: 3, text: "" }) },
  { label: "Paragraph", make: () => ({ type: "paragraph", text: "" }) },
  { label: "Bulleted list", make: () => ({ type: "bullets", items: [""] }) },
  { label: "Numbered list", make: () => ({ type: "numbered", items: [""] }) },
  { label: "Quote", make: () => ({ type: "quote", text: "" }) },
  { label: "Math / physics", make: () => ({ type: "formula", text: "E = mc^2", caption: "" }) },
  { label: "Divider", make: () => ({ type: "divider" }) },
];

export default function AdminNotesTab() {
  const [rows, setRows] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<NoteRow | null>(null);
  const [notebooks, setNotebooks] = useState<NotebookRow[]>([]);
  const [activeNotebook, setActiveNotebook] = useState<NotebookRow | null>(null);
  const [nbEditor, setNbEditor] = useState<NotebookRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const [notesRes, nbRes] = await Promise.all([
      (supabase as any).from("admin_notes").select("*").order("updated_at", { ascending: false }),
      (supabase as any).from("admin_notebooks").select("*").order("created_at", { ascending: false }),
    ]);
    if (notesRes.error) toast.error(notesRes.error.message);
    if (nbRes.error) toast.error(nbRes.error.message);
    setRows((notesRes.data ?? []) as NoteRow[]);
    setNotebooks((nbRes.data ?? []) as NotebookRow[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew = (templateKey: keyof typeof TEMPLATES) => {
    const tpl = TEMPLATES[templateKey];
    setEditor({
      id: "",
      title: tpl.label + " note",
      template: templateKey,
      blocks: JSON.parse(JSON.stringify(tpl.blocks)),
      cover_emoji: "📘",
      published: true,
      background_image_url: null,
      notebook_id: activeNotebook?.id ?? null,
      created_at: "",
      updated_at: "",
    });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const { error } = await (supabase as any).from("admin_notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const togglePublish = async (row: NoteRow) => {
    const { error } = await (supabase as any)
      .from("admin_notes")
      .update({ published: !row.published })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, published: !row.published } : x)));
  };

  if (editor) {
    return (
      <NoteEditor
        row={editor}
        onClose={() => setEditor(null)}
        onSaved={(saved) => {
          setEditor(null);
          setRows((r) => {
            const others = r.filter((x) => x.id !== saved.id);
            return [saved, ...others];
          });
        }}
      />
    );
  }

  if (nbEditor) {
    return (
      <NotebookEditor
        row={nbEditor}
        onClose={() => setNbEditor(null)}
        onSaved={(saved) => {
          setNbEditor(null);
          setNotebooks((n) => [saved, ...n.filter((x) => x.id !== saved.id)]);
          setActiveNotebook((a) => (a && a.id === saved.id ? saved : a));
        }}
      />
    );
  }

  if (!activeNotebook) {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
    const visibleNotebooks = normalizedSearch
      ? notebooks.filter((notebook) =>
          [notebook.title, notebook.description]
            .filter(Boolean)
            .some((value) => value!.toLocaleLowerCase().includes(normalizedSearch)),
        )
      : notebooks;
    const publishedCount = notebooks.filter((notebook) => notebook.published).length;
    const draftCount = notebooks.length - publishedCount;

    return (
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-secondary/45 p-5 shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.65)] md:p-7">
          <div className="pointer-events-none absolute -end-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <LibraryBig className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Enrichments studio</h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Organize lessons into notebooks, add rich learning blocks, and publish them for students.
                </p>
              </div>
            </div>
          <button
            onClick={() =>
              setNbEditor({
                id: "",
                title: "New notebook",
                description: "",
                cover_emoji: "📚",
                cover_image_url: null,
                published: true,
                created_at: "",
                updated_at: "",
              })
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Plus className="w-4 h-4" /> New notebook
          </button>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Notebooks", value: notebooks.length, Icon: BookOpen },
            { label: "Published", value: publishedCount, Icon: CircleCheck },
            { label: "Drafts", value: draftCount, Icon: Clock3 },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-secondary/30 p-3 sm:p-4">
              <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary sm:grid">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
                <p className="text-[11px] text-muted-foreground sm:text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search notebooks..."
            className="h-12 w-full rounded-2xl border border-white/10 bg-background/70 px-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
          <span className="sr-only">Search notebooks</span>
        </label>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : visibleNotebooks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-secondary/20 px-6 py-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-primary/70" />
            <p className="mt-3 font-semibold">{notebooks.length ? "No matching notebooks" : "Create your first notebook"}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {notebooks.length ? "Try a different title or description." : "Notebooks keep related enrichment lessons easy to find and publish."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {visibleNotebooks.map((nb) => (
              <article key={nb.id} className="group rounded-2xl border border-white/10 bg-secondary/35 p-4 transition-colors hover:border-primary/30 hover:bg-secondary/50 flex flex-wrap items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary/15 flex items-center justify-center text-2xl">
                  {nb.cover_image_url ? (
                    <img src={nb.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    nb.cover_emoji || "📚"
                  )}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{nb.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${nb.published ? "border-emerald-500/40 text-emerald-400" : "border-amber-500/40 text-amber-400"}`}>
                      {nb.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {rows.filter((r) => r.notebook_id === nb.id).length} notes
                    </span>
                  </div>
                  {nb.description && <p className="text-xs text-muted-foreground mt-0.5">{nb.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveNotebook(nb)}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                  >
                    <FileText className="w-4 h-4" /> Open
                  </button>
                  <button
                    onClick={() => setNbEditor(nb)}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/10 hover:border-primary/40 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this notebook and its notes?")) return;
                      const { error } = await (supabase as any).from("admin_notebooks").delete().eq("id", nb.id);
                      if (error) return toast.error(error.message);
                      setNotebooks((n) => n.filter((x) => x.id !== nb.id));
                      setRows((r) => r.filter((x) => x.notebook_id !== nb.id));
                    }}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  const visibleRows = rows.filter((r) => r.notebook_id === activeNotebook.id);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-secondary/40 p-5 md:p-6">
        <button
          onClick={() => setActiveNotebook(null)}
          className="inline-flex h-9 items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft className="w-4 h-4" /> All notebooks
        </button>
        <div className="mt-4 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-3xl ring-1 ring-primary/20">
            {activeNotebook.cover_emoji || "📚"}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold tracking-tight">{activeNotebook.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {visibleRows.length} {visibleRows.length === 1 ? "enrichment" : "enrichments"} · {activeNotebook.published ? "Published notebook" : "Draft notebook"}
            </p>
          </div>
        </div>
      </section>
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 md:p-5">
        <div className="mb-3 flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Layout className="w-4 h-4" /></span>
          <div>
            <h3 className="font-semibold">Create an enrichment</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">Start with a guided lesson structure or a blank page.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 ps-12">
          {Object.entries(TEMPLATES).map(([key, tpl]) => (
            <button
              key={key}
              onClick={() => startNew(key as keyof typeof TEMPLATES)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus className="w-4 h-4" /> {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : visibleRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-sm text-muted-foreground">
          No enrichments yet. Choose a template above to begin.
        </div>
      ) : (
        <div className="grid gap-3">
          {visibleRows.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl p-4 border border-white/10 bg-secondary/40 backdrop-blur flex flex-wrap items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-2xl">
                {r.cover_emoji || "📘"}
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{r.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-primary/30 text-primary">
                    {TEMPLATES[r.template]?.label || r.template}
                  </span>
                  {r.published ? (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-400">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-amber-500/40 text-amber-400">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(r.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(r)}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/10 hover:border-primary/40 text-sm"
                >
                  {r.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {r.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => setEditor(r)}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                >
                  <FileText className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => remove(r.id)}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function NotebookEditor({
  row,
  onClose,
  onSaved,
}: {
  row: NotebookRow;
  onClose: () => void;
  onSaved: (row: NotebookRow) => void;
}) {
  const [title, setTitle] = useState(row.title);
  const [description, setDescription] = useState(row.description || "");
  const [emoji, setEmoji] = useState(row.cover_emoji || "📚");
  const [published, setPublished] = useState(row.published);
  const [cover, setCover] = useState<string | null>(row.cover_image_url);
  const [busy, setBusy] = useState(false);
  const [upBusy, setUpBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Pick an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setUpBusy(true);
    try {
      setCover(await uploadImage(file));
      toast.success("Cover uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUpBusy(false);
    }
  };

  const save = async () => {
    if (!title.trim()) return toast.error("Title required");
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        cover_emoji: emoji,
        cover_image_url: cover,
        published,
        created_by: u.user?.id,
      };
      const q = row.id
        ? (supabase as any).from("admin_notebooks").update(payload).eq("id", row.id).select("*").single()
        : (supabase as any).from("admin_notebooks").insert(payload).select("*").single();
      const { data, error } = await q;
      if (error) throw error;
      toast.success("Notebook saved");
      onSaved(data as NotebookRow);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={onClose} className="inline-flex items-center gap-2 px-3 h-9 rounded-lg border border-white/10 hover:border-primary/40 text-sm">
          <X className="w-4 h-4" /> Close
        </button>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 h-9 rounded-lg border border-white/10 text-sm cursor-pointer">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publish
          </label>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-secondary/40 backdrop-blur p-4 md:p-6 space-y-3">
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
          className="w-24 h-14 text-4xl text-center rounded-xl bg-background border border-white/10"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notebook title"
          dir="rtl"
          className="w-full h-14 px-4 rounded-xl bg-background border border-white/10 text-right text-2xl font-semibold"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Short description"
          dir="rtl"
          className="w-full px-3 py-2 rounded-xl bg-background border border-white/10 text-right text-sm"
        />
        <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" /> Cover image
          </span>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={upBusy}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/10 hover:border-primary/40 text-xs disabled:opacity-60"
          >
            {upBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.currentTarget.value = ""; }}
          />
          {cover && (
            <button onClick={() => setCover(null)} className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>
        {cover && (
          <div className="rounded-xl overflow-hidden border border-white/10 aspect-[16/9] bg-black">
            <img src={cover} alt="Notebook cover" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

function NoteEditor({
  row,
  onClose,
  onSaved,
}: {
  row: NoteRow;
  onClose: () => void;
  onSaved: (row: NoteRow) => void;
}) {
  const [title, setTitle] = useState(row.title);
  const [emoji, setEmoji] = useState(row.cover_emoji || "📘");
  const [published, setPublished] = useState(row.published);
  const [blocks, setBlocks] = useState<AdminNoteBlock[]>(row.blocks || []);
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [bgUrl, setBgUrl] = useState<string | null>(row.background_image_url ?? null);
  const [genBusy, setGenBusy] = useState(false);
  const [upBusy, setUpBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadCover = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Pick an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setUpBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `note-covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("news").upload(path, file, {
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("news").getPublicUrl(path);
      setBgUrl(data.publicUrl);
      toast.success("Cover uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUpBusy(false);
    }
  };

  const generateBackground = async () => {
    const promptText = [title, ...blocks.map((b) => (b as any).text || (b as any).items?.join(", ") || "").filter(Boolean)].join(" — ").slice(0, 500);
    if (!promptText.trim()) return toast.error("Add a title first");
    setGenBusy(true);
    try {
      const { data, error } = await (supabase as any).functions.invoke("generate-note-image", { body: { prompt: promptText } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setBgUrl(data.dataUrl);
      toast.success("Background generated");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate image");
    } finally {
      setGenBusy(false);
    }
  };

  const update = (i: number, next: AdminNoteBlock) =>
    setBlocks((b) => b.map((x, idx) => (idx === i ? next : x)));
  const removeAt = (i: number) => setBlocks((b) => b.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setBlocks((b) => {
      const j = i + dir;
      if (j < 0 || j >= b.length) return b;
      const next = [...b];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const add = (make: () => AdminNoteBlock) => setBlocks((b) => [...b, make()]);

  const save = async () => {
    if (!title.trim()) return toast.error("Title required");
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const payload = {
        title: title.trim(),
        template: row.template,
        blocks: blocks as any,
        cover_emoji: emoji,
        published,
        background_image_url: bgUrl,
        notebook_id: row.notebook_id,
        created_by: u.user?.id,
      };
      const q = row.id
        ? (supabase as any).from("admin_notes").update(payload).eq("id", row.id).select("*").single()
        : (supabase as any).from("admin_notes").insert(payload).select("*").single();
      const { data, error } = await q;
      if (error) throw error;
      toast.success("Note saved");
      onSaved(data as NoteRow);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="sticky top-2 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/95 p-3 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <button
          onClick={onClose}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="hidden min-w-0 flex-1 px-2 sm:block">
          <p className="truncate text-sm font-semibold">{title || "Untitled enrichment"}</p>
          <p className="text-xs text-muted-foreground">{blocks.length} content blocks · {published ? "Will be published" : "Saved as draft"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 text-sm transition-colors hover:border-primary/35">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-[hsl(var(--primary))]"
            />
            Publish
          </label>
          <button
            onClick={() => setShowPreview((s) => !s)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Eye className="w-4 h-4" /> {showPreview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="relative rounded-2xl border border-white/10 overflow-hidden">
          {bgUrl && (
            <>
              <img src={bgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            </>
          )}
          <div className="relative p-6 md:p-10">
            <div className="text-6xl mb-4">{emoji}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
            <AdminNoteRenderer blocks={blocks} language="en" />
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 bg-secondary/35 p-4 md:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Enrichment details</h2>
              <p className="mt-1 text-xs text-muted-foreground">Set the title, cover, and student visibility.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[5.5rem_1fr]">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Icon</span>
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
                  aria-label="Enrichment icon"
                  className="h-14 w-full rounded-xl border border-white/10 bg-background text-center text-3xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enrichment title"
                  dir="auto"
                  className="h-14 w-full rounded-xl border border-white/10 bg-background px-4 text-xl font-semibold outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </label>
            </div>
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Cover image
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={upBusy}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/10 hover:border-primary/40 text-xs disabled:opacity-60"
                  >
                    {upBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload photo
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.currentTarget.value = ""; }}
                  />
                  {bgUrl && (
                    <button
                      onClick={() => setBgUrl(null)}
                      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                  <button
                    onClick={generateBackground}
                    disabled={genBusy}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs disabled:opacity-60"
                  >
                    {genBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {bgUrl ? "Regenerate" : "Generate with AI"}
                  </button>
                </div>
              </div>
              {bgUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 aspect-[16/9] bg-black">
                  <img src={bgUrl} alt="Background preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-end justify-between gap-3 px-1">
              <div>
                <h2 className="text-lg font-semibold">Lesson content</h2>
                <p className="mt-1 text-xs text-muted-foreground">Arrange blocks in the order students should read them.</p>
              </div>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">{blocks.length} blocks</span>
            </div>
            {blocks.map((b, i) => (
              <BlockEditor
                key={i}
                block={b}
                onChange={(nb) => update(i, nb)}
                onRemove={() => removeAt(i)}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.03] p-4">
            <p className="mb-1 text-sm font-semibold">Add content</p>
            <p className="mb-3 text-xs text-muted-foreground">Choose the block that best fits the next part of the lesson.</p>
            <div className="flex flex-wrap gap-2">
              {BLOCK_ADDERS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => add(a.make)}
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-white/10 hover:border-primary/40 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> {a.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: AdminNoteBlock;
  onChange: (b: AdminNoteBlock) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const formulaRef = useRef<HTMLTextAreaElement>(null);
  const insertFormulaText = (value: string) => {
    if (block.type !== "formula") return;
    const input = formulaRef.current;
    const start = input?.selectionStart ?? block.text.length;
    const end = input?.selectionEnd ?? start;
    const next = `${block.text.slice(0, start)}${value}${block.text.slice(end)}`;
    onChange({ ...block, text: next });
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + value.length, start + value.length);
    });
  };

  return (
    <div className={`rounded-2xl border p-3 transition-colors md:p-4 ${block.type === "formula" ? "border-primary/25 bg-primary/[0.045]" : "border-white/10 bg-secondary/30"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
          {block.type === "formula" && <Sigma className="h-3.5 w-3.5 text-primary" />}
          {block.type === "formula" ? "Math / physics" : block.type}
          {block.type === "heading" ? ` ${block.level}` : ""}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} title="Move block up" aria-label="Move block up" className="w-8 h-8 rounded-lg hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <ArrowUp className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button onClick={onMoveDown} title="Move block down" aria-label="Move block down" className="w-8 h-8 rounded-lg hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <ArrowDown className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button onClick={onRemove} title="Delete block" aria-label="Delete block" className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
            <Trash2 className="w-3.5 h-3.5 mx-auto" />
          </button>
        </div>
      </div>

      {block.type === "callout" && (
        <div className="flex gap-2">
          <input
            value={block.emoji || ""}
            onChange={(e) => onChange({ ...block, emoji: e.target.value.slice(0, 4) })}
            className="w-14 h-10 text-center text-xl rounded-lg bg-background border border-white/10"
          />
          <textarea
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            rows={2}
            dir="rtl"
            className="flex-1 px-3 py-2 rounded-lg bg-background border border-white/10 text-right text-sm"
          />
        </div>
      )}
      {block.type === "heading" && (
        <div className="flex gap-2">
          <select
            value={block.level}
            onChange={(e) =>
              onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 })
            }
            className="h-10 px-2 rounded-lg bg-background border border-white/10 text-sm"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            dir="rtl"
            className="flex-1 h-10 px-3 rounded-lg bg-background border border-white/10 text-right text-sm font-semibold"
          />
        </div>
      )}
      {block.type === "paragraph" && (
        <textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          rows={3}
          dir="rtl"
          className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-right text-sm"
        />
      )}
      {(block.type === "bullets" || block.type === "numbered") && (
        <div className="space-y-1.5">
          {block.items.map((it, j) => (
            <div key={j} className="flex gap-2">
              <input
                value={it}
                dir="rtl"
                onChange={(e) => {
                  const items = [...block.items];
                  items[j] = e.target.value;
                  onChange({ ...block, items });
                }}
                className="flex-1 h-9 px-3 rounded-lg bg-background border border-white/10 text-right text-sm"
              />
              <button
                onClick={() => {
                  const items = block.items.filter((_, k) => k !== j);
                  onChange({ ...block, items });
                }}
                className="w-9 h-9 rounded-lg border border-white/10 hover:bg-red-500/10 text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5 mx-auto" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...block, items: [...block.items, ""] })}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="w-3 h-3" /> Add item
          </button>
        </div>
      )}
      {block.type === "quote" && (
        <textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          rows={2}
          dir="rtl"
          className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-right text-sm italic"
        />
      )}
      {block.type === "formula" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-background/65 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold">Symbol palette</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Tap a symbol to insert it at the cursor.</p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...block, text: normalizeScientificText(block.text) })}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <WandSparkles className="h-3.5 w-3.5" /> Make readable
              </button>
            </div>
            <div className="space-y-2.5">
              {SCIENTIFIC_SYMBOL_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-wrap items-center gap-1.5">
                  <span className="w-12 shrink-0 text-[10px] font-medium text-muted-foreground">{group.label}</span>
                  {group.symbols.map((symbol) => (
                    <button
                      key={`${group.label}-${symbol}`}
                      type="button"
                      onClick={() => insertFormulaText(symbol)}
                      title={`Insert ${symbol}`}
                      className="grid h-8 min-w-8 place-items-center rounded-lg border border-white/10 bg-secondary/50 px-2 font-serif text-sm transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Equation or scientific notation</span>
            <textarea
              ref={formulaRef}
              value={block.text}
              onChange={(event) => onChange({ ...block, text: event.target.value })}
              onPaste={(event) => {
                const pasted = event.clipboardData.getData("text");
                const normalized = normalizeScientificText(pasted);
                if (normalized !== pasted) {
                  event.preventDefault();
                  insertFormulaText(normalized);
                }
              }}
              onBlur={() => onChange({ ...block, text: normalizeScientificText(block.text) })}
              rows={3}
              dir="ltr"
              spellCheck={false}
              placeholder="Example: F = ma, Δx/Δt, E = mc^2, or \\frac{a}{b}"
              className="w-full resize-y rounded-xl border border-white/10 bg-background px-3 py-2.5 font-serif text-base leading-relaxed outline-none placeholder:font-sans placeholder:text-xs placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <div className="rounded-xl border border-primary/20 bg-background/70 px-4 py-4 text-center">
            <p className="mb-2 text-[10px] font-medium text-muted-foreground">STUDENT PREVIEW</p>
            <div dir="ltr" className="overflow-x-auto whitespace-pre-wrap break-words font-serif text-xl font-semibold leading-relaxed tracking-wide">
              {normalizeScientificText(block.text) || "Your equation will appear here"}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Explanation (optional)</span>
            <input
              value={block.caption || ""}
              onChange={(event) => onChange({ ...block, caption: event.target.value })}
              dir="auto"
              placeholder="Explain the symbols or variables"
              className="h-10 w-full rounded-lg border border-white/10 bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>
      )}
      {block.type === "divider" && (
        <div className="text-center text-muted-foreground text-xs">— divider —</div>
      )}
    </div>
  );
}
