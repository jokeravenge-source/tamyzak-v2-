# Koki character

Account Center → Customize your character → Appearance contains a separate Koki card, visible to free and Premium students. The artwork preserves the supplied cream beret, brown hair, pink outfit and white rabbit on a transparent background.

Enter `koki` in **Character access code** (case insensitive; surrounding spaces are ignored). This permanently unlocks Koki for that signed-in account. Select **Use Koki** to save female variant 16. Existing styles remain free; the new character is not part of either free variant array. Selecting a male character resets this special variant to the default male style. Switching to another style does not remove the entitlement.

Deploy the `0039_koki_character_unlock` Drizzle migration, or the equivalent `20261117160000_koki_character_unlock.sql` Supabase migration, before publishing the frontend. Both contain the same account entitlement table, read and redeem RPCs, and profile validation trigger. They can be replayed safely.

Only the redemption RPC can issue an entitlement; authenticated users can read only their own row. A profile trigger rejects saving variant 16 without its owner's entitlement, including direct inserts or API updates. A wrong code grants nothing. Reusing the correct code is idempotent, with no expiry or usage limit. Premium and points confer no access. Network errors leave the card locked and allow retry. The application bundle does not contain the access-code comparison.

Validation:

```sh
npm test -- --run src/components/KokiCharacterCard.test.tsx src/components/CharacterAvatar.test.tsx src/pages/AccountCenter.test.tsx
PGLITE_MODULE=/path/to/@electric-sql/pglite/dist/index.js node scripts/tests/koki-character.sql.mjs
npm run build
```
