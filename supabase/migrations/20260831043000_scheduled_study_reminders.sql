CREATE TABLE IF NOT EXISTS public.scheduled_push_log (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('study_summary', 'flashcards_due', 'mistakes_due')),
  reminder_day date NOT NULL,
  batch_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent')),
  claimed_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  PRIMARY KEY (user_id, reminder_type, reminder_day)
);

GRANT ALL ON public.scheduled_push_log TO service_role;
ALTER TABLE public.scheduled_push_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages scheduled push log" ON public.scheduled_push_log;
CREATE POLICY "Service role manages scheduled push log"
ON public.scheduled_push_log FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.claim_scheduled_study_reminders(
  _batch_id uuid,
  _limit integer DEFAULT 500
)
RETURNS TABLE(user_id uuid, reminder_type text, due_count integer, study_seconds bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _baghdad_day date := (now() AT TIME ZONE 'Asia/Baghdad')::date;
  _baghdad_hour integer := extract(hour FROM now() AT TIME ZONE 'Asia/Baghdad');
  _day_start timestamptz := (_baghdad_day::timestamp AT TIME ZONE 'Asia/Baghdad');
  _day_end timestamptz := ((_baghdad_day + 1)::timestamp AT TIME ZONE 'Asia/Baghdad');
BEGIN
  RETURN QUERY
  WITH token_users AS (
    SELECT DISTINCT pt.user_id FROM public.push_tokens pt
  ),
  flashcard_reminders AS (
    SELECT fr.user_id, 'flashcards_due'::text AS reminder_type,
      count(*)::integer AS due_count, 0::bigint AS study_seconds
    FROM public.flashcard_reviews fr
    JOIN token_users tu ON tu.user_id = fr.user_id
    WHERE fr.due_at <= now()
    GROUP BY fr.user_id
  ),
  mistake_reminders AS (
    SELECT mm.user_id, 'mistakes_due'::text AS reminder_type,
      count(*)::integer AS due_count, 0::bigint AS study_seconds
    FROM public.my_mistakes mm
    JOIN token_users tu ON tu.user_id = mm.user_id
    WHERE mm.resolved = false AND mm.next_review_at <= now()
    GROUP BY mm.user_id
  ),
  summary_reminders AS (
    SELECT tu.user_id, 'study_summary'::text AS reminder_type,
      0::integer AS due_count, sum(ss.duration_seconds)::bigint AS study_seconds
    FROM token_users tu
    JOIN public.study_sessions ss
      ON ss.user_id = tu.user_id
      AND ss.created_at >= _day_start
      AND ss.created_at < _day_end
    WHERE _baghdad_hour = 21
    GROUP BY tu.user_id
  ),
  candidates AS (
    SELECT * FROM flashcard_reminders
    UNION ALL SELECT * FROM mistake_reminders
    UNION ALL SELECT * FROM summary_reminders
  ),
  limited AS (
    SELECT c.* FROM candidates c
    WHERE NOT EXISTS (
      SELECT 1 FROM public.scheduled_push_log spl
      WHERE spl.user_id = c.user_id
        AND spl.reminder_type = c.reminder_type
        AND spl.reminder_day = _baghdad_day
    )
    ORDER BY c.reminder_type, c.user_id
    LIMIT greatest(1, least(_limit, 500))
  ),
  claimed AS (
    INSERT INTO public.scheduled_push_log (user_id, reminder_type, reminder_day, batch_id)
    SELECT l.user_id, l.reminder_type, _baghdad_day, _batch_id
    FROM limited l
    ON CONFLICT (user_id, reminder_type, reminder_day) DO NOTHING
    RETURNING scheduled_push_log.user_id, scheduled_push_log.reminder_type
  )
  SELECT l.user_id, l.reminder_type, l.due_count, l.study_seconds
  FROM limited l
  JOIN claimed c USING (user_id, reminder_type);
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_scheduled_study_reminders(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_scheduled_study_reminders(uuid, integer) TO service_role;

SELECT cron.unschedule('study-reminders-hourly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'study-reminders-hourly');

SELECT cron.schedule(
  'study-reminders-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mwksmqcthfwgvldgbggy.supabase.co/functions/v1/study-reminders-push',
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
