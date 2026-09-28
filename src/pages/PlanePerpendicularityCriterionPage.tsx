import { useEffect } from "react";
import { ArrowRight, Home } from "lucide-react";
import TheoremVisualizer, { type TheoremContent, type TheoremGeometry } from "@/components/TheoremVisualizer";

const THEOREM_EIGHT_GEOMETRY: TheoremGeometry = {
  // The reusable scene uses A-B as its hinge and D as its construction point.
  // Relabeling maps that exact geometry to the notation in Theorem 8.
  pointLabels: { A: "C", B: "D", C: "A", D: "B", E: "E", T: "T" },
  planeLabels: { X: "Y", Y: "X" },
  segments: [
    { id: "intersection", from: "A", to: "B", color: "#172554" },
    { id: "horizontal-perpendicular", from: "D", to: "E", color: "#d97706" },
    { id: "hinged-perpendicular", from: "D", to: "C", color: "#16a34a" },
    { id: "test", from: "D", to: "T", color: "#7c3aed", dashed: true },
  ],
  segmentLabels: {
    intersection: "مستقيم التقاطع CD",
    "horizontal-perpendicular": "المستقيم BE",
    "hinged-perpendicular": "المستقيم AB",
    test: "مستقيم الاختبار BT",
  },
};

const THEOREM_EIGHT_CONTENT: TheoremContent = {
  heading: "مبرهنة 8: معيار تعامد المستويين",
  theorem: "يتعامد المستويان إذا احتوى أحدهما على مستقيم عمودي على الآخر، أو كل مستوٍ مارّ بمستقيم عمودي على مستوٍ آخر يكون عمودياً على ذلك المستوي.",
  sceneAriaLabel: "المستويان X وY يتقاطعان في CD، والمستقيم AB داخل Y عمودي على X، والمستقيم BE داخل X عمودي على CD",
  instruction: "حرّك زاوية المستويين ودوّر مستقيم الاختبار داخل X. لا يتحقق الشرط AB ⟂ X إلا عندما تبقى الزاوية 90° مع كل اتجاه.",
  dihedralControlLabel: "الزاوية الثنائية ∠ABE",
  testRotationControlLabel: "دوران مستقيم الاختبار BT في X",
  dihedralReadoutLabel: "∠ABE",
  testAngleReadoutLabel: "زاوية AB مع مستقيم الاختبار BT",
  passMessage: "✓ AB عمودي على كل اتجاه في X مارّ بالنقطة B؛ لذلك AB ⟂ X، والزاوية الثنائية ∠ABE = 90°، ومن ثم X ⟂ Y.",
  failMessage: "✕ الشرط AB ⟂ X غير متحقق: دوّر BT لتلاحظ أن زاويته مع AB تتغير، لذلك لا يمكن استنتاج تعامد المستويين.",
  snapToRightAngleFromStep: 2,
};

const THEOREM_EIGHT_PROOF = [
  "ليكن CD مستقيم تقاطع المستويين: X ∩ Y = CD.",
  "نأخذ النقطة B على CD، وفي المستوي X نرسم BE ⟂ CD.",
  "بما أن AB ⟂ X، فإن AB ⟂ CD وAB ⟂ BE؛ لأن CD وBE مستقيمان في X ويمران بقدم العمود B.",
  "لدينا AB ⊂ Y وBE ⊂ X، وكلاهما عمودي على CD عند النقطة نفسها B؛ لذلك ∠ABE هي الزاوية الثنائية بين Y وX على الحافة CD.",
  "وبما أن AB ⟂ BE، فإن ∠ABE = 90°، أي إن الزاوية الثنائية بين المستويين قائمة.",
  "إذن X ⟂ Y، وهو المطلوب إثباته.",
] as const;

const PlanePerpendicularityCriterionPage = () => {
  useEffect(() => {
    document.title = "مبرهنة 8 في تعامد المستويين | تميزك";
  }, []);

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f7f4ec] via-white to-blue-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#183A72]">تميزك • الرياضيات</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">المجسم التفاعلي للمبرهنة 8</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="روابط المبرهنات">
            <a href="/math/theorem-visualizer/result-7" className="inline-flex min-h-11 items-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-[#183A72] transition hover:bg-blue-100">
              النتيجة 7
            </a>
            <a href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <Home className="h-4 w-4" />
              العودة إلى تميزك
              <ArrowRight className="h-4 w-4" />
            </a>
          </nav>
        </header>

        <TheoremVisualizer
          geometry={THEOREM_EIGHT_GEOMETRY}
          proofSteps={THEOREM_EIGHT_PROOF}
          content={THEOREM_EIGHT_CONTENT}
        />
      </div>
    </main>
  );
};

export default PlanePerpendicularityCriterionPage;
