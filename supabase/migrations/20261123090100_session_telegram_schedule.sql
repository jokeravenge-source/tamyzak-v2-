-- Run every minute; the worker sends only near a Baghdad session boundary and once per slot/kind.
SELECT cron.schedule('tamayzak-study-sessions', '* * * * *', $job$
  SELECT net.http_post(
    url := 'https://mwksmqcthfwgvldgbggy.supabase.co/functions/v1/session-telegram',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || coalesce(nullif(current_setting('app.settings.service_role_key',true),''),
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='service_role_key' LIMIT 1),'')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 40000
  );
$job$);
