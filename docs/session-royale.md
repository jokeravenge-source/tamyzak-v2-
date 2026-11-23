# Scheduled sessions and Battle Royale

The existing challenge group destination is used for both posts. It is set under
**لوحة الأدمن → كروب التحدّيات** (currently `@tamayzak`). The room button goes to
`https://tamyazak.site/room?code=37ECJK`. The worker verifies that the configured
`@sovforcejoin_bot` can post there before reserving a delivery. This does not change
the bot webhook, subscription checks, or the current Telegram battle workflow.

## Deploy

1. Apply `20261123090000_session_royale.sql` in the Supabase project.
2. Deploy the `session-telegram` Edge Function (its handler checks the service-role
   bearer independently of gateway JWT verification).
3. Apply `20261123090100_session_telegram_schedule.sql`. It reuses the existing
   `pg_cron`, `pg_net` and service-role configuration used by study reminders.
4. Publish the frontend. Confirm the next scheduled post and its room button in
   the existing group. Verify the vote and challenge with two signed-in students.

Cron runs every minute. A start post is due at 03:00, 06:00, 09:00, 12:00,
15:00, 18:00, 21:00, and 00:00 Baghdad time. The next session's start and the
previous session's vote start at the same boundary. Students in the main study
room can vote during the first three minutes. The server tallies whole
combinations of subject, chapter and curriculum, with the earliest ballot for
that combination breaking a tie. Scheduled topics come from the published SQL
MCQ bank. A round is skipped when there is no usable winning ballot. The winner
appears in the study room and is posted to the same Telegram group, with joining
open until minute five. Scheduled rounds require at least two actual players.

Search by name in Live Battle to invite up to ten students to one private room.
Invitees must accept first. The host starts with at least two participants and
can leave to cancel a waiting room. Single-friend and random matches continue
to use their existing flows. Group rounds score each answer once, with the
database deciding the deadline and not returning the round's answer key.

`session_telegram_posts` records a delivery reservation for each slot and post
kind. Permission or lookup failures before this reservation may be retried
during the send window. After sending, uncertain outcomes are recorded and never
resent automatically.

`scripts/test-session-royale-db.mjs` uses PGlite (or the existing
`NADAWI_PGLITE_MODULE` path) to test Baghdad midnight, whole-ballot scoring,
single votes per student, invitations, authorization and answer timing.
