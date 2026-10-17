# Project rules

- Resolve Nadia lecture counts through `getNadiaLectureCount` in both teacher entry points so curriculum-specific limits remain consistent.
- Keep the fixed study-room catalog in `pinnedStudyRooms` and derive session subjects from joined rooms, using a general session for rooms without a subject, so joining never requires a second curriculum choice.