# Timed Nadawi Unit Two competition

The home card keeps the fixed 20 November 2026, 20:30 Asia/Baghdad release.
The database independently enforces the opening time. Authenticated students get
one official attempt, persisted in `nadawi_contest_attempts`.

## Rules

- All 41 automatically marked questions participate: 24 MCQs and 17 one-word
  answers. Each correct answer earns one competition point; wrong/expired = 0.
- Each question has 30 seconds, starting from its server-side opening time.
  Submission advances immediately. There is no return, pause or reset.
- Both question order and MCQ choice order are shuffled once on the server and
  snapshotted per attempt. Reopening the dialog resumes the same attempt.
- The server records submitted answers, correctness, question durations and the
  total elapsed milliseconds from start to completion. Client-supplied scores
  and times are never accepted. A repeated or late index cannot score again or
  answer a later question accidentally.
- Closing the app does not pause the deadline. State retrieval catches up
  expired questions. Leaderboard retrieval also finalizes fully overdue attempts,
  so abandoned last questions cannot keep a result pending indefinitely.
- Completed attempts rank by score descending, then total elapsed milliseconds
  ascending. Exact equality in both shares a dense rank. The UI shows the current
  standings, refreshed every 15 seconds; no contest closing date was specified.
- Q4 remains optional letter-writing practice after the result, manually marked,
  outside the timed 41-point competition. Its draft is not sent to the teacher.

## Data and deployment

Apply `20261120200000_timed_nadawi_contest.sql` before publishing the frontend.
It seeds the 41 reviewed questions, private keys and four authenticated RPCs:
`start_nadawi_contest`, `get_nadawi_contest_state`,
`submit_nadawi_contest_answer`, `get_nadawi_contest_leaderboard`.
Private tables and the internal step function have no authenticated/anonymous
direct access. The leaderboard projects names, scores, times and the caller's
own-row flag. The public RPC wrapper isolates the generated-types boundary until
Supabase types are regenerated after migration deployment.

`src/data/nadawiContestUnit2.ts` and `nadawi-unit-two-question-review.md` are
source/review materials. They are not imported by the competition student UI;
only one sanitized current question is returned by the server. The supplied
question sheet/answer key remains a separate review document.

No new Edge Function is required. Live deployment and a signed-in production
round still require the connected Lovable database/site publication.

## Validation

Vitest checks the countdown, timeout synchronization/backoff, duplicate-send
prevention, tab return, result/leaderboard rendering, source coverage and home
navigation. `scripts/test-nadawi-contest-db.mjs` executes the actual migration in
PGlite (PostgreSQL/WASM), with local auth fixtures. It verifies the release gate,
permissions, shuffle/resume behavior, all 41 correct answers, punctuation/case,
late/replayed answers, cross-user access rejection, total time, abandoned-attempt
settlement and score/time/shared-rank ordering. This is not a production load test.

To run the database check without adding a project dependency:

```bash
npm install --prefix /tmp/nadawi-db-check @electric-sql/pglite
NADAWI_PGLITE_MODULE=/tmp/nadawi-db-check/node_modules/@electric-sql/pglite/dist/index.js node scripts/test-nadawi-contest-db.mjs
```
