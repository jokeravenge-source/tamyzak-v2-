# Project rules

- Push completed Tamayzak changes to `main` unless the user specifies another branch or asks to keep changes local.

- Isolate pending study-room activity RPC signatures in `studyRoomActivityRpc` without editing generated database types; this keeps the preview compiling while preserving server-side errors and authorization until deployment.

- Battle publishing accepts Telegram groups and channels, checks destination-specific bot posting rights before reserving an invitation, and never automatically retries uncertain deliveries; this prevents unusable rooms and duplicate posts.

- Use the compatibility PDF.js build with its matching compatibility worker for the booklet reader so older Safari versions can open valid PDFs without native Promise.withResolvers.

- Manage adjustable Premium coupons through the admin-verified `admin_premium_coupons` RPC; redeem via the existing promo flow and preserve issued subscription deadlines so edits affect only future redemptions. Calendar months use Baghdad time.

- Mind map generation accepts extracted PDF text/page images, not a separate topic, and uses the server-only AI Gateway SDK to keep the deployed request contract aligned with the upload page.
- Video notes use a cost-efficient Flash model through the server-only AI Gateway SDK, without optional output caps or automatic cross-model replay, to keep per-lecture credit cost low without duplicate billed attempts.
- Video notes are generated in consecutive sections (transcript chunks or time ranges) requested one by one by the page, version cache keys when coverage changes, and reject token-truncated output; this keeps each request within time limits without dropping lecture content.

- Resolve Nadia lecture counts through `getNadiaLectureCount` in both teacher entry points so curriculum-specific limits remain consistent.
- Keep the fixed study-room catalog in `pinnedStudyRooms` and derive session subjects from joined rooms, using a general session for rooms without a subject, so joining never requires a second curriculum choice.
- Persist Ahmed Al-Nadawi admin edits and deletions in `ahmed_flashcard_overrides`, keyed by chapter, language and original source card ID; apply the same overlay in review and student decks so source files and student review histories remain intact. Only database-verified admins may write overrides.

## Mandatory Tamayzak design system

- Read and follow [docs/design-system.md](docs/design-system.md) before any UI creation, redesign, or visual change. This is the default for all future work, not an optional theme.
- Preserve the selected theme; use vivid differentiated semantic tones, rounded cards, and the shared Apple-inspired `FeatureIcon3D` for prominent feature artwork. Match the approved Points lightning and Continue Studying book, not arbitrary new visual styles.
- Reuse the existing CSS palette and semantic theme tokens. Keep Arabic RTL, English LTR, responsive layouts, accessibility, and existing functionality intact. Migrate legacy UI when touching it; never silently replace the global theme.
- Review new UI against the design-system checklist before pushing. Run relevant tests/build and report missing verification.
