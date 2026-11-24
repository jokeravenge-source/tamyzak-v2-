-- Start fresh weekly and monthly Tamayzak competitions without touching the
-- students' saved study sessions. Membership rows are removed by cascade.

DELETE FROM public.study_challenges
WHERE is_public = true
  AND public_series IN ('weekly', 'monthly')
  AND challenge_type = 'standard';

SELECT public.ensure_tamayzak_public_challenges();
