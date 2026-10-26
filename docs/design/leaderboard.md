# Leaderboard surface

Mode: Operate. Audience: Arabic- and English-speaking Tamayzak students checking their total points, position, and other student profiles.

## Direction contract

THESIS: Make the podium the first readable result. Replace the repeated first-place congratulations panel with a physical 2–1–3 podium, first place raised and crowned.

OWN-WORLD: Inherit Tamayzak's theme tokens, UI font, character avatars, and rank colors. Neutral card surfaces; restrained gold, silver, and bronze distinguish podium positions. Do not introduce a new global palette.

STORY: Students identify the top three, find their own position, and scan positions 4–10. All entries keep their existing profile interaction. Daily caching and all-time points remain authoritative.

FIRST VIEWPORT: Compact back/title/refresh toolbar, three-column podium with crown clearance, then a personal-position summary and numbered standings. The podium remains physically 2–1–3 in both languages. Names wrap safely; points remain exact.

FORM: User-pinned podium reference, not an open concept exercise. Source: image(20261026-203307).png. Context launcher unavailable; no generated seed. Code-led refinement of the existing surface.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Scope clarification: This ordinary extension compares its implementation with the incumbent system and records scoped evidence below. It is not a new visual identity or an approved global-system change; no root DESIGN.md or design sidecar is created or rewritten for this refinement. Existing shipping rasters keep their original provenance.

## Boundaries

- Preserve all-time aggregation, pagination, daily caching, profile dialogs, and the shared navigation.
- Keep the student's actual position visible even outside the top ten.
- Cover fewer than three students, long multilingual names, large scores, loading, empty, refresh, and failure states.
- No new rasters or global theme changes. Existing character assets retain their original provenance.

## Implementation record

- The podium fixes second place on the physical left, raised and crowned first place in the center, and third place on the right in both English and Arabic. Individual entries retain the selected language direction; names use bidirectional isolation and points use exact locale formatting without abbreviation.
- The personal summary uses the full sorted board, standings list positions 4–10, and a separate personal row retains the student's true position outside the top ten. Podium, summary, and list entries open the existing profile dialog.
- Theme surfaces, foregrounds, borders, focus rings, and primary emphasis inherit from `src/index.css` and its Tailwind mappings. Typography remains inherited: the existing English body/display stacks and Arabic font rules are unchanged. Only podium-position decoration is local; darker medal fills support white numerals while the original gold, silver, and bronze rings remain intact.
- Incumbent evidence checked: `src/components/CharacterAvatar.tsx` supplies the existing characters and traits; `src/lib/points.ts` supplies unchanged rank thresholds, labels, and colors; `src/components/BottomGroupNav.tsx` and its mount in `src/App.tsx` remain the shared navigation. No global token, font, avatar, rank, or navigation file was changed for this refinement.
- `src/pages/Leaderboard.tsx` retains paginated all-time aggregation and daily caching, with explicit refresh, complete-board failure recovery, and the existing profile dialog. Presentation is scoped to `src/components/leaderboard/LeaderboardView.tsx` and `leaderboard.css`.

## Verification record

- The 21 targeted presentation/integration tests and the production build pass. Tests cover both podium language orders, profile actions, exact scores, fewer than three students, positions 4–10, an outside-top-ten position, loading/empty/refresh/failure states, caching, and pagination. Medal numeral contrast was independently checked at at least 4.5:1 for all three final fills.
- Existing review captures in `.impeccable/review/` use synthetic data. Desktop capture content is cropped on the right and bottom, and post-contrast-fix browser recapture was unavailable. These notes do not claim complete browser coverage or a live deployment.
- Pre-existing context/typecheck gaps are recorded without repair: root PRODUCT.md and DESIGN.md are absent; whole-repository TypeScript checking reports an unrelated TS2367 in `src/App.tsx` at line 1189. The context launcher and detector were unavailable; no seed or global design artifacts were generated.
