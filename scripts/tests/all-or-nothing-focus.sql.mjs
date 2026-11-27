// Run against a fresh local PostgreSQL-compatible PGlite database.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const db = new PGlite();
const migration = (name) => readFile(new URL("../../supabase/migrations/" + name, import.meta.url), "utf8");
const replacement = await migration("20261125161000_all_or_nothing_recorded_focus.sql");
const durationMigration = await migration("20261127150000_all_or_nothing_duration_hours.sql");
assert.equal(replacement, await readFile(new URL("../../drizzle/migrations/0061_all_or_nothing_recorded_focus.sql", import.meta.url), "utf8"));
assert.equal(durationMigration, await readFile(new URL("../../drizzle/migrations/0065_all_or_nothing_duration_hours.sql", import.meta.url), "utf8"));
try {
  await db.exec(`
    CREATE SCHEMA auth;
    CREATE SCHEMA cron;
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
      $$ SELECT nullif(current_setting('test.user_id', true), '')::uuid $$;
    CREATE FUNCTION cron.schedule(text, text, text) RETURNS bigint LANGUAGE sql AS $$ SELECT 1::bigint $$;
    CREATE TABLE public.profiles (user_id uuid PRIMARY KEY, display_name text);
    CREATE TABLE public.study_challenges (
      id uuid PRIMARY KEY, title text, creator_id uuid,
      starts_at timestamptz, ends_at timestamptz, status text DEFAULT 'active',
      is_public boolean DEFAULT true, challenge_type text NOT NULL, public_series text,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
    );
    CREATE TABLE public.study_challenge_members (
      challenge_id uuid, user_id uuid, invited_by uuid, status text DEFAULT 'pending', joined_at timestamptz,
      PRIMARY KEY (challenge_id, user_id)
    );
    CREATE TABLE public.study_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, subject text, mission text,
      duration_seconds integer, mission_completed boolean, points integer DEFAULT 0,
      created_at timestamptz DEFAULT now(), flight_credit_id uuid, study_periods tstzmultirange
    );
    CREATE TABLE public.study_flight_study_credits (session_id uuid PRIMARY KEY, user_id uuid, period tstzrange);
    CREATE TABLE public.point_redemptions (id uuid DEFAULT gen_random_uuid(), user_id uuid, reward text, points_spent integer);
    CREATE TABLE public.user_points (user_id uuid, source text, points integer, ref_id text);
    CREATE UNIQUE INDEX user_points_ref ON public.user_points (user_id, source, ref_id) WHERE ref_id IS NOT NULL;
    CREATE FUNCTION public.test_id(n integer) RETURNS uuid LANGUAGE sql IMMUTABLE AS
      $$ SELECT ('00000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid $$;
  `);
  const flightSql = await migration("20261114010000_flight_visa_rewards_and_study_time.sql");
  await db.exec(flightSql.slice(flightSql.indexOf("CREATE FUNCTION public.validate_flight_study_session()"), flightSql.indexOf("CREATE FUNCTION public.sync_study_flight_account_internal(")));
  await db.exec(await migration("20261124170000_all_or_nothing_point_rooms.sql"));
  await db.exec(`
    BEGIN;
    INSERT INTO auth.users SELECT test_id(n) FROM generate_series(1, 7) n;
    INSERT INTO public.profiles SELECT id, 'Student ' || row_number() OVER (ORDER BY id) FROM auth.users;
    INSERT INTO public.study_challenges
      (id, title, creator_id, starts_at, ends_at, challenge_type, room_state, wager_points, winner_id)
    VALUES
      (test_id(101), 'Running', test_id(1), now()-interval '1 hour', now()+interval '1 hour', 'all_or_nothing', 'running', 100, NULL),
      (test_id(102), 'Lobby', test_id(1), now()-interval '3 hours', now()+interval '1 hour', 'all_or_nothing', 'lobby', 100, NULL),
      (test_id(103), 'Standard', test_id(1), now()-interval '1 hour', now()+interval '1 hour', 'standard', 'running', NULL, NULL),
      (test_id(104), 'Historical', test_id(1), now()-interval '5 hours', now()-interval '3 hours', 'all_or_nothing', 'settled', 100, test_id(1)),
      (test_id(105), 'Ready to settle', test_id(1), now()-interval '3 hours', now()-interval '1 hour', 'all_or_nothing', 'running', 100, NULL);
    INSERT INTO public.study_challenge_members
    SELECT c.id, u.id, test_id(1),
      CASE WHEN u.id = test_id(7) THEN 'pending' ELSE 'accepted' END,
      CASE WHEN u.id = test_id(2) AND c.id = test_id(101)
        THEN now()-interval '30 minutes' ELSE c.starts_at-interval '1 minute' END
    FROM public.study_challenges c CROSS JOIN auth.users u;
  `);
  await db.exec(replacement);
  await db.exec(replacement);
  await db.exec(`
    -- A legacy save at the current time would falsely look like recent study.
    INSERT INTO public.study_sessions (user_id, subject, mission, duration_seconds)
      VALUES (test_id(1), 'physics', '', 7200);

    SET LOCAL test.user_id = '00000000-0000-0000-0000-000000000001';
    SET LOCAL ROLE authenticated;
    SELECT public.save_study_timer_session(test_id(201), 'physics', '', 4200, false, tstzmultirange(
      tstzrange(now()-interval '3 hours', now()-interval '2 hours', '[)'),
      tstzrange(now()-interval '50 minutes', now()-interval '40 minutes', '[)')));
    SELECT public.save_study_timer_session(test_id(201), 'physics', '', 4200, false, tstzmultirange(
      tstzrange(now()-interval '3 hours', now()-interval '2 hours', '[)'),
      tstzrange(now()-interval '50 minutes', now()-interval '40 minutes', '[)')));
    -- A second save of the identical focus adds no seconds to the union.
    SELECT public.save_study_timer_session(test_id(202), 'physics', '', 600, false, tstzmultirange(
      tstzrange(now()-interval '50 minutes', now()-interval '40 minutes', '[)')));
    RESET ROLE;

    SET LOCAL test.user_id = '00000000-0000-0000-0000-000000000002';
    SELECT public.save_study_timer_session(test_id(203), 'physics', '', 600, false, tstzmultirange(
      tstzrange(now()-interval '35 minutes', now()-interval '25 minutes', '[)')));

    SET LOCAL test.user_id = '00000000-0000-0000-0000-000000000003';
    SELECT public.save_study_timer_session(test_id(204), 'physics', '', 1800, false, tstzmultirange(
      tstzrange(now()-interval '3 hours', now()-interval '2 hours 30 minutes', '[)')));
    SELECT public.save_study_timer_session(test_id(205), 'physics', '', 10, false, tstzmultirange(
      tstzrange(now()-interval '20 minutes', now(), '[)')));

    -- A server-issued flight receipt still counts through the existing source.
    INSERT INTO public.study_flight_study_credits VALUES
      (test_id(206), test_id(4), tstzrange(now()-interval '10 minutes', now()-interval '5 minutes', '[)'));
    INSERT INTO public.study_sessions (id,user_id,subject,mission,created_at,duration_seconds,flight_credit_id)
      VALUES (test_id(206),test_id(4),'physics','',now()-interval '5 minutes',300,test_id(206));

    SET LOCAL test.user_id = '00000000-0000-0000-0000-000000000005';
    SELECT public.save_study_timer_session(test_id(210), 'physics', '', 900, false, tstzmultirange(
      tstzrange(now()-interval '70 minutes', now()-interval '55 minutes', '[)')));

    INSERT INTO public.study_sessions (id, user_id, subject, mission, duration_seconds, created_at) VALUES
      (test_id(207), test_id(1), 'physics', '', 1800, now()-interval '4 hours'),
      (test_id(208), test_id(1), 'physics', '', 7200, now()-interval '70 minutes'),
      (test_id(209), test_id(2), 'physics', '', 600, now()-interval '80 minutes');
    INSERT INTO public.study_timer_focus VALUES (test_id(209), tstzmultirange(
      tstzrange(now()-interval '90 minutes', now()-interval '80 minutes', '[)')));
    INSERT INTO public.study_challenge_stakes (challenge_id, user_id, points)
      SELECT test_id(105), id, 100 FROM auth.users WHERE id <> test_id(7);
  `);

  const scored = async (challenge, user) => {
    const { rows } = await db.query(
      "SELECT total_seconds FROM public.study_challenge_totals(test_id($1)) WHERE user_id=test_id($2)", [challenge, user]);
    return Number(rows[0]?.total_seconds);
  };
  assert.equal(await scored(101, 1), 600, "exclude the old save and all work before room start");
  assert.equal(await scored(101, 2), 300, "credit only the part after joining");
  assert.equal(await scored(101, 3), 0, "saving earlier work later or submitting a too-long span adds no time");
  assert.equal(await scored(101, 4), 300, "keep recorded flight time");
  assert.equal(await scored(101, 5), 300, "keep only the overlapping part of a running timer");
  assert.equal(await scored(102, 1), 0, "the lobby never scores");
  assert.equal(await scored(103, 1), 3600, "keep legacy timing for the standard challenge");
  assert.equal(await scored(104, 1), 1800, "historically settled scores remain available");
  assert.equal(await scored(105, 1), 0, "a legacy timer cannot win the pot");

  const { rows: [leaderboard] } = await db.query(`
    SELECT (member->>'totalSeconds')::int AS seconds
    FROM jsonb_array_elements(public.get_my_study_challenges()) room,
         jsonb_array_elements(room->'participants') member
    WHERE room->>'id'=test_id(101)::text AND member->>'userId'=test_id(5)::text
  `);
  assert.equal(leaderboard.seconds, 300, "the UI receives the corrected overlap");
  const { rows: [privacy] } = await db.query(`
    SELECT has_table_privilege('authenticated', 'public.study_timer_focus', 'SELECT') AS can_read,
           has_function_privilege('anon', 'public.save_study_timer_session(uuid,text,text,integer,boolean,tstzmultirange)', 'EXECUTE') AS can_save,
           (SELECT count(*) FROM public.study_sessions WHERE id=test_id(201))::int AS copies
  `);
  assert.deepEqual(privacy, { can_read: false, can_save: false, copies: 1 });
  await db.exec("SELECT public.settle_due_all_or_nothing_challenges(); SELECT public.settle_due_all_or_nothing_challenges();");
  const { rows: awards } = await db.query("SELECT user_id, points FROM public.user_points WHERE ref_id=test_id(105)::text");
  assert.deepEqual(awards, [{ user_id: "00000000-0000-0000-0000-000000000002", points: 600 }]);
  assert.equal(await scored(105, 2), 600, "the fixed score stays the same after settlement");
  await db.exec("ROLLBACK");
  console.log("All or Nothing focus windows, legacy compatibility, retry safety, and settlement passed.");

  await db.exec(replacement);
  await db.exec(`
    CREATE TABLE public.user_progress (user_id uuid PRIMARY KEY, lifetime_points integer DEFAULT 0);
    INSERT INTO auth.users SELECT test_id(n) FROM generate_series(1, 4) n;
    INSERT INTO public.profiles SELECT id, 'Student ' || row_number() OVER (ORDER BY id) FROM auth.users;
    INSERT INTO public.user_progress SELECT id, 1000 FROM auth.users;
    CREATE FUNCTION public.points_balance() RETURNS integer LANGUAGE sql AS $$
      SELECT greatest(p.lifetime_points - coalesce(sum(r.points_spent), 0)::int, 0)
      FROM public.user_progress p LEFT JOIN public.point_redemptions r USING (user_id)
      WHERE p.user_id = auth.uid() GROUP BY p.lifetime_points
    $$;
  `);
  const asUser = (user, sql, params = []) => db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE authenticated");
    await tx.query("SELECT set_config('test.user_id', public.test_id($1)::text, true)", [user]);
    return tx.query(sql, params);
  });
  const { rows: [{ id: legacyRoom }] } = await asUser(1,
    "SELECT public.create_study_challenge_v3('Legacy lobby', 3, '{}', 'all_or_nothing', 100) AS id");
  await db.query(`INSERT INTO public.study_challenge_members VALUES ($1, test_id(2), test_id(1), 'accepted', now())`, [legacyRoom]);

  await db.exec(durationMigration);
  await db.exec(durationMigration);
  const { rows: [legacy] } = await db.query(`
    SELECT c.duration_days, c.duration_hours, m.status,
      (SELECT count(*)::int FROM public.study_challenge_stakes WHERE challenge_id = c.id AND state = 'held') AS held
    FROM public.study_challenges c JOIN public.study_challenge_members m ON m.challenge_id = c.id
    WHERE c.id = $1 AND m.user_id = test_id(2)
  `, [legacyRoom]);
  assert.deepEqual(legacy, { duration_days: 3, duration_hours: 0, status: "pending", held: 1 },
    "legacy day-only rooms retain their duration and unfunded public joins must re-confirm");

  const createRoom = (days, hours) => asUser(1,
    "SELECT public.create_all_or_nothing_challenge('Timed lobby', $1, $2, ARRAY[public.test_id(2)], 100) AS id", [days, hours]);
  for (const [days, hours] of [[0, 0], [30, 1], [0, 24], [null, 2], [2147483647, 1]]) {
    await assert.rejects(() => createRoom(days, hours), /between 1 hour and 30 days/);
  }
  const { rows: [{ id: roomId }] } = await createRoom(1, 5);
  const { rows: [{ id: hourlyRoom }] } = await createRoom(0, 4);
  const { rows: [{ data: rooms }] } = await asUser(1, "SELECT public.get_my_study_challenges() AS data");
  assert.deepEqual(rooms.filter((room) => room.id === roomId || room.id === hourlyRoom)
    .map(({ durationDays, durationHours, minimumPlayers }) => [durationDays, durationHours, minimumPlayers])
    .sort((a, b) => a[0] - b[0]), [[0, 4, 3], [1, 5, 3]]);

  const join = (user) => asUser(user, "SELECT public.respond_study_challenge($1, true)", [roomId]);
  const start = (user) => asUser(user, "SELECT public.start_all_or_nothing_challenge($1) AS result", [roomId]);
  await join(2);
  await assert.rejects(() => start(1), /At least 3 students/);
  await join(3); // An uninvited member joins the public lobby.
  await assert.rejects(() => start(2), /Only the room owner/);

  await db.query("UPDATE public.study_challenges SET starts_at = now() - interval '3 hours' WHERE id = $1", [roomId]);
  const { rows: [{ result }] } = await start(1);
  assert.equal(result.participants, 3);
  assert.equal(result.potPoints, 300);
  const { rows: [round] } = await db.query(`
    SELECT room_state, extract(epoch FROM ends_at - starts_at)::int AS seconds,
      (SELECT count(*)::int FROM public.study_challenge_stakes WHERE challenge_id = c.id AND state = 'held') AS held
    FROM public.study_challenges c WHERE id = $1`, [roomId]);
  assert.deepEqual(round, { room_state: "running", seconds: 29 * 3600, held: 3 });
  await assert.rejects(() => start(1), /cannot be started/);
  console.log("All or Nothing custom durations, legacy lobbies, public stake reservation, and three-player start passed.");
} finally {
  await db.close();
}
