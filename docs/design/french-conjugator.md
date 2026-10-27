# French Conjugator UI refinement

This refinement makes dense conjugation results easier to scan across screen sizes while preserving Tamayzak's existing theme, typography, navigation, and global tokens. It is an extension of the current product language, not a site-wide redesign.

## Design intent

- Keep the search, common verbs, result metadata, mood filtering, and conjugation tables in one clear reading flow.
- Give mood headings a strong navy book icon and tense sections a simple top rule so hierarchy remains visible without card-heavy styling.
- Use restrained French cues: a blue-white-red hero accent, navy primary states, blue row chevrons, and neutral theme-backed surfaces.
- Alternate subtle row fills for legibility; retain generous row height and spacing so long French forms remain readable.

## Responsive behavior

- Mobile: tense sections stay in one horizontal row. Each section uses most of the viewport and exposes part of the next section as a swipe cue; horizontal scrolling uses touch momentum and scroll snapping instead of stacking tenses vertically.
- Tablet (`768px+`): tense sections remain side by side in the same horizontally swipeable, snapping strip, retaining the partial-next-section cue and sizing sections to show two at a time when space permits.
- Desktop (`1180px+`): tense results return to the existing wrapped three-column grid, with slightly larger controls and rows.
- On narrow screens, the mood filter is sticky at the top and horizontally scrollable. Its non-wrapping, non-shrinking buttons remain at least 44px high; touch momentum and contained inline overscroll support deliberate horizontal browsing. At wider sizes it becomes an inset, bordered control and distributes options across the available width.
- These responsive layout changes are scoped to the French Conjugator stylesheet; they do not alter global design tokens.

## Direction, theme, motion, and accessibility

- The page follows the selected Arabic RTL or English LTR direction, while French inputs and conjugated forms stay LTR. Logical CSS properties preserve spacing and borders in both directions.
- Dark mode swaps navy fills for light blue where needed, adjusts tense rules and headings, and continues to use inherited background, foreground, border, and secondary tokens.
- Reduced-motion mode removes mood-button transitions. Loading animation follows the existing application behavior.
- Semantic headings, sections, ordered form lists, and a labelled mood-filter navigation preserve structure. Filter and common-verb buttons expose pressed state; decorative icons are hidden from assistive technology; loading/result feedback uses `aria-live` and `aria-busy`; keyboard focus remains clearly visible.

## Source ownership

- `src/pages/FrenchConjugator.tsx` owns page structure, localized copy, states, controls, semantics, and rendered conjugation results.
- `src/pages/FrenchConjugator.css` owns the scoped responsive grid, sticky filter, mood/tense hierarchy, row styling, dark-mode refinements, and reduced-motion rule.
- `src/lib/frenchConjugation.ts` owns conjugation data shaping, lookup, normalization, suggestions, and metadata consumed by the UI.
