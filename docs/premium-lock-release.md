# Premium lock release

Premium unlock actions navigate to `https://t.me/ias404`. Opening Telegram does
not grant access: activation uses the existing admin-managed live subscription.
Existing valid memberships, including previously redeemed memberships, remain
valid. New point redemption is no longer offered on the activation screen.

## Release order

1. Apply `supabase/migrations/20260916120000_restore_premium_access.sql` using the
   project's normal database migration workflow. This creates the authenticated
   `can_use_premium_tools()` RPC; deploying the AI functions before it exists will
   fail the membership check closed.
2. Redeploy these functions, including their updated shared dependencies:

   - `ai-notes-generate`
   - `english-essay-check`
   - `english-reading-practice`
   - `essay-coach`
   - `generate-mcq`
   - `generate-ministerial-exam`
   - `generate-similar-problems`
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
- A valid live member can use paid tools without consuming the daily free quota.
- An expired or canceled membership is locked; signing out clears access.
- Flashcards, MCQ Bank, Ministerial Bank, Malazam, tracking, and Chemical Equation
  remain free. Existing Arabic/Physics quick-MCQ hard locks are not sold as unlocks.

Local tests cover membership states, lookup errors/races, expiration, bilingual
unlock links, and catalog navigation. Database migration and live deployment
must be verified separately; local test success does not mean this is live.
