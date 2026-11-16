# Internal Arabic Literature course

Replaces the old literature Telegram-bot link in Our Courses → Arabic → Literature with an internal course. The grammar tile and other courses remain intact; no historical course data is deleted.

## Student flow

Sign in, enter a supervisor-issued code, then use Exams or MCQ. A code enrolls the account in the whole literature course (both tabs), rather than unlocking one exam at a time. Enrollment persists across devices. Published exams open as private files; MCQ choices are delivered without answers, and the server scores submissions and saves attempts before returning correct choices/explanations. Retakes are allowed as revision practice.

## Supervisor flow

Existing database-verified `admin` and `moderator` roles can manage this course, either from the same course page or the new Literature Course tab in the admin dashboard. Other users cannot grant themselves access using client flags.

- Upload PDF/JPG/PNG exams up to 100 MiB, enter a title/chapter, then publish the draft. Unpublish or delete from the exam list.
- Create 1–100 codes per batch. Each defaults to one student, with an adjustable use limit and optional access expiry in Baghdad time. Copy raw codes immediately; full codes are not stored: the database retains SHA-256 hashes and an eight-character suffix for identification. Revoking a code also removes access for accounts that redeemed it. Existing signed exam links can remain usable for up to 60 seconds after revocation/unpublishing.
- Select a PDF/DOCX/TXT source up to 100 MiB and request 1–100 MCQs. The existing extraction/generation pipeline handles text and supported page images. Large/scanned files may be processed partially; the dashboard warns about coverage. The supervisor can split the source for complete coverage.
- Review/edit all questions, four choices, correct answer and explanation before saving. Generation does not publish automatically. If fewer than requested are returned, saving is disabled and the supervisor can generate the remainder or change the source/count. Saving a reviewed set creates a draft. Publish it explicitly. Editing an existing set returns it to draft until republished.

The raw MCQ source file is processed for generation, not published to students. Its filename is retained on the set. Practice sets and exam files are course content; no new automatic OCR grading of uploaded written exams is introduced by this change.

## Access boundaries

`literature_course_access` reports permissions. `redeem_literature_code` binds enrollment to `auth.uid()`, locks the code row when consuming a use, checks expiry/revocation and persists failed-attempt throttling (10 attempts per 15 minutes). The per-user attempt row serializes parallel redemptions before consuming a code. Revoked or expired enrollments can redeem another valid code.

RLS protects exams, sets, enrollments and attempts. The `literature-course` bucket is private, with supervisor-only writes and student reads limited to published exam paths for enrolled users. Base MCQ rows are supervisor-only; student RPCs remove correct answers before submission. The database validates question structure even for direct writes. `generate-mcq` accepts `literatureGeneration` only after a caller-scoped, fail-closed supervisor check; this does not relax existing student quotas or generic admin generation.

## Deploy through Lovable

1. Apply `supabase/migrations/20261116180000_literature_course.sql` **or** the identical registered Drizzle mirror `0037_literature_course.sql`. It creates tables, RPCs, RLS and the private bucket. It is replay-safe.
2. Deploy `generate-mcq` including `_shared/literatureGeneration.ts` and its existing dependencies. Existing AI credentials are reused; no new secret is needed.
3. Publish the frontend and verify a supervisor and a student flow with real accounts/files. GitHub sync alone does not prove migrations/functions deployed.

Suggested project instruction: “Apply the literature-course database migration, deploy generate-mcq with its shared modules, and publish the updated Literature course frontend. Verify code creation/redemption, private exam access and MCQ draft generation/publication with supervisor and student accounts. Preserve existing users and all other course data.”

## Verification

UI tests cover locked access, invalid codes, selected generation counts, draft-only saves, incomplete generation, code clearing on account changes, server submission, and replacing the external course link. Unit tests cover count/file/output validation and caller-scoped generation authorization. Local PostgreSQL-compatible PGlite exercises migration replay, admin/moderator/student boundaries, hashed codes, account binding, use limits, expiry/revocation, persistent throttling, storage RLS, draft isolation, hidden MCQ answers and scoring.

Run SQL checks without touching a live database:
`LITERATURE_PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node scripts/tests/literature-course.sql.mjs`

Provider-backed MCQ generation, real Storage signed downloads and mobile visual review still require deployed-project verification.

Broader regression checking found two pre-existing failures in `mcqChapters.test.ts` (flashcard availability count and the English Paragraphs title). They reproduce on the unchanged base repository and are outside this course change.
