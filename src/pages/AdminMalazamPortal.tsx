import { BookMarked, LogOut } from "lucide-react";
import AdminMalazamTab from "@/components/AdminMalazamTab";

type AdminMalazamPortalProps = {
  onLogout: () => void | Promise<void>;
};

export default function AdminMalazamPortal({ onLogout }: AdminMalazamPortalProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-8 md:py-10" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <BookMarked className="size-6" />
            </span>
            <div>
              <p className="text-xs font-black text-primary">لوحة فريق الملازم</p>
              <h1 className="mt-1 text-2xl font-black">إدارة ملازم تميّزك</h1>
              <p className="mt-1 text-sm text-muted-foreground">رفع الملازم ونشرها أو إخفاؤها وحذفها فقط.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-bold transition hover:bg-secondary"
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </button>
        </header>

        <AdminMalazamTab />
      </div>
    </main>
  );
}
