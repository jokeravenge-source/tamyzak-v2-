import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Eye, EyeOff, Hand, Layers3, Lock, Rotate3D } from "lucide-react";

type PointKey = "A" | "B";
type PlaneKey = "X" | "Y" | "Z";
type LineKey = "AB" | "XZ" | "YZ";

type SceneVisibility = {
  planes: Record<PlaneKey, boolean>;
  lines: Record<LineKey, boolean>;
};

type GeometryState = {
  points: Record<PointKey, THREE.Vector3>;
  intersectionAxis: THREE.Vector3;
  planeXAxis: THREE.Vector3;
  planeYAxis: THREE.Vector3;
  planeX: THREE.Vector3[];
  planeY: THREE.Vector3[];
  footprintX: THREE.Vector3;
  footprintY: THREE.Vector3;
  planeXAngle: number;
  planeYAngle: number;
  linePlaneAngle: number;
};

const THEOREM = "إذا كان كل من مستويين متقاطعين عمودياً على مستوى ثالث فإن مستقيم تقاطعهما يكون عمودياً على المستوى الثالث.";

const PROOF_STEPS = [
  "ليكن X وY مستويين متقاطعين، وليكن AB = X ∩ Y مستقيم تقاطعهما.",
  "حسب المعطى: X ⟂ Z وY ⟂ Z.",
  "نفترض عكس المطلوب، أي إن AB غير عمودي على المستوى Z.",
  "بحسب المبرهنة 9، يمر بالمستقيم AB غير العمودي على Z مستوى واحد فقط عمودي على Z.",
  "لكن المستويين المختلفين X وY كلاهما يحتوي AB وكلاهما عمودي على Z؛ وهذا يناقض الوحدانية.",
  "إذن الفرض غير صحيح، ولذلك AB ⟂ Z، وهو المطلوب إثباته.",
] as const;

const radians = (degrees: number) => (degrees * Math.PI) / 180;

function rectanglePoints(
  center: THREE.Vector3,
  firstAxis: THREE.Vector3,
  secondAxis: THREE.Vector3,
  firstHalf: number,
  secondHalf: number,
) {
  return [
    center.clone().addScaledVector(firstAxis, -firstHalf).addScaledVector(secondAxis, -secondHalf),
    center.clone().addScaledVector(firstAxis, firstHalf).addScaledVector(secondAxis, -secondHalf),
    center.clone().addScaledVector(firstAxis, firstHalf).addScaledVector(secondAxis, secondHalf),
    center.clone().addScaledVector(firstAxis, -firstHalf).addScaledVector(secondAxis, secondHalf),
  ];
}

function planeGeometry(points: THREE.Vector3[]) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [points[0], points[1], points[2], points[0], points[2], points[3]]
    .flatMap((point) => [point.x, point.y, point.z]);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function borderGeometry(points: THREE.Vector3[]) {
  return new THREE.BufferGeometry().setFromPoints([...points, points[0]]);
}

/**
 * X is kept perpendicular to the horizontal plane Z and contains AB.
 * Y is a different plane through AB. When AB tilts away from the normal to Z,
 * Y can no longer remain perpendicular, which exposes the contradiction.
 */
function calculateGeometry(lineTilt: number, planeSeparation: number): GeometryState {
  const vertical = new THREE.Vector3(0, 1, 0);
  const tilt = radians(lineTilt);
  const intersectionAxis = new THREE.Vector3(Math.sin(tilt), Math.cos(tilt), 0).normalize();
  const B = new THREE.Vector3(0, 0, 0);
  const A = B.clone().addScaledVector(intersectionAxis, 2.2);
  const planeXAxis = new THREE.Vector3(Math.cos(tilt), -Math.sin(tilt), 0).normalize();
  const planeYAxis = planeXAxis.clone().applyAxisAngle(intersectionAxis, radians(planeSeparation)).normalize();
  const center = B.clone().addScaledVector(intersectionAxis, 1.1);
  const planeX = rectanglePoints(center, intersectionAxis, planeXAxis, 1.45, 2.1);
  const planeY = rectanglePoints(center, intersectionAxis, planeYAxis, 1.45, 2.1);

  const normalX = intersectionAxis.clone().cross(planeXAxis).normalize();
  const normalY = intersectionAxis.clone().cross(planeYAxis).normalize();
  const planeXAngle = Math.acos(THREE.MathUtils.clamp(Math.abs(normalX.dot(vertical)), 0, 1)) * 180 / Math.PI;
  const planeYAngle = Math.acos(THREE.MathUtils.clamp(Math.abs(normalY.dot(vertical)), 0, 1)) * 180 / Math.PI;
  const linePlaneAngle = Math.asin(THREE.MathUtils.clamp(Math.abs(intersectionAxis.dot(vertical)), 0, 1)) * 180 / Math.PI;
  const footprintX = vertical.clone().cross(normalX).normalize();
  const footprintY = vertical.clone().cross(normalY).normalize();

  return {
    points: { A, B },
    intersectionAxis,
    planeXAxis,
    planeYAxis,
    planeX,
    planeY,
    footprintX,
    footprintY,
    planeXAngle,
    planeYAngle,
    linePlaneAngle,
  };
}

function makeLabel(text: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "rgba(255,255,255,0.95)";
  context.beginPath();
  context.roundRect(12, 24, 232, 80, 20);
  context.fill();
  context.fillStyle = color;
  context.font = "bold 56px Cairo, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 66, 218);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(0.63, 0.315, 1);
  sprite.renderOrder = 15;
  return sprite;
}

type SceneUpdate = (lineTilt: number, planeSeparation: number) => void;
type VisibilityUpdate = (visibility: SceneVisibility) => void;
type InteractionUpdate = (enabled: boolean) => void;

export default function IntersectionPerpendicularResultVisualizer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const updateRef = useRef<SceneUpdate | null>(null);
  const visibilityRef = useRef<VisibilityUpdate | null>(null);
  const interactionRef = useRef<InteractionUpdate | null>(null);
  const [lineTilt, setLineTilt] = useState(0);
  const [planeSeparation, setPlaneSeparation] = useState(65);
  const [activeStep, setActiveStep] = useState(-1);
  const [interactionEnabled, setInteractionEnabled] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [sceneError, setSceneError] = useState(false);
  const [planeVisibility, setPlaneVisibility] = useState<Record<PlaneKey, boolean>>({ X: true, Y: true, Z: true });
  const [lineVisibility, setLineVisibility] = useState<Record<LineKey, boolean>>({ AB: true, XZ: true, YZ: true });
  const sceneVisibility = useMemo<SceneVisibility>(
    () => ({ planes: planeVisibility, lines: lineVisibility }),
    [planeVisibility, lineVisibility],
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fcfbf5");
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
    camera.position.set(4.8, 3.7, 5.8);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setSceneError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.8, 0);
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

    const planeZPoints = [
      new THREE.Vector3(-2.8, 0, -2.2),
      new THREE.Vector3(2.8, 0, -2.2),
      new THREE.Vector3(2.8, 0, 2.2),
      new THREE.Vector3(-2.8, 0, 2.2),
    ];
    const planeZ = new THREE.Mesh(
      planeGeometry(planeZPoints),
      new THREE.MeshBasicMaterial({ color: "#bfdbfe", side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false }),
    );
    const zBorder = new THREE.Line(
      borderGeometry(planeZPoints),
      new THREE.LineBasicMaterial({ color: "#2563eb", depthTest: false }),
    );
    planeZ.renderOrder = 1;
    zBorder.renderOrder = 5;
    scene.add(planeZ, zBorder);

    let latestGeometry = calculateGeometry(lineTilt, planeSeparation);
    const planeX = new THREE.Mesh(
      planeGeometry(latestGeometry.planeX),
      new THREE.MeshBasicMaterial({ color: "#ef4444", side: THREE.DoubleSide, transparent: true, opacity: 0.2, depthWrite: false }),
    );
    const xBorder = new THREE.Line(
      borderGeometry(latestGeometry.planeX),
      new THREE.LineBasicMaterial({ color: "#dc2626", depthTest: false }),
    );
    const planeYMaterial = new THREE.MeshBasicMaterial({ color: "#a78bfa", side: THREE.DoubleSide, transparent: true, opacity: 0.2, depthWrite: false });
    const yBorderMaterial = new THREE.LineBasicMaterial({ color: "#7c3aed", depthTest: false });
    const planeY = new THREE.Mesh(planeGeometry(latestGeometry.planeY), planeYMaterial);
    const yBorder = new THREE.Line(borderGeometry(latestGeometry.planeY), yBorderMaterial);
    planeX.renderOrder = 2;
    planeY.renderOrder = 3;
    xBorder.renderOrder = 6;
    yBorder.renderOrder = 7;
    scene.add(planeX, xBorder, planeY, yBorder);

    const abLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([latestGeometry.points.B, latestGeometry.points.A]),
      new THREE.LineBasicMaterial({ color: "#15803d", depthTest: false }),
    );
    const xzLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: "#dc2626", depthTest: false }));
    const yzLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: "#7c3aed", depthTest: false }));
    abLine.renderOrder = 10;
    xzLine.renderOrder = 9;
    yzLine.renderOrder = 9;
    scene.add(abLine, xzLine, yzLine);

    const rightAngle = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: "#15803d", depthTest: false }),
    );
    rightAngle.renderOrder = 11;
    scene.add(rightAngle);

    const dots = new Map<PointKey, THREE.Mesh>();
    const labels = new Map<PointKey, THREE.Sprite>();
    for (const point of ["A", "B"] as const) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 14, 10),
        new THREE.MeshBasicMaterial({ color: "#172554", depthTest: false }),
      );
      dot.renderOrder = 12;
      const label = makeLabel(point, "#172554");
      scene.add(dot, label);
      dots.set(point, dot);
      labels.set(point, label);
    }

    const xLabel = makeLabel("X", "#dc2626");
    const yLabel = makeLabel("Y", "#7c3aed");
    const zLabel = makeLabel("Z", "#2563eb");
    scene.add(xLabel, yLabel, zLabel);

    let latestVisibility = sceneVisibility;
    let theoremPasses = lineTilt === 0;
    const applyVisibility: VisibilityUpdate = (visibility) => {
      latestVisibility = visibility;
      planeX.visible = visibility.planes.X;
      xBorder.visible = visibility.planes.X;
      xLabel.visible = visibility.planes.X;
      planeY.visible = visibility.planes.Y;
      yBorder.visible = visibility.planes.Y;
      yLabel.visible = visibility.planes.Y;
      planeZ.visible = visibility.planes.Z;
      zBorder.visible = visibility.planes.Z;
      zLabel.visible = visibility.planes.Z;
      abLine.visible = visibility.lines.AB;
      xzLine.visible = visibility.lines.XZ;
      yzLine.visible = visibility.lines.YZ;
      rightAngle.visible = theoremPasses && visibility.lines.AB && visibility.planes.Z;
      dots.get("A")!.visible = visibility.lines.AB;
      labels.get("A")!.visible = visibility.lines.AB;
      dots.get("B")!.visible = visibility.lines.AB || visibility.lines.XZ || visibility.lines.YZ;
      labels.get("B")!.visible = visibility.lines.AB || visibility.lines.XZ || visibility.lines.YZ;
    };
    visibilityRef.current = applyVisibility;

    const replacePlane = (mesh: THREE.Mesh, border: THREE.Line, points: THREE.Vector3[]) => {
      mesh.geometry.dispose();
      mesh.geometry = planeGeometry(points);
      border.geometry.dispose();
      border.geometry = borderGeometry(points);
    };

    const update: SceneUpdate = (tiltValue, separationValue) => {
      latestGeometry = calculateGeometry(tiltValue, separationValue);
      theoremPasses = tiltValue === 0;
      replacePlane(planeX, xBorder, latestGeometry.planeX);
      replacePlane(planeY, yBorder, latestGeometry.planeY);

      abLine.geometry.dispose();
      abLine.geometry = new THREE.BufferGeometry().setFromPoints([latestGeometry.points.B, latestGeometry.points.A]);
      xzLine.geometry.dispose();
      xzLine.geometry = new THREE.BufferGeometry().setFromPoints([
        latestGeometry.points.B.clone().addScaledVector(latestGeometry.footprintX, -2.15),
        latestGeometry.points.B.clone().addScaledVector(latestGeometry.footprintX, 2.15),
      ]);
      yzLine.geometry.dispose();
      yzLine.geometry = new THREE.BufferGeometry().setFromPoints([
        latestGeometry.points.B.clone().addScaledVector(latestGeometry.footprintY, -2.15),
        latestGeometry.points.B.clone().addScaledVector(latestGeometry.footprintY, 2.15),
      ]);

      const b = latestGeometry.points.B;
      rightAngle.geometry.dispose();
      rightAngle.geometry = new THREE.BufferGeometry().setFromPoints([
        b.clone().addScaledVector(latestGeometry.intersectionAxis, 0.28),
        b.clone().addScaledVector(latestGeometry.intersectionAxis, 0.28).addScaledVector(latestGeometry.footprintX, 0.28),
        b.clone().addScaledVector(latestGeometry.footprintX, 0.28),
      ]);

      dots.get("A")!.position.copy(latestGeometry.points.A);
      dots.get("B")!.position.copy(latestGeometry.points.B);
      labels.get("A")!.position.copy(latestGeometry.points.A).add(new THREE.Vector3(0.18, 0.2, 0));
      labels.get("B")!.position.copy(latestGeometry.points.B).add(new THREE.Vector3(-0.18, 0.16, 0));
      xLabel.position.copy(latestGeometry.points.B)
        .addScaledVector(latestGeometry.planeXAxis, -1.7)
        .addScaledVector(latestGeometry.intersectionAxis, 1.75);
      yLabel.position.copy(latestGeometry.points.B)
        .addScaledVector(latestGeometry.planeYAxis, 1.7)
        .addScaledVector(latestGeometry.intersectionAxis, 1.75);
      zLabel.position.set(2.2, 0.12, -1.6);

      planeYMaterial.color.set(theoremPasses ? "#a78bfa" : "#f59e0b");
      yBorderMaterial.color.set(theoremPasses ? "#7c3aed" : "#d97706");
      applyVisibility(latestVisibility);
    };
    updateRef.current = update;
    update(lineTilt, planeSeparation);

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
    // Scene objects are created once; controls update them through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { updateRef.current?.(lineTilt, planeSeparation); }, [lineTilt, planeSeparation]);
  useEffect(() => { visibilityRef.current?.(sceneVisibility); }, [sceneVisibility]);
  useEffect(() => { interactionRef.current?.(interactionEnabled); }, [interactionEnabled]);

  const geometry = calculateGeometry(lineTilt, planeSeparation);
  const theoremConfirmed = lineTilt === 0;
  const chooseStep = (index: number) => {
    setActiveStep(index);
    if (index >= 2) setLineTilt(0);
  };
  const setAllVisible = (visible: boolean) => {
    setPlaneVisibility({ X: visible, Y: visible, Z: visible });
    setLineVisibility({ AB: visible, XZ: visible, YZ: visible });
  };

  return (
    <section dir="rtl" className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:p-6" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-amber-600">النتيجة 9</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#183A72] sm:text-2xl">عمود تقاطع مستويين</h2>
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
              aria-label="المستويان X وY متقاطعان في AB وكلاهما عمودي على المستوى Z، لذلك AB عمودي على Z"
              className={`h-[340px] w-full overflow-hidden rounded-2xl border border-blue-100 bg-[#fcfbf5] sm:h-[440px] ${interactionEnabled ? "touch-none" : "touch-pan-y"}`}
            />

            {sceneError && (
              <div className="absolute inset-0 grid place-items-center rounded-2xl bg-[#fcfbf5] p-6 text-center">
                <div>
                  <Rotate3D className="mx-auto h-10 w-10 text-[#183A72]" />
                  <p className="mt-3 font-bold text-[#183A72]">تعذّر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز.</p>
                  <p className="mt-1 text-sm text-slate-500">جرّب تفعيل تسريع الرسوميات في المتصفح أو افتح الصفحة من جهاز آخر.</p>
                </div>
              </div>
            )}

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
                  {(["X", "Y", "Z"] as const).map((plane) => {
                    const visible = planeVisibility[plane];
                    return (
                      <button
                        key={plane}
                        type="button"
                        onClick={() => setPlaneVisibility((current) => ({ ...current, [plane]: !current[plane] }))}
                        aria-pressed={visible}
                        className="flex min-h-10 w-full items-center justify-between rounded-xl px-2.5 text-sm hover:bg-slate-100"
                      >
                        <span>المستوى {plane}</span>
                        {visible ? <Eye className="h-4 w-4 text-blue-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                      </button>
                    );
                  })}
                  <div className="my-2 border-t border-slate-200" />
                  {(["AB", "XZ", "YZ"] as const).map((line) => {
                    const visible = lineVisibility[line];
                    const label = line === "AB" ? "المستقيم AB" : line === "XZ" ? "أثر X على Z" : "أثر Y على Z";
                    return (
                      <button
                        key={line}
                        type="button"
                        onClick={() => setLineVisibility((current) => ({ ...current, [line]: !current[line] }))}
                        aria-pressed={visible}
                        className="flex min-h-10 w-full items-center justify-between rounded-xl px-2.5 text-sm hover:bg-slate-100"
                      >
                        <span>{label}</span>
                        {visible ? <Eye className="h-4 w-4 text-blue-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!sceneError && (
              <div className={`pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur transition ${interactionEnabled ? "bg-[#183A72]/90 text-white" : "bg-white/90 text-slate-600"}`}>
                {interactionEnabled ? "اسحب للتدوير • قرّب بإصبعين" : "اضغط زر اليد لتحريك المجسم"}
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
            <span className="text-red-600">▰ المستوى X</span>
            <span className="text-violet-700">▰ المستوى Y</span>
            <span className="text-blue-600">▰ المستوى Z</span>
            <span className="text-green-700">━ مستقيم التقاطع AB</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">أمل المستقيم AB بعيداً عن العمود. سيبقى X عمودياً على Z، لكن Y يفقد تعامده، فلا تتحقق فرضية النتيجة.</p>

          <div className="mt-4 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              <span className="flex justify-between gap-2"><span>ميل AB عن العمود</span><b dir="ltr">{lineTilt}°</b></span>
              <input
                type="range"
                min={0}
                max={55}
                step={1}
                value={lineTilt}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setLineTilt(next);
                  if (next !== 0) setActiveStep((step) => Math.min(step, 1));
                }}
                className="mt-3 w-full accent-[#183A72]"
                aria-label="ميل المستقيم AB عن العمود على Z"
              />
            </label>
            <label className="block text-sm font-semibold">
              <span className="flex justify-between gap-2"><span>الزاوية بين X وY حول AB</span><b dir="ltr">{planeSeparation}°</b></span>
              <input
                type="range"
                min={20}
                max={140}
                step={1}
                value={planeSeparation}
                onChange={(event) => setPlaneSeparation(Number(event.target.value))}
                className="mt-3 w-full accent-violet-600"
                aria-label="الزاوية بين المستويين X وY"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setLineTilt(0)}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#183A72] px-4 text-sm font-bold text-white transition hover:bg-[#102d5c]"
          >
            <Rotate3D className="h-4 w-4" />
            طبّق فرضية النتيجة
          </button>

          <div aria-live="polite" className={`mt-4 rounded-2xl border p-4 ${theoremConfirmed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>X مع Z = <strong dir="ltr">{geometry.planeXAngle.toFixed(1)}°</strong></span>
              <span>Y مع Z = <strong dir="ltr">{geometry.planeYAngle.toFixed(1)}°</strong></span>
              <span>AB مع Z = <strong dir="ltr">{geometry.linePlaneAngle.toFixed(1)}°</strong></span>
            </div>
            <p className="mt-2 text-sm font-bold">
              {theoremConfirmed
                ? "✓ X ⟂ Z وY ⟂ Z، لذلك مستقيم تقاطعهما AB ⟂ Z مهما تغيرت الزاوية بين X وY."
                : "✕ عند إمالة AB يبقى مستوى واحد فقط عمودياً على Z؛ لذلك لا يمكن أن يبقى X وY معاً عموديين على Z."}
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
