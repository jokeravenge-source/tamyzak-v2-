import { EARTH_RADIUS_KM } from "./config";

export interface LatLng {
  lat: number;
  lng: number;
}

export function isValidCoord(p: LatLng | null | undefined): p is LatLng {
  return (
    !!p &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    p.lat >= -90 &&
    p.lat <= 90 &&
    p.lng >= -180 &&
    p.lng <= 180
  );
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance (Haversine), km. Returns NaN for invalid input. */
export function haversineKm(a: LatLng, b: LatLng): number {
  if (!isValidCoord(a) || !isValidCoord(b)) return NaN;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Real surface distance on the WGS-84 ellipsoid (Vincenty inverse formula,
 * accurate to well under 1 m). Falls back to Haversine for the rare
 * near-antipodal pairs where Vincenty does not converge. km; NaN if invalid.
 */
export function geodesicKm(p1: LatLng, p2: LatLng): number {
  if (!isValidCoord(p1) || !isValidCoord(p2)) return NaN;
  const a = 6378137, f = 1 / 298.257223563, b = (1 - f) * a;
  const L = rad(p2.lng - p1.lng);
  const U1 = Math.atan((1 - f) * Math.tan(rad(p1.lat)));
  const U2 = Math.atan((1 - f) * Math.tan(rad(p2.lat)));
  const sU1 = Math.sin(U1), cU1 = Math.cos(U1), sU2 = Math.sin(U2), cU2 = Math.cos(U2);
  let λ = L, prev = 0, iter = 0;
  let sσ = 0, cσ = 0, σ = 0, cos2α = 0, cos2σm = 0;
  do {
    const sλ = Math.sin(λ), cλ = Math.cos(λ);
    sσ = Math.sqrt((cU2 * sλ) ** 2 + (cU1 * sU2 - sU1 * cU2 * cλ) ** 2);
    if (sσ === 0) return 0;
    cσ = sU1 * sU2 + cU1 * cU2 * cλ;
    σ = Math.atan2(sσ, cσ);
    const sα = (cU1 * cU2 * sλ) / sσ;
    cos2α = 1 - sα * sα;
    cos2σm = cos2α !== 0 ? cσ - (2 * sU1 * sU2) / cos2α : 0;
    const C = (f / 16) * cos2α * (4 + f * (4 - 3 * cos2α));
    prev = λ;
    λ = L + (1 - C) * f * sα * (σ + C * sσ * (cos2σm + C * cσ * (-1 + 2 * cos2σm * cos2σm)));
  } while (Math.abs(λ - prev) > 1e-12 && ++iter < 200);
  if (iter >= 200) return haversineKm(p1, p2);
  const u2 = (cos2α * (a * a - b * b)) / (b * b);
  const A = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
  const B = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
  const Δσ = B * sσ * (cos2σm + (B / 4) * (cσ * (-1 + 2 * cos2σm * cos2σm) - (B / 6) * cos2σm * (-3 + 4 * sσ * sσ) * (-3 + 4 * cos2σm * cos2σm)));
  return (b * A * (σ - Δσ)) / 1000;
}

/** tripDurationSeconds = (distanceKm / virtualSpeedKmh) * 3600 */
export function tripDurationSeconds(distanceKm: number, speedKmh: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return NaN;
  if (!Number.isFinite(speedKmh) || speedKmh <= 0) return NaN;
  return (distanceKm / speedKmh) * 3600;
}

type Vec = [number, number, number];
function toVec({ lat, lng }: LatLng): Vec {
  const φ = rad(lat), λ = rad(lng);
  return [Math.cos(φ) * Math.cos(λ), Math.cos(φ) * Math.sin(λ), Math.sin(φ)];
}
function toLatLng([x, y, z]: Vec): LatLng {
  return { lat: deg(Math.atan2(z, Math.hypot(x, y))), lng: deg(Math.atan2(y, x)) };
}

/** Point at fraction t (0..1) along the great circle from a to b. */
export function interpolateGreatCircle(a: LatLng, b: LatLng, t: number): LatLng {
  const va = toVec(a), vb = toVec(b);
  const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const ω = Math.acos(dot);
  if (ω < 1e-9) return a;
  const s = Math.sin(ω);
  const k1 = Math.sin((1 - t) * ω) / s, k2 = Math.sin(t * ω) / s;
  return toLatLng([k1 * va[0] + k2 * vb[0], k1 * va[1] + k2 * vb[1], k1 * va[2] + k2 * vb[2]]);
}

/**
 * Orthographic projection centred on `center`. Returns x/y in [-1,1]
 * (multiply by radius) and `visible` = on the front hemisphere.
 */
export function orthographic(p: LatLng, center: LatLng) {
  const φ = rad(p.lat), λ = rad(p.lng), φ0 = rad(center.lat), λ0 = rad(center.lng);
  const cosc = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ - λ0);
  return {
    x: Math.cos(φ) * Math.sin(λ - λ0),
    y: -(Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ - λ0)),
    visible: cosc >= 0,
  };
}

export function formatKm(km: number): string {
  if (!Number.isFinite(km)) return "—";
  return km.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Natural duration: "45 sec", "12 min 5 sec", "2 h 14 min". */
export function formatDuration(totalSeconds: number, lang: "en" | "ar" = "en"): string {
  if (!Number.isFinite(totalSeconds)) return "—";
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const u = lang === "ar" ? { h: "س", m: "د", s: "ث" } : { h: "h", m: "min", s: "sec" };
  if (h > 0) return `${h} ${u.h} ${m} ${u.m}`;
  if (m > 0) return sec ? `${m} ${u.m} ${sec} ${u.s}` : `${m} ${u.m}`;
  return `${sec} ${u.s}`;
}

/** Clock-style countdown: H:MM:SS or M:SS. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
