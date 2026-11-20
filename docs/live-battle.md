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

The existing points RPC is retained. No new database migration or Edge Function
is required: publish the updated frontend. Local tests simulate two realtime
clients, duplicate messages, presence sync, timeout races and disconnection;
they do not replace a live two-device Supabase check after publication.
