import { useEffect, useState, type FormEvent } from "react";
import { Copy, KeyRound, Loader2, Pencil, Plus, RefreshCw, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { validateCoupon, type CouponUnit } from "@/lib/adminCoupons";

type Coupon = {
  id: string; code: string; is_active: boolean; duration_amount: number | null;
  duration_unit: CouponUnit | null; duration_seconds: number | null;
  expires_at: string; redemptions: number; grants_full_access: boolean;
};
const units: Record<CouponUnit, string> = { hours: "ساعات", days: "أيام", months: "أشهر" };

export default function AdminCouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("24");
  const [unit, setUnit] = useState<CouponUnit>("hours");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: failure } = await supabase.rpc("admin_premium_coupons", { _action: "list" });
      if (failure) throw failure;
      setCoupons((Array.isArray(data) ? data : []) as unknown as Coupon[]);
    } catch (e) { setError(e instanceof Error ? e.message : "تعذّر تحميل الأكواد. حاول مرة أخرى."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const reset = () => { setEditing(null); setCode(""); setAmount("24"); setUnit("hours"); };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validateCoupon(code, Number(amount), unit);
    if (validation) return toast.error(validation);
    setBusy(true);
    try {
      const { error: failure } = await supabase.rpc("admin_premium_coupons", {
        _action: editing ? "update" : "create", _id: editing ?? undefined,
        _code: code.trim(), _amount: Number(amount), _unit: unit,
      });
      if (failure) throw failure;
      toast.success(editing ? "تم حفظ الكود" : "تم إنشاء الكود"); reset(); await load();
    } catch (e) { toast.error(typeof e === "object" && e && "message" in e ? String(e.message) : "تعذّر حفظ الكود"); }
    finally { setBusy(false); }
  };
  const toggle = async (coupon: Coupon) => {
    setActionId(coupon.id);
    try {
      const { error: failure } = await supabase.rpc("admin_premium_coupons", { _action: "toggle", _id: coupon.id, _active: !coupon.is_active });
      if (failure) throw failure;
      setCoupons(items => items.map(item => item.id === coupon.id ? { ...item, is_active: !item.is_active } : item));
      toast.success(coupon.is_active ? "تم إيقاف الكود" : "تم تفعيل الكود");
    } catch { toast.error("تعذّر تغيير حالة الكود"); }
    finally { setActionId(null); }
  };
  const duration = (coupon: Coupon) => coupon.duration_unit
    ? `${coupon.duration_amount} ${units[coupon.duration_unit]}`
    : coupon.duration_seconds ? `${coupon.duration_seconds / 3600} ساعة`
    : `حتى ${new Date(coupon.expires_at).toLocaleDateString("ar-IQ")}`;

  return <section dir="rtl" className="space-y-8 text-foreground">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div className="flex items-center gap-3"><KeyRound className="size-7 text-primary" /><h1 className="text-2xl font-bold">أكواد Premium</h1></div>
      <Button variant="outline" size="icon" title="تحديث الأكواد" aria-label="تحديث الأكواد" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /></Button>
    </header>
    <form onSubmit={save} className="space-y-4 border-b border-border pb-7">
      <h2 className="text-lg font-semibold">{editing ? "تعديل الكود" : "كود جديد"}</h2>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-2"><Label htmlFor="coupon-code">الكود</Label><Input id="coupon-code" value={code} onChange={e => setCode(e.target.value)} maxLength={100} required disabled={busy} /></div>
        <div className="space-y-2"><Label htmlFor="coupon-amount">المدة</Label><Input id="coupon-amount" type="number" min={1} max={1200} step={1} value={amount} onChange={e => setAmount(e.target.value)} required disabled={busy} /></div>
        <div className="space-y-2"><Label htmlFor="coupon-unit">وحدة المدة</Label><Select value={unit} onValueChange={v => setUnit(v as CouponUnit)} disabled={busy}><SelectTrigger id="coupon-unit"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(units).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <p className="text-sm text-muted-foreground">يبدأ Premium من أول استخدام للكود، مرة واحدة لكل حساب. الأشهر تقويمية. التعديل وإيقاف الكود لا يغيّران مدة مُنحت سابقاً.</p>
      <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : editing ? <Save /> : <Plus />}{editing ? "حفظ التعديل" : "إنشاء الكود"}</Button>{editing && <Button type="button" variant="outline" onClick={reset} disabled={busy}><X />إلغاء</Button>}</div>
    </form>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">الأكواد <span className="text-muted-foreground">({coupons.length})</span></h2><Input className="w-full sm:w-64" aria-label="بحث عن كود" placeholder="بحث عن كود…" value={search} onChange={e => setSearch(e.target.value)} /></div>
    {error ? <div role="alert" className="space-y-3 text-destructive"><p>{error}</p><Button variant="outline" onClick={() => void load()}>حاول مرة أخرى</Button></div>
      : loading ? <div className="flex items-center gap-2 py-8 text-muted-foreground"><Loader2 className="size-5 animate-spin" />جارٍ التحميل…</div>
      : <div className="divide-y divide-border">{coupons.filter(c => c.code.toLowerCase().includes(search.trim().toLowerCase())).map(coupon => <article key={coupon.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1"><h3 className="break-words text-lg font-semibold">{coupon.code}</h3><p className="text-sm text-muted-foreground">{duration(coupon)} · {coupon.redemptions} استخدام · {coupon.grants_full_access ? "وصول كامل" : "Premium"}</p></div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">{coupon.is_active ? "مفعّل" : "متوقف"}</span><Switch aria-label={`تفعيل ${coupon.code}`} checked={coupon.is_active} disabled={actionId === coupon.id} onCheckedChange={() => void toggle(coupon)} />
          <Button size="icon" variant="ghost" title="نسخ الكود" aria-label={`نسخ ${coupon.code}`} onClick={async () => { try { await navigator.clipboard.writeText(coupon.code); toast.success("تم نسخ الكود"); } catch { toast.error("تعذّر النسخ"); } }}><Copy /></Button>
          {coupon.duration_unit && <Button size="icon" variant="ghost" title="تعديل الكود" aria-label={`تعديل ${coupon.code}`} disabled={busy} onClick={() => { setEditing(coupon.id); setCode(coupon.code); setAmount(String(coupon.duration_amount)); setUnit(coupon.duration_unit ?? "hours"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil /></Button>}
        </div>
      </article>)}{coupons.filter(c => c.code.toLowerCase().includes(search.trim().toLowerCase())).length === 0 && <p className="py-8 text-center text-muted-foreground">لا توجد أكواد.</p>}</div>}
  </section>;
}