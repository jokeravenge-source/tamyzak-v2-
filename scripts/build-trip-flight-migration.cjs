// Regenerate SQL from the same route planner as the booking preview.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, file);
const root = path.resolve(__dirname, '..');
const { DESTINATIONS } = require(path.join(root, 'src/features/trip/destinations.ts'));
const { planTrip } = require(path.join(root, 'src/features/trip/journeys.ts'));
const { TRIP_ORIGIN } = require(path.join(root, 'src/features/trip/config.ts'));
const routes = DESTINATIONS.flatMap(destination => {
  const p = planTrip(destination.id);
  if (!p.ok) return [];
  return [{ destinationId: destination.id, originLat: TRIP_ORIGIN.lat, originLng: TRIP_ORIGIN.lng,
    destCountryCode: destination.country.alpha2, destCountryName: destination.country.name,
    destCity: destination.city, destCityAr: destination.cityAr, destAirportCode: destination.airportCode,
    destLat: destination.lat, destLng: destination.lng, distanceKm: p.distanceKm,
    speedKmh: p.speedKmh, durationSec: p.durationSec, itinerary: p.itinerary, stopover: p.stopover }];
});
const sql = fs.readFileSync(path.join(root, 'scripts/trip-flights-schema.sql'), 'utf8') + `
INSERT INTO public.study_flight_routes(destination_id, plan)
SELECT value->>'destinationId', value FROM jsonb_array_elements($flight_routes$${JSON.stringify(routes)}$flight_routes$::jsonb);

-- Legacy browser-authored clocks cannot prove elapsed study time for points.
-- Preserve their city history and souvenir visas, but never redeem them.
INSERT INTO public.study_flight_visits(user_id, destination_id, legacy_data)
SELECT DISTINCT ON (j.user_id, r.destination_id) j.user_id, r.destination_id,
  j.data || jsonb_build_object('id', 'legacy:' || j.id, 'arrivalSeenAt', extract(epoch FROM now())*1000)
FROM public.trip_journeys j JOIN public.study_flight_routes r
  ON j.data->>'destinationId' = r.destination_id
    OR (j.data->>'destCountryCode' = r.plan->>'destCountryCode' AND lower(j.data->>'destCity') = lower(r.plan->>'destCity'))
WHERE jsonb_typeof(j.data->'startedAt') = 'number' AND jsonb_typeof(j.data->'arrivalAt') = 'number'
ORDER BY j.user_id, r.destination_id, j.updated_at DESC
ON CONFLICT DO NOTHING;
`;
for (const file of ['drizzle/migrations/0029_study_flight_rooms.sql', 'supabase/migrations/20261113010000_study_flight_rooms.sql']) {
  const output = path.join(root, file);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== sql) throw Error(`Regenerate ${file}`);
  } else fs.writeFileSync(output, sql);
}
console.log(`${routes.length} server-owned study routes; migration copies match.`);
