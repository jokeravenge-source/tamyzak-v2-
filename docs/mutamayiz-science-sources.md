# Scientific answers and provenance (2026–2027)

متميز now gives exam-style definitions/reasons and worked solutions with givens, law selection, unit conversions, result and a reasonableness check. Scientific replies request a source card. The target academic year is **2026–2027** for Arabic and distinguished English curricula; this setting alone does not establish a textbook's edition or applicability.

## Evidence path

1. After authenticating, `excellence-companion` searches `search_science_sources` using the caller's JWT and the existing public Supabase key. The RPC uses invoker security and returns at most eight verified records for the selected curriculum and academic year. No client-provided source records are accepted. Failure/timeout leaves the answer usable with unverified provenance.
2. The model receives source IDs and question/excerpt data. It ends scientific replies with a hidden `science` block selecting only relevant retrieved IDs. The server removes the block and resolves the IDs against its own retrieved records. Model-authored pages, years, classifications and IDs are not accepted as source metadata. This does not guarantee the model's explanation is correct; the usual answer disclaimer remains.
3. The UI shows printed textbook page and PDF file page separately, with source links and the actual book edition. Exam years/rounds and question classification are asserted only for exact question text, allowing whitespace/NFC normalization and a leading `س:`/`Q:`. Numbers, signs, units and chemical capitalization remain significant. Paraphrases deliberately remain related sources; they are not proof of the exact question's exam history or classification.
4. Missing evidence says **غير متحقق / Unverified**. This never means a question did not occur in exams, or is necessarily enrichment. Conflicting classifications also remain unverified.

Uploaded PDF text now preserves file-page boundaries. Attachments remain student-supplied data: file-page numbers, filenames or a student's claims cannot verify a printed page, edition, classification, exam year or round.

## Curating real sources

The migration creates `science_sources` with admin-only writes and student read access to verified records. Curate through the existing Supabase database administration workflow; there is no new student write endpoint or admin interface in this change.

Each record needs:

| Field | Requirement |
| --- | --- |
| `academic_year` | `2026-2027`, after checking applicability to that school year's approved curriculum |
| `curriculum` | `ar` or `en`, following the app's language/curriculum convention |
| `subject` | `physics`, `chemistry`, `biology`, or `math` |
| `question`, `excerpt` | Exact question and checked answer/source passage, each up to 6,000 characters |
| `book_title`, `book_edition`, `book_url` | Actual title, edition and HTTPS source document; required to attribute pages |
| `chapter`, `printed_page`, `pdf_page` | Check independently against the book. Do not copy PDF pagination into printed pagination |
| `classification` | `curriculum`, `enrichment`, `mixed`, or null when unverified |
| `classification_url` | HTTPS document establishing classification against the approved 2026–2027 scope |
| `exams` | Array of `{ "year": number, "round": string, "url": "https://…" }`, one per checked official occurrence; preserve all documented occurrences |
| `verified` | Defaults to false. An administrator must review the above before setting true |

For mixed questions, keep the exact question and use the excerpt to identify which part extends beyond the curriculum. Use nulls/empty exam arrays for unknown facts, never invented values. A dated teacher booklet is not itself proof of an official exam occurrence. An undated ministerial bank entry is not proof of a particular year/round. Do not seed this table with test fixtures or model guesses.

**No official textbook or exam corpus is included in this change.** Existing question banks lack a consistently verified page/edition/year/round contract, so they are not silently promoted into verified sources. Real 2026–2027 books, approved scope and official exam papers must be supplied and curated to populate the cards. Until then, scientific cards show unverified status.

## Release and validation

Apply either the Supabase migration or its registered Drizzle mirror (identical, idempotent), then deploy the frontend and `excellence-companion` including both new shared source modules. Existing credentials suffice. A GitHub commit is not deployment evidence.

Tested: source parsing and forged metadata, exact vs related matching (including numeric/sign/chemical differences), Arabic/English source cards, account-scoped chat persistence, edge retrieval/failure behavior and existing assistant workflows. SQL was exercised in local PostgreSQL-compatible PGlite: migration replay, Arabic search, year/curriculum filters, student read/write RLS, admin curation and anonymous RPC denial. Production database/provider end-to-end verification still requires deployment and real source records.

Component tests passed for Arabic/English cards. Browser screenshot QA could not run in this environment because Chromium launch was blocked; verify the full chat layout on a real mobile device during release review.
