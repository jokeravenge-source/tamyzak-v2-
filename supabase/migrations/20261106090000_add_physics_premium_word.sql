-- Physics campaign word. It uses the same temporary Premium window as the
-- first campaign and is redeemed through the shared server-side RPC.
INSERT INTO public.premium_promo_codes (id, code, starts_at, expires_at, is_active)
VALUES (
  'al-eilaf-physics-2026-11',
  'الأيلاف',
  '2026-11-06 00:00:00+03',
  '2026-11-08 10:00:00+03',
  true
)
ON CONFLICT (id) DO UPDATE
SET code = EXCLUDED.code,
    starts_at = EXCLUDED.starts_at,
    expires_at = EXCLUDED.expires_at,
    is_active = EXCLUDED.is_active;
