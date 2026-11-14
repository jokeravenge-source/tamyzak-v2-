import { TRIP_ORIGIN, TRIP_VIRTUAL_SPEED_KMH } from "./config";
import { getDestination } from "./destinations";
import { geodesicKm, isValidCoord, tripDurationSeconds } from "./geo";
import { currentFlightStage, flightItinerary, journeyDestinationKey, type FlightStage } from "./itinerary";
import type { CharacterTraits, Gender } from "@/components/CharacterAvatar";

export type FlightPassenger = { userId: string; displayName: string; gender: Gender | null; character: Partial<CharacterTraits> | null; status: "pending" | "accepted" | "declined"; seatNumber: number };
export type FlightInvitation = { flightId: string; hostName: string; city: string; cityAr?: string; arrivalAt: number };
export type FlightStudent = { userId: string; displayName: string; gender?: Gender | null; character?: Partial<CharacterTraits> | null };

export type JourneyStatus = "in_flight" | "arrived";

export interface Journey {
  id: string;
  studentId: string;
  originLat: number;
  originLng: number;
  destCountryCode: string;
  destCountryName: string;
  destCity: string;
  /** Optional on older saved capital-city journeys. */
  destinationId?: string;
  destCityAr?: string;
  destAirportCode?: string;
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
  itinerary?: FlightStage[];
  stopover?: { city: string; cityAr?: string; airportCode?: string; lat: number; lng: number };
  hostId?: string;
  passengers?: FlightPassenger[];
  visaSoldAt?: number | null;
  visaAwardedAt?: number | null;
  canSell?: boolean;
  legacy?: boolean;
  clockOffsetMs?: number;
}

/** Timestamp-derived state. Timestamps are the single source of truth. */
export function journeyState(j: Journey, now: number) {
  now += j.clockOffsetMs ?? 0;
  const paused = j.pausedAt != null;
  const eff = paused ? j.pausedAt! : now;
  const pausedMs = j.pausedMs ?? 0;
  const total = Math.max(0, j.arrivalAt - j.startedAt - pausedMs);
  const remainingMs = Math.max(0, j.arrivalAt - eff);
  const progress = total === 0 ? 1 : Math.min(1, Math.max(0, (eff - j.startedAt - pausedMs) / total));
  const elapsedSec = Math.max(0, (eff - j.startedAt - pausedMs) / 1000);
  let begins = 0, flownSec = 0, cruiseSec = 0;
  for (const stage of j.itinerary ?? []) {
    if (stage.kind === "cruise") { cruiseSec += stage.durationSec; flownSec += Math.min(stage.durationSec, Math.max(0, elapsedSec - begins)); }
    begins += stage.durationSec;
  }
  return { remainingSec: remainingMs / 1000, progress, arrived: remainingMs === 0, paused, elapsedSec,
    routeProgress: cruiseSec > 0 ? flownSec / cruiseSec : progress,
    stage: currentFlightStage(j.itinerary, elapsedSec) };
}

export function planTrip(destinationId: string, speedKmh = TRIP_VIRTUAL_SPEED_KMH) {
  const c = getDestination(destinationId);
  if (!c) return { ok: false as const, error: "unknown_country" };
  if (!isValidCoord(c)) return { ok: false as const, error: "invalid_coords" };
  const distanceKm = geodesicKm(TRIP_ORIGIN, c);
  const schedule = flightItinerary(c);
  const durationSec = speedKmh === TRIP_VIRTUAL_SPEED_KMH ? schedule.durationSec : tripDurationSeconds(distanceKm, speedKmh);
  if (!Number.isFinite(distanceKm) || !Number.isFinite(durationSec)) return { ok: false as const, error: "invalid" };
  if (distanceKm < 1) return { ok: false as const, error: "same_place", country: c.country };
  return { ok: true as const, country: c.country, destination: c, distanceKm: speedKmh === TRIP_VIRTUAL_SPEED_KMH ? schedule.distanceKm : distanceKm, durationSec, speedKmh,
    itinerary: schedule.itinerary, stopover: schedule.stopover };
}

/**
 * Storage contract. The default implementation persists to this browser
 * only. To get cross-device persistence, implement this interface against
 * your backend (scoped to the authenticated student) and pass it to TripApp.
 */
export interface JourneyRepository {
  accountBacked?: boolean;
  list(studentId: string): Promise<Journey[]>;
  /** Must refuse to create a second in-flight journey; returns the active one instead. */
  create(studentId: string, destinationId: string, now?: number): Promise<{ journey: Journey; created: boolean }>;
  markArrivalSeen(studentId: string, id: string, now?: number): Promise<void>;
  /** Stop at a station: freeze the in-flight clock. */
  pause(studentId: string, id: string, now?: number): Promise<void>;
  /** Leave the station: continue, pushing arrival back by the break length. */
  resume(studentId: string, id: string, now?: number): Promise<void>;
  searchStudents?(query: string): Promise<FlightStudent[]>;
  invite?(flightId: string, userId: string): Promise<void>;
  invitations?(): Promise<FlightInvitation[]>;
  respondInvitation?(flightId: string, accept: boolean): Promise<void>;
  sellVisa?(studentId: string, id: string): Promise<{ points: number }>;
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
    async create(studentId, destinationId, now = Date.now()) {
      const all = resolve(readAll(), now);
      const active = all.find((j) => j.studentId === studentId && j.status === "in_flight");
      if (active) return { journey: active, created: false };
      const plan = planTrip(destinationId);
      if (!plan.ok) throw new Error(plan.error);
      if (all.some((j) => j.studentId === studentId && journeyDestinationKey(j) === plan.destination.id)) throw new Error("city_already_visited");
      const durationMs = Math.round(plan.durationSec * 1000);
      const journey: Journey = {
        id: uid(),
        studentId,
        originLat: TRIP_ORIGIN.lat,
        originLng: TRIP_ORIGIN.lng,
        destCountryCode: plan.country.alpha2,
        destCountryName: plan.country.name,
        destinationId: plan.destination.id,
        destCity: plan.destination.city,
        destCityAr: plan.destination.cityAr,
        destAirportCode: plan.destination.airportCode,
        destLat: plan.destination.lat,
        destLng: plan.destination.lng,
        distanceKm: plan.distanceKm,
        speedKmh: plan.speedKmh,
        durationSec: plan.durationSec,
        startedAt: now,
        arrivalAt: now + durationMs,
        status: "in_flight",
        arrivalSeenAt: null,
        pausedAt: null,
        pausedMs: 0,
        itinerary: plan.itinerary,
        ...(plan.stopover ? { stopover: plan.stopover } : {}),
        hostId: studentId,
        passengers: [],
        canSell: false,
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
