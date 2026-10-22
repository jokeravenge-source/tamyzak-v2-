import { useMemo } from "react";
import { TRIP_ORIGIN } from "./config";
import { COUNTRIES } from "./countries";
import { interpolateGreatCircle, isValidCoord, orthographic, type LatLng } from "./geo";

const S = 300, C = 150, R = 118;

export function PlaneIcon({ className, size = 26 }: { className?: string; size?: number }) {
  // Original cartoon plane, nose pointing right (+x).
  return (
    <g className={className}>
      <g transform={`scale(${size / 26}) translate(-13 -9)`}>
        <path d="M2 9c0-1.6 2-2.4 4-2.4h13c3 0 5 1.2 5 2.4s-2 2.4-5 2.4H6c-2 0-4-.8-4-2.4z" className="fill-trip-plane stroke-trip-ink" strokeWidth="1.4" />
        <path d="M10 7 7 1h3l6 6z" className="fill-trip-sun stroke-trip-ink" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M10 11 7 17h3l6-6z" className="fill-trip-sun stroke-trip-ink" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M2.5 8 1 4h2.2L5 7.4z" className="fill-trip-sun stroke-trip-ink" strokeWidth="1" strokeLinejoin="round" />
        <circle cx="17" cy="8.6" r="1" className="fill-trip-sky-deep" />
        <circle cx="20" cy="8.6" r="1" className="fill-trip-sky-deep" />
      </g>
    </g>
  );
}

function projectPath(points: LatLng[], center: LatLng, lift: (i: number) => number = () => 1) {
  let d = "";
  let pen = false;
  points.forEach((p, i) => {
    const q = orthographic(p, center);
    if (!q.visible) { pen = false; return; }
    const k = lift(i);
    const x = (C + R * k * q.x).toFixed(1), y = (C + R * k * q.y).toFixed(1);
    d += `${pen ? "L" : "M"}${x} ${y}`;
    pen = true;
  });
  return d;
}

export type GlobeMode = "idle" | "orbit" | "flight" | "landed";

export function Globe({ destination, progress = 0, mode = "idle", label }: {
  destination?: LatLng | null;
  progress?: number;
  mode?: GlobeMode;
  label: string;
}) {
  const dest = destination && isValidCoord(destination) ? destination : null;
  const destinationLat = dest?.lat ?? null;
  const destinationLng = dest?.lng ?? null;
  const center = useMemo<LatLng>(
    () => (destinationLat != null && destinationLng != null
      ? interpolateGreatCircle(TRIP_ORIGIN, { lat: destinationLat, lng: destinationLng }, 0.5)
      : { lat: 22, lng: TRIP_ORIGIN.lng }),
    [destinationLat, destinationLng],
  );

  const graticule = useMemo(() => {
    const lines: string[] = [];
    for (let lng = -180; lng < 180; lng += 30) {
      const pts: LatLng[] = [];
      for (let lat = -90; lat <= 90; lat += 5) pts.push({ lat, lng });
      lines.push(projectPath(pts, center));
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: LatLng[] = [];
      for (let lng = -180; lng <= 180; lng += 5) pts.push({ lat, lng });
      lines.push(projectPath(pts, center));
    }
    return lines;
  }, [center]);

  const dots = useMemo(
    () => COUNTRIES.map((c) => ({ c, q: orthographic(c, center) })).filter((d) => d.q.visible),
    [center],
  );

  const N = 60;
  const route = useMemo(() => {
    if (destinationLat == null || destinationLng == null) return null;
    const routeDestination = { lat: destinationLat, lng: destinationLng };
    const pts = Array.from({ length: N + 1 }, (_, i) => interpolateGreatCircle(TRIP_ORIGIN, routeDestination, i / N));
    const lift = (i: number) => 1 + 0.13 * Math.sin((Math.PI * i) / N);
    return { pts, lift, d: projectPath(pts, center, lift) };
  }, [destinationLat, destinationLng, center]);

  const at = (p: LatLng, k = 1) => {
    const q = orthographic(p, center);
    return { x: C + R * k * q.x, y: C + R * k * q.y, visible: q.visible };
  };
  const o = at(TRIP_ORIGIN);
  const t = at(dest ?? TRIP_ORIGIN);

  let plane: { x: number; y: number; angle: number } | null = null;
  if (route && (mode === "flight" || mode === "landed")) {
    const f = mode === "landed" ? 1 : Math.min(1, Math.max(0, progress));
    const i = f * N;
    const p = interpolateGreatCircle(TRIP_ORIGIN, dest!, f);
    const pn = interpolateGreatCircle(TRIP_ORIGIN, dest!, Math.min(1, f + 0.01));
    const pp = interpolateGreatCircle(TRIP_ORIGIN, dest!, Math.max(0, f - 0.01));
    const a = at(f >= 0.99 ? pp : p, route.lift(i)), b = at(f >= 0.99 ? p : pn, route.lift(i));
    const pos = at(p, route.lift(i));
    plane = { x: pos.x, y: pos.y, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
  }

  // Split the dotted route into flown (solid-ish) and remaining parts.
  const flownD = route && plane
    ? projectPath(route.pts.slice(0, Math.max(1, Math.round((mode === "landed" ? 1 : progress) * N)) + 1), center, route.lift)
    : "";

  return (
    <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label={label} className="h-full w-full overflow-visible">
      <defs>
        <radialGradient id="trip-ocean" cx="38%" cy="32%" r="75%">
          <stop offset="0%" className="[stop-color:var(--trip-ocean-light)]" />
          <stop offset="100%" className="[stop-color:var(--trip-ocean)]" />
        </radialGradient>
      </defs>

      {/* clouds */}
      <g className="trip-drift fill-trip-cloud">
        <path d="M18 70a12 12 0 0 1 22-6 10 10 0 0 1 16 8H18z" />
        <path d="M232 238a11 11 0 0 1 20-5 9 9 0 0 1 15 7h-35z" />
      </g>
      <g className="trip-drift-rev fill-trip-cloud">
        <path d="M236 48a9 9 0 0 1 17-4 8 8 0 0 1 12 6h-29z" />
      </g>
      {/* stars */}
      {[[40, 230], [262, 120], [70, 28], [278, 270], [20, 150]].map(([x, y], i) => (
        <path key={i} className="trip-twinkle fill-trip-sun" style={{ animationDelay: `${i * 0.6}s` }}
          d={`M${x} ${y! - 5}l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z`} />
      ))}

      <circle cx={C} cy={C + 6} r={R} className="fill-trip-ink/15" />
      <circle cx={C} cy={C} r={R} fill="url(#trip-ocean)" className="stroke-trip-ink" strokeWidth="3" />
      <g className="fill-none stroke-trip-cloud/40" strokeWidth="0.8">
        {graticule.map((d, i) => <path key={i} d={d} />)}
      </g>
      {/* every country's capital as a little island dot (real coordinates) */}
      <g className="fill-trip-land">
        {dots.map(({ c, q }) => (
          <circle key={c.alpha2} cx={C + R * q.x} cy={C + R * q.y} r={2.4} />
        ))}
      </g>
      <ellipse cx={C - 42} cy={C - 54} rx="30" ry="14" className="fill-trip-cloud/25" transform={`rotate(-30 ${C - 42} ${C - 54})`} />

      {route && (
        <>
          <path d={route.d} className="fill-none stroke-trip-cloud" strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round" />
          {flownD && <path d={flownD} className="fill-none stroke-trip-sun" strokeWidth="3.4" strokeDasharray="1 7" strokeLinecap="round" />}
        </>
      )}

      {/* origin */}
      {o.visible && (
        <g>
          <circle cx={o.x} cy={o.y} r="6" className="fill-trip-sun stroke-trip-ink" strokeWidth="2" />
          <text x={o.x} y={o.y + 18} textAnchor="middle" className="fill-trip-ink font-display text-[11px] font-bold">BGW</text>
        </g>
      )}
      {/* destination pin */}
      {dest && t.visible && (
        <g transform={`translate(${t.x} ${t.y})`} className={mode === "landed" ? "trip-pop" : ""}>
          <path d="M0 0c-6-8-9-11-9-15a9 9 0 0 1 18 0c0 4-3 7-9 15z" className="fill-trip-coral stroke-trip-ink" strokeWidth="2" />
          <circle cy="-15" r="3.2" className="fill-trip-cream" />
        </g>
      )}

      {plane && (
        <g transform={`translate(${plane.x} ${plane.y}) rotate(${plane.angle})`} className={mode === "landed" ? "trip-land" : "trip-bob"}>
          <PlaneIcon size={30} />
        </g>
      )}

      {(mode === "idle" || mode === "orbit") && (
        <g className={mode === "orbit" ? "trip-orbit" : "trip-orbit-slow"} style={{ transformOrigin: `${C}px ${C}px` }}>
          <path d={`M${C - 70} ${C - R - 6} A ${R + 18} ${R + 18} 0 0 1 ${C - 4} ${C - R - 18}`}
            className="fill-none stroke-trip-cloud" strokeWidth="2.5" strokeDasharray="1 6" strokeLinecap="round" />
          <g transform={`translate(${C} ${C - R - 18})`}>
            <PlaneIcon size={32} />
          </g>
        </g>
      )}
    </svg>
  );
}
