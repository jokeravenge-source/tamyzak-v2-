# Ahmed Al-Nadawi · English Chemistry CH3

438 text flashcards, 12 topics. The student reader and admin review both use
`answerBlocks`. Prose is reflowable text; worked equations are selectable native
HTML text, with fraction rules and the original script positions. There are no
page images, image URLs, screenshots, PDF embeds, or external requests in the deck.

The `a` string is a linear extraction for search and identity, not a mathematical
typesetting source. Always display `answerBlocks` for these cards. Do not replace
them with the linear extraction in another study flow.

## Inputs and reproduction

User-provided `Chapter three.pdf`, 171 PDF pages. Private source inputs belong in
`../recovered`, outside this repository. The earlier source deck's `cards.json`
and `topics.json` supply region boundaries; put these in `../recovered/deck`.

Run from the repository root:

1. `python3 scripts/source-data/extract-ahmed-ch3-text.py`
2. `python3 scripts/source-data/build-ahmed-ch3-text.py`
3. `python3 scripts/source-data/export-ahmed-ch3-text.py`

Glyph identities were recovered from the embedded fonts. The unmapped Cambria
Math glyphs were visually checked against a source glyph atlas; the mappings are
in the extraction script. Native positions preserve exponents, denominators,
radicals and multi-column working without interpreting or inventing solutions.
Selected image-only reference notes were transcribed manually. Original Arabic
notes remain Arabic. Attendance pages 169–170 are not study material.

## Source qualifications

These exercises have no worked answer in the supplied source and are excluded
from the solved deck: AN-CH3-EN-143 (p47), 146 (p48), 156 (p51), 158 (p52),
164 (p54). Two additional unworked homework prompts occur on pp114 and 118.
No new solution was supplied for these exercises.

AN-CH3-EN-075 is a redundant volume diagram and is excluded. Its dilution rule
is included in the surrounding cards.

The source's final question naming BaI2 has working for Ba(IO3)2; card 441 makes
this discrepancy explicit. The final NaOH question's working also prints an
inconsistent pH 12.3 beside its selected answer C (pH12.7/pOH1.3); card443
identifies that discrepancy rather than silently changing the source.

## Verification

- TypeScript check and production build pass.
- Five focused component/data tests pass.
- All 438 answers were opened in Chromium at 390px; no blank answers, JavaScript
  errors, image elements, or horizontal page overflow.
- Topic filtering, answer concealment after navigation, and reveal were checked.
- Mobile rendering of a complete mass/concentration worked example was inspected.

These checks establish reader behavior and text rendering; they are not a claim
that every scientific assertion in the original booklet is error-free.

## Public publication approval

On 22 October 2026 the user confirmed public publication of the prepared text
flashcards after being told that this includes content from Chapter three.pdf,
438 cards and the glyph mappings in the public repository
jokeravenge-source/tamyzak-v2-. The user's follow-up instruction was:
"publish it i confirm that".

The approval applies to the prepared text deck and its reader integration.
The earlier image-based source deck is not part of this publication.
