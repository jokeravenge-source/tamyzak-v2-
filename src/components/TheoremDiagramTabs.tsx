import { Box, CheckCircle2, Layers3, PanelsTopLeft } from "lucide-react";

export type TheoremDiagramId = "perpendicular-planes" | "result-7" | "theorem-8" | "theorem-9";

type TheoremDiagramTab = {
  id: TheoremDiagramId;
  label: string;
  shortLabel: string;
  href: string;
  Icon: typeof Layers3;
};

const THEOREM_DIAGRAMS: readonly TheoremDiagramTab[] = [
  {
    id: "perpendicular-planes",
    label: "تعامد المستويين",
    shortLabel: "Theorem 7",
    href: "/math/theorem-visualizer",
    Icon: Layers3,
  },
  {
    id: "result-7",
    label: "احتواء المستقيم في المستوي",
    shortLabel: "النتيجة 7",
    href: "/math/theorem-visualizer/result-7",
    Icon: CheckCircle2,
  },
  {
    id: "theorem-8",
    label: "معيار تعامد المستويين",
    shortLabel: "المبرهنة 8",
    href: "/math/theorem-visualizer/theorem-8",
    Icon: Box,
  },
  {
    id: "theorem-9",
    label: "المستوى العمودي الوحيد",
    shortLabel: "المبرهنة 9",
    href: "/math/theorem-visualizer/theorem-9",
    Icon: PanelsTopLeft,
  },
] as const;

type TheoremDiagramTabsProps = {
  activeDiagram: TheoremDiagramId;
};

/** Shared navigation for every interactive solid-geometry theorem diagram. */
const TheoremDiagramTabs = ({ activeDiagram }: TheoremDiagramTabsProps) => (
  <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm backdrop-blur" aria-label="الرسومات المتاحة">
    <div className="mb-2 flex items-center justify-between gap-3 px-2 pt-1">
      <p className="text-sm font-black text-slate-800">الرسومات المتاحة</p>
      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#183A72]">
        {THEOREM_DIAGRAMS.length} رسومات
      </span>
    </div>

    <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4" role="tablist" aria-label="اختر رسماً تفاعلياً">
      {THEOREM_DIAGRAMS.map(({ id, label, shortLabel, href, Icon }) => {
        const active = id === activeDiagram;
        return (
          <a
            key={id}
            href={href}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            className={`group flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183A72] focus-visible:ring-offset-2 ${
              active
                ? "border-[#183A72] bg-[#183A72] text-white shadow-md"
                : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
            }`}
          >
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${active ? "bg-white/15" : "bg-white text-[#183A72] shadow-sm"}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className={`block text-xs font-bold ${active ? "text-blue-100" : "text-[#183A72]"}`}>{shortLabel}</span>
              <span className="mt-0.5 block truncate text-sm font-black">{label}</span>
            </span>
          </a>
        );
      })}
    </nav>
  </section>
);

export default TheoremDiagramTabs;
