# Task Roadmap

## In Progress
- Real-video notes verification awaits a Premium-enabled test account; the available signed-in account is blocked by the Premium screen.

## Done
- Upgraded notes to Gemini 4 Argon via the server-only SDK, removed optional output caps, bypassed prior-model caches, and deployed; seven coverage/math tests pass.
- Deployed full-video coverage corrections: retain complete transcripts, prioritize all topics within the existing token budget, bypass older partial caches, and reject token-truncated output. Six coverage/math tests pass; preview build is clean.
- Added admin Premium coupons with hours, days and calendar months; verified signed-in creation, redemption, repeat deadline, editing, disabling, reload and mobile layout. Test coupon removed.
- Verified all three newly requested accounts have permission to take ownership of joined study rooms; preserved existing delegates.
- Corrected the deployed mind map PDF request mismatch; a signed-in PDF upload returned 200 and rendered three nodes without runtime errors.
- Made Live Battle free without Premium; policy tests pass and the signed-in direct link opens the battle controls. Broader navigation tests have pre-existing AI Tutor/mock failures.
- Added admin-only persisted editing and removal for Ahmed Al-Nadawi decks; verified saves, student readback, deletion and reloads, then restored test content.
- Added nine always-visible pinned rooms and verified mission entry, timer start, and Tamayzak joining without a subject chooser.
- Confirmed preview build is clean; previously listed edge-function build errors are no longer present.
- Redeployed create-podcast-session edge function
