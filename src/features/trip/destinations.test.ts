import { afterEach, describe, expect, it, vi } from "vitest";
import { COUNTRIES } from "./countries";
import { DESTINATIONS, getDestination, searchDestinations } from "./destinations";
import { geodesicKm, isValidCoord } from "./geo";
import { TRIP_ORIGIN } from "./config";
import { createLocalRepository, journeyState, planTrip } from "./journeys";

afterEach(() => vi.restoreAllMocks());

describe("city study flights", () => {
  it("keeps every existing capital route and gives all added cities a unique valid location", () => {
    expect(DESTINATIONS).toHaveLength(COUNTRIES.length + 50);
    expect(new Set(DESTINATIONS.map((city) => city.id)).size).toBe(DESTINATIONS.length);
    for (const country of COUNTRIES) expect(getDestination(country.alpha2)?.city).toBe(country.capital);
    expect(DESTINATIONS.every(isValidCoord)).toBe(true);
  });

  it("finds cities by Arabic, English, country and airport without losing the selected city", () => {
    for (const query of ["دُبَي", "Dubai", "DXB", "Dubai United Arab Emirates"]) {
      expect(searchDestinations(query).some((city) => city.id === "AE:dubai")).toBe(true);
    }
    expect(searchDestinations("العراق").filter((city) => city.id.startsWith("IQ:")).length).toBe(5);
    expect(searchDestinations("not-a-city-123")).toHaveLength(0);
  });

  it("plans a city route using its own coordinates, while legacy country codes still work", () => {
    const dubai = planTrip("AE:dubai"), capital = planTrip("AE");
    expect(dubai.ok && capital.ok).toBe(true);
    if (!dubai.ok || !capital.ok) throw new Error("Expected valid routes");
    expect(dubai.destination.city).toBe("Dubai");
    expect(dubai.distanceKm).toBeCloseTo(geodesicKm(TRIP_ORIGIN, getDestination("AE:dubai")!));
    expect(dubai.distanceKm).not.toBe(capital.distanceKm);
    expect(capital.destination.city).toBe("Abu Dhabi");
    expect(planTrip("IQ").ok).toBe(false);
    expect(planTrip("IQ:erbil").ok).toBe(true);
    expect(planTrip("unknown").ok).toBe(false);
  });

  it("persists the city and airport through reload, breaks, and attempts to start another flight", async () => {
    const now = Date.UTC(2026, 10, 12, 10);
    vi.spyOn(Date, "now").mockReturnValue(now);
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    const repo = createLocalRepository(storage);
    const { journey } = await repo.create("student-1", "AE:dubai", now);
    expect(journey).toMatchObject({ destinationId: "AE:dubai", destCountryCode: "AE", destCity: "Dubai", destCityAr: "دبي", destAirportCode: "DXB" });
    const restored = createLocalRepository(storage);
    expect((await restored.list("student-1"))[0]).toMatchObject(journey);
    expect((await restored.create("student-1", "TR:istanbul", now)).journey.id).toBe(journey.id);
    expect(await restored.list("student-2")).toHaveLength(0);
    await restored.pause("student-1", journey.id, now + 60_000);
    const paused = (await restored.list("student-1"))[0];
    expect(journeyState(paused, now + 120_000).remainingSec).toBe(journeyState(paused, now + 60_000).remainingSec);
    await restored.resume("student-1", journey.id, now + 180_000);
    const resumed = (await restored.list("student-1"))[0];
    expect(resumed.arrivalAt).toBe(journey.arrivalAt + 120_000);
    expect(resumed.destCity).toBe("Dubai");
  });
});
