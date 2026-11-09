# Ibn Al-Baytar day pass

Code: **ابن البيطار**. It can be entered in the existing campaign-code form on
the Premium page or a paid-tool lock screen, after signing in.

Each account receives exactly 86,400 seconds from its first successful redemption.
The code has no scheduled activation cutoff; operators can disable new redemptions
through the existing private campaign table. Re-entering the code never extends
access, including after the day has ended. Existing paid/permanent memberships
are preserved. Students cannot inspect the code table or write subscriptions.

The server issues a local `trialing`, `live` promotional subscription with a
finite deadline. No request is sent to Paddle and no charge is created. Existing
AI entitlement checks use the same server truth. The full-access marker also
temporarily bypasses point gates and grants published-course reading via the existing
enrollment helper; it does not grant teacher/admin roles or permanent enrollments.
Disabled/development-only tools remain disabled. Existing Telegram requirements
for downloading new booklet copies remain in place.

## Release

1. Apply `supabase/migrations/20261109140000_ibn_al_baytar_day_pass.sql` using
   the normal Supabase workflow, **or** use the equivalent registered Drizzle
   migration `0024_ibn_al_baytar_day_pass` through Lovable's database workflow.
   Do not apply both migration tracks to the same database as separate releases.
2. Publish the frontend containing the updated code form and subscription hook.
   The hook re-locks an open tab at the server-returned deadline; the backend
   independently enforces expiry on every paid AI request.
3. Verify with a signed-in student: activate the code, open a paid tool, and
   confirm the expiry is 24 hours after first use. Re-enter it and check that the
   displayed deadline is unchanged. Code creation is not live until step 1 runs.

No edge-function redeployment is needed: existing premium-protected functions
already call the updated `can_use_premium_tools()` RPC.

## Isolated database verification

```sh
npm install --prefix /tmp/tamyazak-pg-tests @electric-sql/pglite
PGLITE_MODULE=/tmp/tamyazak-pg-tests/node_modules/@electric-sql/pglite/dist/index.js node scripts/test-day-pass.mjs
```

This creates an in-memory PostgreSQL database with test identities. It checks
the exact 24-hour interval, repeat/concurrent redemption, expired replay,
private tables, anonymous denial, tool/course access, account isolation,
legacy campaigns, and preservation of existing paid/admin/course privileges.
