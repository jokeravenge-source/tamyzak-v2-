import { DESTINATIONS, getDestination, type Destination } from "./destinations";
import { TRIP_ORIGIN, TRIP_VIRTUAL_SPEED_KMH } from "./config";
import { geodesicKm, interpolateGreatCircle } from "./geo";

export type FlightStageKind = "boarding" | "takeoff" | "cruise" | "landing" | "rest";
export type FlightStage = { kind: FlightStageKind; durationSec: number; city: string; cityAr?: string };
export const MAX_FLIGHT_FRIENDS = 10;
export const VISA_SALE_POINTS = 100;
export const LONG_FLIGHT_KM = 5000;

// A fictional study itinerary, never an airline timetable. Use real city
// coordinates and an intermediate airport reference on longer journeys.
const HUB_IDS = ["TR:istanbul", "AE:dubai", "DE:munich", "FR", "GB", "SG", "TH", "US:new-york", "US:los-angeles", "BR", "ZA:cape-town", "AU:sydney", "JP"];

export function flightItinerary(destination: Destination) {
  const directKm = geodesicKm(TRIP_ORIGIN, destination);
  let stop: Destination | undefined;
  if (directKm >= LONG_FLIGHT_KM) {
    const midpoint = interpolateGreatCircle(TRIP_ORIGIN, destination, .5);
    stop = HUB_IDS.map(getDestination).filter((hub): hub is Destination => !!hub && hub.id !== destination.id)
      .filter((hub) => geodesicKm(TRIP_ORIGIN, hub) > 500 && geodesicKm(hub, destination) > 500)
      .sort((a, b) => geodesicKm(a, midpoint) - geodesicKm(b, midpoint))[0];
  }
  const stages: FlightStage[] = [{ kind: "boarding", durationSec: 120, city: TRIP_ORIGIN.city, cityAr: TRIP_ORIGIN.cityAr },
    { kind: "takeoff", durationSec: 300, city: TRIP_ORIGIN.city, cityAr: TRIP_ORIGIN.cityAr }];
  const flightSeconds = (km: number) => Math.max(1, Math.round(km / TRIP_VIRTUAL_SPEED_KMH * 3600));
  const destinationStage = { city: destination.city, cityAr: destination.cityAr };
  let distanceKm = directKm;
  if (stop) {
    const firstKm = geodesicKm(TRIP_ORIGIN, stop), secondKm = geodesicKm(stop, destination);
    distanceKm = firstKm + secondKm;
    const atStop = { city: stop.city, cityAr: stop.cityAr };
    stages.push({ kind: "cruise", durationSec: flightSeconds(firstKm), ...atStop },
      { kind: "landing", durationSec: 300, ...atStop },
      { kind: "rest", durationSec: 900, ...atStop },
      { kind: "takeoff", durationSec: 300, ...atStop });
    stages.push({ kind: "cruise", durationSec: flightSeconds(secondKm), ...destinationStage });
  } else stages.push({ kind: "cruise", durationSec: flightSeconds(directKm), ...destinationStage });
  stages.push({ kind: "landing", durationSec: 420, ...destinationStage });
  return { distanceKm, durationSec: stages.reduce((sum, stage) => sum + stage.durationSec, 0), itinerary: stages,
    stopover: stop ? { city: stop.city, cityAr: stop.cityAr, airportCode: stop.airportCode, lat: stop.lat, lng: stop.lng } : undefined };
}

export function currentFlightStage(stages: readonly FlightStage[] | undefined, elapsedSec: number) {
  let begins = 0;
  for (let index = 0; index < (stages?.length ?? 0); index++) {
    const stage = stages![index];
    if (elapsedSec < begins + stage.durationSec) return { ...stage, index, remainingSec: begins + stage.durationSec - Math.max(0, elapsedSec) };
    begins += stage.durationSec;
  }
  return null;
}

export function journeyDestinationKey(journey: { destinationId?: string; destCountryCode: string; destCity: string }) {
  return journey.destinationId ?? DESTINATIONS.find((city) => city.country.alpha2 === journey.destCountryCode
    && city.city.toLowerCase() === journey.destCity.toLowerCase())?.id ?? `${journey.destCountryCode}:${journey.destCity.toLowerCase()}`;
}
