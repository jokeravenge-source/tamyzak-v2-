# Tamayzak usability review — 21 October 2026

## Coverage and limits

- Static inventory covers all **88 screen source files** under `src/pages` (39,590 lines at the start), plus routing and shared controls. Conditional states were identified from source; 88 does not mean 88 authenticated browser sessions.
- Live browser review covered the public sign-in screen, tools hub, teacher listing and Nadia curriculum selection. Authenticated student/admin screens could not be exercised in that signed-out session.
- The Taste browser inspector could not run: no local Chrome executable is installed. The separate cloud browser rejects localhost. Therefore this report makes no mobile screenshot, all-screens visual-pass, or numerical visual-score claim.
- Existing Taste direction: **editorial-greeting, seed 548721562**. Kept palette and typography. No palette redraw: existing theme definitions, theme picker and user-selected colours remain authoritative.

## Product inventory and jobs

Students choose a subject, chapter, topic, curriculum and sometimes an instructor. They study real flashcards, MCQs, ministerial questions, lectures and diagrams. Weekly plans, due mistakes and study rooms support that work. Admins review and organise the same material. Arabic and English interfaces must preserve the selected curriculum. Counts come from the displayed lists; no sample metrics were introduced. Nadia chapter limits continue to use `getNadiaLectureCount`, and the fixed room catalogue is unchanged.

## Applied improvements

1. Global tool search now uses a focus-trapped, keyboard-navigable command dialog. It includes previously missing subject, teacher, course and practice destinations, respects hidden tools, matches common Arabic spellings and offers a recovery action for no results.
2. The study-tools screen uses one filtered collection for the result count, rendered cards and empty state. Premium badges no longer overlap the navigation affordance.
3. Section Back restores the previous section and its subject/category, rather than clearing the whole flow. This section history is separate from the flashcard router. It does not claim to replace every browser-history behaviour.
4. Screen changes focus the title and restore reading position on return. Removed the shell's entrance animation; loading has a readable status. Added a keyboard skip-to-content link.
5. Dialogs and sheets stay within the dynamic viewport, scroll long content, use logical RTL spacing and have larger close targets. Shared form controls avoid small mobile input text; buttons can wrap long labels.
6. Bottom navigation reserves space only while mounted. Removed duplicated mandatory bottom spacing and the inactive one-second homepage countdown update.
7. Authentication offers Arabic/English before sign-in without discarding typed details. Validation failures appear alongside the form. The actual Tamayzak mark is used.
8. Subject screens expose MCQs and visual schemes alongside review tools. Opening the MCQ bank from a subject consumes that subject once, avoiding another subject-selection step.
9. Teacher directory has Arabic-aware name search, an empty-result reset and a retry action for loading failures. Existing Arabic/English Nadia navigation is preserved.
10. Administration has a permission-filtered section selector, including on mobile, instead of requiring discovery of a long horizontally hidden row. Access rules are unchanged.
11. Named 27 previously unnamed icon controls and 83 fields in the screen inventory. Added screen headings for Live Battle, Mind Map and Notes. Canvas already supplies its heading through Whiteboard.

## Verification

- Production Vite build: passed.
- TypeScript (`tsc --noEmit -p tsconfig.app.json`): passed.
- **24 focused tests across 7 files: passed.** These cover Arabic search, hidden-tool filtering, keyboard selection and focus return, previous-section restoration, scroll/focus restoration, bilingual authentication, teacher search and curriculum navigation, and the MCQ subject handoff.
- `git diff --check`: passed.
- Taste static lint also reports legacy gradients, emoji, decorative labels and shadows. These are not represented as a clean Taste lint result. Existing theme assets, educational notation/diagrams and chapter numbering were retained; usability fixes were prioritised over a second visual rebrand.
- The previous full-suite failures are not represented as resolved by this change. No unrelated backend or content edits were included.

## Publication status

The user explicitly approved publishing these reviewed source changes to `main` in `jokeravenge-source/tamyzak-v2-` on 21 October 2026. Repository publication and production deployment are separate checks; this report does not claim that every authenticated screen has been verified on the live deployment.

## Screen inventory

“Direct” means this screen received a local fix. “Shared” means it was statically reviewed and benefits from the shared routing/controls where used; it is not an assertion that every private state was rendered in a browser.

| Screen | First question | Change scope |
| --- | --- | --- |
| `AccountCenter.tsx` | Manage my account and study preferences | Direct |
| `AdminAhmedFlashcardsReview.tsx` | Review Ahmed's flashcard wording against its source | Shared / existing flow retained |
| `AdminDashboard.tsx` | Reach the right content-management section | Direct |
| `AdminLogin.tsx` | Sign into administration | Direct |
| `AdminMcqReview.tsx` | Review and correct an MCQ | Direct |
| `AdminNotes.tsx` | Read instructor enrichments | Shared / existing flow retained |
| `Advices.tsx` | Find advice or participate in a discussion | Direct |
| `Auth.tsx` | Sign in or create an account in my language | Direct |
| `Basics.tsx` | Choose the next useful study action | Direct |
| `BiologyDrawings.tsx` | Study a labelled biology drawing | Shared / existing flow retained |
| `BiologySchemes.tsx` | Understand a biology topic visually | Shared / existing flow retained |
| `Canvas.tsx` | Draw and organise my explanation | Whiteboard supplies the heading; shared navigation |
| `Challenge.tsx` | Create or enter a study challenge | Direct |
| `Chapters.tsx` | Choose the chapter to review | Shared / existing flow retained |
| `ChemicalEquations.tsx` | Find a chemical reaction and its memory hint | Shared / existing flow retained |
| `ChemistryExperiments.tsx` | Understand a chemistry experiment | Shared / existing flow retained |
| `DailyGame.tsx` | Complete today's study game | Direct |
| `DailyReport.tsx` | Understand today's study progress | Shared / existing flow retained |
| `EnglishCategory.tsx` | Choose the English section to study | Shared / existing flow retained |
| `EnglishEssays.tsx` | Practise an English composition | Direct |
| `EnglishIsqat.tsx` | Practise missing-word exercises | Shared / existing flow retained |
| `EnglishReadingPractice.tsx` | Read a passage and answer its questions | Direct |
| `EnglishVerbForms.tsx` | Review a verb's forms | Shared / existing flow retained |
| `Essay.tsx` | Submit answers for feedback | Direct |
| `ExamGenerator.tsx` | Configure a relevant practice exam | Direct |
| `FeatureUnlocks.tsx` | Understand which tools are available to me | Shared / existing flow retained |
| `FlashcardsDashboard.tsx` | Manage the correct flashcard set | Direct |
| `FrenchAntonyms.tsx` | Review French opposites | Direct |
| `FrenchSynonyms.tsx` | Review French synonyms | Direct |
| `GuideChat.tsx` | Ask the study guide for help | Direct |
| `HadithChecker.tsx` | Check the wording of a hadith | Direct |
| `Index.tsx` | Review the current flashcard and record my answer | Direct |
| `IntersectionPerpendicularResultPage.tsx` | Explore this geometry result in 3D | Shared / existing flow retained |
| `IslamicSurahs.tsx` | Read or listen to the selected surah | Direct |
| `JoinTamayzak.tsx` | Send a teaching application | Direct |
| `Leaderboard.tsx` | See study rankings | Direct |
| `LiveBattle.tsx` | Start or join an MCQ battle | Direct |
| `MCQ.tsx` | Generate practice questions from a file | Direct |
| `MainMenu.tsx` | Choose a study destination | Shared / existing flow retained |
| `McqBank.tsx` | Practise questions for the selected subject and chapter | Direct |
| `McqReviewDashboard.tsx` | Review the relevant MCQ set | Direct |
| `MindMap.tsx` | Create and inspect a study mind map | Direct |
| `MinisterialBank.tsx` | Answer and review ministerial questions | Direct |
| `MinisterialQuestions.tsx` | Find the public ministerial-question collection | Shared / existing flow retained |
| `Missions.tsx` | Track completed chapter topics | Shared / existing flow retained |
| `More.tsx` | Find a study tool | Shared / existing flow retained |
| `MyMistakes.tsx` | Review due mistakes | Shared / existing flow retained |
| `NadiaFlashcardsDashboard.tsx` | Review Nadia's flashcard sets | Direct |
| `NadiaMinisterialQuestions.tsx` | Select Nadia's ministerial-question chapter | Direct |
| `News.tsx` | Read study announcements | Shared / existing flow retained |
| `NotFound.tsx` | Recover from an unknown address | Shared / existing flow retained |
| `Notes.tsx` | Write and organise a study notebook | Direct |
| `OAuthConsent.tsx` | Understand and confirm the requested sign-in access | Shared / existing flow retained |
| `Onboarding.tsx` | Set up my study space | Shared / existing flow retained |
| `OrganicEquations.tsx` | Review organic reactions | Direct |
| `OurCourses.tsx` | Find and continue a course lesson | Direct |
| `ParentFollow.tsx` | Review and discuss a student's progress | Direct |
| `PerpendicularLineContainmentPage.tsx` | Explore this geometry result in 3D | Shared / existing flow retained |
| `PhysicsActivities.tsx` | Understand a physics activity | Shared / existing flow retained |
| `PhysicsLaws.tsx` | Find the right physics law or unit | Direct |
| `PhysicsProblemSolver.tsx` | Work through a physics problem | Direct |
| `PhysicsQuickMcq.tsx` | Complete a short physics quiz | Direct |
| `PhysicsSchemes.tsx` | Understand eddy currents in short visual sections | Shared / existing flow retained |
| `PlanePerpendicularityCriterionPage.tsx` | Explore this geometry result in 3D | Shared / existing flow retained |
| `PodcastTutor.tsx` | Study with spoken explanations | Direct |
| `PoemsChecker.tsx` | Check the wording of a poem | Direct |
| `Premium.tsx` | Understand the subscription and available tools | Shared / existing flow retained |
| `ProblemGenerator.tsx` | Generate practice problems for a topic | Direct |
| `PsychAssistant.tsx` | Discuss study stress with the assistant | Direct |
| `ResetPassword.tsx` | Set a replacement password | Shared / existing flow retained |
| `Sessions.tsx` | Enter a study room and control my timer | Direct |
| `SubjectTutor.tsx` | Ask a question about my subject | Direct |
| `Subjects.tsx` | Choose the subject or booklet to open | Shared / existing flow retained |
| `SubjectsHub.tsx` | Choose subject-specific review and practice | Direct |
| `Summaries.tsx` | Find, preview or upload study summaries | Direct |
| `TeacherDirectory.tsx` | Find my teacher and the correct curriculum | Direct |
| `Teachers.tsx` | Open an instructor's curriculum and lectures | Shared / existing flow retained |
| `TextToVideo.tsx` | Create a video explanation from text | Direct |
| `TheoremVisualizerPage.tsx` | Explore geometry theorems visually | Shared / existing flow retained |
| `TodoList.tsx` | Plan and complete study tasks | Direct |
| `ToolLanding.tsx` | Understand and open the selected tool | Shared / existing flow retained |
| `ToolPlaceholder.tsx` | Understand the selected tool's availability | Shared / existing flow retained |
| `ToolsIndex.tsx` | Find a public study tool | Direct |
| `UniquePerpendicularPlanePage.tsx` | Explore this geometry result in 3D | Shared / existing flow retained |
| `VideoNotes.tsx` | Convert a lecture into study notes | Direct |
| `Welcome.tsx` | Understand how to begin studying | Shared / existing flow retained |
| `WhoIsBest.tsx` | View teacher rankings and vote | Direct |
| `YoutubePlayer.tsx` | Find and watch a lecture | Direct |
