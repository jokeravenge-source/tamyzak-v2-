// Run against an isolated PostgreSQL-compatible PGlite database.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const sql = await readFile(new URL("../../supabase/migrations/20261128000000_paper_review.sql", import.meta.url), "utf8");
assert.equal(sql, await readFile(new URL("../../drizzle/migrations/0074_paper_review.sql", import.meta.url), "utf8"));
const db = new PGlite();
const id = number => "00000000-0000-4000-8000-" + String(number).padStart(12, "0");
const first = id(1), second = id(2), premium = id(3);
const hash = "f".repeat(64);
const lesson = { status: "reviewed", summary: "Unit conversion", practice: { correctIndex: 1, explanation: "Micro is 10^-6." } };
const result = async (sql, args) => (await db.query(sql, args)).rows[0].result;
const status = (user, premium = false) => result("SELECT public.paper_review_status($1,$2) AS result", [user, premium]);
const reserve = (user, key, premium = false, digest = hash) => result("SELECT public.reserve_paper_review($1,$2,$3,$4) AS result", [user, key, digest, premium]);
const settle = (user, key, lease, report) => result("SELECT public.settle_paper_review($1,$2,$3,$4) AS result", [user, key, lease, report]);
const answer = (user, key, choice) => result("SELECT public.answer_paper_review($1,$2,$3) AS result", [user, key, choice]);

try {
  await db.exec(`
    CREATE SCHEMA auth;
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${first}'), ('${second}'), ('${premium}');
  `);
  await db.exec(sql);
  await db.exec(sql);
  const isolation = await db.query(`
    SELECT has_function_privilege('authenticated','public.reserve_paper_review(uuid,uuid,text,boolean)','EXECUTE') AS student_reserves,
           has_function_privilege('anon','public.paper_review_status(uuid,boolean)','EXECUTE') AS anon_status,
           has_function_privilege('service_role','public.reserve_paper_review(uuid,uuid,text,boolean)','EXECUTE') AS server_reserves,
           has_table_privilege('authenticated','public.paper_reviews','SELECT') AS student_reads
  `);
  assert.deepEqual(isolation.rows[0], { student_reserves: false, anon_status: false, server_reserves: true, student_reads: false });

  const initial = await status(first);
  assert.equal(initial.remaining, 1);
  assert.equal(new Date(initial.resetAt).getUTCHours(), 21);
  assert.equal(new Date(initial.resetAt).getUTCMinutes(), 0);

  const leases = await Promise.all([reserve(first, id(10)), reserve(first, id(11))]);
  assert.deepEqual(leases.map(lease => lease.status).sort(), ["pending", "reserved"]);
  const index = leases.findIndex(lease => lease.status === "reserved");
  const current = id(10 + index), token = leases[index].leaseId;
  assert.equal((await status(first)).pending, true);
  assert.equal(await settle(first, current, id(99), lesson), false, "a stale lease cannot write a report");
  assert.equal(await settle(first, current, token, null), true, "service failure restores quota");
  assert.equal((await status(first)).remaining, 1);

  const photo = await reserve(first, id(12));
  assert.equal(photo.status, "reserved");
  assert.equal(await settle(first, id(12), photo.leaseId, lesson), true);
  assert.equal(await settle(first, id(12), photo.leaseId, null), false, "late cleanup cannot delete a review");
  assert.equal((await reserve(first, id(13))).status, "daily_limit");
  assert.equal((await reserve(first, id(12), false, "a".repeat(64))).status, "conflict");
  assert.deepEqual(await reserve(first, id(12)), { status: "cached", report: lesson, practicePassed: false });
  assert.equal(await answer(second, id(12), 1), null, "another student cannot grade this review");
  assert.equal((await answer(first, id(12), 0)).correct, false);
  assert.equal((await status(first)).completedPractices, 0);
  assert.equal((await answer(first, id(12), 1)).correct, true);
  assert.equal((await answer(first, id(12), 1)).correct, true);
  assert.equal((await status(first)).completedPractices, 1, "retries never repeat credit");
  assert.equal((await reserve(first, id(12))).practicePassed, true);

  await db.exec("UPDATE public.paper_reviews SET free_day = free_day - 1 WHERE completed_at IS NOT NULL");
  assert.equal((await status(first)).remaining, 1);
  assert.equal((await reserve(first, id(13))).status, "reserved", "new Baghdad day");
  assert.equal((await status(second)).remaining, 1);
  const old = await reserve(second, id(14));
  await db.exec("UPDATE public.paper_reviews SET created_at = now() - interval '4 minutes' WHERE completed_at IS NULL");
  const fresh = await reserve(second, id(14));
  assert.notEqual(fresh.leaseId, old.leaseId);
  assert.equal(await settle(second, id(14), old.leaseId, lesson), false);

  assert.equal((await status(premium, true)).remaining, null);
  for (const number of [30, 31, 32]) {
    const paid = await reserve(premium, id(number), true);
    assert.equal(paid.status, "reserved");
    assert.equal(await settle(premium, id(number), paid.leaseId, lesson), true);
  }
  assert.equal((await status(premium, true)).remaining, null);
  console.log("Paper review SQL verified: Baghdad calendar, concurrent reservation, retries, Premium bypass, private attempts, and recorded practice.");
} finally {
  await db.close();
}
