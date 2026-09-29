import { useEffect } from "react";
import { ArrowRight, Home } from "lucide-react";
import IntersectionPerpendicularResultVisualizer from "@/components/IntersectionPerpendicularResultVisualizer";
import TheoremDiagramTabs from "@/components/TheoremDiagramTabs";

const IntersectionPerpendicularResultPage = () => {
  useEffect(() => {
    document.title = "النتيجة 9: عمود تقاطع مستويين | تميزك";
  }, []);

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f7f4ec] via-white to-blue-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#183A72]">تميزك • الرياضيات</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">المجسم التفاعلي للنتيجة 9</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="التنقل الرئيسي">
            <a href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <Home className="h-4 w-4" />
              العودة إلى تميزك
              <ArrowRight className="h-4 w-4" />
            </a>
          </nav>
        </header>

        <TheoremDiagramTabs activeDiagram="result-9" />
        <IntersectionPerpendicularResultVisualizer />
      </div>
    </main>
  );
};

export default IntersectionPerpendicularResultPage;
