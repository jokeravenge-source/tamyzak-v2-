# Finger marking in Biology Drawings

The existing Biology Drawings page now defaults to finger/pen/mouse annotation
over its existing chapter diagrams. Drag-and-drop label practice remains a second
mode. The tool is also listed in All Tools.

Ink is a separate transparent canvas above the SVG artwork. Erasing affects only
ink. Pointer capture, primary-pointer filtering and cancellation bind a gesture to
one pointer. Normalized coordinates, high-DPI repainting and ResizeObserver retain
alignment after resizing. Hand mode restores scrolling and pinch zoom. Controls
wrap, have 44px touch targets, and page padding clears bottom navigation.

Pen colors/thickness, Undo, Redo and reversible Clear all are available. Completed
strokes autosave to IndexedDB, keyed by current account and diagram; guests have
their own device-local scope. Account/diagram changes remount the editor. Obsolete
read/write results cannot update a different editor's UI.

Submit checks visible ink, waits for the latest draft write, and confirms only
after the submission transaction completes. The attempt then stays read-only
until Edit marks is chosen. This is personal review on this device: no automatic
grading, teacher delivery or cross-device synchronization. The UI says so.

Failed reads block editing until Retry, protecting an unread attempt. Failed
writes preserve visible work and offer Retry; failed submission does not show
success. Persisted data and stroke counts are bounded. No database migration,
new scientific content or backend permission is needed. Existing access and
subscription gating is unchanged.

Direct entry: https://tamyazak.site/?menu=biologyDrawings

Validation for a normal checkout:

~~~sh
npm test -- src/lib/biologyDrawing.test.ts
npx tsc --noEmit -p tsconfig.app.json
npm run build
~~~

The execution environment was unavailable. Fifteen direct runtime checks of the
model helpers passed: coordinates/resize/clamping, invalid geometry, point noise
and compaction, record validation/bounds, submission state, eraser compositing and
taps. Metadata syntax and Arabic/English copy-key parity were also checked.
The included Vitest/IndexedDB tests were not run. TypeScript, production build
and browser/device layout verification remain outstanding; a repository push
does not establish hosting publication.

Manual checks: Arabic/English; touch, mouse and pen; release outside the diagram;
secondary fingers/cancellation; erase then draw; Undo/Redo/Clear; rotate/resize;
navigate away/back; submit/reopen/edit; account switch; storage denial/quota;
empty/fully erased submission; bottom navigation.
