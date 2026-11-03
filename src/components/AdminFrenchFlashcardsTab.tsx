import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Languages,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { FRENCH_FLASHCARD_DECKS, FRENCH_FLASHCARD_TOTAL } from "@/data/frenchFlashcardDecks";
import { supabase } from "@/integrations/supabase/client";
import type { FrenchFlashcardOverride } from "@/lib/frenchFlashcardOverrides";

type CustomFrenchCard = {
  id: string;
  chapter: string;
  language: string;
  question: string;
  answer: string;
  approved: boolean;
  created_at: string;
};

type LibraryRow = {
  chapter: number;
  cardIndex: number;
  deckTitle: string;
  originalQuestion: string;
  originalAnswer: string;
  question: string;
  answer: string;
  hidden: boolean;
  override: FrenchFlashcardOverride | null;
};

type EditingCard =
  | { kind: "library"; chapter: number; cardIndex: number; question: string; answer: string; hidden: boolean }
  | { kind: "custom"; id: string; chapter: string; language: string; question: string; answer: string };

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export default function AdminFrenchFlashcardsTab() {
  const [overrides, setOverrides] = useState<FrenchFlashcardOverride[]>([]);
  const [customCards, setCustomCards] = useState<CustomFrenchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [scope, setScope] = useState<"library" | "custom">("library");
  const [chapter, setChapter] = useState("all");
  const [libraryState, setLibraryState] = useState<"all" | "edited" | "hidden">("all");
  const [customState, setCustomState] = useState<"all" | "approved" | "pending">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EditingCard | null>(null);
  const [addForm, setAddForm] = useState({ chapter: "1", language: "both", question: "", answer: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [overrideResult, customResult] = await Promise.all([
      supabase.from("french_flashcard_overrides").select("*").order("chapter").order("card_index"),
      supabase.from("custom_flashcards").select("id, chapter, language, question, answer, approved, created_at")
        .eq("subject", "french").order("chapter").order("created_at", { ascending: false }),
    ]);
    const message = overrideResult.error?.message ?? customResult.error?.message ?? null;
    if (message) setError(message);
    setOverrides((overrideResult.data ?? []) as FrenchFlashcardOverride[]);
    setCustomCards((customResult.data ?? []) as CustomFrenchCard[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const overrideMap = useMemo(() => new Map(
    overrides.map((item) => [`${item.chapter}:${item.card_index}`, item]),
  ), [overrides]);

  const libraryRows = useMemo<LibraryRow[]>(() => FRENCH_FLASHCARD_DECKS.flatMap((deck) =>
    deck.cards.map((card, cardIndex) => {
      const override = overrideMap.get(`${deck.chapter}:${cardIndex}`) ?? null;
      return {
        chapter: deck.chapter,
        cardIndex,
        deckTitle: `${deck.titleEn} · ${deck.titleAr}`,
        originalQuestion: card.q,
        originalAnswer: card.a,
        question: override?.question ?? card.q,
        answer: override?.answer ?? card.a,
        hidden: override?.hidden ?? false,
        override,
      };
    }),
  ), [overrideMap]);

  const query = normalize(search);
  const visibleLibrary = libraryRows.filter((row) => {
    if (chapter !== "all" && row.chapter !== Number(chapter)) return false;
    if (libraryState === "edited" && !row.override) return false;
    if (libraryState === "hidden" && !row.hidden) return false;
    return !query || normalize(`${row.question} ${row.answer} ${row.deckTitle}`).includes(query);
  });
  const visibleCustom = customCards.filter((card) => {
    if (chapter !== "all" && card.chapter !== chapter) return false;
    if (customState === "approved" && !card.approved) return false;
    if (customState === "pending" && card.approved) return false;
    return !query || normalize(`${card.question} ${card.answer} ${card.language}`).includes(query);
  });

  const saveLibraryCard = async (value: Extract<EditingCard, { kind: "library" }>) => {
    if (!value.question.trim() || !value.answer.trim()) return toast.error("Question and answer are required");
    const key = `library:${value.chapter}:${value.cardIndex}`;
    setBusyKey(key);
    const { data: auth } = await supabase.auth.getUser();
    const { error: saveError } = await supabase.from("french_flashcard_overrides").upsert({
      chapter: value.chapter,
      card_index: value.cardIndex,
      question: value.question.trim(),
      answer: value.answer.trim(),
      hidden: value.hidden,
      updated_by: auth.user?.id ?? null,
    }, { onConflict: "chapter,card_index" });
    setBusyKey(null);
    if (saveError) return toast.error(saveError.message);
    setEditing(null);
    toast.success("French flashcard updated for students");
    await load();
  };

  const setLibraryVisibility = async (row: LibraryRow, hidden: boolean) => {
    const key = `library:${row.chapter}:${row.cardIndex}`;
    setBusyKey(key);
    const { data: auth } = await supabase.auth.getUser();
    const { error: saveError } = await supabase.from("french_flashcard_overrides").upsert({
      chapter: row.chapter,
      card_index: row.cardIndex,
      question: row.question,
      answer: row.answer,
      hidden,
      updated_by: auth.user?.id ?? null,
    }, { onConflict: "chapter,card_index" });
    setBusyKey(null);
    if (saveError) return toast.error(saveError.message);
    toast.success(hidden ? "Card hidden from students" : "Card published again");
    await load();
  };

  const restoreLibraryCard = async (row: LibraryRow) => {
    const key = `library:${row.chapter}:${row.cardIndex}`;
    setBusyKey(key);
    const { error: deleteError } = await supabase.from("french_flashcard_overrides")
      .delete().eq("chapter", row.chapter).eq("card_index", row.cardIndex);
    setBusyKey(null);
    if (deleteError) return toast.error(deleteError.message);
    setEditing(null);
    toast.success("Original card restored");
    await load();
  };

  const addCustomCard = async () => {
    if (!addForm.question.trim() || !addForm.answer.trim()) return toast.error("Question and answer are required");
    setBusyKey("add");
    const { data: auth } = await supabase.auth.getUser();
    const languages = addForm.language === "both" ? ["ar", "en"] : [addForm.language];
    const rows = languages.map((language) => ({
      subject: "french",
      chapter: addForm.chapter,
      language,
      question: addForm.question.trim(),
      answer: addForm.answer.trim(),
      approved: true,
      created_by: auth.user?.id ?? null,
    }));
    const { error: insertError } = await supabase.from("custom_flashcards").insert(rows);
    setBusyKey(null);
    if (insertError) return toast.error(insertError.message);
    setAddForm((current) => ({ ...current, question: "", answer: "" }));
    toast.success(languages.length === 2 ? "Card added to both interface languages" : "French flashcard added");
    await load();
  };

  const saveCustomCard = async (value: Extract<EditingCard, { kind: "custom" }>) => {
    if (!value.question.trim() || !value.answer.trim()) return toast.error("Question and answer are required");
    setBusyKey(`custom:${value.id}`);
    const { error: saveError } = await supabase.from("custom_flashcards").update({
      chapter: value.chapter,
      language: value.language,
      question: value.question.trim(),
      answer: value.answer.trim(),
    }).eq("id", value.id);
    setBusyKey(null);
    if (saveError) return toast.error(saveError.message);
    setEditing(null);
    toast.success("Additional card updated");
    await load();
  };

  const approveCustomCard = async (id: string) => {
    setBusyKey(`custom:${id}`);
    const { error: saveError } = await supabase.from("custom_flashcards").update({ approved: true }).eq("id", id);
    setBusyKey(null);
    if (saveError) return toast.error(saveError.message);
    toast.success("French flashcard approved");
    await load();
  };

  const deleteCustomCard = async (card: CustomFrenchCard) => {
    if (!window.confirm("Delete this additional French flashcard permanently?")) return;
    setBusyKey(`custom:${card.id}`);
    const { error: deleteError } = await supabase.from("custom_flashcards").delete().eq("id", card.id);
    setBusyKey(null);
    if (deleteError) return toast.error(deleteError.message);
    toast.success("Additional French flashcard deleted");
    await load();
  };

  const editedCount = overrides.length;
  const hiddenCount = overrides.filter((item) => item.hidden).length;
  const pendingCount = customCards.filter((item) => !item.approved).length;
  const displayedCount = scope === "library" ? visibleLibrary.length : visibleCustom.length;

  return (
    <section className="space-y-5" aria-labelledby="french-admin-title">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="french-admin-title" className="text-2xl font-bold text-foreground">French Flashcards</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Edit the 180 bundled cards, hide incorrect cards, restore source content, and publish additional cards.
          </p>
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            {FRENCH_FLASHCARD_TOTAL} source cards · {editedCount} changed · {hiddenCount} hidden · {customCards.length} additional · {pendingCount} pending
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.open("/flashcards/1?subject=french&lang=ar", "_blank", "noopener,noreferrer")}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ExternalLink className="h-4 w-4" /> Student preview
        </button>
      </div>

      <details className="group rounded-2xl border border-border bg-card p-4 open:shadow-sm">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Plus className="h-4 w-4" /></span>
          Add a new French flashcard
        </summary>
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              <span>Deck</span>
              <select value={addForm.chapter} onChange={(event) => setAddForm({ ...addForm, chapter: event.target.value })} className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-foreground">
                {FRENCH_FLASHCARD_DECKS.map((deck) => <option key={deck.chapter} value={deck.chapter}>{deck.chapter}. {deck.titleEn} · {deck.titleAr}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              <span>Visible in</span>
              <select value={addForm.language} onChange={(event) => setAddForm({ ...addForm, language: event.target.value })} className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-foreground">
                <option value="both">Arabic and English interfaces</option>
                <option value="ar">Arabic interface only</option>
                <option value="en">English interface only</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Question</span>
            <textarea value={addForm.question} onChange={(event) => setAddForm({ ...addForm, question: event.target.value })} rows={3} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground" />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Answer</span>
            <textarea value={addForm.answer} onChange={(event) => setAddForm({ ...addForm, answer: event.target.value })} rows={4} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground" />
          </label>
          <button type="button" onClick={addCustomCard} disabled={busyKey === "add"} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
            {busyKey === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Publish card
          </button>
        </div>
      </details>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="French flashcard sources">
          <button type="button" role="tab" aria-selected={scope === "library"} onClick={() => { setScope("library"); setEditing(null); }} className={`min-h-10 rounded-xl px-4 text-sm font-semibold transition ${scope === "library" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            Built-in library ({FRENCH_FLASHCARD_TOTAL})
          </button>
          <button type="button" role="tab" aria-selected={scope === "custom"} onClick={() => { setScope("custom"); setEditing(null); }} className={`min-h-10 rounded-xl px-4 text-sm font-semibold transition ${scope === "custom" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            Additional cards ({customCards.length})
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions and answers" className="min-h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </label>
          <select aria-label="Filter by French deck" value={chapter} onChange={(event) => setChapter(event.target.value)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground">
            <option value="all">All seven decks</option>
            {FRENCH_FLASHCARD_DECKS.map((deck) => <option key={deck.chapter} value={deck.chapter}>{deck.chapter}. {deck.titleEn}</option>)}
          </select>
          {scope === "library" ? (
            <select aria-label="Filter library state" value={libraryState} onChange={(event) => setLibraryState(event.target.value as typeof libraryState)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground">
              <option value="all">All source cards</option>
              <option value="edited">Changed cards</option>
              <option value="hidden">Hidden cards</option>
            </select>
          ) : (
            <select aria-label="Filter approval state" value={customState} onChange={(event) => setCustomState(event.target.value as typeof customState)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground">
              <option value="all">All statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground">Showing {displayedCount} cards</p>
      </div>

      {loading ? (
        <div className="space-y-3" aria-label="Loading French flashcards">
          {[0, 1, 2].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl border border-border bg-secondary/40" />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-semibold text-destructive">French cards could not be loaded</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <button type="button" onClick={() => void load()} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold"><RotateCcw className="h-4 w-4" /> Try again</button>
        </div>
      ) : scope === "library" ? (
        visibleLibrary.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No bundled French cards match these filters.</div>
        ) : (
          <div className="space-y-3">
            {visibleLibrary.map((row) => {
              const key = `library:${row.chapter}:${row.cardIndex}`;
              const isEditing = editing?.kind === "library" && editing.chapter === row.chapter && editing.cardIndex === row.cardIndex;
              return (
                <article key={key} className={`rounded-2xl border p-4 ${row.hidden ? "border-amber-500/35 bg-amber-500/5" : "border-border bg-card"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2.5 py-1">Deck {row.chapter}: {row.deckTitle}</span>
                        <span>Card {row.cardIndex + 1}</span>
                        {row.override && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">Changed</span>}
                        {row.hidden && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-600 dark:text-amber-300">Hidden from students</span>}
                      </div>
                      {isEditing ? (
                        <div className="space-y-3">
                          <label className="block space-y-1 text-sm font-medium"><span>Question</span><textarea rows={3} value={editing.question} onChange={(event) => setEditing({ ...editing, question: event.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2" /></label>
                          <label className="block space-y-1 text-sm font-medium"><span>Answer</span><textarea rows={4} value={editing.answer} onChange={(event) => setEditing({ ...editing, answer: event.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2" /></label>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap font-semibold text-foreground">{row.question}</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{row.answer}</p>
                        </>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {isEditing ? (
                        <>
                          <button type="button" onClick={() => setEditing(null)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium"><X className="h-4 w-4" /> Cancel</button>
                          <button type="button" disabled={busyKey === key} onClick={() => void saveLibraryCard(editing)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busyKey === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => setEditing({ kind: "library", chapter: row.chapter, cardIndex: row.cardIndex, question: row.question, answer: row.answer, hidden: row.hidden })} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-secondary"><Pencil className="h-4 w-4" /> Edit</button>
                          <button type="button" disabled={busyKey === key} onClick={() => void setLibraryVisibility(row, !row.hidden)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-secondary disabled:opacity-60">{row.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {row.hidden ? "Publish" : "Hide"}</button>
                          {row.override && <button type="button" disabled={busyKey === key} onClick={() => void restoreLibraryCard(row)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-secondary disabled:opacity-60"><RotateCcw className="h-4 w-4" /> Restore</button>}
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : visibleCustom.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Languages className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold text-foreground">No additional French cards found</p>
          <p className="mt-1 text-sm text-muted-foreground">Use “Add a new French flashcard” to publish one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleCustom.map((card) => {
            const key = `custom:${card.id}`;
            const isEditing = editing?.kind === "custom" && editing.id === card.id;
            return (
              <article key={card.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2.5 py-1">Deck {card.chapter}</span>
                      <span>{card.language.toUpperCase()} interface</span>
                      <span className={`rounded-full px-2.5 py-1 ${card.approved ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-amber-500/10 text-amber-600 dark:text-amber-300"}`}>{card.approved ? "Approved" : "Pending"}</span>
                    </div>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <select aria-label="Edit card deck" value={editing.chapter} onChange={(event) => setEditing({ ...editing, chapter: event.target.value })} className="min-h-10 rounded-xl border border-border bg-background px-3">{FRENCH_FLASHCARD_DECKS.map((deck) => <option key={deck.chapter} value={deck.chapter}>{deck.chapter}. {deck.titleEn}</option>)}</select>
                          <select aria-label="Edit card language" value={editing.language} onChange={(event) => setEditing({ ...editing, language: event.target.value })} className="min-h-10 rounded-xl border border-border bg-background px-3"><option value="ar">Arabic interface</option><option value="en">English interface</option></select>
                        </div>
                        <textarea aria-label="Edit custom question" rows={3} value={editing.question} onChange={(event) => setEditing({ ...editing, question: event.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2" />
                        <textarea aria-label="Edit custom answer" rows={4} value={editing.answer} onChange={(event) => setEditing({ ...editing, answer: event.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2" />
                      </div>
                    ) : (
                      <><p className="whitespace-pre-wrap font-semibold text-foreground">{card.question}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{card.answer}</p></>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {isEditing ? (
                      <><button type="button" onClick={() => setEditing(null)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium"><X className="h-4 w-4" /> Cancel</button><button type="button" disabled={busyKey === key} onClick={() => void saveCustomCard(editing)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busyKey === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button></>
                    ) : (
                      <>
                        {!card.approved && <button type="button" disabled={busyKey === key} onClick={() => void approveCustomCard(card.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white disabled:opacity-60"><Check className="h-4 w-4" /> Approve</button>}
                        <button type="button" onClick={() => setEditing({ kind: "custom", id: card.id, chapter: card.chapter, language: card.language, question: card.question, answer: card.answer })} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-secondary"><Pencil className="h-4 w-4" /> Edit</button>
                        <button type="button" disabled={busyKey === key} onClick={() => void deleteCustomCard(card)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"><Trash2 className="h-4 w-4" /> Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
