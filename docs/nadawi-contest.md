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
  After completion, the student’s current rank is shown prominently above the
  standings. The home contest dialog also has a Competition leaderboard button,
  available before or after participation without starting an attempt. It shows
  the top 20 finishers plus the caller’s own result, even outside the top 20.
  Loading, sign-in, empty and retry states are explicit; admin tests stay excluded.
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

## Administrator tests

Apply `20261120210000_nadawi_admin_test.sql` after the timed competition migration.
The admin dashboard has a Test Nadawi competition button below its header. The
home card also exposes it after checking the authenticated admin role. It opens
an independent test dialog before or after release, with the same 30-second
questions, shuffle and grading, plus Restart test. The current test can be resumed.

The test RPCs verify `has_role(auth.uid(), 'admin')` on every request, including
answers and state reads. They use `nadawi_contest_test_attempts`, a separate
private table, so resets and results cannot alter official attempts or appear
in the student leaderboard. The database validation script applies both
migrations and checks non-admin denial, role revocation, full scoring, reset and
official-result isolation.

## Mistake review

Apply `20261120220000_nadawi_mistakes.sql` after the admin-test migration before
publishing. Completed result screens have a Review my mistakes section. Its RPC
returns only the caller’s incorrect/expired questions from the saved shuffled
attempt, with the submitted choice text or word and accepted correct answers.
It refuses unfinished attempts and anonymous callers; preview review additionally
verifies the admin role. No other student’s answers or active answer keys are
exposed, and review never changes points, times or standings.

## Speeding correction

Apply `20261120230000_nadawi_speeding_ticket.sql` before publishing. Q3C.6
accepts `ticket` or `speeding ticket`, not `fine`. Q3C.4 accepts `named` or
`alerted` as requested by the competition owner. This question alone allows a
two-word response. The migration updates the bank and saved official/admin
attempts, regrades the affected answer and adjusts scores without changing
question order, submitted text, progress, deadlines or elapsed times. Rankings
and the mistake review use the corrected score and key.
