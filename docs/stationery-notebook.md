# My Notebook

Open `/notebook` directly, or choose **My Notebook / دفتري** from Tamayzak's tools.
The existing `canvas` menu key now opens the stationery notebook. Previous
whiteboard drawings remain available through Notebook settings and retain their
original storage key. Notes, enrichment notebooks, and mind maps are unchanged.

## Behavior

- 45 independent SVG stickers, including 35 traced from the supplied photo.
- Pointer Events for mouse, pen and touch drawing, dragging, resizing and rotation.
- Pen, pencil, highlighter and stroke eraser. Erasing is undoable and removes
  intersecting strokes, including between sparse input samples.
- Text and sticky notes support editing, size, alignment, bold, italic and color.
- Six shapes, layer ordering, duplication, numeric position/size and opacity.
- Separate paper color/style for each page; plain paper has no lines or grid.
- New pages are empty and inherit the last selected color/style.
- Document-wide undo/redo groups continuous gestures and text edits.
- Two fingers pan/zoom; Space temporarily pans; Ctrl/Cmd + wheel zooms.
- Fullscreen uses the browser API with an application fallback where unavailable.
- Current-page PNG and full-notebook PDF exports render page content, without UI
  controls, selection outlines or dependence on the viewport zoom.

## Persistence

`useNotebook.ts` saves versioned snapshots in IndexedDB (`tamayzak-stationery`)
with a synchronous localStorage recovery copy (`tamayzak.stationery-notebook.v1`).
It loads the newer valid copy, handles localStorage quota failures, and preserves
unreadable data instead of replacing it with an empty notebook. Edits flush on
visibility changes, pagehide and unmount. A failed save displays a retry action.
Storage is local to the current browser/device; PDF export provides a portable
copy. Undo history is session-local; page content persists across sessions.

## Components

- `Notebook.tsx`: editor, gestures, contextual controls and page management.
- `Sidebar.tsx`: searchable supplies and reusable tool/property controls.
- `Paper.tsx`: reusable SVG page, item renderer and live overview thumbnails.
- `model.ts`: document types, validation, geometry and stroke hit testing.
- `useNotebook.ts`: persistence, recovery and transactional history.
- `export.ts`: a viewport-independent canvas renderer and PNG/PDF export.
- `notebook.css`: scoped stationery styling and responsive layouts.

## Validation

Run `npm test -- src/components/notebook` for tool interactions, touch gestures,
page management, storage/recovery, history, exports and asset validation.
Run `npx tsc --noEmit -p tsconfig.app.json` and `npm run build` for application
compilation and production packaging. Live desktop checks covered adding,
rotating, duplicating/deleting stickers, paper choices, clean new pages and text
editing. The cloud browser later rejected a preview reload; a final live reload,
mobile-device session and live download inspection could not be completed in
that environment. Touch and reload behavior are additionally covered by tests.

### Verification result

All 46 notebook tests pass across five suites, including a real multi-page
jsPDF output check, touch gestures and IndexedDB quota/recovery cases. Application
TypeScript compilation and the production build pass. The full repository run
passes 732 tests and reports 7 failing tests plus two unhandled Supabase mock
errors outside the notebook. Re-running the affected suites in a separate clean
checkout of the pre-notebook main commit `4a7fe5897e4eca0642d7e9f7b1b5967be75758eb`
reproduces all seven failures and both errors. These existing failures affect
Nadia's Telegram gate/teacher directory, premium promo copy, MCQ chapter/category
expectations and English literature question counts; no notebook tests fail.
