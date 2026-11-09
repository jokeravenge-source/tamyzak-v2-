// Isolated PostgreSQL integration check; never connects to the live database.
// npm install --prefix /tmp/tamyazak-pg-tests @electric-sql/pglite
// PGLITE_MODULE=/tmp/tamyazak-pg-tests/node_modules/@electric-sql/pglite/dist/index.js node scripts/test-day-pass.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const db = new PGlite();
const read = (name) => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), "utf8");
const migration = await read("20261109140000_ibn_al_baytar_day_pass.sql");
const drizzle = await readFile(new URL("../drizzle/migrations/0024_ibn_al_baytar_day_pass.sql", import.meta.url), "utf8");
const schoolMigration = await read("20261109153000_al_manahil_al_nafeesa_day_pass.sql");
const schoolDrizzle = await readFile(new URL("../drizzle/migrations/0025_al_manahil_al_nafeesa_day_pass.sql", import.meta.url), "utf8");
const ruqayyaMigration = await read("20261109160000_ruqayya_bint_al_hassan_day_pass.sql");
const ruqayyaDrizzle = await readFile(new URL("../drizzle/migrations/0026_ruqayya_bint_al_hassan_day_pass.sql", import.meta.url), "utf8");
assert.equal(migration.replace(/^BEGIN;\n/m, "").replace(/\nCOMMIT;\s*$/, "\n").trim(), drizzle.trim());
assert.equal(schoolMigration.replace(/^BEGIN;\n/m, "").replace(/\nCOMMIT;\s*$/, "\n").trim(), schoolDrizzle.trim());
assert.equal(ruqayyaMigration.replace(/^BEGIN;\n/m, "").replace(/\nCOMMIT;\s*$/, "\n").trim(), ruqayyaDrizzle.trim());
await db.exec(`
  CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
    $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_user::text $$;
  GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
  CREATE TYPE public.app_role AS ENUM ('admin','user');
  CREATE FUNCTION public.has_role(uid uuid, role public.app_role) RETURNS boolean LANGUAGE sql AS
    $$ SELECT uid = '00000000-0000-4000-8000-000000000099'::uuid $$;
  CREATE TABLE public.courses (id uuid PRIMARY KEY, is_published boolean NOT NULL);
  CREATE TABLE public.course_enrollments (course_id uuid, user_id uuid);
`);
await db.exec(await read("20260526211433_922fc3fb-d83e-43f2-a768-6b8f3b809282.sql"));
await db.exec(await read("20261105190000_premium_word_campaign.sql"));
await db.exec(migration);
await db.exec(schoolMigration);
await db.exec(ruqayyaMigration);
const A = "00000000-0000-4000-8000-000000000001";
const B = "00000000-0000-4000-8000-000000000002";
const C = "00000000-0000-4000-8000-000000000003";
const D = "00000000-0000-4000-8000-000000000004";
const OWNER = "00000000-0000-4000-8000-000000000098";
const ADMIN = "00000000-0000-4000-8000-000000000099";
const COURSE = "00000000-0000-4000-8000-000000000010";
const DRAFT = "00000000-0000-4000-8000-000000000011";
await db.query("INSERT INTO public.courses VALUES ($1,true),($2,false)", [COURSE,DRAFT]);
for (const [id, email] of [[A,"a@example.test"],[B,"b@example.test"],[C,"c@example.test"],[D,"d@example.test"],[OWNER,"jokeravenge@gmail.com"],[ADMIN,"admin@example.test"]]) {
  await db.query("INSERT INTO auth.users VALUES ($1,$2)", [id,email]);
}
async function user(uid) {
  await db.exec("RESET ROLE");
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [uid || ""]);
  await db.exec("SET ROLE authenticated");
}
async function redeem(code) { return (await db.query("SELECT public.redeem_premium_promo($1) AS result", [code])).rows[0].result; }
async function status() { return (await db.query("SELECT public.premium_access_status() AS result")).rows[0].result; }
await user(null); assert.equal((await redeem("ابن البيطار")).reason, "unauthenticated");
await user(A); assert.equal((await redeem("wrong")).reason, "invalid_code");
assert.equal((await status()).is_premium, false);
const first = await redeem("  ابن   البيطار  "); assert.equal(first.ok, true);
assert.equal((await redeem("ابن البيطار")).expires_at, first.expires_at);
for (const result of await Promise.all([redeem("ابن البيطار"), redeem("ابن البيطار")])) assert.equal(result.expires_at, first.expires_at);
assert.equal((await status()).is_premium, true); assert.equal((await status()).full_access, true);
assert.equal((await db.query("SELECT public.can_use_premium_tools() AS ok")).rows[0].ok, true);
assert.equal((await db.query("SELECT public.is_course_enrolled($1) AS ok", [COURSE])).rows[0].ok, true);
assert.equal((await db.query("SELECT public.is_course_enrolled($1) AS ok", [DRAFT])).rows[0].ok, false);
assert.equal((await db.query("SELECT count(*)::int AS n FROM public.subscriptions")).rows[0].n, 1);
const pass = (await db.query("SELECT extract(epoch FROM current_period_end-current_period_start)::int AS seconds FROM public.subscriptions")).rows[0];
assert.equal(pass.seconds, 86400);
await assert.rejects(db.query("UPDATE public.subscriptions SET current_period_end=NULL"));
await assert.rejects(db.query("SELECT * FROM public.premium_promo_codes"));
await user(C);
const schoolFirst = await redeem("  المناهل   النفيسة  ");
assert.equal(schoolFirst.ok, true);
assert.equal((await redeem("المناهل النفيسة")).expires_at, schoolFirst.expires_at);
const schoolPass = (await db.query(
  "SELECT extract(epoch FROM current_period_end-current_period_start)::int AS seconds, product_id FROM public.subscriptions WHERE user_id=$1",
  [C],
)).rows[0];
assert.deepEqual(schoolPass, { seconds: 86400, product_id: "promo-full-access" });
assert.equal((await status()).full_access, true);
await user(D);
const ruqayyaFirst = await redeem("  رقية   بنت   الحسن  ");
assert.equal(ruqayyaFirst.ok, true);
assert.equal((await redeem("رقية بنت الحسن")).expires_at, ruqayyaFirst.expires_at);
const ruqayyaPass = (await db.query(
  "SELECT extract(epoch FROM current_period_end-current_period_start)::int AS seconds, product_id FROM public.subscriptions WHERE user_id=$1",
  [D],
)).rows[0];
assert.deepEqual(ruqayyaPass, { seconds: 86400, product_id: "promo-full-access" });
assert.equal((await status()).full_access, true);
await user(B); assert.equal((await status()).is_premium, false);
await db.exec("RESET ROLE");
await db.query(`INSERT INTO public.subscriptions
  (user_id,paddle_subscription_id,paddle_customer_id,product_id,price_id,status,environment,current_period_end)
  VALUES ($1,'paid-existing','paid-customer','paid-product','paid-price','active','live',NULL)`, [B]);
await user(B); await redeem("ابن البيطار"); assert.equal((await status()).expires_at, null);
await db.exec("RESET ROLE");
await db.query("UPDATE public.subscriptions SET status='canceled' WHERE user_id=$1 AND product_id='promo-full-access'", [B]);
await user(B); assert.equal((await redeem("ابن البيطار")).reason, "already_redeemed");
assert.equal((await status()).is_premium, true); assert.equal((await status()).full_access, false);
await db.exec("RESET ROLE");
assert.equal((await db.query("SELECT current_period_end FROM public.subscriptions WHERE paddle_subscription_id='paid-existing'")).rows[0].current_period_end, null);
await db.query("UPDATE public.premium_promo_redemptions SET redeemed_at=now()-interval '25 hours' WHERE user_id=$1", [A]);
await db.query("UPDATE public.subscriptions SET current_period_start=now()-interval '25 hours',current_period_end=now()-interval '1 hour' WHERE user_id=$1", [A]);
await user(A);
assert.equal((await status()).is_premium, false); assert.equal((await status()).full_access, false);
assert.equal((await redeem("ابن البيطار")).reason, "already_redeemed");
assert.equal((await db.query("SELECT public.can_use_premium_tools() AS ok")).rows[0].ok, false);
assert.equal((await db.query("SELECT public.is_course_enrolled($1) AS ok", [COURSE])).rows[0].ok, false);
await db.exec("RESET ROLE");
await db.exec("UPDATE public.premium_promo_codes SET starts_at=now()-interval '1 day',expires_at=now()+interval '1 hour' WHERE id='future-2026-11'");
await user(A); assert.equal((await redeem("المستقبل")).ok, true);
assert.equal((await status()).is_premium, true); assert.equal((await status()).full_access, false);
await db.exec("RESET ROLE; UPDATE public.premium_promo_codes SET expires_at=now()-interval '1 second' WHERE id='future-2026-11'");
await user(A); assert.equal((await status()).is_premium, false);
await db.exec("RESET ROLE");
await db.query("INSERT INTO public.course_enrollments VALUES ($1,$2)", [COURSE,A]);
await user(A); assert.equal((await db.query("SELECT public.is_course_enrolled($1) AS ok", [COURSE])).rows[0].ok, true);
for (const id of [OWNER, ADMIN]) { await user(id); assert.equal((await status()).is_premium, true); assert.equal((await status()).expires_at, null); }
await db.exec("RESET ROLE; SET ROLE anon");
await assert.rejects(db.query("SELECT public.redeem_premium_promo('ابن البيطار')"));
await assert.rejects(db.query("SELECT public.premium_access_status()"));
console.log("PASS: Ibn Al-Baytar, Al-Manahil Al-Nafeesa, and Ruqayya Bint Al-Hassan 24-hour codes, deadlines, idempotence, replay rejection, access controls, and paid/admin/enrollment preservation.");
await db.close();
