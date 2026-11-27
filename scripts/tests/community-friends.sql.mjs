// Runs in an isolated PostgreSQL-compatible database.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const migration = readFileSync(new URL("../../supabase/migrations/20261127170000_community_friends.sql", import.meta.url), "utf8");
assert.equal(migration, readFileSync(new URL("../../drizzle/migrations/0068_community_friends.sql", import.meta.url), "utf8"));
const db = new PGlite();
const [owner, friend, other, missing] = [1, 2, 3, 4].map(id => `00000000-0000-4000-8000-00000000000${id}`);

try {
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE TABLE public.profiles (user_id uuid UNIQUE, display_name text);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO authenticated;
    GRANT SELECT ON public.profiles TO authenticated;
  `);
  for (const id of [owner, friend, other]) {
    await db.query("INSERT INTO auth.users (id) VALUES ($1)", [id]);
    await db.query("INSERT INTO profiles VALUES ($1, $2)", [id, id === friend ? "Ali Hassan" : "Student"]);
  }
  await db.exec(migration);
  const asUser = async (id, role = "authenticated") => {
    await db.exec("RESET ROLE");
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id ?? ""]);
    await db.exec(`SET ROLE ${role}`);
  };
  const save = (ownerId, friendId) => db.query(
    "INSERT INTO community_friends (owner_id, friend_id) VALUES ($1, $2) ON CONFLICT (owner_id, friend_id) DO NOTHING",
    [ownerId, friendId],
  );
  const list = async () => (await db.query(
    "SELECT p.user_id, p.display_name FROM community_friends cf JOIN profiles p ON p.user_id = cf.friend_id ORDER BY cf.friend_id",
  )).rows;

  await asUser(owner);
  await save(owner, friend);
  await save(owner, friend);
  assert.deepEqual(await list(), [{ user_id: friend, display_name: "Ali Hassan" }]);
  await assert.rejects(save(other, friend), /row-level security/);
  await assert.rejects(save(owner, owner), /community_friends_no_self/);
  await assert.rejects(save(owner, missing), /foreign key/);

  await asUser(friend);
  assert.deepEqual(await list(), []);
  await db.query("DELETE FROM community_friends WHERE owner_id = $1", [owner]);
  await save(friend, other);
  assert.deepEqual(await list(), [{ user_id: other, display_name: "Student" }]);
  await asUser(null, "anon");
  await assert.rejects(list(), /permission denied/);

  await db.exec("RESET ROLE");
  await db.exec(migration);
  await db.query("UPDATE profiles SET display_name = 'Ali Kareem' WHERE user_id = $1", [friend]);
  await asUser(owner);
  assert.deepEqual(await list(), [{ user_id: friend, display_name: "Ali Kareem" }]);
  await db.query("DELETE FROM community_friends WHERE owner_id = $1 AND friend_id = $2", [owner, friend]);
  assert.deepEqual(await list(), []);
  await save(owner, friend);
  await db.exec("RESET ROLE");
  await db.query("DELETE FROM auth.users WHERE id = $1", [friend]);
  assert.deepEqual(await list(), []);
  console.log("Community friends passed for account privacy, duplicate saves, current names, removal, and account deletion.");
} finally {
  await db.close();
}
