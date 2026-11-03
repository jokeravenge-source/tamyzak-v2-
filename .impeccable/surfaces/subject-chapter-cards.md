# Subject chapter cards

Scope: the non-French chapter grid in `src/pages/Chapters.tsx`. Operate mode: students scan chapters, see progress, and open a study deck. Preserve chapter content, teacher selection, locks, navigation, and the surrounding page. French is explicitly outside this edit.

## Direction contract

THESIS: Apply the supplied French-card reference to the other subjects' chapter cards.

OWN-WORLD: Pastel chapter tints, fine accent borders, 32px corners, soft downward shadows, outlined icon tiles, and existing Tamayzak type/theme tokens.

STORY: Identify a chapter, check card count and progress, then activate the whole card to study.

FIRST VIEWPORT: Responsive one/two/three-column grid. Each 352px-minimum card has a 60px icon opposite a count pill, chapter number, title and subtitle, reviewed/percentage row, thin progress track, study label, and arrow. Arabic mirrors layout. Locked chapters remain disabled.

FORM: User-selected screenshot; narrow component refinement, no concept seed required. Hover raises a card by 3px; keyboard focus outlines it; reduced-motion removes movement.

FINISH: Review and document this component extension in this brief. Preserve the incumbent global system; no global DESIGN.md, design identity, or design.json is required for this scope.

No PRODUCT.md or DESIGN.md was found. Preserve the incumbent global design. Source-derived count metadata avoids loading large study decks in the chapter picker. The screenshot is reference material, not a shipping asset.

## Implementation and evidence

- `Chapters.tsx` delegates only its non-French grid to `ChapterFlashcardsGrid.tsx` and its scoped CSS. The French branch still renders `FrenchFlashcardsDashboard` with the same props; the French component has no diff.
- `src/index.css` has no diff. Cards inherit its `--font-body`, `--card`, `--foreground`, `--muted-foreground`, `--muted`, and `--border` tokens. Per-card accents and all new selectors remain component-scoped; this does not establish a new global visual system.
- Regenerate `src/data/flashcardDeckSummaries.json` after source-deck changes with `node --import tsx scripts/generate-flashcard-counts.ts --write`. Metadata stores compact fingerprints rather than study text. Counts combine the relevant source metadata with approved additions or Ahmed overrides according to the study-deck variant, and deduplicate normalized question/answer pairs.
- Reviewed/due progress accepts only rated states with the matching subject/chapter prefix and a question fingerprint in the current deck. The displayed reviewed and due values are capped to avoid exceeding the card total or reviewed total. Existing targeted tests cover source counts, approved additions, deletions, unrelated-review exclusion, duplicate additions, chapter activation, and Arabic locked cards; this documentation review inspected those tests without rerunning them.
- Source checks confirm one column below 640px, two from 640px, and three from 1024px; wrapping titles/subtitles; RTL direction and arrow mirroring; native disabled buttons; and a visible keyboard focus outline. Reduced-motion rules remove transitions and use equally specific, later selectors to reset enabled hover transforms. These are source-level checks, not browser visual verification.
- The finish reviewer closed all three material findings (teacher-picker icon import, deck-scoped review membership, and deduplicated source counts) with a code-review verdict of ship. Parent validation passed 12 targeted tests, targeted ESLint, the TypeScript check, and the production build. Rendered fidelity remains unverified.
- No browser rendering, screenshot comparison, or computed-contrast verification was completed in this documentation pass. Browser verification remains outstanding. No shipping raster assets were added.
