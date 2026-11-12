import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

// Pass the installed PGlite entry point; no production dependency is needed.
const { PGlite } = await import(pathToFileURL(process.argv[2]).href);
const db = new PGlite();
const uid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
let checks = 0;
const verify = (condition, label) => { assert.ok(condition, label); checks++; };
async function denied(sql, params, message) {
  await assert.rejects(() => db.query(sql, params), message);
  checks++;
}
async function as(n) {
  await db.exec('RESET ROLE; SET ROLE authenticated');
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [n ? uid(n) : '']);
}
const action = async (name, flight = null, destination = null, invitee = null, accept = null) =>
  (await db.query('SELECT public.study_flights_action($1,$2,$3,$4,$5) AS value', [name, flight, destination, invitee, accept])).rows[0].value;
await db.exec(`
  CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
  CREATE SCHEMA auth;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  GRANT USAGE ON SCHEMA auth TO authenticated;
  CREATE TABLE profiles(user_id uuid PRIMARY KEY, display_name text, gender text, character jsonb);
  CREATE TABLE user_points(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, source text, points integer, ref_id text);
  CREATE UNIQUE INDEX points_ref ON user_points(user_id,source,ref_id) WHERE ref_id IS NOT NULL;
  CREATE TABLE trip_journeys(id text, user_id uuid, data jsonb, updated_at timestamptz DEFAULT now());
  CREATE FUNCTION unsafe_award_for_test(_uid uuid, _ref text, _points integer) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    INSERT INTO public.user_points(user_id, source, points, ref_id) VALUES (_uid,'trip_visa',_points,_ref) $$;
`);
for (let i = 1; i <= 16; i++) await db.query('INSERT INTO profiles VALUES ($1,$2,$3,$4)', [uid(i), `Student ${i}`, i % 2 ? 'male' : 'female', { variant: i % 10 + 1 }]);
await db.query('INSERT INTO trip_journeys(id,user_id,data) VALUES ($1,$2,$3)', ['old-flight',uid(16),{ id:'old-flight',destinationId:'FR',destCity:'Paris',destCountryCode:'FR',startedAt:1,arrivalAt:2,status:'arrived',pausedAt:null,pausedMs:0,durationSec:1 }]);
await db.exec(await fs.readFile(new URL('../drizzle/migrations/0029_study_flight_rooms.sql', import.meta.url), 'utf8'));

await as(null);
await assert.rejects(() => action('state'), /authentication_required/); checks++;
await as(1);
const created = await action('create', null, 'JP');
const flight = created.journeyId;
verify(created.created, 'host starts a flight');
verify(!(await action('create', null, 'FR')).created, 'second booking returns the current flight');
const state = await action('state');
verify(state.userId === uid(1) && state.journeys.length === 1, 'state is scoped to authenticated account');
verify(state.journeys[0].passengers.length === 1 && state.journeys[0].passengers[0].userId === uid(1), 'only the host is aboard initially');
verify(state.journeys[0].itinerary.some(s => s.kind === 'rest'), 'long route has a scheduled lounge stop');
await denied('INSERT INTO study_flight_visits(user_id,destination_id,flight_id) VALUES ($1,$2,$3)', [uid(1),'FR',flight], /permission denied/);
await denied('UPDATE study_flights SET arrival_at=now() WHERE id=$1', [flight], /permission denied/);
await denied('SELECT study_flight_snapshot_internal($1)', [uid(2)], /permission denied/);
await assert.rejects(() => action('sell', flight), /flight_not_arrived/); checks++;
await denied('SELECT unsafe_award_for_test($1,$2,$3)', [uid(1),'JP',100], /unverified_flight_visa/);
await assert.rejects(() => action('invite', flight, null, uid(1)), /invalid_student/); checks++;
for (let i=2;i<=11;i++) await action('invite', flight, null, uid(i));
await action('invite', flight, null, uid(2)); // Retry is idempotent.
await assert.rejects(() => action('invite', flight, null, uid(12)), /flight_full/); checks++;
verify((await action('state')).journeys[0].passengers.filter(p => p.status==='pending').length === 10, 'ten distinct reserved invitations');
await as(2);
verify((await action('inbox')).length === 1, 'invitee sees their invitation');
verify((await action('state')).journeys.length === 0, 'pending invite is not a booked flight');
await action('respond', flight, null, null, true);
await action('respond', flight, null, null, true);
verify((await action('state')).journeys.length === 1, 'acceptance creates one city reservation');
await assert.rejects(() => action('pause', flight), /host_only/); checks++;
await assert.rejects(() => action('invite', flight, null, uid(12)), /host_only/); checks++;
verify(!(await action('create', null, 'FR')).created, 'a passenger cannot start a simultaneous trip');
await as(3);
await action('respond', flight, null, null, false);
await assert.rejects(() => action('respond', flight, null, null, true), /invitation_already_answered/); checks++;
await as(12);
verify((await action('state')).journeys.length === 0 && (await action('inbox')).length === 0, 'outsider cannot see room or invites');
await assert.rejects(() => action('respond', flight, null, null, true), /invitation_not_found/); checks++;
await assert.rejects(() => action('sell', flight), /visa_not_redeemable/); checks++;
await as(1);
await action('pause', flight);
verify((await action('state')).journeys[0].pausedAt !== null, 'host pauses the shared clock');
await db.exec('RESET ROLE');
await db.query("UPDATE study_flights SET paused_at = now()-interval '5 minutes' WHERE id=$1", [flight]);
await as(1);
await action('resume', flight);
verify((await action('state')).journeys[0].pausedMs >= 300000, 'resume includes elapsed break time');
await as(2);
verify((await action('state')).journeys[0].pausedAt === null, 'guest gets the resumed clock');
await db.exec('RESET ROLE');
await db.query("UPDATE study_flights SET arrival_at=now()-interval '1 second' WHERE id=$1",[flight]);
await as(1);
await action('seen', flight);
verify((await action('sell', flight)).points === 100, 'arrival yields exactly 100 points');
verify((await action('sell', flight)).points === 0, 'retry cannot pay twice');
await assert.rejects(() => action('create',null,'JP'), /city_already_visited/); checks++;
verify((await action('state')).journeys[0].visaSoldAt !== null, 'sold visa retains its visit');
await as(2);
verify((await action('sell', flight)).points === 100, 'accepted passenger gets their own earned visa');
await assert.rejects(() => action('create',null,'JP'), /city_already_visited/); checks++;
await as(4);
await assert.rejects(() => action('respond',flight,null,null,true), /flight_not_active/); checks++;
await as(16);
const legacy = await action('state');
verify(legacy.journeys[0].legacy && !legacy.journeys[0].canSell, 'legacy souvenir is preserved without trusting its clock');
await assert.rejects(() => action('create',null,'FR'), /city_already_visited/); checks++;
await assert.rejects(() => action('sell','legacy:old-flight'), /visa_not_redeemable/); checks++;
await as(1);
const next = await action('create', null, 'FR');
await assert.rejects(() => action('invite', next.journeyId, null, uid(16)), /friend_city_already_visited/); checks++;
verify((await action('state')).journeys.find(j => j.id === next.journeyId).passengers.length === 1, 'an impossible invitation does not consume a seat');
await db.exec('RESET ROLE');
verify(Number((await db.query("SELECT sum(points) AS total FROM user_points WHERE source='trip_visa'")).rows[0].total) === 200, 'only two authentic awards exist');
await db.close();
console.log(`${checks} PostgreSQL flight integration checks passed.`);
