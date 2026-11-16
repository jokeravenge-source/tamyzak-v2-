# متميز — unified student assistant

All student chat entry points now mount `MutamayizChat`: the center navigation button, home card, subject cards, daily-report panel, and legacy `companion`, `psych`, and `subjectTutor` menu links. The only displayed assistant name is **متميز**, including the English interface. It combines personal problem solving, emotional support, study planning, scientific explanations, and navigation without a mode switch or a new conversation.

## Request and state contract

- The UI calls the existing authenticated `excellence-companion` function with `mode: "unified"`. Legacy schedule/problem/psych requests use the same system prompt. The structured `weakness` intake remains an internal contract for personalized practice, with the same assistant identity.
- The old `guide-chat` and `psych-chat` functions forward to that endpoint, carrying the user's authorization. They no longer maintain a separate persona, save support conversations, or forward personal messages to Telegram.
- One in-memory, account-scoped conversation is shared by mounted entry points. Sign-out/account changes clear messages and attachments. New conversations invalidate late replies. Personal chat text is not written to local storage or a chat-history table.
- PDF/TXT/MD attachments are read locally, with a 100 MiB file limit and an 80,000-character text context limit. Scanned PDFs without extractable text produce a clear error. File text and learning profiles are untrusted user data, never system instructions.
- The shared student-tool catalog controls both the model's descriptions and the frontend's button allowlist. Unknown/admin markers cannot become navigation buttons; responses have at most three tool buttons. Existing premium/points checks still apply to the destination tools.

## Plans and support

Plans contain at most 35 validated weekday/task pairs. The student sees the tasks before approval. Approval adds tasks to the existing account/local list, preserves parent-authored tasks, avoids repeated approval across entry points, and syncs through the existing task/profile contracts. A failed account write leaves the local plan in place, explains that synchronization failed, and allows a retry without duplicate tasks. Conversation changes alone do not write tasks. An unrelated JSON example before a plan does not prevent extraction of the plan.

Account changes also clear unsent personal drafts. Late file reads and task/profile saves are scoped to the original account and conversation, so they cannot change a new chat or another student's context.

Emotional support is empathetic study support, without diagnosis, medication advice, claims to be a clinician, or promises of absolute confidentiality. Immediate danger takes priority over studying, with guidance toward a trusted person and local professional/emergency help, without fabricated phone numbers.

## Release

No database migration or new frontend secret is required. Deploy the frontend **and** the updated `excellence-companion`, `guide-chat`, and `psych-chat` functions, including their shared modules. A GitHub commit alone does not prove the live edge functions were redeployed. Existing server AI credentials remain server-side.

Validation:

```sh
npm test -- src/lib/mutamayiz.test.ts src/lib/mutamayizEdge.test.ts src/lib/mutamayizLegacy.test.ts src/lib/mutamayizTodos.test.ts src/pages/MutamayizChat.test.tsx src/lib/guideTools.test.ts src/components/BottomGroupNav.test.tsx
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

Scientific provenance now targets 2026–2027 and adds a curated-source lookup and source cards. See [the source contract and release requirements](./mutamayiz-science-sources.md). This extension requires its database migration; no official textbook/exam corpus is bundled, so unavailable provenance remains explicitly unverified.

Attachment delivery includes the active filename and extracted text on every turn. The backend places that data immediately before the latest user question and explicitly distinguishes current attachment availability from earlier chat denials. Empty/scanned PDF page markers cannot pass the readable-text check; partial extraction/truncation is disclosed in context. Replacing an attachment clears the previous file before parsing, and unreadable PDFs show an OCR hint. Deploy both the frontend and `excellence-companion` (plus legacy forwarding changes) for this fix.

For tool requests, متميز starts with the requested/best available tool button, then at most two relevant complementary tools with brief benefits, and ends with one context-aware question about difficulty in the same subject/chapter (or a neutral subject/chapter question when unknown). Ordinary tool recommendations use at most 70 visible words and only the shared site-tool catalog; they do not trigger a science-evidence block merely for naming a science subject. Detailed tutoring and urgent support retain their existing behavior.
