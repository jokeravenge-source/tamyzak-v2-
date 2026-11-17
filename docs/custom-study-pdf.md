# Custom study PDF builder

Open **صمّم ملزمتك / Build Your PDF** from the home study tools, sidebar,
main menu or tool search. The existing `?menu=pdfBuilder` entry also works
after the normal student onboarding. No migration or new service is required.

## Student choices

- Subject, chapter/topic, revision teacher list and curriculum language.
- Ministerial and/or non-ministerial sources; written questions and/or MCQs.
  The source switches apply to MCQs as well.
- All available questions or a specific count per question type, optionally
  sampled at random. Invalid counts block preview rather than inventing questions.
- Answers after each question, in a numbered answer key at the end, or omitted.
- Title, optional student name and three text sizes.
- Four live A4 designs: revision booklet, exam paper with writing space,
  compact revision and a Tamayzak cover/design.

The on-screen page preview and download use the same pagination and content.
Changing a design or answer option updates the preview. Source changes clear
the preview and reset counts to avoid exporting the previous chapter.

## Bank connections

`src/features/pdf-builder/bankSources.ts` lazily imports the existing local
flashcard and ministerial decks. The loader also reads approved
`custom_flashcards` where the student decks allow them and paginates
`mcq_banks` in batches of 1,000. Existing physics chapter 2 and English
literature MCQ fallbacks remain available.

Ahmed Al-Nadawi corrections/deletions use `ahmed_flashcard_overrides`, with
the original chapter/language/card ID and the shared overlay helper. French
corrections/hidden cards use `french_flashcard_overrides`. If either required
overlay cannot load, preview is blocked so outdated or hidden cards are not
exported. Other unavailable online sources produce a visible partial-bank
warning and a retry button; displayed counts only include loaded questions.

Arabic topics use the flashcard topic mapping rather than the incompatible
ministerial chapter numbers. Islamic meanings remain separate from units.
English grammar, literature and passages remain separate. The teacher
selector changes revision cards; ministerial questions and MCQs use the
chapter banks. Source text is never translated.

Classification follows Tamayzak's current banks and explicit ministerial
labels. Some existing ministerial screens reuse flashcard material; this
feature does not independently authenticate historic examination provenance.
Matching written prompts retain the ministerial copy, and MCQs are deduplicated
separately. Normalization preserves case and mathematical operators.
Invalid MCQ choices/answer indexes and document-metadata questions are excluded.
Unavailable chapter/source combinations show their actual empty counts.

## Export and validation

The browser lays out questions at A4 width, keeps complete questions together
when they fit, and continues oversized text across pages. Structured
calculation blocks retain their SVG runs and fraction rules. The answer key
starts on a new page. Fonts finish loading before measurement and export.

`html2canvas` captures one A4 page at a time at 2x resolution; jsPDF combines
the page images into a downloadable A4 document. This preserves Arabic and
mixed-language display but produces image-based PDF pages rather than
selectable text. Canvas memory is released after each page. Leaving the
preview aborts an in-progress export before download.

Tests cover source filtering, count validation, ministerial duplicate priority,
actual local decks, online pagination, teacher overrides, topic/section
isolation, answer omission/placement, calculation markup, Unicode continuation,
template/settings updates, stale requests and real multi-page PDF output.
The export test uses a mocked canvas image; jsdom pagination tests use a
deterministic height model. They do not replace a real-browser visual check.
