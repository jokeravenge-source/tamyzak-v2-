# Telegram challenge channel

Live Battle has an optional **Find an opponent in the channel / دوّر منافس بالقناة**
action. The student explicitly publishes their display name and selected round
settings. Existing room-code, name-search, random queue and solo practice remain
available without joining Telegram. No mandatory channel subscription is added.

The existing `sovforcejoin_bot` connection sends one channel post containing the
host's display name, subject, chapter/all chapters, question language, actual
question count, 25-second question limit, expiry in Baghdad time and a Join button.
Questions/answer keys, emails and the private realtime room key are never posted.

## Deployment and setup

1. Apply `supabase/migrations/20261121190000_battle_channel.sql`.
2. Deploy the new `battle-channel` Edge Function and updated `telegram-webhook`.
   The existing webhook registration can stay: private messages are already enabled.
3. Keep the existing Lovable Telegram connector bound to `sovforcejoin_bot`, using
   the existing server secrets `LOVABLE_API_KEY` and `TELEGRAM_API_KEY`. Do not put
   these in frontend variables or the channel settings form. `PUBLIC_SITE_URL` is
   optional, defaults to `https://tamyazak.site`, and must be the canonical HTTPS
   site used for login. This feature does not replace the bot's webhook.
4. Create the private Telegram channel and add the bot as an administrator with
   permission to post and edit its messages. Forward a channel post to the bot
   privately to obtain its `-100…` chat ID. The helper reports only the forwarded
   channel ID and never changes app settings. Protected forwarding may prevent
   this helper; use the channel ID from the connected Telegram setup in that case.
5. In the owner's admin dashboard choose **قناة التحدّيات** from the section
   dropdown. Enter the numeric ID and channel invite URL, enable posting, and save.
   The backend verifies the authenticated admin role, bot identity, channel type
   and posting permissions before enabling. Verification sends no test post.
6. Publish the frontend. Signed-in students see the new action once configured.

No bot token is collected in the admin form. Configuration is disabled by default.
The application cannot create the Telegram channel or grant bot admin rights on
the channel owner's behalf without that account's Telegram access.

## Room lifecycle

- A waiting invite lasts 3 minutes. Keep the host's waiting page open. Heartbeats
  run while waiting; claims reject a host not seen in 35 seconds.
- An authenticated first guest claims a row under a database lock. A second
  click by that same guest is idempotent; other guests receive a full/expired
  message. Opening one's own invite asks the host to return to their waiting page.
- The private UUID realtime key is returned only to the host and claimed guest.
  The existing battle engine supplies the host's selected bank questions to both
  players and starts once both are present. It retains its existing client-based
  gameplay/scoring; this is not a replacement authoritative grading service.
- The invite survives an OAuth return to `/` in local storage (10-minute TTL).
  After login Live Battle claims that exact invite, with no manual room code.
  The server's shorter invite expiry and host liveness remain authoritative.
- Filled, started, cancelled and expired messages have their Join button removed
  when a live participant syncs the state. Host cancellation and guest acceptance
  sync immediately. A crashed host cannot edit its post: the post includes a fixed
  expiry, stale claims are refused, and the next attempted join settles/edits it.
  There is no background cron dependency or claim that all offline posts are
  edited at the exact expiry instant.
- One active invite per host and a database-enforced 60-second posting cooldown
  reduce repeated channel messages. A client UUID makes create/retry idempotent;
  a conditional sending reservation prevents concurrent duplicate sends. An
  uncertain gateway timeout is not automatically resent; the invite is closed
  and the student receives an unconfirmed-delivery message. Exactly-once Telegram
  delivery across a remote timeout is not promised.
- Cancelling or leaving a waiting host screen closes that invite. The server
  still refuses a stale host if the browser never delivers its cleanup request.

## Validation

`scripts/test-battle-channel-db.mjs` executes the migration in PGlite/PostgreSQL:
auth/RLS/private config, idempotent create/send reservations, single-guest claim,
own-link/third-player denial, host-only actions, expiry/heartbeat and cooldown.
Use the same `NADAWI_PGLITE_MODULE` optional module path as the Nadawi DB test.
Vitest covers post escaping and lifecycle buttons, delivery failures, invite
storage through OAuth, host/guest hook lifecycle, cancellation during publication,
round settings in Live Battle and the admin setup form. Production sending still
requires the configured channel and deployed functions; tests send no Telegram
messages.

Telegram API reference: https://core.telegram.org/bots/api#sendmessage and
https://core.telegram.org/bots/api#editmessagetext.
