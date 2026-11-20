# Live Battle

The entry screen shares one subject/chapter selection across friend rooms,
random matching and solo practice. Question language, round size (default 10)
and display name are under Round options. Joining a six-digit room code remains
available even if the local bank cannot load.

`loadRaceQuestionBank` loads the existing paginated `mcq_banks` and built-in MCQ
sources. Available subjects and chapters come from those validated rows.
`selectBattleQuestions` preserves each row's original choices, answer index and
explanation. There is no PDF upload, AI generation or flashcard-based fallback.
Empty selections stay empty; small banks produce shorter rounds.

The host broadcasts one selected question set to both players. Random queues
include bank language, subject, chapter and requested count. Answers are counted
once per player/question; the host advances after both answers or the 25-second
limit. Losing a player stops the match without declaring a winner. Solo practice
uses the same bank and shows the stored explanation before the student continues.

Room entry now offers Code and Search by name. Name search reads only public
student IDs/display names, excludes the sender and cancels stale searches.
Sending a challenge saves the chosen bank subject/chapter/language and actual
question count in `battle_invites`, then hosts that same room. The recipient's
global in-app notification offers Accept & join / Decline. The join event also
works when Live Battle is already mounted. Pending invitations are cancelled
when the sender leaves and expire after three minutes. Acceptance cannot
interrupt an ongoing battle.

Apply `20261120160000_battle_invite_realtime.sql` before publishing the frontend.
It enables realtime invitation changes and limits client updates to status:
senders can cancel pending invitations; recipients can accept/decline fresh ones.
The existing participant-only SELECT policy remains. The notification watcher
uses realtime with polling/visibility fallback; it is an in-app notification,
not an operating-system push while the app is closed.

The existing points RPC is retained. No new Edge Function is required. Local tests simulate two realtime
clients, duplicate messages, presence sync, timeout races and disconnection;
they do not replace a live two-device Supabase check after publication.
