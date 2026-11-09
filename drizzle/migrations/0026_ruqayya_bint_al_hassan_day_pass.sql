-- One-time 24-hour full-access pass for Ruqayya Bint Al-Hassan students.
-- Uses the rolling-pass infrastructure introduced by the Ibn Al-Baytar campaign.

INSERT INTO public.premium_promo_codes
  (id, code, starts_at, expires_at, is_active, duration_seconds, grants_full_access)
VALUES (
  'ruqayya-bint-al-hassan-day-pass',
  'رقية بنت الحسن',
  '2026-11-09 00:00:00+03',
  'infinity',
  true,
  86400,
  true
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  starts_at = EXCLUDED.starts_at,
  expires_at = EXCLUDED.expires_at,
  is_active = EXCLUDED.is_active,
  duration_seconds = EXCLUDED.duration_seconds,
  grants_full_access = EXCLUDED.grants_full_access;

