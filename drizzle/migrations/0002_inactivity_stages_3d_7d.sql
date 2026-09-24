CREATE TABLE IF NOT EXISTS public.inactivity_push_log (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_activity_at timestamptz NOT NULL,
  stage text NOT NULL,
  batch_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent')),
  claimed_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  PRIMARY KEY (user_id, last_activity_at, stage)
);
GRANT ALL ON public.inactivity_push_log TO service_role;
ALTER TABLE public.inactivity_push_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages inactivity push log" ON public.inactivity_push_log;
CREATE POLICY "Service role manages inactivity push log" ON public.inactivity_push_log
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.claim_inactive_push_recipients_stage(
  _batch_id uuid, _stage text, _limit integer DEFAULT 500
)
RETURNS TABLE(user_id uuid)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $function$
  WITH token_users AS (
    SELECT pt.user_id, min(pt.created_at) AS token_created_at, max(pt.updated_at) AS token_updated_at
    FROM public.push_tokens pt GROUP BY pt.user_id
  ),
  latest_session AS (
    SELECT e.user_id, max(e.created_at) AS session_started_at
    FROM public.events e WHERE e.event_name = 'session_start' GROUP BY e.user_id
  ),
  activity AS (
    SELECT tu.user_id, greatest(coalesce(ls.session_started_at, '-infinity'::timestamptz),
      coalesce(tu.token_updated_at, tu.token_created_at)) AS last_activity_at
    FROM token_users tu LEFT JOIN latest_session ls ON ls.user_id = tu.user_id
  ),
  eligible AS (
    SELECT a.user_id, a.last_activity_at FROM activity a
    WHERE CASE _stage
      WHEN '3d' THEN a.last_activity_at <= now() - interval '3 days' AND a.last_activity_at > now() - interval '7 days'
      WHEN '7d' THEN a.last_activity_at <= now() - interval '7 days'
      ELSE false END
    ORDER BY a.last_activity_at
    LIMIT greatest(1, least(_limit, 500))
  ),
  claimed AS (
    INSERT INTO public.inactivity_push_log (user_id, last_activity_at, batch_id, stage)
    SELECT e.user_id, e.last_activity_at, _batch_id, _stage FROM eligible e
    ON CONFLICT (user_id, last_activity_at, stage) DO NOTHING
    RETURNING inactivity_push_log.user_id
  )
  SELECT claimed.user_id FROM claimed;
$function$;

REVOKE ALL ON FUNCTION public.claim_inactive_push_recipients_stage(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_inactive_push_recipients_stage(uuid, text, integer) TO service_role;