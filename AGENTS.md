# Project rules

- Manage adjustable Premium coupons through the admin-verified `admin_premium_coupons` RPC; redeem via the existing promo flow and preserve issued subscription deadlines so edits affect only future redemptions. Calendar months use Baghdad time.

- Mind map generation accepts extracted PDF text/page images, not a separate topic, and uses the server-only AI Gateway SDK to keep the deployed request contract aligned with the upload page.
- Video notes use a frontier video-capable model through the server-only AI Gateway SDK, without optional output caps or automatic cross-model replay, so upgraded notes retain detail without duplicate billed attempts.
- Video notes are generated in consecutive sections (transcript chunks or time ranges) requested one by one by the page, version cache keys when coverage changes, and reject token-truncated output; this keeps each request within time limits without dropping lecture content.

- Resolve Nadia lecture counts through `getNadiaLectureCount` in both teacher entry points so curriculum-specific limits remain consistent.
- Keep the fixed study-room catalog in `pinnedStudyRooms` and derive session subjects from joined rooms, using a general session for rooms without a subject, so joining never requires a second curriculum choice.
- Persist Ahmed Al-Nadawi admin edits and deletions in `ahmed_flashcard_overrides`, keyed by chapter, language and original source card ID; apply the same overlay in review and student decks so source files and student review histories remain intact. Only database-verified admins may write overrides.