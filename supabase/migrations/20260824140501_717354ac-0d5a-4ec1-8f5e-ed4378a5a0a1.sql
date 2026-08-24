ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS show_study_hours boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.public_student_profile(_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'user_id', _user_id,
    'display_name', COALESCE((SELECT p.display_name FROM public.profiles p WHERE p.user_id = _user_id LIMIT 1), 'Student'),
    'gender', (SELECT p.gender FROM public.profiles p WHERE p.user_id = _user_id LIMIT 1),
    'character', (SELECT p.character FROM public.profiles p WHERE p.user_id = _user_id LIMIT 1),
    'bio', (SELECT p.bio FROM public.profiles p WHERE p.user_id = _user_id LIMIT 1),
    'socials', COALESCE((SELECT p.socials FROM public.profiles p WHERE p.user_id = _user_id LIMIT 1), '{}'::jsonb),
    'show_study_hours', COALESCE((SELECT p.show_study_hours FROM public.profiles p WHERE p.user_id = _user_id LIMIT 1), true),
    'lifetime_points', COALESCE((SELECT up.lifetime_points FROM public.user_progress up WHERE up.user_id = _user_id), 0),
    'current_streak', COALESCE((SELECT up.current_streak FROM public.user_progress up WHERE up.user_id = _user_id), 0),
    'longest_streak', COALESCE((SELECT up.longest_streak FROM public.user_progress up WHERE up.user_id = _user_id), 0),
    'total_seconds', CASE
      WHEN COALESCE((SELECT p.show_study_hours FROM public.profiles p WHERE p.user_id = _user_id LIMIT 1), true)
      THEN COALESCE((SELECT SUM(s.duration_seconds) FROM public.study_sessions s WHERE s.user_id = _user_id), 0)
      ELSE NULL END
  )
$$;

REVOKE ALL ON FUNCTION public.public_student_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_student_profile(uuid) TO authenticated;

CREATE TABLE IF NOT EXISTS public.battle_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  from_name text NOT NULL DEFAULT 'Student',
  room_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS battle_invites_to_pending_idx ON public.battle_invites (to_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS battle_invites_from_idx ON public.battle_invites (from_user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.battle_invites TO authenticated;
GRANT ALL ON public.battle_invites TO service_role;

ALTER TABLE public.battle_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own invites"
ON public.battle_invites FOR SELECT TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send invites"
ON public.battle_invites FOR INSERT TO authenticated
WITH CHECK (auth.uid() = from_user_id AND from_user_id <> to_user_id AND status = 'pending');

CREATE POLICY "Participants can update invites"
ON public.battle_invites FOR UPDATE TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id)
WITH CHECK (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE TRIGGER battle_invites_set_updated_at
BEFORE UPDATE ON public.battle_invites
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();