# Premium lock release

Premium unlock actions navigate to `https://t.me/ias404`. Opening Telegram does
not grant access: activation uses the existing admin-managed live subscription.
Existing valid memberships, including previously redeemed memberships, remain
valid. New point redemption is no longer offered on the activation screen.
Daily AI usage caps are removed; this does not grant non-members access to
Premium tools. Short-term request guards, provider limits, and reward rules stay.

## Release order

1. Apply the migrations in order using the normal database migration workflow:

   - `supabase/migrations/20260916120000_restore_premium_access.sql`
   - `supabase/migrations/20260916130000_remove_daily_ai_limits.sql`

   The first creates the authenticated `can_use_premium_tools()` RPC; the second
   removes daily AI caps from legacy quota RPCs while keeping daily gift rules.
   Deploying the AI functions before the Premium RPC exists fails access closed.
2. Redeploy these functions, including their updated shared dependencies:

   - `ai-notes-generate`
   - `english-essay-check`
   - `english-reading-practice`
   - `essay-coach`
   - `generate-mcq`
   - `generate-ministerial-exam`
   - `generate-similar-problems`
   - `grade-course-exam`
   - `grade-ministerial-exam`
   - `solve-physics-problem`
   - `subject-agent`
   - `text-to-video`
   - `verify-hadith`
   - `verify-poem`
   - `verify-surah`
   - `video-notes`

3. Sync the frontend commit to Lovable and publish it.

Do not deploy unrelated locally modified functions as part of this release.

## Live verification

- A non-member sees a lock on Premium cards; clicking unlock opens @ias404.
- A saved menu or `?menu=mcq` shows the lock screen without mounting the AI tool.
- A signed-in non-member's direct request to a paid AI endpoint returns 403.
- A valid live member can repeatedly use paid tools without a daily quota.
- Free AI features and course paper scans do not have daily usage caps.
- Repeated requests within a short interval still hit the existing spam guards.
- An expired or canceled membership is locked; signing out clears access.
- Flashcards, MCQ Bank, Ministerial Bank, Malazam, tracking, and Chemical Equation
  remain free. Existing Arabic/Physics quick-MCQ hard locks are not sold as unlocks.

Local tests cover membership states, lookup errors/races, expiration, bilingual
unlock links, unlimited repeated access, rate-limit copy, and catalog navigation.
Removing daily caps can increase AI usage costs; provider credit limits remain.
Database migration and live deployment
must be verified separately; local test success does not mean this is live.
