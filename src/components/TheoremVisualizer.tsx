import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type TheoremPoint = "A" | "B" | "C" | "D" | "E" | "T";

export type TheoremSegment = {
  id: string;
  from: TheoremPoint;
  to: TheoremPoint;
  color?: string;
  dashed?: boolean;
};

export type TheoremGeometry = {
  /** Replace or reorder the visible segments without changing the renderer. */
  segments?: readonly TheoremSegment[];
  pointLabels?: Partial<Record<TheoremPoint, string>>;
  planeLabels?: { X?: string; Y?: string };
};

export type TheoremVisualizerProps = {
  geometry?: TheoremGeometry;
  /** Five ordered proof statements. Steps 4 and 5 require a right dihedral angle. */
  proofSteps?: readonly string[];
  className?: string;
};

const THEOREM = "إذا تعامد مستويان فالمستقيم المرسوم في أحدهما والعمودي على مستقيم التقاطع يكون عموديا على المستوي الآخر.";

const DEFAULT_STEPS = [
  "DE ⟂ AB في المستوي Y.",
  "CD ⊂ المستوي X، وCD ⟂ AB (معطى).",
  "∠CDE هي الزاوية الثنائية بين X وY؛ لأن CD وDE عموديان على مستقيم التقاطع AB عند النقطة نفسها D.",
  "بما أن X ⟂ Y، إذن ∠CDE = 90°.",
  "إذن CD ⟂ DE وCD ⟂ AB، وهما مستقيمان متقاطعان في المستوي Y؛ لذلك CD ⟂ المستوي Y. وهو المطلوب إثباته.",
] as const;

const DEFAULT_SEGMENTS: readonly TheoremSegment[] = [
  { id: "intersection", from: "A", to: "B", color: "#172554" },
  { id: "horizontal-perpendicular", from: "D", to: "E", color: "#d48b16" },
  { id: "hinged-perpendicular", from: "D", to: "C", color: "#16a34a" },
  { id: "test", from: "D", to: "T", color: "#7c3aed", dashed: true },
];

const POINTS: readonly TheoremPoint[] = ["A", "B", "C", "D", "E", "T"];
const radians = (degrees: number) => (degrees * Math.PI) / 180;

/** AB is the x axis; plane Y is y=0. Rotating X around AB moves C only. */
function positions(dihedral: number, testRotation: number): Record<TheoremPoint, THREE.Vector3> {
  const theta = radians(dihedral);
  const phi = radians(testRotation);
  return {
    A: new THREE.Vector3(-2.2, 0, 0),
    B: new THREE.Vector3(2.2, 0, 0),
    C: new THREE.Vector3(0, 1.8 * Math.sin(theta), 1.8 * Math.cos(theta)),
    D: new THREE.Vector3(0, 0, 0),
    E: new THREE.Vector3(0, 0, 1.8),
    T: new THREE.Vector3(1.65 * Math.sin(phi), 0, 1.65 * Math.cos(phi)),
  };
}

/** The acute/right/obtuse angle between two oriented rays, not their projections. */
function testSegmentAngle(dihedral: number, testRotation: number): number {
  if (dihedral === 90) return 90;
  // CD·DT = cos(theta)cos(phi), as both rays have unit length.
  const dot = Math.cos(radians(dihedral)) * Math.cos(radians(testRotation));
  return Math.acos(THREE.MathUtils.clamp(dot, -1, 1)) * 180 / Math.PI;
}

function makeLabel(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(12, 24, 232, 80, 20);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = "bold 58px Cairo, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 66, 218);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(0.63, 0.315, 1);
  sprite.renderOrder = 12;
  return sprite;
}

type SceneUpdate = (dihedral: number, testRotation: number) => void;

export default function TheoremVisualizer({ geometry, proofSteps = DEFAULT_STEPS, className = "" }: TheoremVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const updateRef = useRef<SceneUpdate | null>(null);
  const [dihedral, setDihedral] = useState(90);
  const [testRotation, setTestRotation] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);

  const segments = geometry?.segments ?? DEFAULT_SEGMENTS;
  const pointLabels = geometry?.pointLabels;
  const planeLabels = geometry?.planeLabels;
  // Keep one WebGL scene while only the movable geometry is updated by sliders.
  const drawing = useMemo(() => ({ segments, pointLabels, planeLabels }), [segments, pointLabels, planeLabels]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fcfbf5");
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
    camera.position.set(4.5, 3.7, 5.4);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.45, 0);
    controls.minDistance = 3;
    controls.maxDistance = 12;
    controls.update();

    // Keep the faces translucent and draw their perimeter separately, like the
    // two blue/red planes in the classroom sketch. X and its border share a hinge.
    const materialY = new THREE.MeshBasicMaterial({ color: "#bfdbfe", side: THREE.DoubleSide, transparent: true, opacity: 0.22, depthWrite: false });
    const materialX = new THREE.MeshBasicMaterial({ color: "#fecaca", side: THREE.DoubleSide, transparent: true, opacity: 0.18, depthWrite: false });
    const planeY = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.6), materialY);
    planeY.rotation.x = -Math.PI / 2;
    scene.add(planeY);
    const yBorder = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.2, 0, -1.8), new THREE.Vector3(2.2, 0, -1.8),
        new THREE.Vector3(2.2, 0, 1.8), new THREE.Vector3(-2.2, 0, 1.8),
      ]),
      new THREE.LineBasicMaterial({ color: "#2563eb", depthTest: false }),
    );
    yBorder.renderOrder = 4;
    scene.add(yBorder);
    // Local y runs from the hinge at y=0 to the top edge at y=2.6.
    const hingedPlane = new THREE.Group();
    const planeX = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.6), materialX);
    planeX.position.y = 1.3;
    hingedPlane.add(planeX);
    const xBorder = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.2, 0, 0), new THREE.Vector3(2.2, 0, 0),
        new THREE.Vector3(2.2, 2.6, 0), new THREE.Vector3(-2.2, 2.6, 0),
      ]),
      new THREE.LineBasicMaterial({ color: "#ef4444", depthTest: false }),
    );
    xBorder.renderOrder = 5;
    hingedPlane.add(xBorder);
    scene.add(hingedPlane);

    const lineObjects = drawing.segments.map((segment) => {
      const material = segment.dashed
        ? new THREE.LineDashedMaterial({ color: segment.color ?? "#ffffff", dashSize: 0.14, gapSize: 0.08, depthTest: false })
        : new THREE.LineBasicMaterial({ color: segment.color ?? "#ffffff", depthTest: false });
      const line = new THREE.Line(new THREE.BufferGeometry(), material);
      line.renderOrder = 8;
      scene.add(line);
      return { segment, line };
    });

    const markMaterial = new THREE.LineBasicMaterial({ color: "#dc2626", depthTest: false });
    const angleMark = new THREE.Line(new THREE.BufferGeometry(), markMaterial);
    angleMark.renderOrder = 9;
    scene.add(angleMark);

    const dots = new Map<TheoremPoint, THREE.Mesh>();
    const labels = new Map<TheoremPoint, THREE.Sprite>();
    for (const key of POINTS) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshBasicMaterial({ color: key === "T" ? "#7c3aed" : "#172554", depthTest: false }));
      dot.renderOrder = 10;
      scene.add(dot);
      dots.set(key, dot);
      const label = makeLabel(drawing.pointLabels?.[key] ?? key, key === "T" ? "#7c3aed" : "#172554");
      scene.add(label);
      labels.set(key, label);
    }
    const xLabel = makeLabel(drawing.planeLabels?.X ?? "X", "#dc2626");
    const yLabel = makeLabel(drawing.planeLabels?.Y ?? "Y", "#2563eb");
    scene.add(xLabel, yLabel);

    const update: SceneUpdate = (angle, rotation) => {
      const p = positions(angle, rotation);
      for (const { segment, line } of lineObjects) {
        line.geometry.dispose();
        line.geometry = new THREE.BufferGeometry().setFromPoints([p[segment.from], p[segment.to]]);
        if (segment.dashed) line.computeLineDistances();
      }
      for (const key of POINTS) {
        dots.get(key)!.position.copy(p[key]);
        labels.get(key)!.position.copy(p[key]).add(new THREE.Vector3(key === "B" ? 0.26 : -0.18, 0.2, key === "D" ? -0.24 : 0));
      }
      const theta = radians(angle);
      // Group local +y maps to (0, sinθ, cosθ), exactly like segment CD.
      hingedPlane.rotation.x = Math.PI / 2 - theta;
      xLabel.position.set(-1.6, 2.36 * Math.sin(theta) + 0.14, 2.36 * Math.cos(theta));
      yLabel.position.set(1.65, 0.16, -1.25);
      const arc = Array.from({ length: 41 }, (_, index) => {
        const a = (theta * index) / 40;
        return new THREE.Vector3(0, 0.48 * Math.sin(a), 0.48 * Math.cos(a));
      });
      angleMark.geometry.dispose();
      angleMark.geometry = new THREE.BufferGeometry().setFromPoints(arc);
    };
    updateRef.current = update;
    update(dihedral, testRotation);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    };
    render();
    return () => {
      updateRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite) {
          if (object instanceof THREE.Mesh || object instanceof THREE.Line) object.geometry.dispose();
          const material = object.material as THREE.Material;
          if (material instanceof THREE.SpriteMaterial) material.map?.dispose();
          material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Scene configuration changes rebuild the objects; slider changes only update coordinates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing]);

  useEffect(() => { updateRef.current?.(dihedral, testRotation); }, [dihedral, testRotation]);

  const measured = testSegmentAngle(dihedral, testRotation);
  const perpendicular = dihedral === 90;
  const chooseStep = (index: number) => {
    setActiveStep(index);
    if (index >= 3) setDihedral(90);
  };

  return (
    <section dir="rtl" className={`rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:p-6 ${className}`} style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
      <h2 className="text-xl font-extrabold text-[#183A72] sm:text-2xl">برهان تفاعلي: تعامد المستويين</h2>
      <p className="mt-2 text-sm leading-8 sm:text-base">{THEOREM}</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,1fr)]">
        <div>
          <div ref={mountRef} role="img" aria-label="مستويان يلتقيان على AB، والمستقيمان CD وDE ومستقيم اختبار قابل للدوران" className="h-[340px] w-full overflow-hidden rounded-2xl border border-blue-100 bg-[#fcfbf5] touch-none sm:h-[440px]" />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
            <span className="text-blue-600">▰ المستوي Y</span><span className="text-red-600">▰ المستوي X</span>
            <span className="text-green-700">━ CD</span><span className="text-amber-700">━ DE</span>
            <span className="text-violet-700">┄ مستقيم الاختبار</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">اسحب الشكل لتدويره، وحرّك المؤشرين لتختبر صحة المبرهنة.</p>
          <div className="mt-4 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              <span className="flex justify-between gap-2"><span>الزاوية الثنائية ∠CDE</span><b dir="ltr">{dihedral}°</b></span>
              <input type="range" min={20} max={160} step={1} value={dihedral} onChange={(event) => {
                const next = Number(event.target.value);
                setDihedral(next);
                if (next !== 90) setActiveStep((step) => Math.min(step, 2));
              }} className="mt-3 w-full accent-[#183A72]" aria-label="الزاوية الثنائية بين المستويين" />
            </label>
            <label className="block text-sm font-semibold">
              <span className="flex justify-between gap-2"><span>دوران مستقيم الاختبار في Y</span><b dir="ltr">{testRotation}°</b></span>
              <input type="range" min={0} max={360} step={1} value={testRotation} onChange={(event) => setTestRotation(Number(event.target.value))} className="mt-3 w-full accent-violet-600" aria-label="دوران مستقيم الاختبار حول D" />
            </label>
          </div>
          <div aria-live="polite" className={`mt-4 rounded-2xl border p-4 ${perpendicular ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <p className="text-sm">∠CDE = <strong dir="ltr">{dihedral}°</strong> · زاوية CD مع مستقيم الاختبار = <strong dir="ltr">{measured.toFixed(1)}°</strong></p>
            <p className="mt-2 text-sm font-bold">
              {perpendicular
                ? "✓ المستويان متعامدان: تبقى زاوية CD مع كل اتجاه في Y مساوية 90°."
                : "✕ المستويان غير متعامدين: حرّك مستقيم الاختبار لتلاحظ تغيّر الزاوية. ظهور 90° لاتجاه واحد لا يكفي لإثبات التعامد مع المستوي."}
            </p>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-bold text-[#183A72]">خطوات البرهان</h3>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="اختيار خطوة البرهان">
            {proofSteps.map((_, index) => (
              <button key={index} type="button" onClick={() => chooseStep(index)} aria-pressed={activeStep === index}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183A72] ${activeStep === index ? "bg-[#183A72] text-white" : "bg-slate-100 hover:bg-slate-200"}`}>
                {index === proofSteps.length - 1 ? "النتيجة" : `الخطوة ${index + 1}`}
              </button>
            ))}
          </div>
          <ol className="mt-4 space-y-3" aria-live="polite">
            {proofSteps.slice(0, activeStep + 1).map((step, index) => (
              <li key={index} className="rounded-xl bg-slate-50 p-3 text-sm leading-7"><span className="ms-2 font-bold text-[#183A72]">{index + 1}.</span>{step}</li>
            ))}
          </ol>
          {activeStep < 0 && <p className="mt-4 text-sm text-slate-500">اضغط على الخطوة الأولى لبدء البرهان.</p>}
        </aside>
      </div>
    </section>
  );
}
