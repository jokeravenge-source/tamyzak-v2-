/**
 * TRIP configuration — single place to tune the game.
 *
 * TRIP_VIRTUAL_SPEED_KMH is an intentionally accelerated GAME speed,
 * not a claim about real aircraft performance. Each journey stores the
 * speed it was created with, so changing this value never alters
 * journeys that already exist.
 */
export const TRIP_VIRTUAL_SPEED_KMH = 850; // realistic commercial jet cruise speed

/** Mean Earth radius used for great-circle distance. */
export const EARTH_RADIUS_KM = 6371;

/** Fixed origin for every journey. */
export const TRIP_ORIGIN = {
  code: "BGW",
  city: "Baghdad",
  cityAr: "بغداد",
  country: "Iraq",
  countryAr: "العراق",
  countryCode: "IQ",
  lat: 33.3152,
  lng: 44.3661,
} as const;

/** Length of the intro orbit animation (purely decorative). */
export const TRIP_INTRO_MS = 3500;
