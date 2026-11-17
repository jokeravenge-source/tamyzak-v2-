
-- Account-bound cosmetic entitlement. Clients can read their own unlock, but
-- only the redeem RPC can issue it; Premium and points do not unlock Koki.
CREATE TABLE IF NOT EXISTS public.character_unlocks (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_key text NOT NULL CHECK (character_key = 'koki'),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, character_key)
);
ALTER TABLE public.character_unlocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.character_unlocks FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.character_unlocks TO authenticated;
DROP POLICY IF EXISTS "Read own character unlocks" ON public.character_unlocks;
CREATE POLICY "Read own character unlocks" ON public.character_unlocks
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.character_unlock_status()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501'; END IF;
  RETURN jsonb_build_object('user_id', _uid, 'unlocked', (
    SELECT coalesce(jsonb_agg(character_key ORDER BY character_key), '[]'::jsonb)
    FROM public.character_unlocks WHERE user_id = _uid
  ));
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_character_code(access_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501'; END IF;
  IF lower(btrim(coalesce(access_code, ''))) <> 'koki' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code');
  END IF;
  INSERT INTO public.character_unlocks(user_id, character_key) VALUES (_uid, 'koki')
    ON CONFLICT (user_id, character_key) DO NOTHING;
  RETURN jsonb_build_object('ok', true, 'user_id', _uid, 'character_key', 'koki');
END;
$$;

-- Enforce the gate on the saved profile as well as in the chooser. This also
-- covers direct API writes and attempts to select the variant during insert.
CREATE OR REPLACE FUNCTION public.guard_code_character()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.character IS NOT NULL AND jsonb_typeof(NEW.character) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'invalid_character' USING ERRCODE = '22023';
  END IF;
  IF NEW.character ->> 'variant' IS NOT NULL THEN
    -- Match the supported integer catalog exactly: alternate number encodings
    -- must not bypass a renderer that would coerce them to variant 16.
    IF (NEW.character ->> 'variant') !~ '^([1-9]|1[0-6])$' THEN
      RAISE EXCEPTION 'invalid_character_variant' USING ERRCODE = '22023';
    END IF;
    IF NEW.character ->> 'variant' = '16' AND (
      NEW.gender IS DISTINCT FROM 'female' OR NOT EXISTS (
        SELECT 1 FROM public.character_unlocks WHERE user_id = NEW.user_id AND character_key = 'koki'
      )
    ) THEN
      RAISE EXCEPTION 'character_code_required' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_code_character ON public.profiles;
CREATE TRIGGER enforce_code_character BEFORE INSERT OR UPDATE OF character, gender, user_id
  ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_code_character();

REVOKE ALL ON FUNCTION public.character_unlock_status(), public.redeem_character_code(text), public.guard_code_character() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.character_unlock_status(), public.redeem_character_code(text) TO authenticated;
