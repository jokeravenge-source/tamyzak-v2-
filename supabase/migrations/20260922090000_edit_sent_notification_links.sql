ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS telegram_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS push_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS link_updated_at timestamptz;

ALTER TABLE public.telegram_notifications_sent
  ADD COLUMN IF NOT EXISTS message_id bigint;

CREATE INDEX IF NOT EXISTS idx_telegram_notifications_sent_key
  ON public.telegram_notifications_sent (notification_key);

-- Older notification rows can still be identified as Telegram deliveries,
-- although they do not have Telegram message IDs and therefore cannot be
-- edited in place. This lets the admin UI explain that limitation clearly.
UPDATE public.notifications AS notification
SET telegram_sent = true
WHERE EXISTS (
  SELECT 1
  FROM public.telegram_notifications_sent AS delivery
  WHERE delivery.notification_key = 'notif:' || notification.id::text
);

DROP POLICY IF EXISTS "Admins update notifications" ON public.notifications;
CREATE POLICY "Admins update notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
