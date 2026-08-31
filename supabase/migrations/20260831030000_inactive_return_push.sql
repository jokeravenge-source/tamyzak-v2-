CREATE TABLE IF NOT EXISTS public.inactivity_push_log (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_activity_at timestamptz NOT NULL,
  batch_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent')),
  claimed_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  PRIMARY KEY (user_id, last_activity_at)
);

GRANT ALL ON public.inactivity_push_log TO service_role;
ALTER TABLE public.inactivity_push_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages inactivity push log" ON public.inactivity_push_log;
CREATE POLICY "Service role manages inactivity push log"
ON public.inactivity_push_log FOR ALL TO service_role
USING (true) WITH CHECK (true);

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
    SELECT pt.user_id, min(pt.created_at) AS token_created_at
    FROM public.push_tokens pt
    GROUP BY pt.user_id
  ),
  latest_activity AS (
    SELECT e.user_id, max(e.created_at) AS last_activity_at
    FROM public.events e
    WHERE e.event_name = 'session_start'
    GROUP BY e.user_id
  ),
  eligible AS (
    SELECT
      tu.user_id,
      coalesce(la.last_activity_at, tu.token_created_at) AS last_activity_at
    FROM token_users tu
    LEFT JOIN latest_activity la ON la.user_id = tu.user_id
    WHERE coalesce(la.last_activity_at, tu.token_created_at) <= now() - interval '3 days'
    ORDER BY coalesce(la.last_activity_at, tu.token_created_at)
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

REVOKE ALL ON FUNCTION public.claim_inactive_push_recipients(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_inactive_push_recipients(uuid, integer) TO service_role;

SELECT cron.unschedule('inactive-return-push-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'inactive-return-push-daily');

SELECT cron.schedule(
  'inactive-return-push-daily',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mwksmqcthfwgvldgbggy.supabase.co/functions/v1/inactive-return-push',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
