import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { PGlite } = await import(process.env.NADAWI_PGLITE_MODULE || "@electric-sql/pglite");
const db = new PGlite();
const migration = (name) => readFile(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), "utf8");
await db.exec(`
  CREATE ROLE anon;
  CREATE ROLE authenticated;
  CREATE ROLE service_role BYPASSRLS;
  CREATE SCHEMA auth;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
    SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
  $$;
  GRANT USAGE ON SCHEMA auth TO authenticated;
  CREATE TABLE profiles(user_id uuid PRIMARY KEY, display_name text);
  CREATE TABLE study_rooms(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),code text,is_active boolean,subject text);
  CREATE TABLE study_room_members(room_id uuid,user_id uuid,last_seen_at timestamptz NOT NULL DEFAULT now(),UNIQUE(room_id,user_id));
  CREATE TABLE active_sessions(user_id uuid PRIMARY KEY,subject text,last_seen_at timestamptz,is_running boolean);
  GRANT SELECT ON study_rooms,study_room_members,active_sessions TO service_role;
  CREATE TABLE mcq_banks(subject text,chapter integer,language text,question text,choices jsonb,answer_index integer);
  CREATE TABLE battle_invites(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),from_user_id uuid,to_user_id uuid,
    from_name text,room_code text,subject text,chapter int,language text,question_count int,status text);
  ALTER TABLE battle_invites ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can send invites" ON battle_invites FOR INSERT TO authenticated WITH CHECK (auth.uid()=from_user_id);
  INSERT INTO study_rooms(code,is_active) VALUES ('37ECJK',true);
  INSERT INTO mcq_banks VALUES
    ('physics',1,'ar','Question A','["A","B"]',0),
    ('physics',2,'en','Question B','["A","B"]',1),
    ('biology',7,'ar','Broken','{}',1);
`);
await db.exec(await migration("20261123090000_session_royale"));
await db.exec(await migration("20261128123000_session_telegram_break"));
const ids = Array.from({length: 13}, (_, i) => `00000000-0000-4000-8000-${String(i+1).padStart(12, "0")}`);
for (const [i, id] of ids.entries()) await db.query("INSERT INTO profiles VALUES($1,$2)", [id, `Student ${i+1}`]);
const user = (id) => db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [id]);
const value = async (sql, args = []) => (await db.query(sql, args)).rows[0]?.result;
const questions = JSON.stringify([{ q: "One?", choices: ["One", "Two"], answer: 0 }]);
assert.equal(await value("SELECT _royale_slot('2026-11-22 23:59:58+03')::text result"),"2026-11-22 18:00:00+00");
assert.equal(await value("SELECT _royale_slot('2026-11-23 00:00:01+03')::text result"),"2026-11-22 21:00:00+00");
await user(ids[0]);
assert.equal(await value("SELECT session_royale_poll() result"),null);
const topic = { subject:"physics",chapter:1,language:"ar" };
const create = (list) => value("SELECT create_study_royale($1,'physics',1,'ar',$2) result",[list,questions]);
await assert.rejects(() => create(ids.slice(1,12)),/INVALID_INVITEES/);
await assert.rejects(() => create([ids[1],ids[1]]),/INVALID_INVITEES/);
await assert.rejects(() => create([ids[0],ids[1]]),/INVALID_INVITEES/);
const id = await create(ids.slice(1,11));
assert.equal(await value("SELECT count(*)::int result FROM battle_invites WHERE room_code=$1",[`br:${id}`]),10);
await assert.rejects(() => create([ids[1]]),/ROOM_ALREADY_OPEN/);
const act = (action, index = null, choice = null) => value("SELECT study_royale($1,$2,$3,$4) result",[id,action,index,choice]);
await assert.rejects(() => act("start"),/NEED_TWO_PLAYERS/);
await user(ids[1]);
await assert.rejects(() => act("join"),/INVITE_REQUIRED/);
await db.query("UPDATE battle_invites SET status='accepted' WHERE to_user_id=$1",[ids[1]]);
assert.equal((await act("join")).players.length,2);
assert.equal((await act("join")).players.length,2);
for (const idOfStudent of ids.slice(2,11)) {
  await user(idOfStudent);
  await db.query("UPDATE battle_invites SET status='accepted' WHERE to_user_id=$1",[idOfStudent]);
  await act("join");
}
await user(ids[0]);
assert.equal((await act("start")).players.length,11);
await db.query("UPDATE session_royales SET starts_at=clock_timestamp()-interval '1 second' WHERE id=$1",[id]);
const playing = await act("status");
assert.deepEqual(playing.question,{q:"One?",choices:["One","Two"]});
assert.equal((await act("answer",0,0)).picked,0);
assert.equal((await act("answer",0,1)).picked,0);
await db.query("UPDATE session_royales SET starts_at=clock_timestamp()-interval '26 seconds' WHERE id=$1",[id]);
assert.equal((await act("status")).players[0].score,1);
await db.exec("SET ROLE authenticated");
await assert.rejects(() => db.query("SELECT _royale_bank('physics',1,'ar')"),/permission denied/);
await assert.rejects(() => db.query("SELECT * FROM session_royales"),/permission denied/);
await db.exec("RESET ROLE");

// Pin the slot to the voting phase to exercise a real ballot and its change.
await db.exec(`CREATE OR REPLACE FUNCTION _royale_slot(_at timestamptz) RETURNS timestamptz LANGUAGE sql IMMUTABLE AS $$
  SELECT '2099-11-23 00:00:00+03'::timestamptz
$$;`);
for(const idOfStudent of ids.slice(0,3)) await db.query("INSERT INTO study_room_members(room_id,user_id) SELECT id,$1 FROM study_rooms",[idOfStudent]);
const vote = (selected) => value("SELECT session_royale_poll($1) result",[selected ? JSON.stringify(selected) : null]);
const poll = await vote(topic);
assert.equal(poll.topics.length,2);
assert.deepEqual(poll.vote,topic);
const english = {subject:"physics",chapter:2,language:"en"};
assert.deepEqual((await vote(english)).vote,english);
assert.equal(await value("SELECT count(*)::int result FROM session_royale_votes"),1);
await assert.rejects(() => vote({subject:"biology",chapter:7,language:"ar"}),/INVALID_TOPIC/);
await user(ids[1]); await vote(topic);
await user(ids[2]); await vote(english);
await db.query("UPDATE session_royales SET slot=clock_timestamp()-interval '4 minutes' WHERE id=$1",[poll.id]);
const slot = await value("SELECT slot::text result FROM session_royales WHERE id=$1",[poll.id]);
assert.equal(await value("SELECT _royale_finalize($1) result",[slot]),poll.id);
assert.equal(await value("SELECT _royale_finalize($1) result",[slot]),poll.id);
assert.equal(await value("SELECT chapter result FROM session_royales WHERE id=$1",[poll.id]),2);
await user(ids[12]);
await assert.rejects(() => value("SELECT study_royale($1,'join') result",[poll.id]),/ROOM_MEMBERS_ONLY/);
await user(ids[1]);
assert.equal((await value("SELECT study_royale($1,'join') result",[poll.id])).players.length,1);
assert.equal((await db.query("INSERT INTO session_telegram_posts(slot,kind) VALUES($1,'battle') ON CONFLICT DO NOTHING RETURNING *",[slot])).rows.length,1);
assert.equal((await db.query("INSERT INTO session_telegram_posts(slot,kind) VALUES($1,'battle') ON CONFLICT DO NOTHING RETURNING *",[slot])).rows.length,0);
// The count includes newly joined students and fresh clocks even when paused.
await db.query("UPDATE study_room_members SET last_seen_at=now()-interval '16 minutes' WHERE user_id IN ($1,$2)", [ids[1],ids[2]]);
await db.query("INSERT INTO active_sessions VALUES ($1,'general',now(),false),($2,'physics',now(),true),($3,'general',now(),true)", [ids[1],ids[2],ids[3]]);
await db.exec("SET ROLE authenticated");
await assert.rejects(() => db.query("SELECT session_telegram_room_count()"),/permission denied/);
await db.exec("SET ROLE service_role");
assert.equal(await value("SELECT session_telegram_room_count() result"),2);
await db.exec("RESET ROLE");
await db.query("UPDATE active_sessions SET last_seen_at=now()-interval '16 minutes' WHERE user_id=$1", [ids[1]]);
assert.equal(await value("SELECT session_telegram_room_count() result"),1);
await db.query("DELETE FROM study_room_members");
assert.equal(await value("SELECT session_telegram_room_count() result"),0);
await db.query("UPDATE study_rooms SET is_active=false WHERE code='37ECJK'");
assert.equal(await value("SELECT session_telegram_room_count() result"),null);
for (const kind of ["session","break"]) {
  const insertPost = () => db.query("INSERT INTO session_telegram_posts(slot,kind) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING *",[slot,kind]);
  assert.equal((await insertPost()).rows.length,1);
  assert.equal((await insertPost()).rows.length,0);
}
await assert.rejects(() => db.query("INSERT INTO session_telegram_posts(slot,kind) VALUES($1,'other')",[slot]),/check constraint/);
await db.close();
console.log("Session Royale and Telegram break DB checks passed");
