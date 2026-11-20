# Nadawi Unit Two contest

The home card retains the fixed 20 November 2026, 20:30 Asia/Baghdad release.
After that time its dialog opens the prepared challenge. Closing/reopening the
dialog preserves the current attempt while the home card stays mounted.

Content in `src/data/nadawiContestUnit2.ts` covers every supplied subquestion:
6 reading + 12 grammar transformations + 6 grammar alternatives = 24 MCQs;
5 word-box + 6 vocabulary/matching + 6 spelling = 17 typed one-word questions.
The source references and original prompts are retained for review. The full
converted question/answer key is in `nadawi-unit-two-question-review.md`.

Compound answers are scaffolded: special ___ → powder, get ___ of → rid,
___ belt → conveyor, driving ___ → licence. The telephone context is stated
for This/That. Case and final punctuation are ignored; spelling is checked,
and multiword short answers are rejected. Q4 remains a separate 100–120-word
letter task, manually marked and excluded from the automatic score of 41.
The original optional-question instructions and mark allocations are not used:
the user requested all questions.

This is an on-screen quiz attempt. It does not submit answers to a teacher,
persist official standings or award account points. Answers appear after the
student completes the automatically marked questions. Letter drafts are shown
in the result without an invented automatic grade. No AI calls or new database
migration are needed. Publish the updated frontend to activate the content.
