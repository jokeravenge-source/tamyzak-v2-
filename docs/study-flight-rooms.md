# Shared study flights

Students start alone in the cabin. The host can invite up to ten distinct students by profile name; invitations appear on the Sessions chooser and in the flight tool. Accepting reserves the destination for that account and adds the saved character to the shared cabin. Pending/declined invitations never create fictional passengers. The host controls the shared break clock. Room membership refreshes every 15 seconds while the flight page is open; invitation inboxes refresh every 20 seconds and on focus.

The route planner includes boarding, taxi/takeoff, cruising, approach and landing. Routes of at least 5,000 km include a simulated intermediate airport and a 15-minute lounge stop. These are study simulations, not verified airline itineraries. Map progress follows both legs and stops advancing in the lounge. Manual breaks freeze the whole room’s study clock until the host resumes.

Each account can book/visit a city once, including when joining someone else’s flight. A completed account-verified visa can be sold for exactly 100 points once. Selling removes the owned visa presentation and leaves a receipt and the permanent city visit. The world map distinguishes visited, booked and unvisited cities; it also has city search and a keyboard-accessible city list. Its coastline is Natural Earth public-domain 1:110m land data, bundled locally.

## Deployment

Apply the registered Drizzle migration `0029_study_flight_rooms.sql` before publishing the frontend. The identical Supabase SQL copy is `supabase/migrations/20261113010000_study_flight_rooms.sql`; apply through one migration system only. The account repository fails visibly when the RPC is missing or offline; it never silently replaces account records or point awards with browser-local data. Anonymous users retain the local single-player preview, without real point awards or invitations.

The migration introduces server-owned route definitions, flight clocks, ten invitation slots, and a unique `(user_id, destination_id)` visit ledger. No authenticated direct table writes are granted. `study_flights_action` derives the account from `auth.uid()`, locks bookings per account, and locks the shared flight before membership/break/visa transitions. Visa redemption locks the visit, verifies arrival using database time, and inserts the 100-point award in the same transaction. A points trigger rejects `trip_visa` awards without a sold, completed flight ledger entry, including attempts through unrelated generic points APIs.

Existing `trip_journeys` city history is frozen into the visit ledger during migration. Legacy visas remain souvenirs and cannot be redeemed: the old browser-authored clocks are insufficient evidence for account point awards. Legacy history does not block opening a new flight to a different city. New flights and accepted invitations use only the server clock. No previous rows or points are deleted.

## Maintenance and validation

Route data is generated from the same TypeScript planner used by the preview:

```sh
node scripts/build-trip-flight-migration.cjs
node scripts/build-trip-flight-migration.cjs --check
npm test -- src/features/trip
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

`scripts/test-trip-flights.mjs` exercises the migration in PostgreSQL using a supplied PGlite installation, without adding a production dependency:

```sh
node scripts/test-trip-flights.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
```

The integration checks cover unauthenticated/cross-account access, private helper access, direct clock/ledger edits, arrival validation, fake point awards, eleven invitations, acceptance/decline, a passenger’s clock, break accounting, one-time point awards, permanent city uniqueness after selling, and preservation of legacy souvenirs.
