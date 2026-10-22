# Project rules

- Resolve Nadia lecture counts through `getNadiaLectureCount` in both teacher entry points so curriculum-specific limits remain consistent.
- Keep the fixed study-room catalog in `pinnedStudyRooms` and derive session subjects from joined rooms, using a general session for rooms without a subject, so joining never requires a second curriculum choice.
- Persist Ahmed Al-Nadawi admin edits and deletions in `ahmed_flashcard_overrides`, keyed by chapter, language and original source card ID; apply the same overlay in review and student decks so source files and student review histories remain intact. Only database-verified admins may write overrides.