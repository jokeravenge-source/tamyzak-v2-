import { TRIP_ORIGIN, TRIP_VIRTUAL_SPEED_KMH } from "./config";
import { getCountry } from "./countries";
import { geodesicKm, isValidCoord, tripDurationSeconds } from "./geo";

export type JourneyStatus = "in_flight" | "arrived";

export interface Journey {
  id: string;
  studentId: string;
  originLat: number;
  originLng: number;
  destCountryCode: string;
  destCountryName: string;
  destCity: string;
  destLat: number;
  destLng: number;
  distanceKm: number;
  speedKmh: number;
  durationSec: number;
  startedAt: number; // epoch ms
  arrivalAt: number; // epoch ms
  status: JourneyStatus;
  arrivalSeenAt: number | null;
  /** Set while the student is resting at a station; the clock is frozen. */
  pausedAt?: number | null;
  /** Total time already spent at stations (ms). arrivalAt includes it. */
  pausedMs?: number;
}

/** Timestamp-derived state. Timestamps are the single source of truth. */
export function journeyState(j: Journey, now: number) {
  const paused = j.pausedAt != null;
  const eff = paused ? j.pausedAt! : now;
  const pausedMs = j.pausedMs ?? 0;
  const total = Math.max(0, j.arrivalAt - j.startedAt - pausedMs);
  const remainingMs = Math.max(0, j.arrivalAt - eff);
  const progress = total === 0 ? 1 : Math.min(1, Math.max(0, (eff - j.startedAt - pausedMs) / total));
  return { remainingSec: remainingMs / 1000, progress, arrived: remainingMs === 0, paused };
}

export function planTrip(countryCode: string, speedKmh = TRIP_VIRTUAL_SPEED_KMH) {
  const c = getCountry(countryCode);
  if (!c) return { ok: false as const, error: "unknown_country" };
  if (!isValidCoord(c)) return { ok: false as const, error: "invalid_coords" };
  const distanceKm = geodesicKm(TRIP_ORIGIN, c);
  const durationSec = tripDurationSeconds(distanceKm, speedKmh);
  if (!Number.isFinite(distanceKm) || !Number.isFinite(durationSec)) return { ok: false as const, error: "invalid" };
  if (distanceKm < 1) return { ok: false as const, error: "same_place", country: c };
  return { ok: true as const, country: c, distanceKm, durationSec, speedKmh };
}

/**
 * Storage contract. The default implementation persists to this browser
 * only. To get cross-device persistence, implement this interface against
 * your backend (scoped to the authenticated student) and pass it to TripApp.
 */
export interface JourneyRepository {
  list(studentId: string): Promise<Journey[]>;
  /** Must refuse to create a second in-flight journey; returns the active one instead. */
  create(studentId: string, countryCode: string, now?: number): Promise<{ journey: Journey; created: boolean }>;
  markArrivalSeen(studentId: string, id: string, now?: number): Promise<void>;
  /** Stop at a station: freeze the in-flight clock. */
  pause(studentId: string, id: string, now?: number): Promise<void>;
  /** Leave the station: continue, pushing arrival back by the break length. */
  resume(studentId: string, id: string, now?: number): Promise<void>;
}

const KEY = "tamayzak.trip.journeys.v1";

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `j_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function createLocalRepository(storage: Pick<Storage, "getItem" | "setItem"> = localStorage): JourneyRepository {
  const readAll = (): Journey[] => {
    try {
      const v = JSON.parse(storage.getItem(KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  const writeAll = (all: Journey[]) => storage.setItem(KEY, JSON.stringify(all));
  /** Resolve expired journeys to ARRIVED even if no tab was open at arrival. */
  const resolve = (all: Journey[], now: number) => {
    let changed = false;
    for (const j of all) {
      if (j.status === "in_flight" && j.pausedAt == null && now >= j.arrivalAt) {
        j.status = "arrived";
        changed = true;
      }
    }
    if (changed) writeAll(all);
    return all;
  };

  return {
    async list(studentId) {
      return resolve(readAll(), Date.now())
        .filter((j) => j.studentId === studentId)
        .sort((a, b) => b.startedAt - a.startedAt);
    },
    async create(studentId, countryCode, now = Date.now()) {
      const all = resolve(readAll(), now);
      const active = all.find((j) => j.studentId === studentId && j.status === "in_flight");
      if (active) return { journey: active, created: false };
      const plan = planTrip(countryCode);
      if (!plan.ok) throw new Error(plan.error);
      const durationMs = Math.round(plan.durationSec * 1000);
      const journey: Journey = {
        id: uid(),
        studentId,
        originLat: TRIP_ORIGIN.lat,
        originLng: TRIP_ORIGIN.lng,
        destCountryCode: plan.country.alpha2,
        destCountryName: plan.country.name,
        destCity: plan.country.capital,
        destLat: plan.country.lat,
        destLng: plan.country.lng,
        distanceKm: plan.distanceKm,
        speedKmh: plan.speedKmh,
        durationSec: plan.durationSec,
        startedAt: now,
        arrivalAt: now + durationMs,
        status: "in_flight",
        arrivalSeenAt: null,
        pausedAt: null,
        pausedMs: 0,
      };
      all.push(journey);
      writeAll(all);
      return { journey, created: true };
    },
    async markArrivalSeen(studentId, id, now = Date.now()) {
      const all = readAll();
      const j = all.find((x) => x.id === id && x.studentId === studentId);
      if (j && !j.arrivalSeenAt) {
        j.arrivalSeenAt = now;
        if (now >= j.arrivalAt) j.status = "arrived";
        writeAll(all);
      }
    },
    async pause(studentId, id, now = Date.now()) {
      const all = resolve(readAll(), now);
      const j = all.find((x) => x.id === id && x.studentId === studentId);
      if (j && j.status === "in_flight" && j.pausedAt == null) {
        j.pausedAt = now;
        writeAll(all);
      }
    },
    async resume(studentId, id, now = Date.now()) {
      const all = readAll();
      const j = all.find((x) => x.id === id && x.studentId === studentId);
      if (j && j.pausedAt != null) {
        const rest = Math.max(0, now - j.pausedAt);
        j.arrivalAt += rest;
        j.pausedMs = (j.pausedMs ?? 0) + rest;
        j.pausedAt = null;
        writeAll(all);
      }
    },
  };
}
