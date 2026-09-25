import { useEffect } from "react";
import { ArrowRight, Home } from "lucide-react";
import TheoremVisualizer from "@/components/TheoremVisualizer";

const TheoremVisualizerPage = () => {
  useEffect(() => {
    document.title = "مبرهنة تعامد المستويين ثلاثية الأبعاد | تميزك";
  }, []);

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f7f4ec] via-white to-blue-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#183A72]">تميزك • الرياضيات</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">المجسم التفاعلي للمبرهنة</h1>
          </div>
          <a href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
            <Home className="h-4 w-4" />
            العودة إلى تميزك
            <ArrowRight className="h-4 w-4" />
          </a>
        </header>

        <TheoremVisualizer />
      </div>
    </main>
  );
};

export default TheoremVisualizerPage;
