process.on('uncaughtException', e => { console.error(e.message, e.where ?? ''); process.exit(1); });
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
await db.exec(`CREATE TABLE study_challenges(id uuid PRIMARY KEY,creator_id uuid,title text,starts_at timestamptz,ends_at timestamptz,status text,is_public boolean); CREATE TABLE study_challenge_members(challenge_id uuid,user_id uuid,status text);`);
for (let i = 1; i <= 16; i++) await db.query('INSERT INTO profiles VALUES ($1,$2,$3,$4)', [uid(i), `Student ${i}`, i % 2 ? 'male' : 'female', { variant: i % 10 + 1 }]);
await db.query('INSERT INTO trip_journeys(id,user_id,data) VALUES ($1,$2,$3)', ['old-flight',uid(16),{ id:'old-flight',destinationId:'FR',destCity:'Paris',destCountryCode:'FR',startedAt:1,arrivalAt:2,status:'arrived',pausedAt:null,pausedMs:0,durationSec:1 }]);
await db.exec(`CREATE TABLE study_sessions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,subject text,mission text,duration_seconds integer,points integer DEFAULT 0,mission_completed boolean,created_at timestamptz DEFAULT now()); GRANT SELECT ON user_points,study_sessions TO authenticated;`);
await db.exec(await fs.readFile(new URL('../drizzle/migrations/0029_study_flight_rooms.sql', import.meta.url), 'utf8'));

await db.query("UPDATE study_flight_visits SET legacy_data=legacy_data || jsonb_build_object('startedAt',extract(epoch FROM now()-interval '1 hour')*1000,'arrivalAt',extract(epoch FROM now()-interval '5 minutes')*1000,'durationSec',3300,'status','in_flight') WHERE user_id=$1",[uid(16)]);
const plan={durationSec:3000,itinerary:[{kind:'cruise',durationSec:1200},{kind:'rest',durationSec:600},{kind:'cruise',durationSec:1200}],destCity:'Test city'};
await db.query('INSERT INTO study_flight_routes VALUES($1,$2)',['TEST',plan]);
for (const i of [1,2,3,4]) {
  await db.query("INSERT INTO study_flights(id,owner_id,destination_id,plan,started_at,arrival_at) VALUES($1,$2,'TEST',$3,now()-interval '1 hour',now()-interval '10 minutes')",['f'+i,uid(i),plan]);
  await db.query("INSERT INTO study_flight_visits(user_id,destination_id,flight_id,sold_at) VALUES($1,'TEST',$2,CASE WHEN $3 THEN now() ELSE null END)",[uid(i),'f'+i,i===3]);
}
await db.query("UPDATE study_flights SET started_at=now()-interval '10 minutes', arrival_at=now()+interval '40 minutes' WHERE id='f4'");
await db.query("INSERT INTO user_points(user_id,source,points,ref_id) VALUES($1,'trip_visa',100,'TEST')",[uid(3)]);
await db.query("INSERT INTO study_sessions(user_id,subject,mission,duration_seconds,created_at) VALUES($1,'general','Normal session',900,now()-interval '40 minutes')",[uid(1)]);
await db.query("INSERT INTO study_challenges VALUES('11111111-1111-1111-1111-111111111111',$1,'Flight challenge',now()-interval '2 hours',now()+interval '1 hour','active',false)",[uid(1)]);
await db.query("INSERT INTO study_challenge_members VALUES('11111111-1111-1111-1111-111111111111',$1,'accepted')",[uid(1)]);
await db.exec(await fs.readFile(new URL('../drizzle/migrations/0034_flight_visa_rewards_and_study_time.sql',import.meta.url),'utf8'));
const points=async n=>Number((await db.query("SELECT coalesce(sum(points),0) total FROM user_points WHERE user_id=$1 AND source='trip_visa'",[uid(n)])).rows[0].total);
const hours=async n=>Number((await db.query('SELECT coalesce(sum(duration_seconds),0) total FROM study_sessions WHERE user_id=$1',[uid(n)])).rows[0].total);
verify(await points(1)===100,'existing completed visa paid automatically');
verify(await points(3)===100,'already sold visa not paid twice');
verify(await points(16)===100,'existing frozen legacy visa rewarded even with a stale status');
verify(Math.abs(await hours(16)-3300)<=2,'existing legacy flight hours backfilled');
verify(await points(4)===0,'unfinished flight has no visa reward');
verify(Math.abs(await hours(1)-2400)<=2,'lounge excluded and existing normal session not double counted');
verify(Math.abs(await hours(2)-2400)<=2,'completed flight time added without separate study timer');
verify(Math.abs(await hours(4)-600)<=2,'active flight time also joins study history');
await as(4);await denied('SELECT unsafe_award_for_test($1,$2,$3)',[uid(4),'TEST',100],/unverified_flight_visa/);
await as(null);await assert.rejects(()=>db.query('SELECT sync_my_study_flights()'),/authentication_required/);checks++;
await as(1);
await denied('SELECT sync_study_flight_account_internal($1)',[uid(2)],/permission denied/);
await denied('SELECT study_flight_periods_internal($1,$2)',[uid(1),'TEST'],/permission denied/);
await denied("INSERT INTO study_flight_study_credits(user_id,destination_id,period) VALUES($1,'TEST',tstzrange(now()-interval '1 hour',now()))",[uid(1)],/permission denied/);
for(let i=0;i<3;i++) await db.query('SELECT sync_my_study_flights()');
verify(await points(1)===100,'repeated sync awards exactly once');
verify(Math.abs(await hours(1)-2400)<=2,'repeated sync does not duplicate study time');
const snapshot=await action('state');
verify(snapshot.journeys[0].visaAwardedAt!==null&&!snapshot.journeys[0].canSell,'automatic reward is visible and no sale required');
verify((await action('sell','f1')).points===0,'old sell request cannot mint a second reward');
verify((await action('state')).journeys[0].visaSoldAt===null,'student keeps visa after automatic award');
await db.exec('RESET ROLE; GRANT INSERT ON study_sessions TO authenticated');
await as(1);
await denied("INSERT INTO study_sessions(id,user_id,subject,mission,duration_seconds,points,created_at,flight_credit_id) VALUES(gen_random_uuid(),$1,'general','fake',3600,0,now(),gen_random_uuid())",[uid(1)],/unverified_flight_study/);
await db.exec('RESET ROLE');
const arrival=(await db.query("SELECT arrival_at FROM study_flights WHERE id='f1'")).rows[0].arrival_at;
await as(1);
await db.query("INSERT INTO study_sessions(user_id,subject,mission,duration_seconds,created_at) VALUES($1,'general','Late normal save',3000,$2)",[uid(1),arrival]);
await db.exec('RESET ROLE');
verify(Math.abs(await hours(1)-3000)<=2,'later normal timer excludes already credited flight periods');
await as(1);
const challengeRows=(await db.query('SELECT get_my_study_challenges() value')).rows[0].value;
verify(Math.abs(challengeRows[0].participants[0].totalSeconds-3000)<=2,'challenge scores retain exact flight intervals and separately studied lounge time');
await db.exec('RESET ROLE');
// Join an in-progress flight now: the new acceptance clock excludes earlier time.
await db.query("INSERT INTO study_flight_members(flight_id,user_id,status,seat_number) VALUES('f4',$1,'accepted',1)",[uid(5)]);
await as(5);await action('state');await db.exec('RESET ROLE');
verify(await hours(5)<=2,'accepted friend receives no pre-join flight time');
// A future arrival is settled without opening the flight tool via account sync.
await db.query("UPDATE study_flights SET started_at=now()-interval '50 minutes',arrival_at=now() WHERE id='f4'");
await as(4);await db.query('SELECT sync_my_study_flights()');await db.exec('RESET ROLE');
verify(await points(4)===100,'future arrival automatically awards the visa');
verify(Math.abs(await hours(4)-2400)<=3,'future arrival finalizes all eligible time once');
// Host breaks are recorded as immutable clock intervals and excluded.
await db.query("INSERT INTO study_flights(id,owner_id,destination_id,plan,started_at,arrival_at,paused_at) VALUES('paused',$1,'TEST',$2,now()-interval '30 minutes',now()+interval '20 minutes',now()-interval '10 minutes')",[uid(6),plan]);
await db.query("INSERT INTO study_flight_visits(user_id,destination_id,flight_id) VALUES($1,'TEST','paused')",[uid(6)]);
await as(6);await action('state');await action('resume','paused');await action('state');await db.exec('RESET ROLE');
verify((await db.query("SELECT count(*)::int n FROM study_flight_breaks WHERE flight_id='paused'")).rows[0].n===1,'manual break recorded on resume');
verify(Math.abs(await hours(6)-1200)<=3,'manual break and lounge do not become study hours');
verify((await db.query('SELECT count(*)::int n FROM study_sessions WHERE points<>0')).rows[0].n===0,'flight time does not mint separate ordinary study points');
await db.close();console.log(`${checks} flight reward and study-time integration checks passed.`);
