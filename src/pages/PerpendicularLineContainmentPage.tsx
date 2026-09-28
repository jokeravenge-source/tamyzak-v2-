import { useEffect } from "react";
import { ArrowRight, Home } from "lucide-react";
import PerpendicularLineContainmentVisualizer from "@/components/PerpendicularLineContainmentVisualizer";

const PerpendicularLineContainmentPage = () => {
  useEffect(() => {
    document.title = "نتيجة 7 في تعامد المستويين | تميزك";
  }, []);

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f7f4ec] via-white to-blue-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#183A72]">تميزك • الرياضيات</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">المجسم التفاعلي للنتيجة 7</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="روابط المبرهنات">
            <a href="/math/theorem-visualizer" className="inline-flex min-h-11 items-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-[#183A72] transition hover:bg-blue-100">
              المبرهنة السابقة
            </a>
            <a href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <Home className="h-4 w-4" />
              العودة إلى تميزك
              <ArrowRight className="h-4 w-4" />
            </a>
          </nav>
        </header>

        <PerpendicularLineContainmentVisualizer />
      </div>
    </main>
  );
};

export default PerpendicularLineContainmentPage;
