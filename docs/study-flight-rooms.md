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

## Automatic visa rewards and study hours (0034)

Each completed account visa now awards **100 points automatically**, without selling or removing it. Migration `0034_flight_visa_rewards_and_study_time` backfills existing completed visas, including frozen legacy snapshots. Previously sold visas already paid under the same `(user_id, trip_visa, destination_id)` reference are not paid twice. Pending destinations are not visas yet and earn no points until arrival. The account visit rule remains once per city.

Flight study time is saved into `study_sessions`, for current and completed flights, so existing study totals and challenge rankings include it. Server timestamps, membership acceptance time, the itinerary's lounge stages, and host break intervals determine credited time. Lounge stops and manual breaks are excluded. A durable private receipt ledger and an account transaction lock prevent duplicated credit across tabs, retries, ordinary timers and flight timers. Continuous receipts are extended between polls, with new rows only across gaps or after 12 hours. Exact credited intervals are stored server-side for challenge ranking; clients cannot manufacture receipt IDs or trusted time spans. Flight history rows have zero extra ordinary session points: the visa reward is 100 points.

New friends earn time only after their acceptance timestamp. Pre-update memberships and aggregate historical pauses lack exact timestamps: existing accepted membership uses the recorded flight start, and known old pause duration is reserved from the beginning of the old flight. Frozen legacy hours are bounded by both their saved elapsed duration and the server route duration. These are historical estimates; no new browser-authored legacy claims are accepted.

While signed in, the main app synchronizes on opening, returning to the foreground, and every minute while visible. The flight page also synchronizes through its existing state refresh. Progress listeners are notified when points or study hours change. A finished journey while offline is settled using server time on the next account sync. The migration performs the first backfill for all existing accounts; a student does not need to reopen the flight tool to receive that initial credit. No background scheduler is required, and time is never credited beyond arrival.

Apply **one** equivalent migration through the active deployment runner:

- `drizzle/migrations/0034_flight_visa_rewards_and_study_time.sql` (registered in the journal).
- `supabase/migrations/20261114010000_flight_visa_rewards_and_study_time.sql`.

This update requires the flight schema from 0029/0030 and the challenge schema from 0031. Publishing frontend files alone does not award existing points or install time accounting. Guests keep the local preview without account points or study-hour credit. Older clients' sell requests remain safe but return no second reward and no longer remove the visa.

Validation:

```sh
node scripts/test-flight-rewards.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
npm test -- src/features/trip src/lib/studyChallenges.test.ts src/hooks/useFlightStudySync.test.ts
npx tsc --noEmit -p tsconfig.app.json
npm run build
```
