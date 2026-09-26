import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TEACHER_TOOL_CATALOG, type TeacherToolKey } from "@/lib/teacherTools";
import {
  FLASHCARD_LISTS,
  isFlashcardListId,
  type FlashcardListId,
} from "@/lib/flashcardLists";

type TeacherRow = {
  id: string;
  name: string;
  background_image_url: string;
  background_image_path: string;
  tools: string[] | null;
  flashcard_list_ids: string[] | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

type TeacherForm = {
  name: string;
  tools: TeacherToolKey[];
  flashcardListIds: FlashcardListId[];
  isPublished: boolean;
  sortOrder: number;
  image: File | null;
};

const EMPTY_FORM: TeacherForm = {
  name: "",
  tools: [],
  flashcardListIds: [],
  isPublished: true,
  sortOrder: 0,
  image: null,
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Could not save teacher";

export default function AdminTeachersTab() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [form, setForm] = useState<TeacherForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<TeacherRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platform_teachers")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setLoading(false);
    if (error) return toast.error(error.message);
    setTeachers((data ?? []) as TeacherRow[]);
  };

  useEffect(() => { void loadTeachers(); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    if (fileRef.current) fileRef.current.value = "";
  };

  const editTeacher = (teacher: TeacherRow) => {
    const validTools = (teacher.tools ?? []).filter((key): key is TeacherToolKey =>
      TEACHER_TOOL_CATALOG.some((tool) => tool.key === key)
    );
    const flashcardListIds = (teacher.flashcard_list_ids ?? []).filter(isFlashcardListId);
    setEditing(teacher);
    setForm({
      name: teacher.name,
      tools: validTools,
      flashcardListIds,
      isPublished: teacher.is_published,
      sortOrder: teacher.sort_order,
      image: null,
    });
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleTool = (key: TeacherToolKey) => {
    setForm((current) => ({
      ...current,
      tools: current.tools.includes(key)
        ? current.tools.filter((tool) => tool !== key)
        : [...current.tools, key],
      flashcardListIds:
        key === "flashcards" && current.tools.includes(key)
          ? []
          : current.flashcardListIds,
    }));
  };

  const toggleFlashcardList = (id: FlashcardListId) => {
    setForm((current) => ({
      ...current,
      flashcardListIds: current.flashcardListIds.includes(id)
        ? current.flashcardListIds.filter((listId) => listId !== id)
        : [...current.flashcardListIds, id],
    }));
  };

  const saveTeacher = async () => {
    const name = form.name.trim();
    if (!name) return toast.error("Teacher name is required");
    if (!editing && !form.image) return toast.error("Background image is required");
    if (form.tools.length === 0) return toast.error("Select at least one tool");
    if (form.tools.includes("flashcards") && form.flashcardListIds.length === 0) {
      return toast.error("Select at least one flashcard list");
    }
    if (form.image && !form.image.type.startsWith("image/")) return toast.error("Please select an image file");
    if (form.image && form.image.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5MB");

    setSaving(true);
    let uploadedPath: string | null = null;
    try {
      let imageUrl = editing?.background_image_url ?? "";
      let imagePath = editing?.background_image_path ?? "";

      if (form.image) {
        const rawExtension = form.image.name.split(".").pop()?.toLowerCase() || "jpg";
        const extension = rawExtension.replace(/[^a-z0-9]/g, "") || "jpg";
        uploadedPath = `teachers/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("teacher-images")
          .upload(uploadedPath, form.image, { contentType: form.image.type, upsert: false });
        if (uploadError) throw uploadError;
        imagePath = uploadedPath;
        imageUrl = supabase.storage.from("teacher-images").getPublicUrl(uploadedPath).data.publicUrl;
      }

      const payload = {
        name,
        background_image_url: imageUrl,
        background_image_path: imagePath,
        tools: form.tools,
        flashcard_list_ids: form.tools.includes("flashcards") ? form.flashcardListIds : [],
        is_published: form.isPublished,
        sort_order: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
      };

      const query = editing
        ? supabase.from("platform_teachers").update(payload).eq("id", editing.id)
        : supabase.from("platform_teachers").insert(payload);
      const { error } = await query;
      if (error) throw error;

      if (editing && uploadedPath && editing.background_image_path && editing.background_image_path !== uploadedPath) {
        await supabase.storage.from("teacher-images").remove([editing.background_image_path]);
      }

      toast.success(editing ? "Teacher updated" : "Teacher added");
      resetForm();
      await loadTeachers();
    } catch (error: unknown) {
      if (uploadedPath) await supabase.storage.from("teacher-images").remove([uploadedPath]);
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const deleteTeacher = async (teacher: TeacherRow) => {
    if (!confirm(`Delete ${teacher.name}?`)) return;
    setDeletingId(teacher.id);
    const { error } = await supabase.from("platform_teachers").delete().eq("id", teacher.id);
    if (!error && teacher.background_image_path) {
      await supabase.storage.from("teacher-images").remove([teacher.background_image_path]);
    }
    setDeletingId(null);
    if (error) return toast.error(error.message);
    if (editing?.id === teacher.id) resetForm();
    setTeachers((current) => current.filter((item) => item.id !== teacher.id));
    toast.success("Teacher deleted");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-secondary/40 p-5 backdrop-blur">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              {editing ? <Pencil className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {editing ? "Edit teacher" : "Add teacher"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Set the teacher name, card background, and the tools students can open.</p>
          </div>
          {editing && (
            <button type="button" onClick={resetForm} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm hover:bg-secondary">
              <X className="h-4 w-4" /> Cancel editing
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold">Teacher name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. حيدر ديوان"
              className="h-11 w-full rounded-xl border border-white/10 bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Display order</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
              className="h-11 w-full rounded-xl border border-white/10 bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-semibold">Background image {editing ? "(leave empty to keep current image)" : ""}</span>
          <span className="flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 text-center text-sm transition-colors hover:bg-primary/10">
            <ImagePlus className="h-5 w-5 text-primary" />
            {form.image?.name ?? "Choose JPG, PNG, or WebP (max 5MB)"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => setForm((current) => ({ ...current, image: event.target.files?.[0] ?? null }))}
          />
        </label>

        {editing?.background_image_url && !form.image && (
          <div className="mt-3 h-32 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(editing.background_image_url).slice(1, -1)})` }} />
        )}

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">Teacher tools</span>
            <span className="text-xs text-muted-foreground">{form.tools.length} selected</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TEACHER_TOOL_CATALOG.map((tool) => {
              const checked = form.tools.includes(tool.key);
              return (
                <label key={tool.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${checked ? "border-primary bg-primary/10 text-foreground" : "border-white/10 bg-background/50 text-muted-foreground hover:border-primary/30"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleTool(tool.key)} className="h-4 w-4 accent-primary" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{tool.labelEn}</span>
                    <span className="block truncate text-xs" dir="rtl">{tool.labelAr}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {form.tools.includes("flashcards") && (
          <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold">Flashcard lists</h3>
                <p className="mt-1 text-xs text-muted-foreground">Choose the subject flashcard lists that belong to this teacher.</p>
              </div>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-300">
                {form.flashcardListIds.length} selected
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {FLASHCARD_LISTS.map((list) => {
                const checked = form.flashcardListIds.includes(list.id);
                return (
                  <label key={list.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${checked ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-background/60 hover:border-blue-500/30"}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleFlashcardList(list.id)} className="h-4 w-4 accent-blue-600" />
                    <span>
                      <span className="block font-bold">{list.nameEn}</span>
                      <span className="block text-xs text-muted-foreground">{list.subjectEn} · {list.nameAr}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <label className="mt-5 inline-flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))}
            className="h-4 w-4 accent-primary"
          />
          Publish this teacher to students
        </label>

        <button
          type="button"
          onClick={saveTeacher}
          disabled={saving}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {editing ? "Save changes" : "Add teacher"}
        </button>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Teachers</h2>
          <span className="rounded-full border border-white/10 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">{teachers.length} total</span>
        </div>
        {loading ? (
          <div className="flex min-h-40 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
        ) : teachers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">No teachers added yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <article key={teacher.id} className="overflow-hidden rounded-2xl border border-white/10 bg-secondary/40">
                <div className="relative h-40 bg-slate-900 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(teacher.background_image_url).slice(1, -1)})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute inset-x-4 bottom-3 text-white">
                    <h3 className="text-lg font-bold">{teacher.name}</h3>
                    <p className="text-xs text-white/75">{teacher.tools?.length ?? 0} tools · order {teacher.sort_order}</p>
                  </div>
                  <span className={`absolute end-3 top-3 rounded-full px-2 py-1 text-[10px] font-bold ${teacher.is_published ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-200"}`}>
                    {teacher.is_published ? "Published" : "Hidden"}
                  </span>
                </div>
                <div className="flex gap-2 p-3">
                  <button type="button" onClick={() => editTeacher(teacher)} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 text-sm hover:border-primary/40 hover:bg-primary/5">
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button type="button" onClick={() => deleteTeacher(teacher)} disabled={deletingId === teacher.id} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                    {deletingId === teacher.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
