-- Send one return reminder after 24 hours without opening Tamayzak.
-- Token updated_at is included because it is refreshed whenever an
-- already-authorized PWA opens, making it a reliable app-open signal.
CREATE OR REPLACE FUNCTION public.claim_inactive_push_recipients(
  _batch_id uuid,
  _limit integer DEFAULT 500
)
RETURNS TABLE(user_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  WITH token_users AS (
    SELECT
      pt.user_id,
      min(pt.created_at) AS token_created_at,
      max(pt.updated_at) AS token_updated_at
    FROM public.push_tokens pt
    GROUP BY pt.user_id
  ),
  latest_session AS (
    SELECT e.user_id, max(e.created_at) AS session_started_at
    FROM public.events e
    WHERE e.event_name = 'session_start'
    GROUP BY e.user_id
  ),
  activity AS (
    SELECT
      tu.user_id,
      greatest(
        coalesce(ls.session_started_at, '-infinity'::timestamptz),
        coalesce(tu.token_updated_at, tu.token_created_at)
      ) AS last_activity_at
    FROM token_users tu
    LEFT JOIN latest_session ls ON ls.user_id = tu.user_id
  ),
  eligible AS (
    SELECT a.user_id, a.last_activity_at
    FROM activity a
    WHERE a.last_activity_at <= now() - interval '24 hours'
    ORDER BY a.last_activity_at
    LIMIT greatest(1, least(_limit, 500))
  ),
  claimed AS (
    INSERT INTO public.inactivity_push_log (user_id, last_activity_at, batch_id)
    SELECT e.user_id, e.last_activity_at, _batch_id
    FROM eligible e
    ON CONFLICT (user_id, last_activity_at) DO NOTHING
    RETURNING inactivity_push_log.user_id
  )
  SELECT claimed.user_id FROM claimed;
$function$;

REVOKE ALL ON FUNCTION public.claim_inactive_push_recipients(uuid, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_inactive_push_recipients(uuid, integer)
  TO service_role;

-- Retry each hour. The claim log prevents duplicate successful reminders.
SELECT cron.unschedule('inactive-return-push-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'inactive-return-push-daily'
);

SELECT cron.schedule(
  'inactive-return-push-daily',
  '17 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mwksmqcthfwgvldgbggy.supabase.co/functions/v1/inactive-return-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(
        current_setting('app.settings.service_role_key', true),
        (SELECT decrypted_secret
         FROM vault.decrypted_secrets
         WHERE name = 'service_role_key'
         LIMIT 1),
        ''
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
