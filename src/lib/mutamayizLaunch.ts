type MutamayizLaunch = { kind: "study-guide" } | { kind: "draft"; text: string };

const OPEN_MUTAMAYIZ = "app:open-mutamayiz";
let pendingLaunch: MutamayizLaunch | null = null;

function launch(entry: MutamayizLaunch) {
  pendingLaunch = entry;
  window.dispatchEvent(new CustomEvent(OPEN_MUTAMAYIZ));
}

export function openMutamayizStudyGuide() {
  launch({ kind: "study-guide" });
}

export function openMutamayizWithDraft(draft: string) {
  const text = draft.trim().slice(0, 6000);
  if (text) launch({ kind: "draft", text });
}

/** Local-only, one-use launch context. Nothing is sent until the student presses Send. */
export function takeMutamayizLaunch() {
  const entry = pendingLaunch;
  pendingLaunch = null;
  return entry;
}
