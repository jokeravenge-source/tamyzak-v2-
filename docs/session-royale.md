# Scheduled sessions and Battle Royale

The session and break use `SESSION_TELEGRAM_CHAT_ID` when configured in the
Edge Function environment. Set it to the sessions channel’s public username,
public Telegram URL, or negative numeric chat ID. The default destination and the
Battle Royale destination come from **لوحة الأدمن → كروب التحدّيات**
(seed value `@tamayzak`). The room button opens
`https://tamyazak.site/room?code=37ECJK`. The worker verifies that
`@sovforcejoin_bot` can post to the selected chat before reserving a delivery.

## Deploy

1. On new installations apply `20261123090000_session_royale.sql` and
   `20261123090100_session_telegram_schedule.sql` to set up the existing worker
   and its `pg_cron` job.
2. Apply `20261128123000_session_telegram_break.sql`.
3. Deploy the `session-telegram` Edge Function. The checked-in job uses the
   configured service-role bearer. Platform-managed schedules can use the cron secret.
4. Confirm both posts in the sessions destination at the next Baghdad boundary.

Cron runs every minute. A start post is due at 03:00, 06:00, 09:00, 12:00,
15:00, 18:00, 21:00, and 00:00 Baghdad time. The five-minute break notice is
due at that same boundary and gives the return time in Baghdad. Both notices
show a snapshot of the main room’s member count, using the room’s 15-minute
membership and timer activity window. Paused students with a recent heartbeat
count during the break. The previous session’s vote opens at the same boundary.
Students in the main study
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
