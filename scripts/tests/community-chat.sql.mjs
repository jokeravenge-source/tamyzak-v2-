// Runs against an isolated PostgreSQL-compatible database.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const migration = readFileSync(new URL("../../supabase/migrations/20261127180000_community_chat.sql", import.meta.url), "utf8");
assert.equal(migration, readFileSync(new URL("../../drizzle/migrations/0069_community_chat.sql", import.meta.url), "utf8"));
const mediaMigration = readFileSync(new URL("../../supabase/migrations/20261127190000_community_chat_photos_reactions.sql", import.meta.url), "utf8");
assert.equal(mediaMigration, readFileSync(new URL("../../drizzle/migrations/0070_community_chat_photos_reactions.sql", import.meta.url), "utf8"));
const db = new PGlite();
const [author, student, moderator, post] = [1, 2, 3, 4].map(id => `00000000-0000-4000-8000-00000000000${id}`);

try {
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE SCHEMA storage;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    CREATE TABLE storage.objects (bucket_id text, name text, PRIMARY KEY (bucket_id, name));
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA storage TO authenticated;
    GRANT SELECT, INSERT, DELETE ON storage.objects TO authenticated;
    CREATE TABLE public.profiles (user_id uuid UNIQUE, display_name text);
    CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'moderator');
    CREATE TABLE public.user_roles (user_id uuid, role public.app_role);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION public.has_role(user_account uuid, account_role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER AS
      $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_account AND role = account_role) $$;
    GRANT USAGE ON SCHEMA auth TO authenticated;
    GRANT SELECT ON public.profiles TO authenticated;
  `);
  for (const id of [author, student, moderator]) await db.query("INSERT INTO auth.users VALUES ($1)", [id]);
  await db.query("INSERT INTO profiles VALUES ($1, 'Ali'), ($2, 'Noor')", [author, student]);
  await db.query("INSERT INTO user_roles VALUES ($1, 'moderator')", [moderator]);
  await db.exec(migration);

  const asUser = async (id, role = "authenticated") => {
    await db.exec("RESET ROLE");
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id ?? ""]);
    await db.exec(`SET ROLE ${role}`);
  };
  const publish = (by, body) => db.query(
    "INSERT INTO community_posts (id, author_id, body) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
    [post, by, body],
  );
  const feed = async () => (await db.query("SELECT * FROM list_community_chat_posts()")).rows;
  const thread = async () => (await db.query("SELECT * FROM list_community_chat_comments($1)", [post])).rows;

  await asUser(null, "anon");
  await assert.rejects(feed(), /permission denied/);
  await assert.rejects(publish(author, "Can't post anonymously"), /permission denied/);
  await asUser(author);
  await assert.rejects(publish(student, "Wrong account"), /row-level security/);
  await assert.rejects(publish(author, " \n\t "), /check constraint/);
  await assert.rejects(publish(author, "a".repeat(2001)), /check constraint/);
  await assert.rejects(db.query("INSERT INTO community_posts (author_id, body, created_at) VALUES ($1, 'Invalid date', now())", [author]), /permission denied/);
  await publish(author, "Physics question");
  await publish(author, "Retry");
  assert.deepEqual((await feed()).map(row => [row.author_name, row.body, row.comment_count]), [["Ali", "Physics question", 0]]);

  await asUser(student);
  await db.query("INSERT INTO community_comments (post_id, author_id, body) VALUES ($1, $2, 'My answer')", [post, student]);
  await assert.rejects(db.query("INSERT INTO community_comments (post_id, author_id, body) VALUES ($1, $2, 'Wrong account')", [post, author]), /row-level security/);
  await assert.rejects(db.query("INSERT INTO community_comments (post_id, author_id, body) VALUES ($1, $2, 'Missing post')", [moderator, student]), /foreign key/);
  assert.equal((await feed())[0].comment_count, 1);
  assert.deepEqual((await thread()).map(row => [row.author_name, row.body]), [["Noor", "My answer"]]);
  await db.query("DELETE FROM community_posts WHERE id = $1", [post]);
  assert.equal((await feed()).length, 1);
  await asUser(author);
  await db.query("DELETE FROM community_comments WHERE post_id = $1", [post]);
  assert.equal((await thread()).length, 1);
  await asUser(moderator);
  await db.query("DELETE FROM community_posts WHERE id = $1", [post]);
  assert.equal((await feed()).length, 0);
  assert.equal((await thread()).length, 0);

  await db.exec("RESET ROLE");
  await db.exec(migration);
  await db.query("INSERT INTO community_posts (author_id, body) SELECT $1, 'Post ' || n FROM generate_series(1, 25) AS n", [author]);
  await asUser(student);
  const first = await feed();
  assert.equal(first.length, 21);
  const cursor = first[19];
  const remaining = (await db.query("SELECT * FROM list_community_chat_posts($1, $2)", [cursor.created_at, cursor.id])).rows;
  assert.equal(remaining.length, 5);
  assert.equal(remaining[0].id, first[20].id);

  await db.exec("RESET ROLE");
  await db.exec(mediaMigration);
  await db.exec(mediaMigration);
  const photo = `${author}/${post}/1.png`;
  const attach = paths => db.query("INSERT INTO community_posts (id, author_id, body, photo_paths) VALUES ($1, $2, '', $3)", [post, author, paths]);
  const upload = path => db.query("INSERT INTO storage.objects VALUES ('community-chat-photos', $1)", [path]);
  const visiblePhotos = async () => (await db.query("SELECT name FROM storage.objects")).rows;
  const react = async reaction => (await db.query("SELECT * FROM set_community_chat_reaction($1, $2)", [post, reaction])).rows[0];
  const postWithMedia = async () => (await db.query("SELECT * FROM list_community_chat_posts_v2() WHERE id = $1", [post])).rows[0];

  await asUser(author);
  await assert.rejects(attach([]), /check constraint/);
  await assert.rejects(attach([photo]), /missing photo attachment/);
  await upload(photo);
  await assert.rejects(attach([photo, photo]), /duplicate photo/);
  await asUser(student);
  assert.deepEqual(await visiblePhotos(), []);
  await assert.rejects(upload(`${author}/${post}/2.png`), /row-level security/);
  await asUser(author);
  await attach([photo]);
  await db.query("DELETE FROM storage.objects WHERE name = $1", [photo]);
  assert.deepEqual(await visiblePhotos(), [{ name: photo }]);
  await asUser(student);
  assert.deepEqual(await visiblePhotos(), [{ name: photo }]);
  assert.deepEqual((await postWithMedia()).photo_paths, [photo]);
  assert.deepEqual(await react("like"), { like_count: 1, dislike_count: 0, viewer_reaction: "like" });
  assert.deepEqual(await react("like"), { like_count: 1, dislike_count: 0, viewer_reaction: "like" });
  assert.deepEqual(await react("dislike"), { like_count: 0, dislike_count: 1, viewer_reaction: "dislike" });
  await assert.rejects(react("unknown"), /check constraint/);
  await assert.rejects(db.query("SELECT * FROM community_post_reactions"), /permission denied/);
  await asUser(author);
  assert.deepEqual(await react("like"), { like_count: 1, dislike_count: 1, viewer_reaction: "like" });
  await asUser(student);
  assert.equal((await postWithMedia()).viewer_reaction, "dislike");
  assert.deepEqual(await react(null), { like_count: 1, dislike_count: 0, viewer_reaction: null });
  await asUser(null, "anon");
  await assert.rejects(react("like"), /permission denied/);

  await asUser(author);
  await db.query("DELETE FROM community_posts WHERE id = $1", [post]);
  await asUser(student);
  assert.deepEqual(await visiblePhotos(), []);
  assert.deepEqual(await react(null), { like_count: 0, dislike_count: 0, viewer_reaction: null });
  await asUser(author);
  await db.query("DELETE FROM storage.objects WHERE name = $1", [photo]);
  assert.deepEqual(await visiblePhotos(), []);
  console.log("Community Chat passed for posts, threaded comments, pagination, private photo attachments, and idempotent per-user reactions.");
} finally {
  await db.close();
}
