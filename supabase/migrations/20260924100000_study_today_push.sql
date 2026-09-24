-- Deliver the Study today reminder once per Baghdad calendar day to devices
-- that have opted in to browser push notifications.
ALTER TABLE public.scheduled_push_log
  DROP CONSTRAINT IF EXISTS scheduled_push_log_reminder_type_check;
ALTER TABLE public.scheduled_push_log
  ADD CONSTRAINT scheduled_push_log_reminder_type_check
  CHECK (reminder_type IN ('study_summary', 'flashcards_due', 'mistakes_due', 'study_today'));

CREATE OR REPLACE FUNCTION public.claim_study_today_push(
  _batch_id uuid,
  _limit integer DEFAULT 300
)
RETURNS TABLE(user_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  WITH eligible AS (
    SELECT DISTINCT pt.user_id
    FROM public.push_tokens pt
    WHERE extract(hour FROM now() AT TIME ZONE 'Asia/Baghdad') = 13
      AND NOT EXISTS (
        SELECT 1 FROM public.scheduled_push_log log
        WHERE log.user_id = pt.user_id
          AND log.reminder_type = 'study_today'
          AND log.reminder_day = (now() AT TIME ZONE 'Asia/Baghdad')::date
      )
    ORDER BY pt.user_id
    LIMIT greatest(1, least(_limit, 300))
  ), claimed AS (
    INSERT INTO public.scheduled_push_log (user_id, reminder_type, reminder_day, batch_id)
    SELECT e.user_id, 'study_today', (now() AT TIME ZONE 'Asia/Baghdad')::date, _batch_id
    FROM eligible e
    ON CONFLICT (user_id, reminder_type, reminder_day) DO NOTHING
    RETURNING scheduled_push_log.user_id
  )
  SELECT claimed.user_id FROM claimed;
$function$;

REVOKE ALL ON FUNCTION public.claim_study_today_push(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_study_today_push(uuid, integer) TO service_role;

SELECT cron.unschedule('study-today-push')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'study-today-push');

-- 10:00–10:59 UTC = 13:00–13:59 in Baghdad. Each run claims the next
-- batch, allowing larger audiences while the daily log prevents repeats.
SELECT cron.schedule(
  'study-today-push',
  '* 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mwksmqcthfwgvldgbggy.supabase.co/functions/v1/study-today-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(
        current_setting('app.settings.service_role_key', true),
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1),
        ''
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
