import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Eye, EyeOff, Sparkles, Wrench } from "lucide-react";

type Row = {
  id: string;
  kind: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  active: boolean;
  sort_order: number;
  created_at: string;
};

const empty = {
  kind: "feature",
  title_ar: "",
  title_en: "",
  desc_ar: "",
  desc_en: "",
  sort_order: 0,
};

const AdminAnnouncementsTab = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("feature_announcements")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.title_ar.trim() || !form.title_en.trim()) {
      toast.error("العنوان بالعربي والإنكليزي مطلوب");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("feature_announcements").insert({
      ...form,
      sort_order: Number(form.sort_order) || 0,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة");
    setForm({ ...empty });
    load();
  };

  const toggle = async (r: Row) => {
    const { error } = await supabase
      .from("feature_announcements")
      .update({ active: !r.active })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)));
  };

  const remove = async (r: Row) => {
    if (!confirm("حذف هذا الإعلان؟")) return;
    const { error } = await supabase.from("feature_announcements").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.filter((x) => x.id !== r.id));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> إعلان جديد
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="feature">ميزة جديدة</option>
            <option value="fix">إصلاح</option>
          </select>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            placeholder="الترتيب"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <input
            value={form.title_ar}
            onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
            placeholder="العنوان بالعربية"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <input
            value={form.title_en}
            onChange={(e) => setForm({ ...form, title_en: e.target.value })}
            placeholder="Title (English)"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <textarea
            value={form.desc_ar}
            onChange={(e) => setForm({ ...form, desc_ar: e.target.value })}
            placeholder="الوصف بالعربية"
            className="min-h-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <textarea
            value={form.desc_en}
            onChange={(e) => setForm({ ...form, desc_en: e.target.value })}
            placeholder="Description (English)"
            className="min-h-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={add}
          disabled={saving}
          className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? "..." : "إضافة"}
        </button>
        <p className="text-xs text-muted-foreground">
          كل إعلان يظهر للمستخدم مرة واحدة فقط ولا يتكرر يومياً. أطفئ الإعلان لإيقاف ظهوره للجميع.
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد إعلانات.</p>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-card/50 p-4 flex items-start gap-3"
            >
              <div className="mt-1 text-primary">
                {r.kind === "fix" ? <Wrench className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{r.title_ar}</p>
                <p className="text-xs text-muted-foreground">{r.title_en}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.desc_ar}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  الترتيب: {r.sort_order} · {r.active ? "ظاهر" : "مخفي"}
                </p>
              </div>
              <button
                onClick={() => toggle(r)}
                className="rounded-lg border border-border p-2 hover:bg-muted"
                title={r.active ? "إخفاء" : "إظهار"}
              >
                {r.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => remove(r)}
                className="rounded-lg border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncementsTab;
