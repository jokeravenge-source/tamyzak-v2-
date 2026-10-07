ALTER TABLE public.feature_announcements
ADD COLUMN IF NOT EXISTS link_url text;

COMMENT ON COLUMN public.feature_announcements.link_url IS
'Optional internal path or HTTP(S) destination opened when a student selects the announcement card.';
