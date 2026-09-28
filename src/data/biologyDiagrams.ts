import type { DiagramDef } from "@/components/LabeledDiagram";
import { createElement as h, Fragment } from "react";

/* ---------- shared paints ---------- */
const P = "hsl(var(--primary))";
const A = "hsl(var(--accent))";

/* ============================================================
 * CHAPTER 1
 * ============================================================ */

/* 1.4 Bacteria */
const bacteria: DiagramDef = {
  id: "ch1-bacteria",
  title: { en: "Structure of Bacteria", ar: "تركيب البكتيريا" },
  aspect: "3/4",
  parts: [
    // ax 0-100 (viewBox x), ay 0-75 (viewBox y). lx/ly are container %.
    { id: "pilus",    label: { en: "Sex pilus",       ar: "الأهداب الجنسية" }, ax: 44, ay: 9,  lx: 2,  ly: 16 },
    { id: "cyto",     label: { en: "Cytoplasm",       ar: "السايتوبلازم" },    ax: 58, ay: 14, lx: 76, ly: 20 },
    { id: "nucleoid", label: { en: "Nucleoid",        ar: "النيوكليويد" },     ax: 50, ay: 12, lx: 76, ly: 30 },
    { id: "plasma",   label: { en: "Plasma membrane", ar: "الغشاء البلازمي" }, ax: 44, ay: 23, lx: 76, ly: 42 },
    { id: "wall",     label: { en: "Cell wall",       ar: "الجدار الخلوي" },   ax: 58, ay: 27, lx: 76, ly: 52 },
    { id: "capsule",  label: { en: "Capsule",         ar: "المحفظة" },         ax: 64, ay: 45, lx: 76, ly: 62 },
    { id: "fimbriae", label: { en: "Fimbriae",        ar: "الزوائد" },         ax: 36, ay: 38, lx: 2,  ly: 50 },
    { id: "flagella", label: { en: "Flagella",        ar: "الأسواط" },         ax: 50, ay: 66, lx: 2,  ly: 82 },
  ],
  art: h(Fragment, null,
    // capsule (outer dashed halo)
    h("path", { d: "M36 8 Q36 3 50 3 Q64 3 64 8 L64 58 Q64 67 50 67 Q36 67 36 58 Z",
                fill: "hsl(var(--accent) / 0.10)", stroke: A, strokeWidth: 0.35, strokeDasharray: "1 1" }),
    // body (rod = cell wall outer)
    h("path", { d: "M40 10 Q40 6 50 6 Q60 6 60 10 L60 60 Q60 65 50 65 Q40 65 40 60 Z",
                fill: "hsl(var(--primary) / 0.22)", stroke: P, strokeWidth: 0.55 }),
    // cell wall band (darker ring around middle)
    h("path", { d: "M40 26 L60 26 L60 30 L40 30 Z", fill: "hsl(20 55% 45% / 0.55)", stroke: P, strokeWidth: 0.25 }),
    // plasma membrane band (just inside the wall band)
    h("path", { d: "M40 21 L60 21 L60 25 L40 25 Z", fill: "hsl(170 55% 55% / 0.55)", stroke: A, strokeWidth: 0.25 }),
    // nucleoid (DNA tangle near top)
    h("path", { d: "M44 10 q3 -3 6 1 t6 2 q-2 4 -6 3 t-6 2 q-2 -4 0 -8", fill: "none", stroke: "hsl(0 0% 12%)", strokeWidth: 0.45, opacity: 0.9 }),
    h("path", { d: "M46 13 q3 2 6 0 t5 2", fill: "none", stroke: "hsl(0 0% 12%)", strokeWidth: 0.4, opacity: 0.8 }),
    h("path", { d: "M47 16 q3 -2 6 1 t4 1", fill: "none", stroke: "hsl(0 0% 12%)", strokeWidth: 0.4, opacity: 0.8 }),
    // fimbriae (short hairs both sides, along full body)
    ...Array.from({ length: 14 }, (_, i) => h("line", {
      key: `fl${i}`, x1: 40, y1: 8 + i * 4, x2: 35, y2: 7 + i * 4.1,
      stroke: "hsl(0 0% 30%)", strokeWidth: 0.3,
    })),
    ...Array.from({ length: 14 }, (_, i) => h("line", {
      key: `fr${i}`, x1: 60, y1: 8 + i * 4, x2: 65, y2: 7 + i * 4.1,
      stroke: "hsl(0 0% 30%)", strokeWidth: 0.3,
    })),
    // sex pilus (longer hair from top-left of body)
    h("line", { x1: 44, y1: 8, x2: 30, y2: 4, stroke: "hsl(0 0% 20%)", strokeWidth: 0.45 }),
    // flagella (wavy tail from bottom)
    h("path", { d: "M50 65 Q47 68 50 70 T50 73 Q53 71 56 73 T54 67", fill: "none", stroke: "hsl(0 0% 20%)", strokeWidth: 0.5 }),
  ),
};

/* Animal cell */
const animalCell: DiagramDef = {
  id: "ch1-animal-cell",
  title: { en: "Animal Cell", ar: "الخلية الحيوانية" },
  aspect: "1/1",
  parts: [
    // Labels follow the supplied textbook reference, with rough ER left and smooth ER right.
    { id: "pino",      label: { en: "Pinocytotic vesicle", ar: "حويصلة الشرب الخلوي" },       ax: 44, ay: 8,  lx: 2,  ly: 2,  lw: 24 },
    { id: "lyso",      label: { en: "Lysosome",            ar: "الجسيم الحال" },                ax: 38, ay: 17, lx: 2,  ly: 14, lw: 21 },
    { id: "ribo",      label: { en: "Ribosomes",           ar: "الرايبوسومات" },                ax: 38, ay: 23, lx: 2,  ly: 26, lw: 21 },
    { id: "rer",       label: { en: "Rough ER",            ar: "الشبكة الإندوبلازمية الخشنة" }, ax: 36, ay: 32, lx: 2,  ly: 39, lw: 24 },
    { id: "centro",    label: { en: "Centrioles",          ar: "المريكزان" },                   ax: 44, ay: 49, lx: 2,  ly: 56, lw: 21 },
    { id: "membrane",  label: { en: "Cell (plasma) membrane", ar: "الغشاء البلازمي" },          ax: 31, ay: 56, lx: 2,  ly: 72, lw: 24 },
    { id: "cyto",      label: { en: "Cytoplasm",           ar: "السايتوبلازم" },                ax: 40, ay: 63, lx: 2,  ly: 86, lw: 21 },
    { id: "mito",      label: { en: "Mitochondrion",       ar: "الميتوكوندريا" },               ax: 61, ay: 12, lx: 80, ly: 5,  lw: 18 },
    { id: "golgi",     label: { en: "Golgi apparatus",     ar: "جهاز جولجي" },                  ax: 52, ay: 22, lx: 80, ly: 21, lw: 18 },
    { id: "nucleolus", label: { en: "Nucleolus",           ar: "النوية" },                      ax: 50, ay: 32, lx: 80, ly: 37, lw: 18 },
    { id: "nucleus",   label: { en: "Nucleus",             ar: "النواة" },                      ax: 54, ay: 36, lx: 80, ly: 48, lw: 18 },
    { id: "ser",       label: { en: "Smooth ER",           ar: "الشبكة الإندوبلازمية الملساء" }, ax: 64, ay: 36, lx: 80, ly: 61, lw: 18 },
    { id: "micro",     label: { en: "Microtubules",        ar: "الأنيبيبات الدقيقة" },          ax: 63, ay: 55, lx: 80, ly: 79, lw: 18 },
  ],
  art: h(Fragment, null,
    // Tall oval outline and pale cytoplasm, matching the supplied schoolbook figure.
    h("path", {
      d: "M50 2 C63 2 70 16 71 34 C73 53 65 70 50 72 C35 70 27 53 29 34 C30 16 37 2 50 2 Z",
      fill: "hsl(39 75% 94%)", stroke: "hsl(216 28% 18%)", strokeWidth: 0.8,
    }),
    h("path", {
      d: "M50 3.2 C62.2 3.2 68.8 16.6 69.8 34 C71.7 52.2 64.1 68.4 50 70.7 C35.9 68.4 28.3 52.2 30.2 34 C31.2 16.6 37.8 3.2 50 3.2 Z",
      fill: "none", stroke: "hsl(37 54% 69%)", strokeWidth: 0.28,
    }),

    // Central green nucleus with a red nucleolus.
    h("ellipse", { cx: 50, cy: 35, rx: 8.4, ry: 8.9, fill: "hsl(158 45% 35%)", stroke: "hsl(216 28% 18%)", strokeWidth: 0.55 }),
    h("ellipse", { cx: 50, cy: 35, rx: 7.7, ry: 8.2, fill: "none", stroke: "hsl(158 35% 24%)", strokeWidth: 0.22 }),
    h("circle", { cx: 50, cy: 32, r: 1.9, fill: "hsl(4 68% 42%)", stroke: "hsl(4 55% 30%)", strokeWidth: 0.28 }),

    // Three orange mitochondria with visible cristae.
    ...[[61,12,-12],[55,53,-18],[58,62,15]].map(([cx, cy, angle], i) => h("g", { key: `mt${i}`, transform: `rotate(${angle} ${cx} ${cy})` },
      h("ellipse", { cx, cy, rx: 4.6, ry: 2.25, fill: "hsl(24 91% 68%)", stroke: "hsl(17 67% 34%)", strokeWidth: 0.46 }),
      h("path", { d: `M${cx-3.2} ${cy} q0.8 -1.45 1.6 0 t1.6 0 t1.6 0 t1.6 0`, fill: "none", stroke: "hsl(12 70% 35%)", strokeWidth: 0.38, strokeLinecap: "round" }),
    )),

    // Golgi apparatus above the nucleus.
    h("path", {
      d: "M44 19.5 Q50 16.7 56 19.5 M43.5 21.5 Q50 18.5 56.5 21.5 M44 23.5 Q50 20.7 56 23.5 M45 25.4 Q50 23.1 55 25.4",
      fill: "none", stroke: "hsl(153 60% 24%)", strokeWidth: 0.72, strokeLinecap: "round",
    }),

    // Pinocytotic vesicles, lysosome and free ribosomes at the upper-left.
    h("circle", { cx: 44, cy: 8, r: 1.05, fill: "hsl(39 70% 98%)", stroke: "hsl(216 28% 20%)", strokeWidth: 0.4 }),
    h("circle", { cx: 47, cy: 6.2, r: 1.15, fill: "hsl(39 70% 98%)", stroke: "hsl(216 28% 20%)", strokeWidth: 0.4 }),
    h("circle", { cx: 38, cy: 17, r: 1.6, fill: "hsl(39 70% 98%)", stroke: "hsl(216 28% 20%)", strokeWidth: 0.42 }),
    ...[[36.5,22],[38.2,21.4],[39.7,22.7],[36.8,24.1],[39,24.3]].map(([x, y], i) =>
      h("circle", { key: `rb${i}`, cx: x, cy: y, r: 0.43, fill: "hsl(216 28% 18%)" })),

    // Rough ER forms the left bridge from the plasma membrane to the nuclear envelope.
    // Ribosomes cover its outer surface, which distinguishes it from the smooth ER.
    h("path", {
      d: "M30.5 27.5 C33 26.4 34.5 27.8 34 31.5 C33.5 35.6 34.2 39.7 36.2 39.7 C38.3 39.7 39 35.5 38.4 31.7 C37.9 28.3 39.3 26.7 42.1 28 M30.3 31 C32.1 30.2 32.5 32.5 32.2 35.4 C31.9 39.1 33.5 42.1 35.6 42 C38 41.9 39.4 38.7 39.3 35.1 C39.2 31.9 40.3 30.4 42.2 31.5",
      fill: "none", stroke: "hsl(216 28% 22%)", strokeWidth: 0.66, strokeLinecap: "round", strokeLinejoin: "round",
    }),
    ...[
      [30.8,26.8],[32.6,26.6],[34.3,27.2],[33.7,30],[33.4,33],
      [33.4,36],[34.1,39.2],[36.3,40.4],[38.2,38.4],[38.7,35.2],
      [38.1,31.7],[39,28.5],[40.7,27.2],[41.7,29.3],
    ].map(([x, y], i) =>
      h("circle", { key: `rerd${i}`, cx: x, cy: y, r: 0.31, fill: "hsl(216 28% 18%)" })),

    // Smooth ER forms the matching right bridge, from nucleus to plasma membrane, without ribosomes.
    h("path", {
      d: "M57.9 28 C60.7 26.7 62.1 28.3 61.6 31.7 C61 35.5 61.7 39.7 63.8 39.7 C65.8 39.7 66.6 35.6 66 31.5 C65.5 27.8 67 26.4 69.5 27.5 M57.8 31.5 C59.7 30.4 60.8 31.9 60.7 35.1 C60.6 38.7 62 41.9 64.4 42 C66.5 42.1 68.1 39.1 67.8 35.4 C67.5 32.5 67.9 30.2 69.7 31",
      fill: "none", stroke: "hsl(216 28% 22%)", strokeWidth: 0.66, strokeLinecap: "round", strokeLinejoin: "round",
    }),

    // Paired centrioles below-left of the nucleus.
    h("g", null,
      h("g", { transform: "rotate(-20 43 49)" },
        h("rect", { x: 40.5, y: 48, width: 5, height: 1.8, rx: 0.35, fill: "hsl(46 78% 50%)", stroke: "hsl(216 28% 22%)", strokeWidth: 0.28 }),
        ...[41.1,42.1,43.1,44.1].map((x, i) => h("line", { key: `ch${i}`, x1: x, y1: 48.1, x2: x, y2: 49.7, stroke: "hsl(28 70% 34%)", strokeWidth: 0.2 })),
      ),
      h("g", { transform: "rotate(70 46 50)" },
        h("rect", { x: 43.5, y: 49.1, width: 5, height: 1.8, rx: 0.35, fill: "hsl(46 78% 50%)", stroke: "hsl(216 28% 22%)", strokeWidth: 0.28 }),
        ...[44.1,45.1,46.1,47.1].map((x, i) => h("line", { key: `cv${i}`, x1: x, y1: 49.2, x2: x, y2: 50.8, stroke: "hsl(28 70% 34%)", strokeWidth: 0.2 })),
      ),
    ),

    // Short green fibers are the microtubules shown in the reference image.
    ...[
      [61,54,65,50], [62,56,66,53], [63,58,66,56],
      [40,57,42,63], [42,58,45,64], [48,66,53,68],
      [49,64,54,68], [45,11,48,8], [46,13,50,9],
    ].map(([x1, y1, x2, y2], i) => h("line", {
      key: `tub${i}`, x1, y1, x2, y2, stroke: "hsl(149 68% 26%)", strokeWidth: 0.58, strokeLinecap: "round",
    })),
  ),
};

/* Plant cell */
const plantCell: DiagramDef = {
  id: "ch1-plant-cell",
  title: { en: "Plant Cell", ar: "الخلية النباتية" },
  aspect: "1/1",
  parts: [
    // Right side labels
    { id: "wall",     label: { en: "Cell wall",         ar: "الجدار الخلوي" },        ax: 88, ay: 3,    lx: 80, ly: 2,  lw: 18 },
    { id: "membrane", label: { en: "Cell membrane",     ar: "الغشاء البلازمي" },      ax: 86, ay: 7.5,  lx: 80, ly: 10, lw: 18 },
    { id: "golgi",    label: { en: "Golgi apparatus",   ar: "جهاز جولجي" },           ax: 58, ay: 15,   lx: 80, ly: 18, lw: 18 },
    { id: "chloro",   label: { en: "Chloroplast",       ar: "البلاستيدة الخضراء" },   ax: 80, ay: 22.5, lx: 80, ly: 30, lw: 18 },
    { id: "vacmem",   label: { en: "Vacuole membrane",  ar: "غشاء الفجوة" },          ax: 66, ay: 34.5, lx: 80, ly: 42, lw: 18 },
    { id: "mito",     label: { en: "Mitochondrion",     ar: "الميتوكوندريا" },        ax: 76, ay: 54,   lx: 80, ly: 64, lw: 18 },
    { id: "cyto",     label: { en: "Cytoplasm",         ar: "السايتوبلازم" },         ax: 50, ay: 66,   lx: 80, ly: 82, lw: 18 },
    // Left side labels
    { id: "gvesi",    label: { en: "Golgi vesicles",    ar: "حويصلات جولجي" },        ax: 36, ay: 12,   lx: 2,  ly: 4,  lw: 18 },
    { id: "ribo",     label: { en: "Ribosome",          ar: "الرايبوسوم" },           ax: 28, ay: 16,   lx: 2,  ly: 12, lw: 18 },
    { id: "ser",      label: { en: "Smooth ER",         ar: "الشبكة الملساء" },       ax: 24, ay: 24,   lx: 2,  ly: 20, lw: 18 },
    { id: "nucleolus",label: { en: "Nucleolus",         ar: "النوية" },               ax: 30, ay: 31.5, lx: 2,  ly: 30, lw: 18 },
    { id: "nucleus",  label: { en: "Nucleus",           ar: "النواة" },               ax: 32, ay: 36,   lx: 2,  ly: 40, lw: 18 },
    { id: "rer",      label: { en: "Rough ER",          ar: "الشبكة الخشنة" },        ax: 24, ay: 42,   lx: 2,  ly: 50, lw: 18 },
    { id: "vacuole",  label: { en: "Central vacuole",   ar: "الفجوة المركزية" },      ax: 50, ay: 45,   lx: 2,  ly: 66, lw: 18 },
    { id: "amylo",    label: { en: "Amyloplast",        ar: "بلاستيدة نشوية" },       ax: 20, ay: 60,   lx: 2,  ly: 80, lw: 18 },
  ],
  art: h(Fragment, null,
    // Cell wall (dark outer rounded rect)
    h("rect", { x: 10, y: 3,   width: 80, height: 68, rx: 4, fill: "hsl(95 45% 78%)", stroke: "hsl(95 40% 35%)", strokeWidth: 0.7 }),
    // Cell membrane (just inside)
    h("rect", { x: 13, y: 5.5, width: 74, height: 63, rx: 4, fill: "hsl(95 50% 82%)", stroke: "hsl(95 40% 45%)", strokeWidth: 0.35 }),
    // Large central vacuole (off-white blob, vacuole membrane = its border)
    h("path", { d: "M33 22 Q33 17 40 17 L62 17 Q72 17 72 27 L72 56 Q72 64 60 64 L40 64 Q33 64 33 56 Z",
                fill: "hsl(50 60% 96%)", stroke: "hsl(40 50% 55%)", strokeWidth: 0.4 }),
    // Chloroplasts (green ovals with stripes)
    ...[[80, 22.5],[80, 33],[80, 44],[26, 50],[54, 62]].map(([cx, cy], i) => h("g", { key: `cp${i}` },
      h("ellipse", { cx, cy, rx: 4, ry: 2, fill: "hsl(95 55% 60%)", stroke: "hsl(95 50% 30%)", strokeWidth: 0.3 }),
      ...Array.from({ length: 4 }, (_, k) => h("line", {
        key: k, x1: cx - 2.8 + k * 1.6, y1: cy - 1.4, x2: cx - 2.8 + k * 1.6, y2: cy + 1.4,
        stroke: "hsl(95 55% 30%)", strokeWidth: 0.3,
      })),
    )),
    // Mitochondria (pink/orange ovals with cristae)
    ...[[76, 54],[44, 64]].map(([cx, cy], i) => h("g", { key: `mt${i}` },
      h("ellipse", { cx, cy, rx: 4, ry: 2, fill: "hsl(15 65% 80%)", stroke: "hsl(15 55% 50%)", strokeWidth: 0.3 }),
      h("path", { d: `M${cx-3} ${cy} q1 -1.6 2 0 q1 1.6 2 0 q1 -1.6 2 0`, fill: "none", stroke: "hsl(25 60% 50%)", strokeWidth: 0.35 }),
    )),
    // Nucleus (pink oval)
    h("ellipse", { cx: 30, cy: 35, rx: 6, ry: 5.5, fill: "hsl(320 50% 88%)", stroke: "hsl(320 40% 55%)", strokeWidth: 0.35 }),
    // Nucleolus (small purple inside nucleus)
    h("circle",  { cx: 30, cy: 32, r: 1.6, fill: "hsl(280 50% 50%)" }),
    // Smooth ER (wavy stacked curves, no dots)
    h("path", { d: "M19 22 Q23 20 27 22 M19 24 Q23 22 27 24 M19 26 Q23 24 27 26 M19 28 Q23 26 27 28",
                fill: "none", stroke: "hsl(200 55% 55%)", strokeWidth: 0.35 }),
    // Rough ER (wavy stacks with ribosome dots)
    h("path", { d: "M19 41 Q23 39 27 41 M19 43 Q23 41 27 43 M19 45 Q23 43 27 45",
                fill: "none", stroke: "hsl(200 55% 55%)", strokeWidth: 0.35 }),
    ...Array.from({ length: 8 }, (_, i) => h("circle", {
      key: `rerd${i}`, cx: 19 + (i % 4) * 2.6, cy: 40 + Math.floor(i / 4) * 2.2 + (i % 2) * 0.3,
      r: 0.35, fill: "hsl(0 0% 15%)",
    })),
    // Ribosome cluster (free)
    ...[[26, 16],[28, 15.5],[30, 17],[27, 18],[29, 19],[31, 18.5]].map(([x, y], i) =>
      h("circle", { key: `rb${i}`, cx: x, cy: y, r: 0.5, fill: "hsl(0 0% 12%)" })),
    // Golgi vesicles (small empty circles)
    ...[[34, 13],[37, 14],[40, 12.5],[42, 14.5],[36, 11]].map(([x, y], i) =>
      h("circle", { key: `gv${i}`, cx: x, cy: y, r: 0.7, fill: "none", stroke: "hsl(40 60% 50%)", strokeWidth: 0.3 })),
    // Golgi apparatus (stacked curved cisternae)
    h("path", { d: "M48 13 Q54 11 60 13 M48 15 Q54 13 60 15 M48 17 Q54 15 60 17 M48 19 Q54 17 60 19",
                fill: "none", stroke: "hsl(35 75% 55%)", strokeWidth: 0.55 }),
    // Amyloplast (concentric spiral - starch grain)
    h("g", null,
      h("circle", { cx: 20, cy: 60, r: 2.2, fill: "hsl(220 15% 88%)", stroke: "hsl(220 20% 55%)", strokeWidth: 0.3 }),
      h("circle", { cx: 20, cy: 60, r: 1.5, fill: "none", stroke: "hsl(220 20% 55%)", strokeWidth: 0.25 }),
      h("circle", { cx: 20, cy: 60, r: 0.8, fill: "none", stroke: "hsl(220 20% 55%)", strokeWidth: 0.25 }),
    ),
  ),
};

/* Mitochondrion (A for memorizing) */
const mitochondrion: DiagramDef = {
  id: "ch1-mitochondrion",
  title: { en: "Mitochondrion", ar: "الميتوكوندريا" },
  aspect: "16/9",
  parts: [
    { id: "outer",   label: { en: "Outer membrane", ar: "الغشاء الخارجي" }, ax: 35, ay: 20, lx: 27, ly: 3,  lw: 20 },
    { id: "inner",   label: { en: "Inner membrane", ar: "الغشاء الداخلي" }, ax: 64, ay: 21, lx: 55, ly: 3,  lw: 20 },
    { id: "cristae", label: { en: "Cristae",        ar: "الأعراف" },       ax: 23, ay: 43, lx: 3,  ly: 76, lw: 18 },
    { id: "matrix",  label: { en: "Matrix",         ar: "الحشوة" },        ax: 77, ay: 39, lx: 79, ly: 72, lw: 18 },
  ],
  art: (() => {
    const MEMBRANE = "hsl(17 92% 76%)";
    const MEMBRANE_EDGE = "hsl(18 55% 24%)";
    const MATRIX = "hsl(91 38% 68%)";
    const GRANULE = "hsl(355 66% 28%)";
    const outer = "M10 39 C10 27 20 20 34 19 C45 18 51 21 60 19 C75 16 91 21 94 33 C98 45 87 53 70 56 C57 58 47 55 35 57 C20 59 11 52 10 39 Z";
    const inner = "M14 39 C14 29 22 23.5 35 22.5 C45 22 52 24 61 22 C74 19 88 23 91 33.5 C94 43.5 83 50.5 69 53 C57 55 47 52.5 35 54 C22 55.5 14.5 49 14 39 Z";
    const topCristae = [
      "M33.5 22.7 C34.2 27 35.2 30.5 36.5 34.8 C37 36.7 38.7 36.2 38.6 34.3 C38.2 29.8 37.2 26.2 37 22.4 Z",
      "M48 22.8 C48.8 27 50 31.5 50.4 38 C50.6 40.2 52.7 40.4 53.2 38.3 C53.5 32.8 52.1 27 52.5 22.5 Z",
      "M59.8 22.2 C60 25.5 61.8 27.3 63.2 30 C64.2 31.8 65.8 30.5 65.1 28.7 C64.5 26.8 63.6 24.7 64.3 21.5 Z",
      "M72.2 20.7 C72.7 25.2 76 27 78.2 31.2 C79.4 33.3 81 32.2 80.1 29.9 C78.5 25.6 76.8 22.7 76.2 20.5 Z",
    ];
    const bottomCristae = [
      "M17 47.7 C19.6 46.8 21.5 43.5 23.2 39.5 C24 37.6 25.7 38.2 25.4 40.2 C24.6 45.2 26.2 49.9 28.2 54.2 L22 54 Z",
      "M31 54.7 C31.4 49.8 30.4 45.2 31.7 41.2 C32.4 39.2 34 39.6 34 41.6 C33.7 46.8 35.8 51.5 38 54 Z",
      "M43 53.6 C43 48.5 41.5 44 42.4 40 C42.9 37.8 44.8 38.2 45 40.4 C45.1 45.1 47.7 50.4 50 53 Z",
      "M57 53.7 C57.5 49.1 56.3 45.2 57.2 41.3 C57.7 39.1 59.7 39.5 59.7 41.7 C59.4 46.2 61 50.4 62.8 53.8 Z",
      "M71 52.6 C72.2 48.7 71.2 45 72.3 41.5 C73 39.5 74.6 40 74.7 42 C74.6 46 77.6 49.5 80.4 49.5 L84 48 Z",
    ];
    return h(Fragment, null,
      // Orange outer membrane and green matrix follow the supplied reference.
      h("path", { d: outer, fill: MEMBRANE, stroke: MEMBRANE_EDGE, strokeWidth: 0.85, strokeLinejoin: "round" }),
      h("path", { d: inner, fill: MATRIX, stroke: MEMBRANE_EDGE, strokeWidth: 0.55, strokeLinejoin: "round" }),

      // Inner-membrane infoldings (cristae) project deeply into the matrix.
      ...topCristae.map((d, i) => h("path", {
        key: `tcr${i}`, d, fill: MEMBRANE, stroke: MEMBRANE_EDGE, strokeWidth: 0.45, strokeLinejoin: "round",
      })),
      ...bottomCristae.map((d, i) => h("path", {
        key: `bcr${i}`, d, fill: MEMBRANE, stroke: MEMBRANE_EDGE, strokeWidth: 0.45, strokeLinejoin: "round",
      })),

      // Matrix granules and mitochondrial DNA details visible in the reference.
      ...[[23,35],[29,45],[39,33],[48,28],[53,46],[61,43],[71,31]].map(([x, y], i) =>
        h("circle", { key: `mg${i}`, cx: x, cy: y, r: 0.75, fill: GRANULE })
      ),
      h("path", { d: "M31 35 C33 31 35 29 36 28 C35 32 33 35 31 37", fill: "none", stroke: MEMBRANE_EDGE, strokeWidth: 0.36, strokeLinecap: "round" }),
      h("path", { d: "M42 35 C44 38 45 41 46 44 M41 36 C43 33 45 31 46 29 C46 34 45 38 44 42", fill: "none", stroke: MEMBRANE_EDGE, strokeWidth: 0.36, strokeLinecap: "round" }),
    );
  })(),
};

/* Chloroplast (reference for memorizing) */
const chloroplast: DiagramDef = {
  id: "ch1-chloroplast",
  title: { en: "Chloroplast", ar: "البلاستيدة الخضراء" },
  aspect: "16/9",
  parts: [
    { id: "grana",   label: { en: "Grana lamellae", ar: "صفائح الكرانا" }, ax: 34, ay: 22, lx: 2,  ly: 18, lw: 22 },
    { id: "outer",   label: { en: "Outer membrane", ar: "الغشاء الخارجي" }, ax: 10, ay: 42, lx: 2,  ly: 52, lw: 22 },
    { id: "inner",   label: { en: "Inner membrane", ar: "الغشاء الداخلي" }, ax: 14, ay: 48, lx: 2,  ly: 70, lw: 22 },
    { id: "starch",  label: { en: "Starch granule", ar: "حبيبة نشاء" },     ax: 64, ay: 26, lx: 78, ly: 18, lw: 20 },
    { id: "stroma",  label: { en: "Stroma",         ar: "السدى" },          ax: 70, ay: 42, lx: 78, ly: 42, lw: 20 },
    { id: "granum",  label: { en: "Granum",         ar: "الكرانوم" },       ax: 80, ay: 55, lx: 78, ly: 70, lw: 20 },
  ],
  art: (() => {
    const OUTER = "hsl(95 35% 45%)";
    const INNER = "hsl(95 45% 55%)";
    const STROMA_BG = "hsl(50 75% 92%)";
    const GRANUM = "hsl(135 55% 38%)";
    const GRANUM_EDGE = "hsl(135 60% 22%)";
    const STARCH = "hsl(50 80% 80%)";
    const STARCH_EDGE = "hsl(40 55% 55%)";
    const THYLA = "hsl(205 65% 55%)";
    const grana: [number, number][] = [
      [26, 22], [46, 20], [68, 22],
      [22, 52], [42, 54], [62, 54], [80, 50],
      [36, 36], [78, 36],
    ];
    return h(Fragment, null,
      h("ellipse", { cx: 50, cy: 37.5, rx: 46, ry: 28, fill: STROMA_BG, stroke: OUTER, strokeWidth: 0.9 }),
      h("ellipse", { cx: 50, cy: 37.5, rx: 43.5, ry: 25.5, fill: "none", stroke: INNER, strokeWidth: 0.5 }),
      ...Array.from({ length: 70 }, (_, i) => {
        const a = (i * 137.5) * Math.PI / 180;
        const r = Math.sqrt((i + 1) / 70) * 24;
        const x = 50 + Math.cos(a) * r;
        const y = 37.5 + Math.sin(a) * r * 0.58;
        return h("circle", { key: `sd${i}`, cx: x, cy: y, r: 0.3, fill: "hsl(95 30% 45%)", opacity: 0.55 });
      }),
      h("path", { d: "M28 22 Q36 18 46 20 T68 22 Q76 24 80 26", fill: "none", stroke: THYLA, strokeWidth: 0.5 }),
      h("path", { d: "M22 52 Q32 48 42 54 T62 54 Q72 54 80 50", fill: "none", stroke: THYLA, strokeWidth: 0.5 }),
      h("path", { d: "M26 28 Q34 34 42 30 Q52 26 62 32 Q72 36 80 32", fill: "none", stroke: THYLA, strokeWidth: 0.5 }),
      h("path", { d: "M22 44 Q32 40 42 46 Q52 50 62 44 Q72 40 80 44", fill: "none", stroke: THYLA, strokeWidth: 0.5 }),
      h("path", { d: "M36 36 Q50 38 64 36 Q72 36 78 38", fill: "none", stroke: THYLA, strokeWidth: 0.4 }),
      h("ellipse", { cx: 40, cy: 32, rx: 3, ry: 2.4, fill: STARCH, stroke: STARCH_EDGE, strokeWidth: 0.3 }),
      h("ellipse", { cx: 56, cy: 42, rx: 5,  ry: 4,   fill: STARCH, stroke: STARCH_EDGE, strokeWidth: 0.3 }),
      h("circle",  { cx: 64, cy: 26, r: 1.4, fill: STARCH, stroke: STARCH_EDGE, strokeWidth: 0.3 }),
      ...grana.map(([cx, cy], i) => h("g", { key: `gr${i}` },
        ...Array.from({ length: 4 }, (_, k) => h("ellipse", {
          key: k, cx, cy: cy - 3 + k * 2, rx: 3.2, ry: 0.95,
          fill: GRANUM, stroke: GRANUM_EDGE, strokeWidth: 0.25,
        })),
      )),
    );
  })(),
};

/* Chromosome (sister chromatids + centromere) */
const chromosome: DiagramDef = {
  id: "ch1-chromosome",
  title: { en: "Chromosome", ar: "الكروموسوم" },
  aspect: "16/9",
  parts: [
    { id: "chromatids", label: { en: "Sister chromatids", ar: "كروماتيدان شقيقان" }, ax: 22, ay: 22, lx: 30, ly: 2,  lw: 36 },
    { id: "centromere", label: { en: "Centromere",        ar: "القطعة المركزية" },   ax: 52, ay: 38, lx: 70, ly: 44, lw: 26 },
  ],
  art: (() => {
    const BLUE = "hsl(205 75% 55%)";
    const BLUE_DK = "hsl(210 70% 35%)";
    const PURPLE = "hsl(285 55% 55%)";
    const PURPLE_DK = "hsl(285 55% 35%)";
    return h(Fragment, null,
      h("path", { d: "M50 38 Q30 18 14 18 Q8 18 8 24 Q8 28 14 30 Q30 34 50 40 Z", fill: BLUE, stroke: BLUE_DK, strokeWidth: 0.5 }),
      h("path", { d: "M50 38 Q30 58 14 58 Q8 58 8 52 Q8 48 14 46 Q30 42 50 36 Z", fill: BLUE, stroke: BLUE_DK, strokeWidth: 0.5 }),
      h("path", { d: "M50 38 Q70 18 86 18 Q92 18 92 24 Q92 28 86 30 Q70 34 50 40 Z", fill: PURPLE, stroke: PURPLE_DK, strokeWidth: 0.5 }),
      h("path", { d: "M50 38 Q70 58 86 58 Q92 58 92 52 Q92 48 86 46 Q70 42 50 36 Z", fill: PURPLE, stroke: PURPLE_DK, strokeWidth: 0.5 }),
      h("circle", { cx: 50, cy: 38, r: 4.5, fill: "hsl(50 95% 88%)", opacity: 0.95 }),
      h("circle", { cx: 50, cy: 38, r: 2.2, fill: "hsl(50 100% 96%)" }),
    );
  })(),
};

/* Plasma membrane (Fig 1.7) */
const plasmaMembrane: DiagramDef = {
  id: "ch1-plasma-membrane",
  title: { en: "Plasma Membrane", ar: "الغشاء البلازمي" },
  aspect: "16/9",
  parts: [
    // Label placement mirrors the supplied textbook figure.
    { id: "transport", label: { en: "Transporting materials", ar: "المواد المنقولة" },     ax: 56, ay: 14, lx: 39, ly: 1,  lw: 25 },
    { id: "hHead",     label: { en: "Hydrophilic head",       ar: "الرأس المحب للماء" },   ax: 29, ay: 27, lx: 2,  ly: 16, lw: 22 },
    { id: "hTail",     label: { en: "Hydrophobic tail",       ar: "الذيل الكاره للماء" },  ax: 30, ay: 37, lx: 2,  ly: 39, lw: 22 },
    { id: "channel",   label: { en: "Protein channel",        ar: "قناة بروتينية" },       ax: 38, ay: 56, lx: 2,  ly: 72, lw: 22 },
    { id: "hole",      label: { en: "Hole",                   ar: "الفتحة" },              ax: 39, ay: 60, lx: 31, ly: 89, lw: 16 },
    { id: "carrier",   label: { en: "Carrier proteins",       ar: "البروتينات الناقلة" },  ax: 70, ay: 57, lx: 54, ly: 89, lw: 22 },
    { id: "extra",     label: { en: "Extracellular",          ar: "خارج الخلية" },         ax: 89, ay: 13, lx: 81, ly: 5,  lw: 17, emphasizeArrow: true },
    { id: "phos",      label: { en: "Phospholipids",          ar: "الدهون الفسفورية" },    ax: 88, ay: 27, lx: 81, ly: 27, lw: 17 },
    { id: "intra",     label: { en: "Intracellular",          ar: "داخل الخلية" },         ax: 89, ay: 66, lx: 81, ly: 83, lw: 17, emphasizeArrow: true },
  ],
  art: (() => {
    // Textbook colors and geometry (viewBox 100 x 75).
    const HEAD_R = 1.75;
    const TOP_HEAD_Y = 27;
    const BOT_HEAD_Y = 57;
    const HEAD_FILL = "hsl(202 72% 46%)";
    const HEAD_STROKE = "hsl(214 45% 15%)";
    const CORE_FILL = "hsl(292 33% 48%)";
    const TAIL_STROKE = "hsl(305 29% 28%)";
    const PROTEIN_FILL = "hsl(13 92% 63%)";
    const PROTEIN_STROKE = "hsl(12 68% 25%)";
    const MATERIAL_FILL = "hsl(1 75% 50%)";
    const membraneSegments = [
      { x1: 27.5, x2: 34 },
      { x1: 44, x2: 50 },
      { x1: 61, x2: 74 },
      { x1: 80, x2: 91 },
    ];
    const phospholipidX = [
      28.5, 31, 33.5,
      44.5, 47, 49.5,
      61.5, 64, 66.5, 69, 71.5, 73.5,
      80.5, 83, 85.5, 88, 90.5,
    ];

    return h(Fragment, null,
      // Subtle zones clarify which empty region is outside and which is inside the cell.
      h("rect", {
        x: 25, y: 7, width: 69, height: 15, rx: 2.5,
        fill: "hsl(202 72% 46% / 0.07)", stroke: "hsl(202 72% 46% / 0.22)",
        strokeWidth: 0.3, strokeDasharray: "1.2 1.2",
      }),
      h("rect", {
        x: 25, y: 61, width: 69, height: 9, rx: 2.5,
        fill: "hsl(38 90% 55% / 0.08)", stroke: "hsl(38 80% 50% / 0.25)",
        strokeWidth: 0.3, strokeDasharray: "1.2 1.2",
      }),

      // Purple hydrophobic core, split by the membrane proteins exactly as in the reference.
      ...membraneSegments.map(({ x1, x2 }, i) => h("path", {
        key: `core${i}`,
        d: `M${x1} 28.2 L${x2} 28.2 L${x2} 55.8 L${x1} 55.8 Z`,
        fill: CORE_FILL,
        opacity: 0.95,
      })),

      // Paired fatty-acid tails face inward; the blue hydrophilic heads face the water.
      ...phospholipidX.map((x, i) => h(Fragment, { key: `pl${i}` },
        h("path", {
          d: `M${x - 0.38} ${TOP_HEAD_Y + 1.55} Q${x - 0.7} 34 ${x - 0.4} 40 M${x + 0.38} ${TOP_HEAD_Y + 1.55} Q${x + 0.75} 34 ${x + 0.4} 40`,
          fill: "none", stroke: TAIL_STROKE, strokeWidth: 0.3, strokeLinecap: "round",
        }),
        h("path", {
          d: `M${x - 0.38} ${BOT_HEAD_Y - 1.55} Q${x - 0.7} 50 ${x - 0.4} 44 M${x + 0.38} ${BOT_HEAD_Y - 1.55} Q${x + 0.75} 50 ${x + 0.4} 44`,
          fill: "none", stroke: TAIL_STROKE, strokeWidth: 0.3, strokeLinecap: "round",
        }),
      )),

      // Protein channel: two orange walls enclosing a white pore.
      h("path", {
        d: "M34 26 C34.8 24.2 36.5 24.2 37.2 26 L38 55.8 C37.5 59.2 35.5 59.5 34.5 56.4 Z",
        fill: PROTEIN_FILL, stroke: PROTEIN_STROKE, strokeWidth: 0.45,
      }),
      h("path", {
        d: "M43.8 26 C43.1 24.2 41.4 24.2 40.7 26 L40 55.8 C40.5 59.2 42.5 59.5 43.5 56.4 Z",
        fill: PROTEIN_FILL, stroke: PROTEIN_STROKE, strokeWidth: 0.45,
      }),

      // Carrier proteins: the same upright and slanted orange shapes in the supplied figure.
      h("path", {
        d: "M49.8 25.5 C50.6 23.8 52.2 24.2 52.7 26.2 L54.2 49.5 L50.7 58.2 C49.8 59.7 48 58.7 48.2 56.8 Z",
        fill: PROTEIN_FILL, stroke: PROTEIN_STROKE, strokeWidth: 0.45,
      }),
      h("path", {
        d: "M61 27 C62.3 24.3 64.4 24.7 64.5 27.2 L56 57.7 C55.2 60 52.8 59 53 56.8 Z",
        fill: PROTEIN_FILL, stroke: PROTEIN_STROKE, strokeWidth: 0.45,
      }),
      h("path", {
        d: "M74.2 26 C75 24.2 77 24.5 77.7 26.5 L78.3 55.8 C77.7 59 75.5 59.5 74.7 56.4 Z",
        fill: PROTEIN_FILL, stroke: PROTEIN_STROKE, strokeWidth: 0.45,
      }),
      h("path", {
        d: "M79 27 C78.8 24.5 81.1 24.2 82.3 26.5 L89.2 56.8 C89.7 59 87.2 60 86 57.8 Z",
        fill: PROTEIN_FILL, stroke: PROTEIN_STROKE, strokeWidth: 0.45,
      }),

      // Hydrophilic head rows.
      ...phospholipidX.map((x, i) => h("circle", {
        key: `th${i}`, cx: x, cy: TOP_HEAD_Y, r: HEAD_R,
        fill: HEAD_FILL, stroke: HEAD_STROKE, strokeWidth: 0.35,
      })),
      ...phospholipidX.map((x, i) => h("circle", {
        key: `bh${i}`, cx: x, cy: BOT_HEAD_Y, r: HEAD_R,
        fill: HEAD_FILL, stroke: HEAD_STROKE, strokeWidth: 0.35,
      })),

      // Red materials above, inside and below the transport proteins.
      ...[[35,15],[38,18],[36.5,21],[41,17],[40,22],[55,16],[58,17],[56,21],[60,20]].map(([x, y], i) =>
        h("circle", { key: `tm${i}`, cx: x, cy: y, r: 1.15, fill: MATERIAL_FILL, stroke: "hsl(0 65% 20%)", strokeWidth: 0.34 })
      ),
      h("circle", { cx: 39, cy: 62, r: 1.35, fill: MATERIAL_FILL, stroke: "hsl(0 65% 20%)", strokeWidth: 0.34 }),
      h("ellipse", { cx: 56.7, cy: 40.5, rx: 1.2, ry: 1.7, fill: MATERIAL_FILL, stroke: "hsl(0 65% 20%)", strokeWidth: 0.34 }),
      h("ellipse", { cx: 78.2, cy: 40.5, rx: 1.2, ry: 1.7, fill: MATERIAL_FILL, stroke: "hsl(0 65% 20%)", strokeWidth: 0.34 }),
    );
  })(),
};

/* Lysosomal digestion — redrawn from the supplied textbook reference */
const lysosomalDigestion: DiagramDef = {
  id: "ch1-lysosomal-digestion",
  title: { en: "Lysosomal Digestion", ar: "الهضم بواسطة الجسيمات الحالة" },
  aspect: "16/9",
  parts: [
    { id: "er",            label: { en: "Endoplasmic reticulum",      ar: "الشبكة الإندوبلازمية" },          ax: 49, ay: 14, lx: 2,  ly: 2,  lw: 25 },
    { id: "golgi",         label: { en: "Golgi apparatus",            ar: "جهاز جولجي" },                   ax: 47, ay: 28, lx: 2,  ly: 20, lw: 22 },
    { id: "cytoplasm",     label: { en: "Cytoplasm",                  ar: "السايتوبلازم" },                 ax: 34, ay: 35, lx: 2,  ly: 36, lw: 20 },
    { id: "foodParticles", label: { en: "Food particles",             ar: "دقائق الغذاء" },                 ax: 22, ay: 43, lx: 2,  ly: 51, lw: 20 },
    { id: "phagocytosis",  label: { en: "Phagocytosis",               ar: "البلعمة" },                      ax: 29, ay: 49, lx: 2,  ly: 68, lw: 20 },
    { id: "foodVacuole1",  label: { en: "Food vacuole",               ar: "الفجوة الغذائية" },             ax: 38, ay: 50, lx: 21, ly: 87, lw: 20 },
    { id: "fusion",        label: { en: "Lysosome-vacuole fusion",    ar: "اندماج الجسيم الحال والفجوة" }, ax: 48, ay: 53, lx: 48, ly: 87, lw: 26 },
    { id: "digestive",     label: { en: "Digestive vacuole",          ar: "الفجوة الهاضمة" },              ax: 58, ay: 50, lx: 75, ly: 70, lw: 22 },
    { id: "foodVacuole2",  label: { en: "Food vacuole",               ar: "الفجوة الغذائية" },             ax: 69, ay: 37, lx: 79, ly: 51, lw: 19 },
    { id: "lysosomes",     label: { en: "Lysosomes",                  ar: "الجسيمات الحالة" },             ax: 57, ay: 35, lx: 79, ly: 29, lw: 19 },
    { id: "exocytosis",    label: { en: "Exocytosis and elimination", ar: "الإخراج الخلوي والتخلص" },      ax: 77, ay: 20, lx: 75, ly: 3,  lw: 23 },
  ],
  art: (() => {
    const CELL = "hsl(38 55% 97%)";
    const MEMBRANE = "hsl(25 52% 38%)";
    const ER = "hsl(16 89% 53%)";
    const ER_DARK = "hsl(13 68% 34%)";
    const GOLGI = "hsl(345 78% 58%)";
    const GOLGI_DARK = "hsl(345 62% 35%)";
    const LYSO = "hsl(25 86% 74%)";
    const LYSO_DARK = "hsl(18 62% 35%)";
    const FOOD = "hsl(25 66% 34%)";
    const FLOW = "hsl(216 28% 18%)";
    return h(Fragment, null,
      h("defs", null,
        h("marker", { id: "lysosomal-flow-arrow", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 4.5, markerHeight: 4.5, orient: "auto-start-reverse" },
          h("path", { d: "M0,0 L10,5 L0,10 z", fill: FLOW }))),

      // Cell outline and the parallel plasma-membrane line.
      h("path", { d: "M35 7 C48 3 67 5 76 14 C82 20 78 29 80 39 C83 52 73 63 58 66 C46 68 34 64 31 57 C29 53 31 50 29 47 C26 43 27 37 27 31 C27 20 29 11 35 7 Z", fill: CELL, stroke: MEMBRANE, strokeWidth: 0.75, strokeLinejoin: "round" }),
      h("path", { d: "M36 8.5 C49 4.7 66 6.3 74.8 15.3 C80 21 76.8 29.3 78.5 39 C80.8 51 71.8 61 57.5 64.2 C46.3 66.3 35.2 62.5 32.5 56.2 C31 52.8 33.2 49.8 30.8 46.3 C28.2 42.5 29 35.8 28.8 30.8 C28.5 20.5 30.5 12.2 36 8.5 Z", fill: "none", stroke: "hsl(28 48% 66%)", strokeWidth: 0.28 }),

      // Rough endoplasmic reticulum, including the ribosome-studded surface.
      h("path", { d: "M37 13 C42 8 49 9 54 9 C61 8 67 10 71 14 C68 17 66 19 61 18 C58 21 54 18 51 20 C47 18 43 20 40 17 C37 18 34 16 37 13 Z", fill: ER, stroke: ER_DARK, strokeWidth: 0.5, strokeLinejoin: "round" }),
      h("path", { d: "M38 14 C45 12 51 13 57 12 C62 11 66 13 69 14 M39 16 C45 15 51 16 57 15 C62 14 65 16 67 17", fill: "none", stroke: ER_DARK, strokeWidth: 0.28 }),
      ...[[39,12],[42,11],[45,13],[48,11],[51,13],[54,11],[57,13],[60,11],[63,13],[66,12],[40,17],[44,18],[48,17],[53,18],[58,17],[63,18]].map(([x, y], i) => h("circle", { key: `erd${i}`, cx: x, cy: y, r: 0.28, fill: ER_DARK })),

      // Golgi cisternae and budding vesicles.
      ...[
        "M38 25 C43 22 51 22 58 24", "M37 27 C43 24 51 24 59 26",
        "M37 29.5 C44 26.5 52 27 58.5 28.5", "M38 32 C44 29 51 29.5 56.5 31",
        "M40 34 C45 31.5 50 32 54 33",
      ].map((d, i) => h("path", { key: `gc${i}`, d, fill: "none", stroke: GOLGI, strokeWidth: 2.15, strokeLinecap: "round" })),
      ...[[36.5,25.2],[58.8,22.4],[56.2,34.5]].map(([x, y], i) => h("ellipse", { key: `gv${i}`, cx: x, cy: y, rx: 1.7, ry: 1.1, fill: GOLGI, stroke: GOLGI_DARK, strokeWidth: 0.3 })),

      // Enzyme-filled lysosomes released from Golgi.
      ...[[47,38,1.1],[52,36,1.45],[56,32.5,1.65],[59.5,39,1.1],[62,34.5,1.5]].map(([cx, cy, r], i) => h("g", { key: `lys${i}` },
        h("circle", { cx, cy, r, fill: LYSO, stroke: LYSO_DARK, strokeWidth: 0.35 }),
        ...[[-0.35,-0.25],[0.45,-0.45],[0.15,0.45]].map(([dx, dy], k) => h("circle", { key: k, cx: cx + dx, cy: cy + dy, r: 0.18, fill: LYSO_DARK })))),

      // Food particles, phagocytic cup and the first food vacuole.
      ...[[22,38,1.8],[20.8,47.5,2.6],[24.6,54.5,1.25]].map(([cx, cy, r], i) => h("circle", { key: `fp${i}`, cx, cy, r, fill: FOOD, stroke: "hsl(22 58% 22%)", strokeWidth: 0.35 })),
      h("circle", { cx: 36.5, cy: 49.2, r: 2.25, fill: FOOD, stroke: "hsl(22 58% 22%)", strokeWidth: 0.35 }),
      h("path", { d: "M29.5 46 C31.5 44.5 35 44.8 38 46.5 C40.5 48 40.7 51.5 38.6 53.5 C36.2 55.6 32.5 54.5 30.5 52", fill: "none", stroke: MEMBRANE, strokeWidth: 0.55, strokeLinecap: "round" }),
      h("circle", { cx: 44, cy: 54, r: 4.05, fill: "hsl(20 82% 67%)", stroke: LYSO_DARK, strokeWidth: 0.48 }),
      h("circle", { cx: 43, cy: 53, r: 2.15, fill: FOOD, stroke: "hsl(22 58% 22%)", strokeWidth: 0.3 }),
      h("circle", { cx: 48.2, cy: 51.2, r: 1.65, fill: LYSO, stroke: LYSO_DARK, strokeWidth: 0.34 }),
      ...[[47.6,50.7],[48.5,51],[48,51.7]].map(([x, y], i) => h("circle", { key: `flys${i}`, cx: x, cy: y, r: 0.2, fill: LYSO_DARK })),

      // Digestive vacuole and a late food vacuole moving toward exocytosis.
      h("path", { d: "M54 47 C55.5 44.5 59 44 61.5 46 C64 48 63 53 60.5 55 C57.8 57 53.6 55.2 53.2 52 C53 50.3 53.4 48.4 54 47 Z", fill: FOOD, stroke: "hsl(22 58% 22%)", strokeWidth: 0.48 }),
      ...[[56,49],[58,47.5],[60,49.2],[56.5,52],[59.5,53]].map(([x, y], i) => h("path", { key: `frag${i}`, d: `M${x-0.5} ${y} q0.5 -0.8 1 0 q-0.4 0.8 -1 1`, fill: "none", stroke: "hsl(42 65% 86%)", strokeWidth: 0.45, strokeLinecap: "round" })),
      h("path", { d: "M58 45 C57.5 42.8 59 40.8 60.7 41.8 C62 42.7 61.5 44.5 60.5 46", fill: LYSO, stroke: LYSO_DARK, strokeWidth: 0.35 }),
      h("ellipse", { cx: 69.5, cy: 37, rx: 4.7, ry: 4.1, fill: "hsl(24 83% 72%)", stroke: LYSO_DARK, strokeWidth: 0.48 }),
      ...[[67.5,35],[70,34.5],[71.5,37],[68.5,38.5],[71,39]].map(([x, y], i) => h("path", { key: `late${i}`, d: `M${x-0.55} ${y} q0.55 -0.75 1.1 0 q-0.35 0.75 -1.1 0.9`, fill: "none", stroke: "hsl(20 60% 30%)", strokeWidth: 0.42, strokeLinecap: "round" })),

      // Exocytosis opening and released remnants.
      h("path", { d: "M75 25 C73 23 73.2 19.5 75.8 17.8 C77.5 16.7 79.3 17.5 80.2 19", fill: "none", stroke: MEMBRANE, strokeWidth: 0.62, strokeLinecap: "round" }),
      h("path", { d: "M75.5 23 C76.5 20 78.2 19.5 79.7 21.5", fill: "none", stroke: LYSO_DARK, strokeWidth: 0.42, strokeLinecap: "round" }),
      ...[[79.7,16.5],[81.5,14.5],[83.2,17.2],[84.5,13],[85.5,18.5],[82.5,20],[87,16]].map(([x, y], i) => h("circle", { key: `exo${i}`, cx: x, cy: y, r: 0.48, fill: FOOD })),

      // Direction arrows reproduce the complete sequence in the reference.
      ...[
        "M24.5 47.5 C27 47.5 29.5 47.5 32.5 48", "M39.2 51 C40 52 40.5 52.5 41 53",
        "M49.6 53 C51 52.8 51.8 52.2 52.7 51.5", "M62.2 47 C64.5 44.5 65.5 42 67 40.5",
        "M72.5 33.5 C74.5 30.5 75 28 75.8 25.5",
      ].map((d, i) => h("path", { key: `flow${i}`, d, fill: "none", stroke: FLOW, strokeWidth: 0.42, strokeLinecap: "round", markerEnd: "url(#lysosomal-flow-arrow)" })),
    );
  })(),
};

/* Neuron types — Chapter 2 opening diagram */
const neuronTypes: DiagramDef = {
  id: "ch2-neuron-types",
  title: { en: "Types of Neurons", ar: "أنواع الخلايا العصبية" },
  aspect: "16/9",
  parts: [
    { id: "multiBody", label: { en: "Cell body (multipolar)",        ar: "جسم الخلية (متعدد الأقطاب)" }, ax: 26, ay: 20, lx: 2,  ly: 16, lw: 22 },
    { id: "multiAxon", label: { en: "Axon (multipolar)",             ar: "المحور (متعدد الأقطاب)" },     ax: 26, ay: 44, lx: 2,  ly: 49, lw: 22 },
    { id: "multipolar",label: { en: "(c) Multipolar",                ar: "(ج) متعدد الأقطاب" },           ax: 26, ay: 63, lx: 16, ly: 88, lw: 20 },
    { id: "biDend",   label: { en: "Dendrites (bipolar)",           ar: "التغصنات (ثنائي القطب)" },       ax: 50, ay: 13, lx: 39, ly: 1,  lw: 22 },
    { id: "biBody",   label: { en: "Cell body (bipolar)",           ar: "جسم الخلية (ثنائي القطب)" },     ax: 50, ay: 36, lx: 37, ly: 40, lw: 22 },
    { id: "biAxon",   label: { en: "Axon (bipolar)",                ar: "المحور (ثنائي القطب)" },         ax: 50, ay: 52, lx: 37, ly: 69, lw: 22 },
    { id: "bipolar",  label: { en: "(a) Bipolar",                   ar: "(أ) ثنائي القطب" },              ax: 50, ay: 63, lx: 41, ly: 88, lw: 18 },
    { id: "pseudoDend",label:{ en: "Dendrites (pseudounipolar)",    ar: "التغصنات (كاذب أحادي القطب)" }, ax: 73, ay: 13, lx: 80, ly: 2,  lw: 18 },
    { id: "peripheral",label: { en: "Peripheral axon",              ar: "المحور المحيطي" },               ax: 73, ay: 25, lx: 80, ly: 24, lw: 18 },
    { id: "pseudoBody",label: { en: "Cell body (pseudounipolar)",   ar: "جسم الخلية (كاذب أحادي القطب)" },ax: 78, ay: 35, lx: 80, ly: 43, lw: 18 },
    { id: "central",  label: { en: "Central axon",                  ar: "المحور المركزي" },               ax: 73, ay: 47, lx: 80, ly: 62, lw: 18 },
    { id: "pseudo",   label: { en: "(b) Pseudounipolar",            ar: "(ب) كاذب أحادي القطب" },         ax: 73, ay: 62, lx: 65, ly: 88, lw: 24 },
  ],
  art: (() => {
    const CELL = "hsl(24 88% 73%)";
    const EDGE = "hsl(20 50% 24%)";
    const NUCLEUS = "hsl(350 62% 30%)";
    const MYELIN = "hsl(345 48% 24%)";
    const AXON = "hsl(30 78% 54%)";
    const branch = (d: string, key: string) => h("path", {
      key, d, fill: "none", stroke: EDGE, strokeWidth: 0.52,
      strokeLinecap: "round", strokeLinejoin: "round",
    });
    return h(Fragment, null,
      // (c) Multipolar neuron: many dendrites from the soma and one long myelinated axon.
      h("path", { d: "M26 15 C29 15.5 30 18 29 21 C28.5 23.5 27 25 26 26 C24.8 24.5 22.8 23.5 22.7 20.5 C22.5 17.5 23.8 15.5 26 15 Z", fill: CELL, stroke: EDGE, strokeWidth: 0.5 }),
      h("circle", { cx: 26, cy: 20, r: 1.05, fill: NUCLEUS }),
      ...[
        "M24 16 C22 14 21 12 20 10 M20.5 13 C18.5 13 17.5 11.5 16.5 10",
        "M25 15 C24 12.5 24 10.5 24.5 8 M24.3 10.5 C22.8 9.5 22.5 8 22.5 6.8",
        "M27 15.2 C28 12.5 29 11 31 10 M29.2 11.5 C29.5 9.8 30.8 8.5 32 7.5",
        "M29 18 C31.5 17 33 15.5 34 14 M31.8 16.5 C33 17 34.2 17 35.5 16.5",
        "M23 18 C20.5 17.5 18.5 16 17 14.5 M20.5 17 C19 18.2 17.7 18.5 16 18.3",
        "M23 22 C20.5 22 19 23.2 17.5 24.5 M20.5 22.4 C19.5 21 18.5 20.5 17 20.5",
        "M28.7 22 C31 22.5 32.5 24 34 25.5 M31.5 23.8 C33 23.3 34.4 23.7 35.5 24.5",
      ].map((d, i) => branch(d, `md${i}`)),
      h("line", { x1: 26, y1: 25.5, x2: 26, y2: 61, stroke: EDGE, strokeWidth: 0.65 }),
      ...[28,33,38,43,48,53,58].map((y, i) => h("rect", { key: `mm${i}`, x: 24.9, y, width: 2.2, height: 3.7, rx: 0.45, fill: MYELIN, stroke: EDGE, strokeWidth: 0.25 })),
      branch("M26 61 C25.5 63 24.5 64 23.8 65 M26 61 C26.5 63 27.5 64 28.3 65 M23.8 65 C24.6 65.6 25.3 65.5 26 64.8 M28.3 65 C27.5 65.6 26.8 65.5 26 64.8", "multi-terminal"),

      // (a) Bipolar neuron: dendrites and axon emerge from opposite ends of the soma.
      h("path", { d: "M50 30 C53 32.5 53.5 36 52 39 C51.3 40.5 50.5 41.5 50 43 C49.3 41.5 48.5 40.5 47.8 39 C46.5 36 47 32.5 50 30 Z", fill: CELL, stroke: EDGE, strokeWidth: 0.5 }),
      h("ellipse", { cx: 50, cy: 36.5, rx: 0.85, ry: 1.25, fill: NUCLEUS }),
      h("line", { x1: 50, y1: 30, x2: 50, y2: 16, stroke: EDGE, strokeWidth: 0.65 }),
      ...[
        "M50 16 C49 13 47.5 12 46 10 M47.8 12.3 C46 12.2 45 11 44 9.5",
        "M50 16 C51.2 13 52.5 12 54 9.5 M52.3 12.3 C54 12.2 55 10.8 56 9",
        "M49 14 C47 11 47 8.5 46.5 6.5 M51 14 C52 11 52 8.5 52.5 6.5",
      ].map((d, i) => branch(d, `bd${i}`)),
      h("line", { x1: 50, y1: 43, x2: 50, y2: 62, stroke: EDGE, strokeWidth: 0.65 }),
      h("path", { d: "M50 61 C48.5 62.5 48.5 64 50 65.5 C51.5 64 51.5 62.5 50 61 Z", fill: CELL, stroke: EDGE, strokeWidth: 0.45 }),

      // (b) Pseudounipolar neuron: a lateral soma joins peripheral and central axon branches.
      h("line", { x1: 73, y1: 17, x2: 73, y2: 57, stroke: EDGE, strokeWidth: 0.72 }),
      ...[
        "M73 17 C72 14 70.5 13 69 11 M70.8 13.3 C69 13.2 68 12 67 10.5",
        "M73 17 C74 14 75.5 13 77 10 M75.3 13 C77 13 78.2 11.5 79 9.5",
        "M72 14 C71 11.5 71 9.5 71.5 7.5 M74 14 C75 11.5 75 9.5 75.5 7.5",
      ].map((d, i) => branch(d, `pd${i}`)),
      ...[20,24.2,28.4,39,43.2,47.4,51.6].map((y, i) => h("rect", { key: `pm${i}`, x: 71.9, y, width: 2.2, height: 3.3, rx: 0.35, fill: AXON, stroke: EDGE, strokeWidth: 0.22 })),
      h("line", { x1: 73, y1: 35, x2: 77, y2: 35, stroke: EDGE, strokeWidth: 0.58 }),
      h("ellipse", { cx: 78.5, cy: 35, rx: 2.2, ry: 1.8, fill: CELL, stroke: EDGE, strokeWidth: 0.45 }),
      h("circle", { cx: 78.7, cy: 35, r: 0.65, fill: NUCLEUS }),
      ...[
        "M73 57 C71.5 59 70.5 61 70.5 63 M72 59 C70 59.5 69 60.5 68 62",
        "M73 57 C74 59 75.5 60 77 62 M74.3 59.3 C76 59 77.3 59.8 78.5 61",
        "M73 57 C73 60 73 62 73.5 64",
      ].map((d, i) => branch(d, `pt${i}`)),
    );
  })(),
};

/* ============================================================
 * CHAPTER 3 — Fruit layers
 * ============================================================ */
const fruit: DiagramDef = {
  id: "ch3-fruit",
  title: { en: "Layers of a Fruit", ar: "طبقات الثمرة" },
  aspect: "16/9",
  parts: [
    { id: "exocarp",  label: { en: "Outer layer (Exocarp)",  ar: "الطبقة الخارجية" }, ax: 90, ay: 37, lx: 78, ly: 8,  lw: 20 },
    { id: "mesocarp", label: { en: "Middle layer (Mesocarp)", ar: "الطبقة الوسطى" },   ax: 73, ay: 50, lx: 56, ly: 82, lw: 22 },
    { id: "endocarp", label: { en: "Inner layer (Endocarp)",  ar: "الطبقة الداخلية" }, ax: 70, ay: 26, lx: 38, ly: 4,  lw: 22 },
    { id: "seed",     label: { en: "Seed",                    ar: "البذرة" },          ax: 38, ay: 38, lx: 2,  ly: 46, lw: 18 },
  ],
  art: (() => {
    const SKIN = "hsl(135 45% 32%)";
    const SKIN_DARK = "hsl(135 55% 22%)";
    const FLESH = "hsl(40 55% 82%)";
    const FLESH_SH = "hsl(35 45% 65%)";
    const ENDO = "hsl(265 45% 65%)";
    const ENDO_DARK = "hsl(265 50% 45%)";
    const SEED = "hsl(115 50% 45%)";
    const SEED_DK = "hsl(115 60% 30%)";
    const VEIN = "hsl(265 40% 50%)";

    // Lens/eye shape centered at (50, 37.5)
    const outer = "M 8 37.5 Q 50 -4 92 37.5 Q 50 79 8 37.5 Z";
    const flesh = "M 12 37.5 Q 50 0 88 37.5 Q 50 75 12 37.5 Z";
    const endo  = "M 22 37.5 Q 50 10 78 37.5 Q 50 65 22 37.5 Z";

    // spikes (inward thorns) along the inner edge of the skin (top + bottom)
    const spikes: React.ReactNode[] = [];
    for (let i = 0; i < 14; i++) {
      const t = (i + 0.5) / 14;
      const x = 14 + t * 72;
      // top arc y (approx): parabola through (12,37.5),(50,3),(88,37.5)
      const u = (x - 50) / 38;
      const yTop = 3 + (37.5 - 3) * u * u;
      const yBot = 72 - (37.5 - 3) * u * u;
      spikes.push(
        h("line", { key: `st${i}`, x1: x, y1: yTop, x2: x, y2: yTop + 5,
          stroke: ENDO_DARK, strokeWidth: 0.35, strokeLinecap: "round" }),
        h("line", { key: `sb${i}`, x1: x, y1: yBot, x2: x, y2: yBot - 5,
          stroke: ENDO_DARK, strokeWidth: 0.35, strokeLinecap: "round" }),
      );
    }

    // little veins in flesh
    const veins = [
      "M 18 40 q 6 -4 12 -1 t 10 2",
      "M 20 32 q 5 3 11 1 t 9 -2",
      "M 64 30 q 6 4 12 2 t 8 -1",
      "M 62 46 q 7 -3 13 0 t 9 -2",
      "M 30 50 q 6 -2 12 1",
      "M 58 24 q 5 -2 10 0",
    ];

    return h(Fragment, null,
      // outer skin (exocarp)
      h("path", { d: outer, fill: SKIN, stroke: SKIN_DARK, strokeWidth: 0.6 }),
      // mesocarp (flesh)
      h("path", { d: flesh, fill: FLESH, stroke: FLESH_SH, strokeWidth: 0.4 }),
      // veins
      ...veins.map((d, i) => h("path", { key: `v${i}`, d, fill: "none", stroke: VEIN, strokeWidth: 0.25, opacity: 0.55 })),
      // endocarp ring (purple)
      h("path", { d: endo, fill: "none", stroke: ENDO, strokeWidth: 1.6 }),
      h("path", { d: endo, fill: "none", stroke: ENDO_DARK, strokeWidth: 0.4 }),
      // spikes
      ...spikes,
      // seed (oval, slightly left)
      h("ellipse", { cx: 48, cy: 38, rx: 18, ry: 7.5, fill: SEED, stroke: SEED_DK, strokeWidth: 0.5 }),
      // seed highlight
      h("ellipse", { cx: 44, cy: 35.5, rx: 10, ry: 2.2, fill: "hsl(115 60% 70% / 0.7)" }),
      // seed surface lines
      h("path", { d: "M 40 39 q 6 -2 12 0 t 10 -1", fill: "none", stroke: SEED_DK, strokeWidth: 0.35, opacity: 0.7 }),
      h("path", { d: "M 42 41 q 5 1 10 -1 t 9 0", fill: "none", stroke: SEED_DK, strokeWidth: 0.3, opacity: 0.6 }),
      // seed stalk (funicle) to the left wall
      h("path", { d: "M 30 38 q 2 -2 4 -1 q 3 1 5 1", fill: "none", stroke: SEED_DK, strokeWidth: 0.5 }),
      h("path", { d: "M 22 37 q 3 4 8 1", fill: "none", stroke: SEED_DK, strokeWidth: 0.4 }),
    );
  })(),
};

/* Binary fission in bacteria */
const binaryFission: DiagramDef = {
  id: "ch3-binary-fission",
  title: { en: "Binary Fission in Bacteria", ar: "التكاثر اللاجنسي في البكتيريا" },
  aspect: "3/5",
  parts: [
    // Labels point at the TOP cell (stage 1). Top cell ≈ x:35-65, y:3-13.
    { id: "chromo",  label: { en: "Chromosome",      ar: "كروموسوم" },        ax: 50,   ay: 8,   lx: 72, ly: 2,  lw: 26 },
    { id: "plasma",  label: { en: "Plasma membrane", ar: "الغشاء البلازمي" }, ax: 64.1, ay: 8,   lx: 72, ly: 12, lw: 26 },
    { id: "cyto",    label: { en: "Cytoplasm",       ar: "السايتوبلازم" },    ax: 43,   ay: 8.5, lx: 2,  ly: 2,  lw: 26 },
    { id: "wall",    label: { en: "Cell wall",       ar: "جدار الخلية" },     ax: 35,   ay: 8,   lx: 2,  ly: 12, lw: 26 },
  ],
  art: (() => {
    const WALL = "hsl(0 70% 58%)";
    const WALL_DK = "hsl(0 65% 35%)";
    const CYTO = "hsl(200 75% 90%)";
    const MEM = "hsl(210 60% 55%)";
    const DNA = "hsl(215 75% 38%)";

    // Rounded rectangle "rod" cell
    const rod = (cx: number, cy: number, w: number, hgt: number, key: string) => {
      const x = cx - w / 2;
      const y = cy - hgt / 2;
      const r = hgt / 2;
      return h("g", { key },
        // cell wall (red rim)
        h("rect", { x, y, width: w, height: hgt, rx: r, ry: r,
          fill: WALL, stroke: WALL_DK, strokeWidth: 0.5 }),
        // plasma membrane + cytoplasm (blue interior)
        h("rect", { x: x + 0.9, y: y + 0.9, width: w - 1.8, height: hgt - 1.8,
          rx: Math.max(r - 0.9, 0.5), ry: Math.max(r - 0.9, 0.5),
          fill: CYTO, stroke: MEM, strokeWidth: 0.3 }),
      );
    };

    // Single DNA squiggle (compact loop) centered at (cx, cy)
    const dna1 = (cx: number, cy: number, key: string) =>
      h("path", { key,
        d: `M ${cx-5} ${cy} q 2 -3 4 -1 q 2 2 4 -1 q 2 -3 4 0 q 1 3 -2 3 q -3 0 -3 2 q 0 2 -3 1 q -3 -1 -4 -4 z`,
        fill: "none", stroke: DNA, strokeWidth: 0.55, strokeLinejoin: "round", strokeLinecap: "round" });

    // Replicating DNA (longer tangled loop)
    const dna2 = (cx: number, cy: number, key: string) =>
      h("path", { key,
        d: `M ${cx-9} ${cy} q 2 -3 4 -1 q 2 2 4 -1 q 2 -2 4 0 q 2 2 4 -1 q 2 -2 3 1 q 1 3 -2 3 q -3 0 -4 2 q -2 2 -4 0 q -2 -1 -4 1 q -3 1 -5 -4 z`,
        fill: "none", stroke: DNA, strokeWidth: 0.55, strokeLinejoin: "round", strokeLinecap: "round" });

    // Stretched DNA (across the cell, two copies linked)
    const dna3 = (cx: number, cy: number, key: string) =>
      h("path", { key,
        d: `M ${cx-12} ${cy} q 2 -3 4 0 q 2 3 4 0 q 2 -3 4 0 q 2 3 4 0 q 2 -3 4 0 q 2 3 4 0 q 2 -3 4 0`,
        fill: "none", stroke: DNA, strokeWidth: 0.55, strokeLinejoin: "round", strokeLinecap: "round" });

    // Arrow between stages
    const arrow = (y: number, key: string) =>
      h("g", { key },
        h("line", { x1: 50, y1: y, x2: 50, y2: y + 2.6, stroke: WALL_DK, strokeWidth: 0.6 }),
        h("path", { d: `M ${48} ${y + 2.4} L 50 ${y + 3.6} L 52 ${y + 2.4} Z`, fill: WALL_DK }),
      );

    return h(Fragment, null,
      /* Stage 1 — one cell with single chromosome */
      rod(50, 8, 30, 10, "c1"),
      dna1(50, 8, "d1"),
      arrow(13.5, "a1"),

      /* Stage 2 — chromosome replicating */
      rod(50, 22, 30, 10, "c2"),
      dna2(50, 22, "d2"),
      arrow(27.5, "a2"),

      /* Stage 3 — chromosomes separating, cell elongating */
      rod(50, 36, 36, 10, "c3"),
      dna3(50, 36, "d3"),
      arrow(41.5, "a3"),

      /* Stage 4 — cell pinching in the middle (two attached rods) */
      rod(36, 51, 22, 10, "c4a"),
      rod(64, 51, 22, 10, "c4b"),
      dna1(36, 51, "d4a"),
      dna1(64, 51, "d4b"),
      arrow(56.5, "a4"),

      /* Stage 5 — two separated daughter cells */
      rod(28, 67, 22, 10, "c5a"),
      rod(72, 67, 22, 10, "c5b"),
      dna1(28, 67, "d5a"),
      dna1(72, 67, "d5b"),
    );
  })(),
};

/* Bacterial conjugation (ch3) */
const bacterialConjugation: DiagramDef = {
  id: "ch3-bacterial-conjugation",
  title: { en: "Conjugation in Bacteria", ar: "الاقتران في البكتريا" },
  aspect: "16/7",
  parts: [
    // The five textbook labels are anchored to the introductory donor/recipient pair.
    { id: "donor",      label: { en: "Donor cell",             ar: "خلية معطية" },       ax: 6,  ay: 26, lx: 1,  ly: 2,  lw: 17 },
    { id: "recipient",  label: { en: "Recipient cell",         ar: "خلية مستلمة" },      ax: 14, ay: 26, lx: 20, ly: 2,  lw: 18 },
    { id: "bridge",     label: { en: "Conjugation bridge",     ar: "جسر اقتران" },        ax: 27, ay: 37, lx: 40, ly: 2,  lw: 20 },
    { id: "fertility",  label: { en: "Fertility factor",       ar: "عامل الخصوبة" },      ax: 6,  ay: 42, lx: 1,  ly: 84, lw: 18 },
    { id: "chromosome", label: { en: "Bacterial chromosome",  ar: "كروموسوم البكتيريا" }, ax: 14, ay: 31, lx: 21, ly: 84, lw: 21 },
  ],
  art: (() => {
    const CELL_EDGE = "hsl(215 28% 32%)";
    const CELL_OUTER = "hsl(207 31% 50%)";
    const CELL_INNER = "hsl(211 38% 42%)";
    const CHROMOSOME = "hsl(337 56% 67%)";
    const FACTOR = "hsl(37 83% 56%)";
    const FACTOR_DARK = "hsl(28 68% 38%)";
    const BRIDGE = "hsl(202 25% 33%)";
    const INK = "hsl(220 18% 22%)";

    const bacterium = (cx: number, factor: boolean, key: string) => h("g", { key },
      h("rect", {
        x: cx - 3.1, y: 23, width: 6.2, height: 27, rx: 3.1,
        fill: CELL_OUTER, stroke: CELL_EDGE, strokeWidth: 0.65,
      }),
      h("rect", {
        x: cx - 2.35, y: 24.2, width: 4.7, height: 24.6, rx: 2.25,
        fill: CELL_INNER, stroke: "hsl(205 34% 58%)", strokeWidth: 0.25,
      }),
      // Irregular pink bacterial chromosome near the upper half of the cell.
      h("path", {
        d: "M " + (cx - 1.8) + " 30 C " + (cx - 0.4) + " 27.5 " + (cx + 1.8) + " 29 " + (cx + 1.1) + " 31.2 C " + (cx + 0.5) + " 33 " + (cx - 1.5) + " 31.7 " + (cx - 0.7) + " 34.2 C " + cx + " 36.2 " + (cx + 1.7) + " 34.7 " + (cx + 1.5) + " 33.6",
        fill: "none", stroke: CHROMOSOME, strokeWidth: 0.55,
        strokeLinecap: "round", strokeLinejoin: "round",
      }),
      factor && h("circle", {
        cx, cy: 42, r: 1.45, fill: "none", stroke: FACTOR,
        strokeWidth: 0.85,
      }),
    );

    const factorRing = (cx: number, key: string, dashed = false) => h("circle", {
      key, cx, cy: 42, r: 1.45, fill: "none", stroke: FACTOR,
      strokeWidth: 0.85, strokeDasharray: dashed ? "0.7 0.45" : undefined,
    });

    const bridge = (left: number, right: number, key: string) => h("g", { key },
      h("line", {
        x1: left + 3, y1: 37, x2: right - 3, y2: 37,
        stroke: BRIDGE, strokeWidth: 1.35, strokeLinecap: "round",
      }),
      h("line", {
        x1: left + 3, y1: 36.75, x2: right - 3, y2: 36.75,
        stroke: "hsl(196 26% 57%)", strokeWidth: 0.38, strokeLinecap: "round",
      }),
    );

    const processArrow = (x1: number, x2: number, key: string) => h("g", { key },
      h("line", { x1, y1: 36.5, x2, y2: 36.5, stroke: INK, strokeWidth: 0.5 }),
      h("path", {
        d: "M " + x2 + " 36.5 L " + (x2 - 1.1) + " 35.65 L " + (x2 - 1.1) + " 37.35 Z",
        fill: INK,
      }),
    );

    const stepNumber = (cx: number, value: string, key: string) => h("g", { key },
      h("circle", { cx, cy: 57, r: 2.1, fill: "hsl(26 71% 56%)" }),
      h("text", {
        x: cx, y: 57.9, textAnchor: "middle", fontSize: 2.7,
        fontWeight: 700, fill: "white",
      }, value),
    );

    return h(Fragment, null,
      /* Introductory donor and recipient cells from the left of the reference. */
      bacterium(6, true, "intro-donor"),
      bacterium(14, false, "intro-recipient"),
      h("line", {
        x1: 9, y1: 37, x2: 10.9, y2: 37,
        stroke: BRIDGE, strokeWidth: 1.25, strokeLinecap: "round",
      }),
      processArrow(18, 20.5, "intro-arrow"),

      /* 1 — a conjugation bridge joins donor and recipient. */
      bacterium(24, false, "stage1-donor"),
      bacterium(31, false, "stage1-recipient"),
      factorRing(24, "stage1-factor"),
      bridge(24, 31, "stage1-bridge"),
      stepNumber(27.5, "1", "step-1"),
      processArrow(34.5, 37, "arrow-1-2"),

      /* 2 — one strand of the fertility factor opens and starts copying. */
      bacterium(40.5, false, "stage2-donor"),
      bacterium(47.5, false, "stage2-recipient"),
      factorRing(40.5, "stage2-factor", true),
      bridge(40.5, 47.5, "stage2-bridge"),
      h("path", {
        d: "M40.2 42 C42 42 42.4 38.2 44 37",
        fill: "none", stroke: FACTOR, strokeWidth: 0.8, strokeLinecap: "round",
      }),
      stepNumber(44, "2", "step-2"),
      processArrow(51, 53.5, "arrow-2-3"),

      /* 3 — the copied strand travels through the bridge to the recipient. */
      bacterium(57, false, "stage3-donor"),
      bacterium(64, false, "stage3-recipient"),
      factorRing(57, "stage3-factor", true),
      bridge(57, 64, "stage3-bridge"),
      h("path", {
        d: "M57 42 C58.5 41.5 59 38 60.2 37 C61.7 36 62.1 40.5 64.7 40.2",
        fill: "none", stroke: FACTOR, strokeWidth: 0.85, strokeLinecap: "round",
      }),
      stepNumber(60.5, "3", "step-3"),
      processArrow(67.5, 70, "arrow-3-4"),

      /* 4 — both bacteria end with a complete fertility factor. */
      bacterium(74, false, "stage4-donor"),
      bacterium(81, false, "stage4-recipient"),
      factorRing(74, "stage4-donor-factor"),
      factorRing(81, "stage4-recipient-factor"),
      bridge(74, 81, "stage4-bridge"),
      stepNumber(77.5, "4", "step-4"),

      // Small caption inside the artwork keeps the sequence identifiable.
      h("text", {
        x: 88, y: 18, textAnchor: "middle", fontSize: 3,
        fontWeight: 700, fill: "hsl(var(--foreground))",
      }, "الاقتران في البكتريا"),
    );
  })(),
};

/* Conjugation in Paramecium (ch3) */
const parameciumConjugation: DiagramDef = {
  id: "ch3-paramecium-conjugation",
  title: { en: "Conjugation in Paramecium", ar: "الاقتران في البرامسيوم" },
  aspect: "16/7",
  parts: [
    { id: "macro",    label: { en: "Macronucleus",          ar: "النواة الكبيرة" },            ax: 5.7,  ay: 25.5, lx: 1,  ly: 1,  lw: 17 },
    { id: "micro",    label: { en: "Micronucleus",          ar: "النواة الصغيرة" },            ax: 12.3, ay: 24.3, lx: 20, ly: 1,  lw: 17 },
    { id: "contact",  label: { en: "Cytoplasmic bridge",    ar: "الجسر السايتوبلازمي" },        ax: 44,   ay: 29,   lx: 35, ly: 84, lw: 20 },
    { id: "exchange", label: { en: "Micronuclear exchange", ar: "تبادل الأنوية الصغيرة" },      ax: 78,   ay: 29,   lx: 76, ly: 1,  lw: 22 },
  ],
  art: (() => {
    const BODY = "hsl(29 31% 58%)";
    const BODY_LIGHT = "hsl(34 37% 67%)";
    const EDGE = "hsl(26 24% 24%)";
    const MACRO = "hsl(31 29% 28%)";
    const MICRO = "hsl(215 18% 17%)";
    const EXCHANGE = "hsl(5 60% 43%)";
    const ARROW = "hsl(15 58% 52%)";

    /** Pear-shaped Paramecium body, kept deliberately close to the textbook silhouette. */
    const body = (cx: number, cy: number, key: string, mirror = false) => h("g", {
      key,
      transform: mirror ? `translate(${2 * cx} 0) scale(-1 1)` : undefined,
    },
      h("path", {
        d: `M${cx - 3.2} ${cy - 12.5} C${cx - 6.2} ${cy - 10.7} ${cx - 6.8} ${cy - 4.8} ${cx - 6.2} ${cy + 1.5} C${cx - 5.6} ${cy + 7.5} ${cx - 2.2} ${cy + 12.1} ${cx} ${cy + 13.4} C${cx + 2.3} ${cy + 12.1} ${cx + 5.8} ${cy + 7.4} ${cx + 6.3} ${cy + 1.4} C${cx + 6.9} ${cy - 5.1} ${cx + 6.1} ${cy - 10.8} ${cx + 3.1} ${cy - 12.5} C${cx + 1.5} ${cy - 13.5} ${cx - 1.6} ${cy - 13.5} ${cx - 3.2} ${cy - 12.5} Z`,
        fill: BODY,
        stroke: EDGE,
        strokeWidth: 0.55,
        strokeLinejoin: "round",
      }),
      h("path", {
        d: `M${cx - 2.3} ${cy - 10.8} C${cx - 4.3} ${cy - 7.2} ${cx - 4.8} ${cy - 1} ${cx - 3.7} ${cy + 4.5}`,
        fill: "none", stroke: BODY_LIGHT, strokeWidth: 0.55, strokeLinecap: "round", opacity: 0.72,
      }),
    );

    const macro = (cx: number, cy: number, key: string) => h("path", {
      key,
      d: `M${cx - 2.7} ${cy} C${cx - 2.4} ${cy - 2.2} ${cx + 0.4} ${cy - 2.7} ${cx + 2.3} ${cy - 1.2} C${cx + 3} ${cy + 0.4} ${cx + 1.1} ${cy + 2.3} ${cx - 1.2} ${cy + 2} C${cx - 2.5} ${cy + 1.7} ${cx - 3} ${cy + 0.8} ${cx - 2.7} ${cy} Z`,
      fill: MACRO, stroke: EDGE, strokeWidth: 0.32,
    });

    const micro = (cx: number, cy: number, key: string, r = 0.72) => h("circle", {
      key, cx, cy, r, fill: MICRO,
    });

    const pairedBodies = (cx: number, cy: number, key: string) => h("g", { key },
      body(cx - 3.5, cy, `${key}-left`),
      body(cx + 3.5, cy, `${key}-right`, true),
      // The narrow contact area shared by the conjugants.
      h("line", { x1: cx, y1: cy - 8.6, x2: cx, y2: cy + 7.6, stroke: EDGE, strokeWidth: 0.46, opacity: 0.85 }),
    );

    const flowArrow = (x1: number, y1: number, x2: number, y2: number, key: string) => {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const size = 1.25;
      const hx1 = x2 - size * Math.cos(angle - Math.PI / 5);
      const hy1 = y2 - size * Math.sin(angle - Math.PI / 5);
      const hx2 = x2 - size * Math.cos(angle + Math.PI / 5);
      const hy2 = y2 - size * Math.sin(angle + Math.PI / 5);
      return h("g", { key },
        h("line", { x1, y1, x2, y2, stroke: ARROW, strokeWidth: 0.55, strokeLinecap: "round" }),
        h("path", { d: `M${x2} ${y2} L${hx1} ${hy1} L${hx2} ${hy2} Z`, fill: ARROW }),
      );
    };

    const stageNumber = (x: number, y: number, value: string, key: string) => h("text", {
      key, x, y, textAnchor: "middle", fontSize: 3.1, fontWeight: 700, fill: EDGE,
    }, `(${value})`);

    return h(Fragment, null,
      /* (1) Two compatible individuals make close lateral contact. */
      pairedBodies(9, 27, "p1"),
      macro(5.7, 25.5, "p1-macro-left"),
      macro(12.3, 25.5, "p1-macro-right"),
      micro(8.1, 24.3, "p1-micro-left"),
      micro(9.9, 24.3, "p1-micro-right"),
      stageNumber(9, 44.5, "1", "n1"),
      flowArrow(16, 27, 20, 27, "a1"),

      /* (2) The micronuclei divide while both cells remain paired. */
      pairedBodies(27, 27, "p2"),
      macro(23.7, 25.5, "p2-macro-left"),
      macro(30.3, 25.5, "p2-macro-right"),
      micro(25.5, 23.6, "p2-micro-left-a", 0.58),
      micro(26.8, 24.7, "p2-micro-left-b", 0.58),
      micro(28.9, 24.7, "p2-micro-right-a", 0.58),
      micro(30.2, 23.6, "p2-micro-right-b", 0.58),
      stageNumber(27, 44.5, "2", "n2"),
      flowArrow(34, 27, 37.5, 27, "a2"),

      /* Preparatory division shown between stages 2 and 3 in the supplied figure. */
      pairedBodies(44, 27, "prep"),
      macro(40.7, 25.5, "prep-macro-left"),
      macro(47.3, 25.5, "prep-macro-right"),
      ...[-2.1, -0.7, 0.7, 2.1].map((dy, i) =>
        h("path", {
          key: `prep-left-${i}`,
          d: `M41.9 ${24.8 + dy} q1.1 -0.8 2.1 0`,
          fill: "none", stroke: MICRO, strokeWidth: 0.52, strokeLinecap: "round",
        })),
      ...[-2.1, -0.7, 0.7, 2.1].map((dy, i) =>
        h("path", {
          key: `prep-right-${i}`,
          d: `M44 ${24.8 + dy} q1.1 0.8 2.1 0`,
          fill: "none", stroke: MICRO, strokeWidth: 0.52, strokeLinecap: "round",
        })),
      flowArrow(51, 27, 54.5, 27, "a-prep"),

      /* (3) Each conjugant forms stationary and migratory pronuclei. */
      pairedBodies(61, 27, "p3"),
      macro(57.7, 25.5, "p3-macro-left"),
      macro(64.3, 25.5, "p3-macro-right"),
      micro(59.3, 23.7, "p3-left-a", 0.62),
      micro(60.4, 25.1, "p3-left-b", 0.62),
      micro(61.6, 25.1, "p3-right-a", 0.62),
      micro(62.7, 23.7, "p3-right-b", 0.62),
      stageNumber(61, 44.5, "3", "n3"),
      flowArrow(68, 27, 71.5, 27, "a3"),

      /* (4) Migratory pronuclei pass through the cytoplasmic bridge. */
      pairedBodies(78, 27, "p4"),
      macro(74.7, 24.6, "p4-macro-left"),
      macro(81.3, 24.6, "p4-macro-right"),
      h("line", { x1: 75.8, y1: 27.2, x2: 80.2, y2: 27.2, stroke: EXCHANGE, strokeWidth: 0.7, strokeLinecap: "round" }),
      h("path", { d: "M79.8 26.45 L81 27.2 L79.8 27.95 Z", fill: EXCHANGE }),
      h("line", { x1: 80.2, y1: 29.4, x2: 75.8, y2: 29.4, stroke: EXCHANGE, strokeWidth: 0.7, strokeLinecap: "round" }),
      h("path", { d: "M76.2 28.65 L75 29.4 L76.2 30.15 Z", fill: EXCHANGE }),
      micro(75.7, 32.1, "p4-new-left", 0.68),
      micro(80.3, 32.1, "p4-new-right", 0.68),
      stageNumber(78, 44.5, "4", "n4"),

      /* (5) The conjugants separate; each retains a reorganized nuclear set. */
      flowArrow(75.5, 41, 69.5, 51, "a4-left"),
      flowArrow(80.5, 41, 86.5, 51, "a4-right"),
      body(69, 59, "p5-left"),
      macro(68.2, 57.6, "p5-macro-left"),
      micro(71.2, 58.8, "p5-micro-left"),
      body(87, 59, "p5-right", true),
      macro(87.8, 57.6, "p5-macro-right"),
      micro(84.8, 58.8, "p5-micro-right"),
      stageNumber(78, 72.5, "5", "n5"),
    );
  })(),
};


/* Monocotyledon and dicotyledon seed structure (ch3) */
const seedTypes: DiagramDef = {
  id: "ch3-seed-types",
  title: {
    en: "Monocotyledon and Dicotyledon Seeds",
    ar: "تركيب بذور ذوات الفلقة الواحدة وذوات الفلقتين",
  },
  aspect: "4/3",
  parts: [
    // (A) Monocotyledon — labels follow the left half of the supplied reference.
    { id: "a-peri",   label: { en: "Surrounding layer", ar: "طبقة محيطة" },       ax: 8,  ay: 25, lx: 1,  ly: 2,  lw: 20 },
    { id: "a-endo",   label: { en: "Endosperm",         ar: "سويداء" },            ax: 14, ay: 31, lx: 23, ly: 2,  lw: 20 },
    { id: "a-cot",    label: { en: "Embryonic leaf",    ar: "ورقة جنينية" },       ax: 20, ay: 37, lx: 1,  ly: 16, lw: 20 },
    { id: "a-rad",    label: { en: "Radicle",           ar: "جذير" },              ax: 20, ay: 49, lx: 1,  ly: 79, lw: 20 },
    { id: "a-embryo", label: { en: "Monocot embryo",    ar: "جنين أحادي الفلقة" }, ax: 45, ay: 38, lx: 23, ly: 79, lw: 22 },

    // (B) Dicotyledon — labels follow the right half of the supplied reference.
    { id: "b-coat",   label: { en: "Seed coat",         ar: "غطاء البذرة" },       ax: 58, ay: 21, lx: 55, ly: 2,  lw: 20 },
    { id: "b-plum",   label: { en: "Plumule",           ar: "رويشة" },             ax: 67, ay: 29, lx: 78, ly: 2,  lw: 20 },
    { id: "b-rad",    label: { en: "Radicle",           ar: "جذير" },              ax: 65, ay: 39, lx: 52, ly: 79, lw: 20 },
    { id: "b-cot",    label: { en: "Embryonic leaf",    ar: "ورقة جنينية" },       ax: 71, ay: 45, lx: 74, ly: 79, lw: 22 },
    { id: "b-embryo", label: { en: "Dicot embryo",      ar: "جنين ثنائي الفلقة" }, ax: 96, ay: 38, lx: 78, ly: 16, lw: 20 },
  ],
  art: (() => {
    const OUT = "hsl(24 31% 24%)";
    const GOLD = "hsl(41 69% 55%)";
    const CREAM = "hsl(43 53% 78%)";
    const CREAM_LIGHT = "hsl(46 58% 87%)";
    const GREEN = "hsl(92 39% 47%)";
    const GREEN_DARK = "hsl(111 39% 29%)";
    const BLUE = "hsl(199 34% 31%)";
    const BLUE_LIGHT = "hsl(181 38% 38%)";
    const BROWN = "hsl(7 51% 31%)";

    const bracket = (x: number, y1: number, y2: number, key: string) =>
      h("path", {
        key,
        d: "M " + (x-1.5) + " " + y1 + " L " + x + " " + y1 + " L " + x + " " + y2 + " L " + (x-1.5) + " " + y2,
        fill: "none",
        stroke: OUT,
        strokeWidth: 0.45,
        strokeLinecap: "round",
      });

    return h(Fragment, null,
      /* =========================================================
       * (A) MONOCOTYLEDON
       * Open grain at left + the isolated embryo at its right.
       * ========================================================= */
      // Outer rounded wedge and its surrounding layer.
      h("path", {
        d: "M8 20 C12 17 19 17 23 20 C26 29 26 42 22 52 C19 57 12 57 8 52 C5 43 5 29 8 20 Z",
        fill: GOLD, stroke: OUT, strokeWidth: 0.7, strokeLinejoin: "round",
      }),
      h("path", {
        d: "M9.5 22 C13 19.5 18.7 19.3 21.8 21.8 C24 30.5 24.2 41 20.7 50.5 C18 54.5 12.7 54.5 9.6 50.5 C7.1 42 7.2 30 9.5 22 Z",
        fill: CREAM, stroke: "hsl(35 45% 43%)", strokeWidth: 0.35,
      }),
      // Pale endosperm occupying most of the grain.
      h("path", {
        d: "M10.7 23.2 C14 21 18 21 20.7 23 C22.6 31.3 22.8 40.8 19.8 49 C17.8 52.2 13.4 52.4 10.8 49 C8.8 41 8.9 31 10.7 23.2 Z",
        fill: CREAM_LIGHT, stroke: "hsl(36 39% 55%)", strokeWidth: 0.28,
      }),
      h("path", {
        d: "M10.8 25 C12.2 23.4 14 22.8 15.7 22.8 C12.9 30.8 12.8 43.3 15.4 51.7 C12.5 51.8 10.6 49.6 9.8 46.8 C8.9 39.4 9.2 31.3 10.8 25 Z",
        fill: "hsl(46 56% 71%)", opacity: 0.55,
      }),

      // Single green embryonic leaf pressed against the inner side.
      h("path", {
        d: "M18.2 28 C21.1 31.5 22.4 38.6 20.8 47.7 C19.8 50.7 17.7 51.5 16.2 48.3 C16.3 41.2 16.5 34 18.2 28 Z",
        fill: GREEN, stroke: GREEN_DARK, strokeWidth: 0.45, strokeLinejoin: "round",
      }),
      h("path", {
        d: "M19 29.7 C18.4 35.7 18.5 42.1 18.1 48.7",
        fill: "none", stroke: GREEN_DARK, strokeWidth: 0.38, strokeLinecap: "round",
      }),
      ...[
        "M18.8 33 L16.9 35.5", "M18.7 35.5 L20.8 37.4",
        "M18.5 38 L16.6 40.2", "M18.4 40.6 L20.5 42.4",
        "M18.3 43.2 L16.7 45", "M18.2 45.5 L19.8 46.8",
      ].map((d, i) => h("path", {
        key: "mono-vein-" + i, d, fill: "none", stroke: GREEN_DARK,
        strokeWidth: 0.25, strokeLinecap: "round",
      })),
      // Radicle at the lower end of the monocot embryo.
      h("path", {
        d: "M17 48 C17.2 52 19.2 53.2 20.8 50.2 C20.8 53.4 19.1 55.2 17.6 54.3 C16.4 53.1 16.1 50.4 17 48 Z",
        fill: "hsl(78 49% 40%)", stroke: GREEN_DARK, strokeWidth: 0.35,
      }),

      // Isolated monocot embryo shown as the dark second structure.
      h("path", {
        d: "M31 19 C34 16.8 39.9 16.5 42.4 20.1 C44.1 29.6 44.3 43 42.3 52.2 C39.5 55.2 34.1 54.1 31.7 50.3 C29.3 41.3 29.1 28 31 19 Z",
        fill: BLUE, stroke: OUT, strokeWidth: 0.7, strokeLinejoin: "round",
      }),
      h("path", {
        d: "M31.8 21 C34.4 19.1 37.6 18.8 39.8 20 C36.3 28 36.4 42.4 39.2 51.8 C36.7 53.4 33.6 51.8 32.4 48.9 C30.5 40.1 30.5 29.2 31.8 21 Z",
        fill: "hsl(205 31% 41%)", opacity: 0.85,
      }),
      h("path", {
        d: "M38.4 28 C42.4 31.9 42.8 41.3 40.3 49.6 C37.7 46.2 36.4 39.7 38.4 28 Z",
        fill: BLUE_LIGHT, stroke: "hsl(180 34% 27%)", strokeWidth: 0.35,
      }),
      h("path", {
        d: "M36.2 43 C38 39.2 40.4 38 42.5 38.6 C42.4 44 41.7 49.1 40.5 51.6 C38.5 50.1 37.1 47.1 36.2 43 Z",
        fill: "hsl(170 43% 35%)", opacity: 0.8,
      }),
      bracket(45.5, 20, 53.5, "mono-embryo-bracket"),
      h("text", {
        x: 25, y: 64.5, textAnchor: "middle", fontSize: 3.4,
        fill: "hsl(var(--foreground))", fontWeight: 700,
      }, "(أ) ذوات الفلقة الواحدة"),

      /* =========================================================
       * (B) DICOTYLEDON
       * Open seed at left + the separated two-cotyledon embryo.
       * ========================================================= */
      // Thick brown seed coat around the opened seed.
      h("path", {
        d: "M61.7 14.5 C68.7 13.5 74 21.6 74.9 34.5 C76 48.5 72.5 59 67 61 C60.8 62 55.8 53.4 55 40 C54.2 27.8 56.6 17.1 61.7 14.5 Z",
        fill: BROWN, stroke: OUT, strokeWidth: 0.75,
      }),
      h("path", {
        d: "M62 17 C67.7 16.2 71.9 23 72.7 34.8 C73.5 46.5 70.9 56 66.8 58.3 C61.8 58.5 58.2 51.1 57.5 39.4 C56.9 29 58.6 19.5 62 17 Z",
        fill: CREAM_LIGHT, stroke: "hsl(29 36% 48%)", strokeWidth: 0.35,
      }),
      h("path", {
        d: "M59.2 22 C61.3 18.8 64 17.2 66.5 17.7 C62.7 26.6 62.1 45.7 66.5 58.1 C62.6 58.2 59.3 51 58.7 40 C58.2 32.9 58.4 26.3 59.2 22 Z",
        fill: "hsl(45 57% 75%)", opacity: 0.6,
      }),

      // Plumule, embryonic axis, and radicle within the opened dicot seed.
      h("path", {
        d: "M65.4 28.7 C62.3 27.4 61.6 24.8 62.4 23 C65.2 23.7 66.7 25.6 66.2 28.5 Z",
        fill: GREEN, stroke: GREEN_DARK, strokeWidth: 0.32,
      }),
      h("path", {
        d: "M66 29 C69.2 26.3 71 26.8 71.8 28.2 C70.3 31.5 68.2 32.1 66.1 31.2 Z",
        fill: "hsl(94 46% 53%)", stroke: GREEN_DARK, strokeWidth: 0.32,
      }),
      h("path", {
        d: "M66 29.8 C65 33.2 64.5 38.3 65 43.3",
        fill: "none", stroke: GREEN_DARK, strokeWidth: 0.65, strokeLinecap: "round",
      }),
      h("path", {
        d: "M64.3 42.2 C65.3 46.6 67 48.2 68.3 46 C68 49.8 66.6 51.9 65 50.2 C63.9 48.3 63.6 45 64.3 42.2 Z",
        fill: GREEN, stroke: GREEN_DARK, strokeWidth: 0.35,
      }),

      // Separated dicot embryo: the two large embryonic leaves from the reference.
      h("path", {
        d: "M84 17.5 C87.4 14.8 91.9 15.3 94 19.1 C93.5 28 93 42.5 92.2 53.8 C89.9 59.6 85.4 59.3 82.2 54 C79.8 43.7 80.2 27.7 84 17.5 Z",
        fill: CREAM, stroke: OUT, strokeWidth: 0.7, strokeLinejoin: "round",
      }),
      // Left cotyledon and the narrow reddish seam between the pair.
      h("path", {
        d: "M84 18 C86.4 16.3 88.2 16.2 89.5 17.2 C86.6 27.6 86.4 44.8 89.1 57.1 C86.3 58.2 83.5 55.2 82.2 51.5 C80.4 41.1 80.8 27.1 84 18 Z",
        fill: "hsl(28 38% 72%)", stroke: BROWN, strokeWidth: 0.4,
      }),
      h("path", {
        d: "M88.7 17.1 C87.2 28 87.1 46.5 89.3 57",
        fill: "none", stroke: BROWN, strokeWidth: 1.05, strokeLinecap: "round",
      }),
      // Green lower shading and pale upper fold visible on the right cotyledon.
      h("path", {
        d: "M89 37.2 C91 34.8 92.6 34.2 93.1 34.5 C93 42.1 92.7 49.4 92.1 53.6 C90.8 56.4 89.6 57.3 88.8 57 C87.7 50.1 87.8 43.4 89 37.2 Z",
        fill: "hsl(125 23% 48%)", opacity: 0.75,
      }),
      h("path", {
        d: "M88.8 18 C91.1 16.4 92.8 17.1 93.6 19.7 C93.3 24.8 93.1 30.2 93 34.7 C91.1 35.1 89.8 33.7 89.2 31.5 C90.2 25.3 90 21.2 88.8 18 Z",
        fill: "hsl(45 31% 83%)", opacity: 0.95,
      }),
      bracket(96, 18, 58, "dicot-embryo-bracket"),
      h("text", {
        x: 75, y: 64.5, textAnchor: "middle", fontSize: 3.4,
        fill: "hsl(var(--foreground))", fontWeight: 700,
      }, "(ب) ذوات الفلقتين"),
    );
  })(),
};


/* Spermatogenesis (ch3) */
const spermatogenesis: DiagramDef = {
  id: "ch3-spermatogenesis",
  title: { en: "Spermatogenesis", ar: "تكوين النطف" },
  aspect: "3/4",
  parts: [
    // Row labels on the left column
    { id: "spg",   label: { en: "Spermatogonium",         ar: "سلائف النطفة" },       ax: 40, ay: 6,  lx: 2,  ly: 4,  lw: 26 },
    { id: "pri",   label: { en: "Primary spermatocyte",   ar: "خلية نطفية أولية" },   ax: 40, ay: 19, lx: 2,  ly: 22, lw: 26 },
    { id: "sec",   label: { en: "Secondary spermatocyte", ar: "خلية نطفية ثانوية" },  ax: 26, ay: 34, lx: 2,  ly: 42, lw: 26 },
    { id: "std",   label: { en: "Spermatids",             ar: "أرومات النطفة" },      ax: 10, ay: 48, lx: 2,  ly: 62, lw: 26 },
    { id: "sperm", label: { en: "Mature sperm",           ar: "نطفة ناضجة" },         ax: 10, ay: 66, lx: 2,  ly: 84, lw: 26 },
    // Process brackets & drop zones on the right column, short arrows to nearby anchors
    { id: "m1",    label: { en: "Meiosis I",              ar: "انقسام اختزالي أول" }, ax: 72, ay: 20, lx: 74, ly: 22, lw: 24 },
    { id: "m2",    label: { en: "Meiosis II",             ar: "انقسام اختزالي ثاني" },ax: 72, ay: 37, lx: 74, ly: 48, lw: 24 },
    { id: "trans", label: { en: "Spermiogenesis",         ar: "عملية التحول النطفي" },ax: 72, ay: 57, lx: 74, ly: 74, lw: 24 },
  ],
  art: (() => {
    const RIM  = "hsl(0 0% 20%)";
    const FILL = "hsl(0 65% 88%)";
    const RED  = "hsl(0 70% 45%)";
    const BLUE = "hsl(215 75% 45%)";
    const ARR  = "hsl(0 0% 25%)";
    const BRK  = "hsl(210 70% 50%)";

    // Cell circle with pink fill
    const cell = (cx: number, cy: number, r: number, key: string) =>
      h("circle", { key, cx, cy, r, fill: FILL, stroke: RIM, strokeWidth: 0.5 });

    // A pair of tiny squiggle chromosomes (one red, one blue)
    const pair = (cx: number, cy: number, key: string, scale = 1) => h("g", { key },
      h("path", { d: `M ${cx-1.2*scale} ${cy-1.4*scale} q 0.4 0.8 0 1.6 q -0.4 0.8 0 1.6`,
        fill: "none", stroke: RED, strokeWidth: 0.55*scale, strokeLinecap: "round" }),
      h("path", { d: `M ${cx+1.2*scale} ${cy-1.4*scale} q -0.4 0.8 0 1.6 q 0.4 0.8 0 1.6`,
        fill: "none", stroke: BLUE, strokeWidth: 0.55*scale, strokeLinecap: "round" }),
    );

    // XX-shape chromosomes (crossed pair) — used for primary/secondary
    const xx = (cx: number, cy: number, key: string, color1 = RED, color2 = BLUE, size = 1.6) => h("g", { key },
      h("line", { x1: cx-size, y1: cy-size, x2: cx+size, y2: cy+size, stroke: color1, strokeWidth: 0.7, strokeLinecap: "round" }),
      h("line", { x1: cx-size, y1: cy+size, x2: cx+size, y2: cy-size, stroke: color1, strokeWidth: 0.7, strokeLinecap: "round" }),
      h("line", { x1: cx+size*1.6, y1: cy-size, x2: cx+size*3.6, y2: cy+size, stroke: color2, strokeWidth: 0.7, strokeLinecap: "round" }),
      h("line", { x1: cx+size*1.6, y1: cy+size, x2: cx+size*3.6, y2: cy-size, stroke: color2, strokeWidth: 0.7, strokeLinecap: "round" }),
    );

    const arrow = (x1: number, y1: number, x2: number, y2: number, key: string, stage = 0) => h("g", {
      key, className: "stage-arrow",
      style: { animationDelay: `${0.35 + stage * 0.7}s` },
    },
      h("line", { x1, y1, x2, y2, stroke: ARR, strokeWidth: 0.45 }),
      h("path", {
        d: `M ${x2-1.2} ${y2-1.4} L ${x2} ${y2} L ${x2+1.2} ${y2-1.4} Z`,
        fill: ARR, transform: `rotate(${Math.atan2(y2-y1, x2-x1)*180/Math.PI - 90} ${x2} ${y2})`,
      }),
    );

    // Small sperm (head + tail)
    const sperm = (cx: number, cy: number, key: string) => h("g", { key },
      h("ellipse", { cx, cy, rx: 1.4, ry: 2.2, fill: FILL, stroke: RIM, strokeWidth: 0.45 }),
      h("path", { d: `M ${cx} ${cy+2.2} q -1.6 2.4 0 4.8 q 1.6 2.4 0 4.8`,
        fill: "none", stroke: RIM, strokeWidth: 0.45, strokeLinecap: "round" }),
    );

    // Right-side bracket "]" spanning y1..y2 at x
    const bracket = (x: number, y1: number, y2: number, key: string) => h("path", {
      key, d: `M ${x-1.4} ${y1} L ${x} ${y1} L ${x} ${y2} L ${x-1.4} ${y2}`,
      fill: "none", stroke: BRK, strokeWidth: 0.55, strokeLinecap: "round",
    });

    return h(Fragment, null,
      /* Row 1 — spermatogonium */
      cell(40, 6, 3.6, "c1"),
      pair(40, 6, "d1", 0.9),
      arrow(40, 9.8, 40, 13.8, "a1", 0),

      /* Row 2 — primary spermatocyte (bigger, 2 XX-pairs) */
      cell(40, 19, 5, "c2"),
      xx(37, 19, "d2a", RED, BLUE, 1.3),
      arrow(36.5, 22.7, 26, 29.6, "a2l", 1),
      arrow(43.5, 22.7, 54, 29.6, "a2r", 1),

      /* Row 3 — two secondary spermatocytes */
      cell(26, 34, 4.2, "c3a"),
      xx(24, 34, "d3a", RED, RED, 1.1),
      cell(54, 34, 4.2, "c3b"),
      xx(52, 34, "d3b", BLUE, BLUE, 1.1),
      arrow(23, 37.6, 10, 44.6, "a3a", 2),
      arrow(29, 37.6, 32, 44.6, "a3b", 2),
      arrow(51, 37.6, 48, 44.6, "a3c", 2),
      arrow(57, 37.6, 68, 44.6, "a3d", 2),

      /* Row 4 — four spermatids */
      cell(10, 48, 3.2, "c4a"), pair(10, 48, "d4a", 0.75),
      cell(32, 48, 3.2, "c4b"), pair(32, 48, "d4b", 0.75),
      cell(48, 48, 3.2, "c4c"), pair(48, 48, "d4c", 0.75),
      cell(68, 48, 3.2, "c4d"), pair(68, 48, "d4d", 0.75),

      /* Transition line + arrows */
      h("line", { x1: 4, y1: 57, x2: 70, y2: 57, stroke: BRK, strokeWidth: 0.45, opacity: 0.75 }),
      arrow(10, 51.4, 10, 60.6, "a5a", 3),
      arrow(32, 51.4, 32, 60.6, "a5b", 3),
      arrow(48, 51.4, 48, 60.6, "a5c", 3),
      arrow(68, 51.4, 68, 60.6, "a5d", 3),

      /* Row 5 — mature sperm */
      sperm(10, 63, "s1"),
      sperm(32, 63, "s2"),
      sperm(48, 63, "s3"),
      sperm(68, 63, "s4"),

      /* Right-side brackets for meiosis I & II — sit in the right margin */
      bracket(72, 13, 27, "brk1"),
      bracket(72, 29, 46, "brk2"),
    );
  })(),
};


/* Human sperm anatomy (ch3) */
const spermAnatomy: DiagramDef = {
  id: "ch3-sperm-anatomy",
  title: { en: "Mature Human Sperm", ar: "نطفة الإنسان الناضجة" },
  aspect: "16/7",
  parts: [
    // Positions mirror the supplied textbook figure: head and tail labels above,
    // with the neck and midpiece labels below their structures.
    { id: "head", label: { en: "Head",     ar: "الرأس" },      ax: 16, ay: 29, lx: 2,  ly: 4,  lw: 18 },
    { id: "neck", label: { en: "Neck",     ar: "عنق" },        ax: 28, ay: 34, lx: 5,  ly: 72, lw: 18 },
    { id: "mid",  label: { en: "Midpiece", ar: "قطعة وسطية" }, ax: 38, ay: 34, lx: 29, ly: 74, lw: 20 },
    { id: "tail", label: { en: "Tail",     ar: "ذيل" },        ax: 67, ay: 35, lx: 59, ly: 3,  lw: 18 },
  ],
  art: (() => {
    const OUT = "hsl(209 32% 25%)";
    const GOLD = "hsl(35 83% 57%)";
    const GOLD_DARK = "hsl(24 64% 36%)";
    const NUCLEUS = "hsl(196 62% 58%)";
    const NUCLEUS_DARK = "hsl(211 56% 39%)";
    const POSTERIOR = "hsl(151 55% 42%)";
    const MIDPIECE = "hsl(8 61% 52%)";

    return h(Fragment, null,
      // Golden outer rim around the asymmetric oval head.
      h("path", {
        d: "M7.5 30.5 C7.8 23.7 12.6 19.5 19.2 20 C24.2 20.4 27.5 23.3 29 28.2 L29 33.6 C27.1 38.6 22.5 41.3 17.3 41.1 C11.1 40.8 7.2 36.7 7.5 30.5 Z",
        fill: GOLD, stroke: OUT, strokeWidth: 0.75, strokeLinejoin: "round",
      }),

      // Blue nuclear region occupies most of the head, as in the reference.
      h("path", {
        d: "M9.4 30.6 C9.6 25.3 13.3 22 18.4 22 C21.2 22.1 23.6 23.1 25.3 25.2 L25.1 36.2 C22.9 38.2 20.1 39.2 17.2 39 C12.3 38.7 9.2 35.5 9.4 30.6 Z",
        fill: NUCLEUS, stroke: NUCLEUS_DARK, strokeWidth: 0.4,
      }),

      // Darker anterior crescent gives the same depth visible in the textbook art.
      h("path", {
        d: "M9.5 30.5 C9.7 25.5 12.8 22.4 17.4 22 C14.5 25.4 13.4 31.8 16.7 38.8 C12.3 38.3 9.3 35.1 9.5 30.5 Z",
        fill: NUCLEUS_DARK, opacity: 0.45,
      }),

      // Green posterior portion at the base of the head.
      h("path", {
        d: "M24.4 23.7 C27.1 25.2 28.2 27.4 28.2 30.7 C28.2 34 27 36.3 24.7 37.8 C25.4 33.3 25.2 28.3 24.4 23.7 Z",
        fill: POSTERIOR, stroke: "hsl(151 48% 29%)", strokeWidth: 0.38,
      }),

      // Neck: the short constricted connector immediately behind the head.
      h("path", {
        d: "M28.2 29.2 L31.1 29.6 L31.3 34.9 L28.1 34.7 Z",
        fill: "hsl(31 45% 34%)", stroke: OUT, strokeWidth: 0.45,
      }),

      // Midpiece: a slightly tapering red cylinder surrounded by a golden rim.
      h("path", {
        d: "M30.8 28.9 C35.4 28.5 40.5 29.1 46.5 31.5 L46.4 36.5 C40.2 35.2 35.1 35.1 30.9 35.4 Z",
        fill: MIDPIECE, stroke: GOLD_DARK, strokeWidth: 0.75, strokeLinejoin: "round",
      }),
      h("path", {
        d: "M31.5 30.1 C36.1 29.8 40.6 30.4 45.8 32.2 L45.8 35.3 C40.6 34.3 36 34.1 31.5 34.4 Z",
        fill: "hsl(6 70% 58%)", stroke: "none",
      }),

      // Repeated mitochondrial coils create the ribbed appearance in the reference.
      ...Array.from({ length: 12 }, (_, i) => h("line", {
        key: `mb${i}`,
        x1: 32 + i * 1.15,
        y1: 29.8 + i * 0.09,
        x2: 32 + i * 1.15,
        y2: 34.6 + i * 0.12,
        stroke: "hsl(34 85% 69%)", strokeWidth: 0.55, strokeLinecap: "round",
      })),

      // Tail: dark outline under a golden flagellum, narrowing toward the end.
      h("path", {
        d: "M46 34 C54 35.2 56.7 41.5 65 42.1 C73.5 42.7 76.8 33.3 84.7 32.4 C90.3 31.8 92.7 36.8 96.1 35.1",
        fill: "none", stroke: OUT, strokeWidth: 2.15, strokeLinecap: "round",
      }),
      h("path", {
        d: "M46 34 C54 35.2 56.7 41.5 65 42.1 C73.5 42.7 76.8 33.3 84.7 32.4 C90.3 31.8 92.7 36.8 96.1 35.1",
        fill: "none", stroke: GOLD, strokeWidth: 1.35, strokeLinecap: "round",
      }),

      // The final tapered blue segment is distinct in the supplied figure.
      h("path", {
        d: "M94.2 35.8 C96.8 35.6 98.1 33.5 99.4 34",
        fill: "none", stroke: "hsl(197 55% 38%)", strokeWidth: 1.05, strokeLinecap: "round",
      }),
    );
  })(),
};


/* Male reproductive system in insects (ch3) */
const insectMaleRepro: DiagramDef = {
  id: "ch3-insect-male-repro",
  title: { en: "Male Reproductive System in Insects", ar: "الجهاز التناسلي الذكري في الحشرات" },
  aspect: "4/3",
  parts: [
    // The six labels and their anchors follow the supplied ministerial reference.
    { id: "testis",    label: { en: "Testis",            ar: "خصية" },          ax: 32, ay: 12, lx: 1,  ly: 5,  lw: 23 },
    { id: "vas",       label: { en: "Vas deferens",      ar: "وعاء ناقل" },     ax: 28, ay: 28, lx: 1,  ly: 27, lw: 23 },
    { id: "seminal",   label: { en: "Seminal vesicle",   ar: "حويصلة منوية" }, ax: 31, ay: 42, lx: 1,  ly: 50, lw: 23 },
    { id: "accessory", label: { en: "Accessory gland",   ar: "غدة مساعدة" },    ax: 57, ay: 31, lx: 76, ly: 20, lw: 22 },
    { id: "ejac",      label: { en: "Ejaculatory duct", ar: "القناة القاذفة" }, ax: 50, ay: 55, lx: 76, ly: 51, lw: 22 },
    { id: "penis",     label: { en: "Penis",            ar: "قضيب" },          ax: 50, ay: 68, lx: 1,  ly: 80, lw: 23 },
  ],
  art: (() => {
    const OUT = "hsl(15 30% 18%)";
    const ORGAN = "hsl(22 76% 75%)";
    const ORGAN_LIGHT = "hsl(28 86% 86%)";
    const ORGAN_DARK = "hsl(13 45% 38%)";
    const TUBE = "hsl(17 34% 27%)";

    const testis = (cx: number, mirror: boolean, key: string) => {
      const sign = mirror ? -1 : 1;
      return h("g", { key },
        // Fan-shaped testis, matching the shell-like outline in the reference.
        h("path", {
          d: `M ${cx-8} 13 Q ${cx-7} 5 ${cx} 4 Q ${cx+7} 5 ${cx+8} 13 Q ${cx+5} 18 ${cx} 19 Q ${cx-5} 18 ${cx-8} 13 Z`,
          fill: ORGAN_LIGHT, stroke: OUT, strokeWidth: 0.7, strokeLinejoin: "round",
        }),
        // The visible lobes of the testis radiate from its upper centre.
        ...[-6,-4,-2,0,2,4,6].map((offset, index) => h("path", {
          key: `${key}-rib-${index}`,
          d: `M ${cx + offset * 0.35} 5.2 Q ${cx + offset * 0.75} 11 ${cx + offset} 16.2`,
          fill: "none", stroke: ORGAN_DARK, strokeWidth: 0.48, strokeLinecap: "round",
        })),
        h("path", {
          d: `M ${cx-6.5} 13.2 Q ${cx} 17.7 ${cx+6.5} 13.2`,
          fill: "none", stroke: ORGAN_DARK, strokeWidth: 0.35, opacity: 0.7,
        }),
        // Short outlet leaving the lower edge of the testis.
        h("path", {
          d: `M ${cx + 6 * sign} 15 C ${cx + 8 * sign} 18 ${cx + 6 * sign} 20 ${cx + 5 * sign} 21`,
          fill: "none", stroke: TUBE, strokeWidth: 0.9, strokeLinecap: "round",
        }),
      );
    };

    return h(Fragment, null,
      // Paired testes.
      testis(32, false, "testis-left"),
      testis(68, true, "testis-right"),

      // Paired coiled vasa deferentia descending from the testes.
      h("path", {
        d: "M38 18 C36 21 39 23 35 25 C31 27 36 29 32 31 C29 32 29 33 29 35",
        fill: "none", stroke: TUBE, strokeWidth: 0.9, strokeLinecap: "round",
      }),
      h("path", {
        d: "M62 18 C64 21 61 23 65 25 C69 27 64 29 68 31 C71 32 71 33 71 35",
        fill: "none", stroke: TUBE, strokeWidth: 0.9, strokeLinecap: "round",
      }),

      // Paired seminal vesicles: broad lateral sacs tapering into the common junction.
      h("path", {
        d: "M29 33 C23 35 23 42 27 47 C30 51 36 52 43 51 C39 47 37 41 35 36 C34 33 32 32 29 33 Z",
        fill: ORGAN, stroke: OUT, strokeWidth: 0.7, strokeLinejoin: "round",
      }),
      h("path", {
        d: "M71 33 C77 35 77 42 73 47 C70 51 64 52 57 51 C61 47 63 41 65 36 C66 33 68 32 71 33 Z",
        fill: ORGAN, stroke: OUT, strokeWidth: 0.7, strokeLinejoin: "round",
      }),
      h("path", { d: "M27 38 Q30 43 34 47", fill: "none", stroke: ORGAN_LIGHT, strokeWidth: 0.55, opacity: 0.8 }),
      h("path", { d: "M73 38 Q70 43 66 47", fill: "none", stroke: ORGAN_LIGHT, strokeWidth: 0.55, opacity: 0.8 }),

      // Two long accessory glands lie medially, as in the supplied drawing.
      h("path", {
        d: "M43 20 C40 22 40 28 41 34 C42 40 43 46 47 50 C49 51 50 49 49 47 C46 41 46 34 47 27 C48 22 46 19 43 20 Z",
        fill: ORGAN_LIGHT, stroke: OUT, strokeWidth: 0.65, strokeLinejoin: "round",
      }),
      h("path", {
        d: "M57 20 C60 22 60 28 59 34 C58 40 57 46 53 50 C51 51 50 49 51 47 C54 41 54 34 53 27 C52 22 54 19 57 20 Z",
        fill: ORGAN_LIGHT, stroke: OUT, strokeWidth: 0.65, strokeLinejoin: "round",
      }),
      h("path", { d: "M44 23 Q43 34 47 45", fill: "none", stroke: ORGAN_DARK, strokeWidth: 0.3, opacity: 0.55 }),
      h("path", { d: "M56 23 Q57 34 53 45", fill: "none", stroke: ORGAN_DARK, strokeWidth: 0.3, opacity: 0.55 }),

      // All paired ducts meet at one central junction.
      h("path", { d: "M39 49 Q45 49 50 52 Q55 49 61 49", fill: "none", stroke: TUBE, strokeWidth: 1, strokeLinecap: "round" }),
      h("path", { d: "M47 49 Q49 50 50 52 Q51 50 53 49", fill: "none", stroke: TUBE, strokeWidth: 0.8, strokeLinecap: "round" }),

      // Single ejaculatory duct, followed by the thicker terminal penis.
      h("path", {
        d: "M48.7 51 L48.7 64 Q48.7 66 47.8 67 L47.8 71 Q50 73 52.2 71 L52.2 67 Q51.3 66 51.3 64 L51.3 51 Z",
        fill: ORGAN, stroke: OUT, strokeWidth: 0.75, strokeLinejoin: "round",
      }),
      h("path", { d: "M50 52 L50 71", fill: "none", stroke: ORGAN_DARK, strokeWidth: 0.45, strokeLinecap: "round" }),
      h("path", { d: "M48.3 65 L51.7 65", fill: "none", stroke: OUT, strokeWidth: 0.35, opacity: 0.7 }),
    );
  })(),
};


/* Female reproductive system in insects (ch3) */
const insectFemaleRepro: DiagramDef = {
  id: "ch3-insect-female-repro",
  title: { en: "Female Reproductive System in Insects", ar: "الجهاز التناسلي الأنثوي في الحشرات" },
  aspect: "4/3",
  parts: [
    // Labels reproduce the six structures called out in the supplied reference.
    { id: "ovary",       label: { en: "Ovary",                    ar: "مبيض" },                 ax: 66, ay: 20, lx: 76, ly: 7,  lw: 22 },
    { id: "lateral",     label: { en: "Lateral oviduct",          ar: "قناة بيض جانبية" },      ax: 58, ay: 41, lx: 76, ly: 32, lw: 22 },
    { id: "accessory",   label: { en: "Accessory gland",         ar: "غدة مساعدة" },           ax: 23, ay: 53, lx: 1,  ly: 47, lw: 24 },
    { id: "mainOviduct", label: { en: "Main oviduct",            ar: "قناة البيض الرئيسة" },   ax: 50, ay: 55, lx: 1,  ly: 65, lw: 24 },
    { id: "spermatheca", label: { en: "Spermatheca and its gland", ar: "مستودع منوي وغدته" }, ax: 70, ay: 54, lx: 76, ly: 57, lw: 22 },
    { id: "vagina",      label: { en: "Vagina",                   ar: "مهبل" },                 ax: 50, ay: 67, lx: 1,  ly: 84, lw: 24 },
  ],
  art: (() => {
    const OUT = "hsl(15 30% 18%)";
    const ORGAN = "hsl(22 70% 76%)";
    const ORGAN_LIGHT = "hsl(28 85% 88%)";
    const ORGAN_DARK = "hsl(8 43% 39%)";
    const TUBE = "hsl(17 35% 28%)";

    const ovary = (cx: number, key: string) => h("g", { key },
      // Pear-shaped ovary with a narrow apical end and a broad basal end.
      h("path", {
        d: `M ${cx} 4 C ${cx-1} 8 ${cx-8} 11 ${cx-10} 18 C ${cx-13} 27 ${cx-8} 35 ${cx} 38 C ${cx+8} 35 ${cx+13} 27 ${cx+10} 18 C ${cx+8} 11 ${cx+1} 8 ${cx} 4 Z`,
        fill: ORGAN_LIGHT, stroke: OUT, strokeWidth: 0.75, strokeLinejoin: "round",
      }),
      // Ovarioles: several dark, slightly wavy tubes running through each ovary.
      ...[-7.2,-4.8,-2.4,0,2.4,4.8,7.2].map((offset, index) => h("path", {
        key: `${key}-ovariole-${index}`,
        d: `M ${cx + offset * 0.12} 6 C ${cx + offset * 0.55} 13 ${cx + offset * 0.95} 20 ${cx + offset * 0.78} 27 C ${cx + offset * 0.65} 33 ${cx + offset * 0.35} 35 ${cx + offset * 0.18} 36.5`,
        fill: "none", stroke: ORGAN_DARK, strokeWidth: 0.62, strokeLinecap: "round",
      })),
      h("path", {
        d: `M ${cx-8.5} 25 Q ${cx} 35.5 ${cx+8.5} 25`,
        fill: "none", stroke: "hsl(22 55% 65%)", strokeWidth: 0.35, opacity: 0.75,
      }),
    );

    return h(Fragment, null,
      // Paired ovaries.
      ovary(34, "ovary-left"),
      ovary(66, "ovary-right"),

      // Paired lateral oviducts converge into the main median duct.
      h("path", {
        d: "M34 37 C36 41 41 43 49 48",
        fill: "none", stroke: TUBE, strokeWidth: 1, strokeLinecap: "round",
      }),
      h("path", {
        d: "M66 37 C64 41 59 43 51 48",
        fill: "none", stroke: TUBE, strokeWidth: 1, strokeLinecap: "round",
      }),
      h("path", {
        d: "M49 47 Q50 48 51 47 L52 57 Q50 59 48 57 Z",
        fill: ORGAN, stroke: OUT, strokeWidth: 0.65, strokeLinejoin: "round",
      }),

      // Left accessory gland: a long curved sac opening beside the median duct.
      h("path", {
        d: "M48.5 52 C41 51 35 51 29 49 C24 47 18 48 16 51 C18 55 23 57 29 57 C37 57 42 55 49 54 Z",
        fill: ORGAN_LIGHT, stroke: OUT, strokeWidth: 0.7, strokeLinejoin: "round",
      }),
      h("path", { d: "M18 51 Q24 53 30 52", fill: "none", stroke: ORGAN_DARK, strokeWidth: 0.35, opacity: 0.65 }),

      // Right spermatheca (storage sac) and its associated elongated gland.
      h("path", {
        d: "M52 52 C57 50 60 47 64 47 C68 47 70 49 69 52 C68 55 63 55 60 53 C58 52 56 53 54 55",
        fill: "none", stroke: TUBE, strokeWidth: 0.9, strokeLinecap: "round",
      }),
      h("ellipse", { cx: 65, cy: 50.5, rx: 4.3, ry: 2.5, fill: ORGAN, stroke: OUT, strokeWidth: 0.65, transform: "rotate(-12 65 50.5)" }),
      h("path", {
        d: "M68 53 C73 51 80 50 84 53 C85 56 81 59 76 61 C70 63 66 62 62 59 C64 57 66 55 68 53 Z",
        fill: ORGAN_LIGHT, stroke: OUT, strokeWidth: 0.7, strokeLinejoin: "round",
      }),
      h("path", { d: "M72 55 Q78 56 82 54", fill: "none", stroke: ORGAN_DARK, strokeWidth: 0.35, opacity: 0.65 }),

      // Main oviduct continues into the terminal vagina.
      h("path", { d: "M50 55 L50 61", fill: "none", stroke: TUBE, strokeWidth: 1.25, strokeLinecap: "round" }),
      h("path", {
        d: "M45.5 59 Q50 57.5 54.5 59 L54.5 70 Q50 72 45.5 70 Z",
        fill: ORGAN, stroke: OUT, strokeWidth: 0.75, strokeLinejoin: "round",
      }),
      h("path", { d: "M50 60 L50 70.5", fill: "none", stroke: ORGAN_DARK, strokeWidth: 0.45, strokeLinecap: "round" }),
      h("ellipse", { cx: 50, cy: 70, rx: 4.4, ry: 1.2, fill: "hsl(18 55% 68%)", stroke: OUT, strokeWidth: 0.35 }),
    );
  })(),
};


/* Human male reproductive system (ch3) */
const maleRepro: DiagramDef = {
  id: "ch3-male-repro",
  title: { en: "Human Male Reproductive System", ar: "الجهاز التناسلي الذكري في الإنسان" },
  aspect: "4/3",
  parts: [
    // Left-side labels — anchor on the actual structure
    { id: "vas",    label: { en: "Vas deferens",        ar: "قناة ناقلة" },       ax: 18, ay: 30, lx: 2,  ly: 18, lw: 24 },
    { id: "ejac",   label: { en: "Ejaculatory duct",    ar: "القناة القاذفة" },   ax: 47, ay: 21, lx: 2,  ly: 32, lw: 24 },
    { id: "cowp",   label: { en: "Cowper's glands",     ar: "غدد كوبر" },         ax: 44, ay: 30, lx: 2,  ly: 44, lw: 24 },
    { id: "epid",   label: { en: "Epididymis",          ar: "بريخ" },             ax: 21, ay: 55, lx: 2,  ly: 58, lw: 24 },
    { id: "testis", label: { en: "Testis",              ar: "خصية" },             ax: 28, ay: 66, lx: 2,  ly: 72, lw: 24 },
    // Right-side labels
    { id: "semv",   label: { en: "Seminal vesicle",     ar: "حويصلة منوية" },     ax: 60, ay: 17, lx: 76, ly: 10, lw: 22 },
    { id: "prost",  label: { en: "Prostate",            ar: "غدة البروستات" },    ax: 55, ay: 25, lx: 76, ly: 26, lw: 22 },
    { id: "penis",  label: { en: "Penis",               ar: "القضيب" },           ax: 55, ay: 40, lx: 76, ly: 46, lw: 22 },
    { id: "semt",   label: { en: "Seminiferous tubules", ar: "نبيبات منوية" },    ax: 74, ay: 60, lx: 76, ly: 66, lw: 22 },
  ],
  art: (() => {
    const OUT = "hsl(12 45% 22%)";
    const RED = "hsl(4 60% 60%)";
    const RED_D = "hsl(4 55% 38%)";
    const RED_DK = "hsl(0 55% 40%)";     // prostate — darker
    const YEL = "hsl(42 82% 58%)";
    const YEL_D = "hsl(30 65% 35%)";
    const TAN = "hsl(18 50% 65%)";
    const TAN_D = "hsl(15 40% 40%)";
    const TUBE = "hsl(18 35% 30%)";
    // Lumpy grape-cluster used for seminal vesicles
    const lumps = (cx: number, cy: number, keyBase: string) =>
      ([[-3.2,-2,2,1.7],[-1,-3,1.9,1.5],[1.2,-2.5,2,1.7],[3.2,-1,1.7,1.4],
        [-2.2,0.2,1.9,1.5],[0.2,0.8,2.1,1.7],[2.4,1,1.9,1.5],
        [-2.8,2.4,1.7,1.4],[0.4,2.8,1.9,1.5],[2.6,2.6,1.6,1.3]] as const)
        .map(([dx,dy,rx,ry], i) => h("ellipse", {
          key: `${keyBase}${i}`, cx: cx+dx, cy: cy+dy, rx, ry, fill: YEL, stroke: YEL_D, strokeWidth: 0.3,
        }));
    return h(Fragment, null,
      // Ureters (context, unlabeled) coming down from top corners into bladder top
      h("path", { d: "M22 1 Q26 6 36 10", fill: "none", stroke: TUBE, strokeWidth: 0.55 }),
      h("path", { d: "M78 1 Q74 6 64 10", fill: "none", stroke: TUBE, strokeWidth: 0.55 }),
      // BLADDER — large red dome at top center
      h("path", {
        d: "M36 4 Q36 2 42 2 L58 2 Q64 2 64 4 Q68 10 65 15 Q60 20 50 20 Q40 20 35 15 Q32 10 36 4 Z",
        fill: RED, stroke: RED_D, strokeWidth: 0.55,
      }),
      // Bladder highlight/shading
      h("path", { d: "M40 5 Q45 3 55 3 Q60 4 62 6", fill: "none", stroke: "hsl(4 80% 82%)", strokeWidth: 0.5, opacity: 0.7 }),
      // VAS DEFERENS — long tubes looping from testes up around bladder, joining behind at prostate
      h("path", { d: "M25 56 Q 14 40 17 22 Q 20 12 34 12 Q 39 14 41 17", fill: "none", stroke: TUBE, strokeWidth: 0.85 }),
      h("path", { d: "M75 56 Q 86 40 83 22 Q 80 12 66 12 Q 61 14 59 17", fill: "none", stroke: TUBE, strokeWidth: 0.85 }),
      // SEMINAL VESICLES — yellow lumpy sacs flanking the base of bladder / top of prostate
      ...lumps(40, 17, "svL"),
      ...lumps(60, 17, "svR"),
      // EJACULATORY DUCT — short tubes from seminal vesicles down into prostate top
      h("line", { x1: 47, y1: 20, x2: 48, y2: 24, stroke: TUBE, strokeWidth: 0.55 }),
      h("line", { x1: 53, y1: 20, x2: 52, y2: 24, stroke: TUBE, strokeWidth: 0.55 }),
      // PROSTATE — darker rounded gland directly below bladder
      h("ellipse", { cx: 50, cy: 25, rx: 6.5, ry: 4.2, fill: RED_DK, stroke: OUT, strokeWidth: 0.5 }),
      h("path", { d: "M44 25 Q50 27 56 25", fill: "none", stroke: "hsl(0 60% 25%)", strokeWidth: 0.35, opacity: 0.6 }),
      // COWPER'S GLANDS — 2 small yellow bulbs on either side just below prostate
      h("circle", { cx: 44, cy: 30, r: 1.5, fill: YEL, stroke: YEL_D, strokeWidth: 0.3 }),
      h("circle", { cx: 56, cy: 30, r: 1.5, fill: YEL, stroke: YEL_D, strokeWidth: 0.3 }),
      // Small ducts from Cowper's to urethra
      h("line", { x1: 45.4, y1: 30.4, x2: 48, y2: 31, stroke: TUBE, strokeWidth: 0.3 }),
      h("line", { x1: 54.6, y1: 30.4, x2: 52, y2: 31, stroke: TUBE, strokeWidth: 0.3 }),
      // PENIS — vertical tan shaft below prostate
      h("path", {
        d: "M46 29 Q46 28.2 47 28.2 L53 28.2 Q54 28.2 54 29 L54 48 Q54 49 53 49 L47 49 Q46 49 46 48 Z",
        fill: TAN, stroke: TAN_D, strokeWidth: 0.5,
      }),
      // Urethra line inside penis
      h("line", { x1: 50, y1: 30, x2: 50, y2: 48, stroke: "hsl(0 40% 35%)", strokeWidth: 0.35, opacity: 0.55 }),
      // Glans hint
      h("ellipse", { cx: 50, cy: 49, rx: 4, ry: 1.4, fill: "hsl(10 55% 55%)", stroke: TAN_D, strokeWidth: 0.35 }),
      // Scrotal connection lines (light) from vas base to testes
      h("path", { d: "M25 56 Q 26 60 28 62", fill: "none", stroke: TUBE, strokeWidth: 0.5, opacity: 0.7 }),
      h("path", { d: "M75 56 Q 74 60 72 62", fill: "none", stroke: TUBE, strokeWidth: 0.5, opacity: 0.7 }),
      // LEFT TESTIS (whole external view) with epididymis wrapping it
      h("ellipse", { cx: 28, cy: 64, rx: 5.5, ry: 6.5, fill: RED, stroke: RED_D, strokeWidth: 0.5 }),
      // subtle shading
      h("ellipse", { cx: 30, cy: 66, rx: 2.5, ry: 3.5, fill: "hsl(4 65% 48%)", opacity: 0.35 }),
      // EPIDIDYMIS — thick C-tube on top-left of testis
      h("path", {
        d: "M22 57 Q 18 58 19 63 Q 20 69 26 69",
        fill: "none", stroke: "hsl(15 35% 35%)", strokeWidth: 1.4, strokeLinecap: "round",
      }),
      // RIGHT TESTIS — cross-section revealing seminiferous tubules (radial "orange slice" pattern)
      h("circle", { cx: 72, cy: 62, r: 6.5, fill: "hsl(0 55% 72%)", stroke: RED_D, strokeWidth: 0.6 }),
      ...Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return h("line", {
          key: `sf${i}`,
          x1: 72 + Math.cos(a) * 1, y1: 62 + Math.sin(a) * 1,
          x2: 72 + Math.cos(a) * 6.1, y2: 62 + Math.sin(a) * 6.1,
          stroke: RED_D, strokeWidth: 0.28,
        });
      }),
      // rete testis center
      h("circle", { cx: 72, cy: 62, r: 1.2, fill: RED_D }),
    );
  })(),
};


export const CHAPTER_DIAGRAMS: Record<number, DiagramDef[]> = {
  1: [bacteria, animalCell, plantCell, plasmaMembrane, lysosomalDigestion, mitochondrion, chloroplast, chromosome],
  2: [neuronTypes],
  3: [fruit, binaryFission, bacterialConjugation, parameciumConjugation, seedTypes, spermatogenesis, spermAnatomy, insectMaleRepro, insectFemaleRepro, maleRepro],
};
