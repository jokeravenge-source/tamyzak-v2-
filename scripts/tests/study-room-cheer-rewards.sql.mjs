// Use an isolated PostgreSQL-compatible PGlite database.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const migration = name => readFileSync(new URL(`../../supabase/migrations/${name}.sql`, import.meta.url), "utf8");
const rewards = migration("20261127160000_study_room_cheer_rewards");
assert.equal(rewards, readFileSync(new URL("../../drizzle/migrations/0067_study_room_cheer_rewards.sql", import.meta.url), "utf8"));

const room = "00000000-0000-4000-8000-000000000001";
const host = "00000000-0000-4000-8000-000000000002";
const recipient = "00000000-0000-4000-8000-000000000003";
const member = "00000000-0000-4000-8000-000000000004";
const outsider = "00000000-0000-4000-8000-000000000005";
const inboxTopic = `study-room-inbox:${room}:${recipient}`;
const db = new PGlite();

try {
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE SCHEMA realtime;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO anon, authenticated;
    CREATE TABLE realtime.messages(extension text);
    CREATE TABLE realtime.sent(topic text, event text, private boolean);
    CREATE FUNCTION realtime.topic() RETURNS text LANGUAGE sql STABLE AS $$ SELECT ''::text $$;
    CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean)
      RETURNS void LANGUAGE plpgsql AS $$
      BEGIN
        IF current_setting('test.fail_broadcast', true) = 'true' THEN RAISE EXCEPTION 'broadcast failed'; END IF;
        INSERT INTO realtime.sent VALUES (topic, event, private);
      END;
      $$;
    CREATE TABLE study_rooms(id uuid PRIMARY KEY, owner_id uuid, is_active boolean NOT NULL DEFAULT true);
    CREATE TABLE study_room_members(room_id uuid, user_id uuid, display_name text, PRIMARY KEY(room_id, user_id));
    CREATE TABLE study_room_bans(room_id uuid, user_id uuid);
    CREATE FUNCTION public.is_banned_from_room(_room uuid) RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT EXISTS (SELECT 1 FROM study_room_bans WHERE room_id = _room AND user_id = auth.uid()) $$;
    CREATE FUNCTION public.is_study_room_member(_room uuid) RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT EXISTS (SELECT 1 FROM study_room_members WHERE room_id = _room AND user_id = auth.uid()) $$;
    CREATE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN new; END; $$;
    CREATE TYPE public.app_role AS ENUM ('admin');
    CREATE FUNCTION public.has_role(uuid, public.app_role) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
  `);

  const ledger = migration("20260524085344_9a606200-3087-4c4c-a2bd-9005225eb929");
  await db.exec(ledger.slice(0, ledger.indexOf('CREATE POLICY "Users insert own points"')));
  const progress = migration("20260808142905_e374a026-fb0f-41b0-862d-2f44f1a8d19b");
  await db.exec(progress.slice(0, progress.indexOf("-- 5. Award function")));
  const balance = migration("20260811210948_681d735f-3272-4cae-aa28-2abd5195e7a2");
  await db.exec(balance.slice(0, balance.indexOf("CREATE OR REPLACE FUNCTION public.redeem_premium_with_points")));
  const activity = migration("20261126190000_study_room_encouragement_and_voice");
  await db.exec(activity.replace(/^CREATE EXTENSION[^\n]*\n/, ""));

  const asUser = async (user, role = "authenticated") => {
    await db.exec("RESET ROLE");
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [user ?? ""]);
    await db.exec(`SET ROLE ${role}`);
  };
  const scalar = async (sql, params = []) => Object.values((await db.query(sql, params)).rows[0])[0];
  const cheer = target => db.query("SELECT public.encourage_study_room_member($1, $2)", [room, target]);
  const getActivity = () => scalar("SELECT public.study_room_activity($1)", [room]);
  const pointsBalance = () => scalar("SELECT public.points_balance()");

  await db.query("INSERT INTO study_rooms VALUES ($1, $2)", [room, host]);
  for (const [user, name] of [[host, "Host"], [recipient, "Recipient"], [member, "Friend"]]) {
    await db.query("INSERT INTO study_room_members VALUES ($1, $2, $3)", [room, user, name]);
  }
  await asUser(host);
  await cheer(recipient);
  await db.exec("RESET ROLE");
  await db.exec("UPDATE study_room_encouragements SET created_at = now() - interval '2 minutes'; DELETE FROM realtime.sent;");
  await db.exec(rewards);
  await db.exec(rewards);

  await asUser(recipient);
  assert.equal((await getActivity()).inbox[0].reward_points, 0);
  assert.equal(await pointsBalance(), 0);
  await assert.rejects(cheer(recipient), /ROOM_MEMBERSHIP_REQUIRED/);
  await assert.rejects(cheer(outsider), /ROOM_MEMBERSHIP_REQUIRED/);
  await asUser(outsider);
  await assert.rejects(cheer(recipient), /ROOM_MEMBERSHIP_REQUIRED/);
  await asUser(null, "anon");
  await assert.rejects(cheer(recipient), /permission denied/);

  await asUser(host);
  await cheer(recipient);
  await assert.rejects(cheer(recipient), /ENCOURAGEMENT_COOLDOWN/);
  assert.equal(await pointsBalance(), 0);
  assert.deepEqual((await getActivity()).inbox, []);
  await asUser(recipient);
  assert.equal(await pointsBalance(), 5);
  const [notification] = (await getActivity()).inbox;
  assert.equal(notification.sender_id, host);
  assert.equal(notification.reward_points, 5);
  await db.query("SELECT public.dismiss_study_room_encouragements($1, $2)", [room, notification.created_at]);
  assert.deepEqual((await getActivity()).inbox, []);
  assert.equal(await pointsBalance(), 5);

  await asUser(member);
  await db.exec("SET test.fail_broadcast = 'true'");
  await assert.rejects(cheer(recipient), /broadcast failed/);
  await db.exec("SET test.fail_broadcast = 'false'");
  await asUser(recipient);
  assert.equal(await pointsBalance(), 5);
  assert.deepEqual((await getActivity()).inbox, []);
  await asUser(member);
  await cheer(recipient);

  await db.exec("RESET ROLE");
  await db.query("UPDATE study_room_encouragements SET created_at = now() - interval '2 minutes' WHERE sender_id = $1", [host]);
  await db.exec(rewards);
  await asUser(host);
  await cheer(recipient);
  await asUser(recipient);
  assert.equal(await pointsBalance(), 15);
  assert.deepEqual((await getActivity()).inbox.map(item => item.reward_points), [5, 5]);

  await db.exec("RESET ROLE");
  const { rows } = await db.query("SELECT user_id, points, source FROM user_points ORDER BY created_at");
  assert.deepEqual(rows, Array.from({ length: 3 }, () => ({ user_id: recipient, points: 5, source: "study_room_cheer" })));
  const broadcasts = await db.query("SELECT topic, event, private FROM realtime.sent");
  assert.deepEqual(broadcasts.rows, Array.from({ length: 3 }, () => ({ topic: inboxTopic, event: "changed", private: true })));
  console.log("Study room cheer rewards passed for legacy inboxes, private delivery, authorization, cooldown, atomic rollback, and repeat cheers.");
} finally {
  await db.close();
}
