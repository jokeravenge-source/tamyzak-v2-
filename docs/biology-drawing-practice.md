# Standalone Biology Sketchpad

Biology Sketchpad is a separate study tool at
`https://tamyazak.site/?menu=biologySketchpad`. It is listed in Study Tools,
All Tools, Biology, search, and the teacher-tool catalog. The assistant's shared
navigation catalog includes the new key. Its public landing page uses
`/tools/biology-sketchpad`.

The existing Biology Drawings tool keeps its drag-and-drop label practice.
Sketchpad starts with blank paper. Students can also choose an outline of one
of the existing 19 biology diagrams, grouped by chapter. Outlines reuse the
original scientific geometry and change only the colors/fills to ink on white
paper. They are not newly generated scientific content.

The sketch canvas supports finger, pen and mouse input, pen colors/thickness,
eraser, Undo, Redo and reversible Clear all. Ink is a separate transparent canvas
above the optional outline. Erasing affects only the student's ink. Pointer
capture, primary-pointer filtering and cancellation bind a gesture to one pointer.
Normalized coordinates and high-DPI repainting retain alignment after resizing.
Hand mode restores scrolling and pinch zoom. Controls wrap with 44px touch targets;
page padding clears the bottom navigation.

Completed strokes autosave to IndexedDB, keyed by account and paper ID. Blank
paper and every template have distinct `sketchbook:` IDs. Guests have a separate
device-local scope. Account/paper changes remount the editor; obsolete read/write
results cannot update another editor's UI.

Submit checks visible ink, waits for the latest draft write and confirms after
the submission transaction commits. The sketch stays read-only until Edit sketch
is chosen. Submission is personal review stored in this browser on this device;
it does not grade, deliver to a teacher or synchronize across devices. Failed
reads block editing until Retry. Failed writes preserve visible work and offer
Retry. Storage validation and stroke counts are bounded. No database migration or
new server permission is required.

Validation commands:

```sh
npm test -- src/lib/biologyDrawing.test.ts src/data/biologySketches.test.tsx src/components/BiologySketchCanvas.test.tsx
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

The 14 focused tests cover coordinates and resizing, storage isolation and
validation, eraser compositing, scientific geometry preservation, blank paper,
touch strokes, Undo/Clear, successful Submit/Edit, fully erased submission and
storage failure. Browser checks use the actual page with a mobile-width viewport;
physical-device testing remains separate. Publishing must be verified at the
hosting provider; pushing main alone is not publication.

Verified in this change: 51 focused and navigation/access tests passed; TypeScript
application checking and production build passed (162 Malazam pages generated).
Mobile-width browser checks at 320px/390px passed with no horizontal overflow.
Arabic template drawing, erasing, undo, Submit, reload, Edit and resubmission
were exercised. English blank paper and Submit were also checked.
