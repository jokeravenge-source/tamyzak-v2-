import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Eye, EyeOff, Hand, Layers3, Lock } from "lucide-react";

type PointKey = "A" | "B" | "C" | "D" | "E";

type SegmentDefinition = {
  id: "intersection" | "constructed" | "given" | "gap";
  from: PointKey;
  to: PointKey;
  color: string;
  dashed?: boolean;
};

type SceneVisibility = {
  planes: { X: boolean; Y: boolean };
  segments: Record<string, boolean>;
};

type GeometryState = {
  points: Record<PointKey, THREE.Vector3>;
  distanceDE: number;
};

const THEOREM = "إذا تعامد مستويان فالمستقيم المرسوم من نقطة في أحدهما والعمودي على المستوى الآخر يكون محتوى فيه.";

const PROOF_STEPS = [
  "ليكن AB مستقيم تقاطع المستويين: X ∩ Y = AB.",
  "من النقطة C في المستوي Y نرسم CE داخل Y بحيث CE ⟂ AB.",
  "بما أن X ⟂ Y، فإن CE ⟂ X وفق نتيجة تعامد المستويين السابقة.",
  "ولدينا CD ⟂ X حسب المعطى.",
  "لا يمكن رسم أكثر من مستقيم واحد من النقطة C عمودياً على المستوي X؛ لذلك CD = CE. وبما أن CE ⊂ Y، إذن CD ⊂ Y، وهو المطلوب إثباته.",
] as const;

const SEGMENTS: readonly SegmentDefinition[] = [
  { id: "intersection", from: "A", to: "B", color: "#172554" },
  { id: "constructed", from: "C", to: "E", color: "#d97706" },
  { id: "given", from: "C", to: "D", color: "#16a34a" },
  { id: "gap", from: "E", to: "D", color: "#7c3aed", dashed: true },
];

const SEGMENT_LABELS: Record<SegmentDefinition["id"], string> = {
  intersection: "مستقيم التقاطع AB",
  constructed: "المستقيم المنشأ CE",
  given: "المستقيم المعطى CD",
  gap: "المسافة بين D وE",
};

const POINTS: readonly PointKey[] = ["A", "B", "C", "D", "E"];
const radians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * X is the fixed horizontal plane and Y rotates around AB.
 * CE stays inside Y and is perpendicular to AB. CD is always perpendicular to X.
 * At a 90° dihedral angle, D and E coincide, so CD and CE are the same line.
 */
function calculateGeometry(dihedral: number, pointOffset: number): GeometryState {
  const theta = radians(dihedral);
  const distanceFromIntersection = 1.8;
  const c = new THREE.Vector3(
    pointOffset,
    distanceFromIntersection * Math.sin(theta),
    distanceFromIntersection * Math.cos(theta),
  );
  const e = new THREE.Vector3(pointOffset, 0, 0);
  const d = new THREE.Vector3(pointOffset, 0, c.z);

  return {
    points: {
      A: new THREE.Vector3(-2.2, 0, 0),
      B: new THREE.Vector3(2.2, 0, 0),
      C: c,
      D: d,
      E: e,
    },
    distanceDE: d.distanceTo(e),
  };
}

function makeLabel(text: string, color: string, width = 256): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "rgba(255,255,255,0.95)";
  context.beginPath();
  context.roundRect(12, 24, width - 24, 80, 20);
  context.fill();
  context.fillStyle = color;
  context.font = "bold 54px Cairo, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, width / 2, 66, width - 36);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(width === 384 ? 0.95 : 0.63, 0.315, 1);
  sprite.renderOrder = 12;
  return sprite;
}

type SceneUpdate = (dihedral: number, pointOffset: number) => void;
type VisibilityUpdate = (visibility: SceneVisibility) => void;
type InteractionUpdate = (enabled: boolean) => void;

export default function PerpendicularLineContainmentVisualizer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const updateRef = useRef<SceneUpdate | null>(null);
  const visibilityRef = useRef<VisibilityUpdate | null>(null);
  const interactionRef = useRef<InteractionUpdate | null>(null);
  const [dihedral, setDihedral] = useState(90);
  const [pointOffset, setPointOffset] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [interactionEnabled, setInteractionEnabled] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [planeVisibility, setPlaneVisibility] = useState({ X: true, Y: true });
  const [segmentVisibility, setSegmentVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SEGMENTS.map((segment) => [segment.id, true])),
  );
  const sceneVisibility = useMemo<SceneVisibility>(
    () => ({ planes: planeVisibility, segments: segmentVisibility }),
    [planeVisibility, segmentVisibility],
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fcfbf5");
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
    camera.position.set(4.8, 3.8, 5.6);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.45, 0);
    controls.minDistance = 3;
    controls.maxDistance = 12;
    controls.update();
    const setInteraction: InteractionUpdate = (enabled) => {
      controls.enabled = enabled;
      renderer.domElement.style.pointerEvents = enabled ? "auto" : "none";
      controls.update();
    };
    interactionRef.current = setInteraction;
    setInteraction(interactionEnabled);

    // Plane X is fixed. Plane Y is hinged along AB and follows the angle slider.
    const planeX = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 3.6),
      new THREE.MeshBasicMaterial({ color: "#bfdbfe", side: THREE.DoubleSide, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    planeX.rotation.x = -Math.PI / 2;
    scene.add(planeX);
    const xBorder = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.2, 0, -1.8), new THREE.Vector3(2.2, 0, -1.8),
        new THREE.Vector3(2.2, 0, 1.8), new THREE.Vector3(-2.2, 0, 1.8),
      ]),
      new THREE.LineBasicMaterial({ color: "#2563eb", depthTest: false }),
    );
    xBorder.renderOrder = 4;
    scene.add(xBorder);

    const hingedPlaneY = new THREE.Group();
    const planeY = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 2.6),
      new THREE.MeshBasicMaterial({ color: "#fecaca", side: THREE.DoubleSide, transparent: true, opacity: 0.18, depthWrite: false }),
    );
    planeY.position.y = 1.3;
    hingedPlaneY.add(planeY);
    const yBorder = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.2, 0, 0), new THREE.Vector3(2.2, 0, 0),
        new THREE.Vector3(2.2, 2.6, 0), new THREE.Vector3(-2.2, 2.6, 0),
      ]),
      new THREE.LineBasicMaterial({ color: "#ef4444", depthTest: false }),
    );
    yBorder.renderOrder = 5;
    hingedPlaneY.add(yBorder);
    scene.add(hingedPlaneY);

    const lineObjects = SEGMENTS.map((segment) => {
      const material = segment.dashed
        ? new THREE.LineDashedMaterial({ color: segment.color, dashSize: 0.13, gapSize: 0.08, depthTest: false })
        : new THREE.LineBasicMaterial({ color: segment.color, depthTest: false });
      const line = new THREE.Line(new THREE.BufferGeometry(), material);
      line.renderOrder = 8;
      scene.add(line);
      return { segment, line };
    });

    const angleMark = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: "#dc2626", depthTest: false }),
    );
    angleMark.renderOrder = 9;
    scene.add(angleMark);

    const dots = new Map<PointKey, THREE.Mesh>();
    const labels = new Map<PointKey, THREE.Sprite>();
    for (const key of POINTS) {
      const color = key === "C" ? "#166534" : key === "D" ? "#16a34a" : key === "E" ? "#d97706" : "#172554";
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 12, 8),
        new THREE.MeshBasicMaterial({ color, depthTest: false }),
      );
      dot.renderOrder = 10;
      scene.add(dot);
      dots.set(key, dot);
      const label = makeLabel(key, color);
      scene.add(label);
      labels.set(key, label);
    }
    const coincidentLabel = makeLabel("D ≡ E", "#183A72", 384);
    scene.add(coincidentLabel);
    const xLabel = makeLabel("X", "#2563eb");
    const yLabel = makeLabel("Y", "#dc2626");
    scene.add(xLabel, yLabel);

    let latestAngle = dihedral;
    let latestVisibility = sceneVisibility;
    const updatePointVisibility = () => {
      const coincident = latestAngle === 90;
      for (const point of POINTS) {
        const usedByVisibleSegment = SEGMENTS.some((segment) =>
          (segment.from === point || segment.to === point) && latestVisibility.segments[segment.id] !== false,
        );
        dots.get(point)!.visible = usedByVisibleSegment;
        labels.get(point)!.visible = usedByVisibleSegment;
      }
      if (coincident) {
        dots.get("E")!.visible = false;
        labels.get("D")!.visible = false;
        labels.get("E")!.visible = false;
        coincidentLabel.visible = latestVisibility.segments.given !== false || latestVisibility.segments.constructed !== false;
      } else {
        coincidentLabel.visible = false;
      }
    };

    const applyVisibility: VisibilityUpdate = (visibility) => {
      latestVisibility = visibility;
      planeX.visible = visibility.planes.X;
      xBorder.visible = visibility.planes.X;
      xLabel.visible = visibility.planes.X;
      hingedPlaneY.visible = visibility.planes.Y;
      yLabel.visible = visibility.planes.Y;
      angleMark.visible = visibility.planes.X && visibility.planes.Y;
      for (const { segment, line } of lineObjects) line.visible = visibility.segments[segment.id] !== false;
      updatePointVisibility();
    };
    visibilityRef.current = applyVisibility;

    const update: SceneUpdate = (angle, offset) => {
      latestAngle = angle;
      const geometry = calculateGeometry(angle, offset);
      for (const { segment, line } of lineObjects) {
        line.geometry.dispose();
        line.geometry = new THREE.BufferGeometry().setFromPoints([
          geometry.points[segment.from],
          geometry.points[segment.to],
        ]);
        if (segment.dashed) line.computeLineDistances();
      }

      for (const key of POINTS) {
        const point = geometry.points[key];
        dots.get(key)!.position.copy(point);
        const labelOffset = key === "B"
          ? new THREE.Vector3(0.25, 0.2, 0)
          : key === "C"
            ? new THREE.Vector3(-0.22, 0.22, 0)
            : key === "D"
              ? new THREE.Vector3(0.23, 0.18, 0.16)
              : key === "E"
                ? new THREE.Vector3(-0.25, 0.18, -0.12)
                : new THREE.Vector3(-0.18, 0.2, 0);
        labels.get(key)!.position.copy(point).add(labelOffset);
      }
      coincidentLabel.position.copy(geometry.points.D).add(new THREE.Vector3(0, 0.25, -0.24));

      const theta = radians(angle);
      hingedPlaneY.rotation.x = Math.PI / 2 - theta;
      yLabel.position.set(-1.65, 2.34 * Math.sin(theta) + 0.14, 2.34 * Math.cos(theta));
      xLabel.position.set(1.65, 0.16, -1.25);
      const arc = Array.from({ length: 41 }, (_, index) => {
        const current = (theta * index) / 40;
        return new THREE.Vector3(1.55, 0.48 * Math.sin(current), 0.48 * Math.cos(current));
      });
      angleMark.geometry.dispose();
      angleMark.geometry = new THREE.BufferGeometry().setFromPoints(arc);
      updatePointVisibility();
    };
    updateRef.current = update;
    update(dihedral, pointOffset);
    applyVisibility(sceneVisibility);

    const resize = (width: number, height: number) => {
      if (width < 2 || height < 2) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(Math.round(width), Math.round(height), false);
    };
    const observer = new ResizeObserver(([entry]) => {
      if (entry) resize(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(mount);
    const initialRect = mount.getBoundingClientRect();
    resize(initialRect.width, initialRect.height);
    const handleWindowResize = () => {
      const rect = mount.getBoundingClientRect();
      resize(rect.width, rect.height);
    };
    window.addEventListener("resize", handleWindowResize);

    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    };
    render();

    return () => {
      updateRef.current = null;
      visibilityRef.current = null;
      interactionRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", handleWindowResize);
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
    // The scene objects are built once; state changes update coordinates and visibility through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { updateRef.current?.(dihedral, pointOffset); }, [dihedral, pointOffset]);
  useEffect(() => { visibilityRef.current?.(sceneVisibility); }, [sceneVisibility]);
  useEffect(() => { interactionRef.current?.(interactionEnabled); }, [interactionEnabled]);

  const geometry = calculateGeometry(dihedral, pointOffset);
  const linePlaneAngle = Math.abs(90 - dihedral);
  const perpendicularPlanes = dihedral === 90;
  const chooseStep = (index: number) => {
    setActiveStep(index);
    if (index >= 2) setDihedral(90);
  };
  const setAllVisible = (visible: boolean) => {
    setPlaneVisibility({ X: visible, Y: visible });
    setSegmentVisibility(Object.fromEntries(SEGMENTS.map((segment) => [segment.id, visible])));
  };

  return (
    <section dir="rtl" className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:p-6" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-amber-600">نتيجة 7</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#183A72] sm:text-2xl">احتواء العمود في المستوي</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#183A72]">هندسة مجسمة</span>
      </div>
      <p className="mt-3 text-sm leading-8 sm:text-base">{THEOREM}</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,1fr)]">
        <div>
          <div className="relative">
            <div
              ref={mountRef}
              role="img"
              aria-label="المستوي X والمستوي Y متقاطعان في AB، ومن C رُسم CD عمودياً على X وCE داخل Y"
              className={`h-[340px] w-full overflow-hidden rounded-2xl border border-blue-100 bg-[#fcfbf5] sm:h-[440px] ${interactionEnabled ? "touch-none" : "touch-pan-y"}`}
            />

            <div className="absolute left-3 top-3 z-20 flex gap-2" dir="rtl">
              <button
                type="button"
                onClick={() => setInteractionEnabled((enabled) => !enabled)}
                aria-pressed={interactionEnabled}
                title={interactionEnabled ? "قفل تحريك المجسم" : "تفعيل تحريك المجسم"}
                className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-xs font-bold shadow-md backdrop-blur transition ${interactionEnabled ? "border-[#183A72] bg-[#183A72] text-white" : "border-slate-200 bg-white/95 text-slate-700 hover:bg-slate-50"}`}
              >
                {interactionEnabled ? <Lock className="h-4 w-4" /> : <Hand className="h-4 w-4" />}
                <span className="hidden sm:inline">{interactionEnabled ? "قفل العرض" : "حرّك المجسم"}</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibilityOpen((open) => !open)}
                aria-expanded={visibilityOpen}
                title="إظهار وإخفاء المستويات والمستقيمات"
                className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-xs font-bold shadow-md backdrop-blur transition ${visibilityOpen ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white/95 text-slate-700 hover:bg-slate-50"}`}
              >
                <Layers3 className="h-4 w-4" />
                <span className="hidden sm:inline">العناصر</span>
              </button>
            </div>

            {visibilityOpen && (
              <div className="absolute left-3 top-16 z-20 w-64 max-w-[calc(100%-1.5rem)] rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur" dir="rtl">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <strong className="text-sm text-[#183A72]">إظهار وإخفاء العناصر</strong>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setAllVisible(true)} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold hover:bg-slate-200">الكل</button>
                    <button type="button" onClick={() => setAllVisible(false)} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold hover:bg-slate-200">إخفاء</button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {(["X", "Y"] as const).map((plane) => {
                    const visible = planeVisibility[plane];
                    return (
                      <button
                        key={plane}
                        type="button"
                        onClick={() => setPlaneVisibility((current) => ({ ...current, [plane]: !current[plane] }))}
                        aria-pressed={visible}
                        className="flex min-h-10 w-full items-center justify-between rounded-xl px-2.5 text-sm hover:bg-slate-100"
                      >
                        <span>المستوي {plane}</span>
                        {visible ? <Eye className="h-4 w-4 text-blue-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                      </button>
                    );
                  })}
                  <div className="my-2 border-t border-slate-200" />
                  {SEGMENTS.map((segment) => {
                    const visible = segmentVisibility[segment.id] !== false;
                    return (
                      <button
                        key={segment.id}
                        type="button"
                        onClick={() => setSegmentVisibility((current) => ({ ...current, [segment.id]: !visible }))}
                        aria-pressed={visible}
                        className="flex min-h-10 w-full items-center justify-between rounded-xl px-2.5 text-sm hover:bg-slate-100"
                      >
                        <span className="flex items-center gap-2">
                          <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                          {SEGMENT_LABELS[segment.id]}
                        </span>
                        {visible ? <Eye className="h-4 w-4 text-blue-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={`pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur transition ${interactionEnabled ? "bg-[#183A72]/90 text-white" : "bg-white/90 text-slate-600"}`}>
              {interactionEnabled ? "اسحب للتدوير • قرّب بإصبعين" : "اضغط زر اليد لتحريك المجسم"}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
            <span className="text-blue-600">▰ المستوي X</span>
            <span className="text-red-600">▰ المستوي Y</span>
            <span className="text-green-700">━ CD ⟂ X</span>
            <span className="text-amber-700">━ CE ⊂ Y</span>
            <span className="text-violet-700">┄ المسافة DE</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">غيّر زاوية المستويين: عند 90° تتطابق النقطتان D وE، فيصبح CD هو نفسه CE داخل Y.</p>

          <div className="mt-4 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              <span className="flex justify-between gap-2"><span>الزاوية بين X وY</span><b dir="ltr">{dihedral}°</b></span>
              <input
                type="range"
                min={20}
                max={160}
                step={1}
                value={dihedral}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setDihedral(next);
                  if (next !== 90) setActiveStep((step) => Math.min(step, 1));
                }}
                className="mt-3 w-full accent-[#183A72]"
                aria-label="الزاوية بين المستويين X وY"
              />
            </label>
            <label className="block text-sm font-semibold">
              <span className="flex justify-between gap-2"><span>موضع النقطة C على امتداد AB</span><b dir="ltr">{pointOffset.toFixed(1)}</b></span>
              <input
                type="range"
                min={-1.3}
                max={1.3}
                step={0.1}
                value={pointOffset}
                onChange={(event) => setPointOffset(Number(event.target.value))}
                className="mt-3 w-full accent-amber-600"
                aria-label="تحريك موضع النقطة C داخل المستوي Y"
              />
            </label>
          </div>

          <div aria-live="polite" className={`mt-4 rounded-2xl border p-4 ${perpendicularPlanes ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <p className="text-sm">
              زاوية CD مع المستوي Y = <strong dir="ltr">{linePlaneAngle.toFixed(1)}°</strong>
              <span className="mx-2">•</span>
              المسافة بين D وE = <strong dir="ltr">{geometry.distanceDE.toFixed(2)}</strong>
            </p>
            <p className="mt-2 text-sm font-bold">
              {perpendicularPlanes
                ? "✓ X ⟂ Y: تتطابق D مع E، لذلك CD = CE ويقع CD بالكامل داخل المستوي Y."
                : "✕ الفرض X ⟂ Y غير متحقق: تنفصل D عن E ويخرج CD من المستوي Y، فتفشل النتيجة."}
            </p>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-bold text-[#183A72]">خطوات البرهان</h3>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="اختيار خطوة البرهان">
            {PROOF_STEPS.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => chooseStep(index)}
                aria-pressed={activeStep === index}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183A72] ${activeStep === index ? "bg-[#183A72] text-white" : "bg-slate-100 hover:bg-slate-200"}`}
              >
                {index === PROOF_STEPS.length - 1 ? "النتيجة" : `الخطوة ${index + 1}`}
              </button>
            ))}
          </div>
          <ol className="mt-4 space-y-3" aria-live="polite">
            {PROOF_STEPS.slice(0, activeStep + 1).map((step, index) => (
              <li key={index} className="rounded-xl bg-slate-50 p-3 text-sm leading-7">
                <span className="ms-2 font-bold text-[#183A72]">{index + 1}.</span>{step}
              </li>
            ))}
          </ol>
          {activeStep < 0 && <p className="mt-4 text-sm text-slate-500">اضغط على الخطوة الأولى لبدء البرهان.</p>}
        </aside>
      </div>
    </section>
  );
}
