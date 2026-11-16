-- Replacement for the Arabic hub's external literature bot; no legacy data is deleted.
CREATE TABLE IF NOT EXISTS public.literature_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code_hash text UNIQUE NOT NULL, code_hint text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '', max_uses integer NOT NULL CHECK (max_uses BETWEEN 1 AND 10000),
  uses integer NOT NULL DEFAULT 0 CHECK (uses >= 0), expires_at timestamptz,
  revoked boolean NOT NULL DEFAULT false, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.literature_enrollments (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code_id uuid NOT NULL REFERENCES public.literature_access_codes(id),
  expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.literature_code_attempts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  attempts integer NOT NULL, window_end timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS public.literature_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 180),
  chapter text NOT NULL DEFAULT '', file_path text NOT NULL UNIQUE,
  is_published boolean NOT NULL DEFAULT false, created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.literature_mcq_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 180),
  chapter text NOT NULL DEFAULT '', source_name text NOT NULL,
  requested_count integer NOT NULL CHECK (requested_count BETWEEN 1 AND 100),
  questions jsonb NOT NULL CHECK (jsonb_typeof(questions) = 'array' AND jsonb_array_length(questions) = requested_count),
  is_published boolean NOT NULL DEFAULT false, created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.literature_mcq_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), set_id uuid NOT NULL REFERENCES public.literature_mcq_sets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL, total integer NOT NULL, answers jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.is_literature_supervisor() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT auth.uid() IS NOT NULL AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role)); $$;
CREATE OR REPLACE FUNCTION public.has_literature_access() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT public.is_literature_supervisor() OR EXISTS (
 SELECT 1 FROM public.literature_enrollments e JOIN public.literature_access_codes c ON c.id=e.code_id
 WHERE e.user_id=auth.uid() AND NOT c.revoked AND (e.expires_at IS NULL OR e.expires_at > now())
); $$;
CREATE OR REPLACE FUNCTION public.literature_course_access() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT jsonb_build_object('supervisor',public.is_literature_supervisor(),'unlocked',public.has_literature_access()); $$;

ALTER TABLE public.literature_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literature_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literature_code_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literature_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literature_mcq_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literature_mcq_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.literature_access_codes, public.literature_enrollments, public.literature_code_attempts, public.literature_exams, public.literature_mcq_sets, public.literature_mcq_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.literature_access_codes, public.literature_enrollments, public.literature_mcq_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.literature_exams, public.literature_mcq_sets TO authenticated;
GRANT ALL ON public.literature_access_codes, public.literature_enrollments, public.literature_code_attempts, public.literature_exams, public.literature_mcq_sets, public.literature_mcq_attempts TO service_role;
DROP POLICY IF EXISTS "Literature supervisors read code metadata" ON public.literature_access_codes;
CREATE POLICY "Literature supervisors read code metadata" ON public.literature_access_codes FOR SELECT TO authenticated USING(public.is_literature_supervisor());
DROP POLICY IF EXISTS "Literature students read own enrollment" ON public.literature_enrollments;
CREATE POLICY "Literature students read own enrollment" ON public.literature_enrollments FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.is_literature_supervisor());
DROP POLICY IF EXISTS "Literature exams read" ON public.literature_exams;
CREATE POLICY "Literature exams read" ON public.literature_exams FOR SELECT TO authenticated USING(public.is_literature_supervisor() OR (is_published AND public.has_literature_access()));
DROP POLICY IF EXISTS "Literature supervisors manage exams" ON public.literature_exams;
CREATE POLICY "Literature supervisors manage exams" ON public.literature_exams FOR ALL TO authenticated USING(public.is_literature_supervisor()) WITH CHECK(public.is_literature_supervisor());
DROP POLICY IF EXISTS "Literature supervisors manage MCQ sets" ON public.literature_mcq_sets;
CREATE POLICY "Literature supervisors manage MCQ sets" ON public.literature_mcq_sets FOR ALL TO authenticated USING(public.is_literature_supervisor()) WITH CHECK(public.is_literature_supervisor());
DROP POLICY IF EXISTS "Literature attempts read" ON public.literature_mcq_attempts;
CREATE POLICY "Literature attempts read" ON public.literature_mcq_attempts FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.is_literature_supervisor());

CREATE OR REPLACE FUNCTION public.create_literature_codes(quantity integer DEFAULT 1, use_limit integer DEFAULT 1, expiry timestamptz DEFAULT NULL, code_label text DEFAULT '') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE result jsonb := '[]'; raw_code text; new_id uuid; i integer;
BEGIN
 IF NOT public.is_literature_supervisor() THEN RAISE EXCEPTION 'Supervisor access required'; END IF;
 IF quantity IS NULL OR quantity NOT BETWEEN 1 AND 100 OR use_limit IS NULL OR use_limit NOT BETWEEN 1 AND 10000 OR (expiry IS NOT NULL AND expiry <= now()) OR length(coalesce(code_label,''))>180 THEN RAISE EXCEPTION 'Invalid code settings'; END IF;
 FOR i IN 1..quantity LOOP
  raw_code := 'ADAB-' || upper(replace(gen_random_uuid()::text,'-',''));
  INSERT INTO public.literature_access_codes(code_hash,code_hint,max_uses,expires_at,label,created_by)
  VALUES(encode(sha256(convert_to(raw_code,'UTF8')),'hex'),right(raw_code,8),use_limit,expiry,coalesce(code_label,''),auth.uid()) RETURNING id INTO new_id;
  result := result || jsonb_build_array(jsonb_build_object('id',new_id,'code',raw_code));
 END LOOP;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.revoke_literature_code(code_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
 IF NOT public.is_literature_supervisor() THEN RAISE EXCEPTION 'Supervisor access required'; END IF;
 UPDATE public.literature_access_codes SET revoked=true WHERE id=code_id;
END $$;
CREATE OR REPLACE FUNCTION public.redeem_literature_code(access_code text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE c public.literature_access_codes%ROWTYPE; tries integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF public.has_literature_access() THEN RETURN jsonb_build_object('ok',true); END IF;
 -- Return failures instead of raising: the failed-attempt counter must survive.
 INSERT INTO public.literature_code_attempts(user_id,attempts,window_end) VALUES(auth.uid(),1,now()+interval '15 minutes')
 ON CONFLICT(user_id) DO UPDATE SET attempts=CASE WHEN literature_code_attempts.window_end<=now() THEN 1 ELSE literature_code_attempts.attempts+1 END,
 window_end=CASE WHEN literature_code_attempts.window_end<=now() THEN now()+interval '15 minutes' ELSE literature_code_attempts.window_end END RETURNING attempts INTO tries;
 IF tries>10 THEN RETURN jsonb_build_object('ok',false,'error','rate_limited'); END IF;
 IF public.has_literature_access() THEN RETURN jsonb_build_object('ok',true); END IF;
 IF access_code IS NULL OR length(access_code)>100 THEN RETURN jsonb_build_object('ok',false,'error','invalid_code'); END IF;
 SELECT * INTO c FROM public.literature_access_codes WHERE code_hash=encode(sha256(convert_to(upper(trim(access_code)),'UTF8')),'hex') FOR UPDATE;
 IF NOT FOUND OR c.revoked OR c.uses>=c.max_uses OR (c.expires_at IS NOT NULL AND c.expires_at<=now()) THEN RETURN jsonb_build_object('ok',false,'error','invalid_code'); END IF;
 INSERT INTO public.literature_enrollments(user_id,code_id,expires_at) VALUES(auth.uid(),c.id,c.expires_at)
 ON CONFLICT(user_id) DO UPDATE SET code_id=excluded.code_id,expires_at=excluded.expires_at,created_at=now();
 UPDATE public.literature_access_codes SET uses=uses+1 WHERE id=c.id;
 RETURN jsonb_build_object('ok',true);
END $$;
-- Validating at the DB boundary also protects direct supervisor writes and model output.
CREATE OR REPLACE FUNCTION public.validate_literature_mcqs() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE q jsonb;
BEGIN
 FOR q IN SELECT value FROM jsonb_array_elements(NEW.questions) LOOP
  IF jsonb_typeof(q) IS DISTINCT FROM 'object' OR jsonb_typeof(q->'question') IS DISTINCT FROM 'string' OR length(trim(q->>'question')) NOT BETWEEN 1 AND 4000
    OR jsonb_typeof(q->'choices') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid MCQ'; END IF;
  IF jsonb_array_length(q->'choices')<>4 OR EXISTS(SELECT 1 FROM jsonb_array_elements(q->'choices') v WHERE jsonb_typeof(v) IS DISTINCT FROM 'string' OR length(trim(v #>> '{}')) NOT BETWEEN 1 AND 1000)
    OR (SELECT count(DISTINCT lower(trim(v #>> '{}'))) FROM jsonb_array_elements(q->'choices') v)<>4
    OR coalesce(q->>'answer_index','') !~ '^[0-3]$' OR jsonb_typeof(q->'answer_index') IS DISTINCT FROM 'number'
    OR jsonb_typeof(q->'explanation') IS DISTINCT FROM 'string' OR length(trim(q->>'explanation')) NOT BETWEEN 1 AND 6000 THEN RAISE EXCEPTION 'Invalid MCQ choices or answer'; END IF;
 END LOOP;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS literature_validate_mcqs ON public.literature_mcq_sets;
CREATE TRIGGER literature_validate_mcqs BEFORE INSERT OR UPDATE ON public.literature_mcq_sets FOR EACH ROW EXECUTE FUNCTION public.validate_literature_mcqs();

CREATE OR REPLACE FUNCTION public.list_literature_mcq_sets() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
 IF NOT public.has_literature_access() THEN RAISE EXCEPTION 'Course code required'; END IF;
 RETURN coalesce((SELECT jsonb_agg(jsonb_build_object('id',s.id,'title',s.title,'chapter',s.chapter,'count',s.requested_count) ORDER BY s.created_at DESC)
 FROM public.literature_mcq_sets s WHERE s.is_published),'[]'::jsonb);
END $$;
CREATE OR REPLACE FUNCTION public.get_literature_mcq_set(set_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.has_literature_access() THEN RAISE EXCEPTION 'Course code required'; END IF;
 SELECT jsonb_build_object('id',s.id,'title',s.title,'questions',(SELECT jsonb_agg(jsonb_build_object('question',q.value->>'question','choices',q.value->'choices') ORDER BY q.ordinality) FROM jsonb_array_elements(s.questions) WITH ORDINALITY q))
 INTO result FROM public.literature_mcq_sets s WHERE s.id=set_id AND s.is_published;
 IF result IS NULL THEN RAISE EXCEPTION 'Question set unavailable'; END IF;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.submit_literature_mcq(set_id uuid, selections jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE s public.literature_mcq_sets%ROWTYPE; n integer; score integer := 0; i integer; q jsonb; review jsonb := '[]';
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_literature_access() THEN RAISE EXCEPTION 'Course code required'; END IF;
 SELECT * INTO s FROM public.literature_mcq_sets WHERE id=set_id AND is_published;
 IF NOT FOUND THEN RAISE EXCEPTION 'Question set unavailable'; END IF;
 n:=jsonb_array_length(s.questions);
 IF jsonb_typeof(selections) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid answers'; END IF;
 IF jsonb_array_length(selections)<>n OR EXISTS(SELECT 1 FROM jsonb_array_elements(selections) v WHERE jsonb_typeof(v) IS DISTINCT FROM 'number' OR (v #>> '{}') !~ '^[0-3]$') THEN RAISE EXCEPTION 'Answer all questions'; END IF;
 FOR i IN 0..n-1 LOOP
  q:=s.questions->i;
  IF (selections->>i)::integer=(q->>'answer_index')::integer THEN score:=score+1; END IF;
  review:=review || jsonb_build_array(jsonb_build_object('answer_index',q->'answer_index','explanation',q->>'explanation'));
 END LOOP;
 INSERT INTO public.literature_mcq_attempts(set_id,user_id,score,total,answers) VALUES(s.id,auth.uid(),score,n,selections);
 RETURN jsonb_build_object('score',score,'total',n,'review',review);
END $$;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('literature-course','literature-course',false,104857600,ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
DROP POLICY IF EXISTS "Literature files read" ON storage.objects;
CREATE POLICY "Literature files read" ON storage.objects FOR SELECT TO authenticated USING(bucket_id='literature-course' AND (
 public.is_literature_supervisor() OR (public.has_literature_access() AND EXISTS(SELECT 1 FROM public.literature_exams e WHERE e.file_path=name AND e.is_published))));
DROP POLICY IF EXISTS "Literature supervisors upload files" ON storage.objects;
CREATE POLICY "Literature supervisors upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='literature-course' AND public.is_literature_supervisor());
DROP POLICY IF EXISTS "Literature supervisors delete files" ON storage.objects;
CREATE POLICY "Literature supervisors delete files" ON storage.objects FOR DELETE TO authenticated USING(bucket_id='literature-course' AND public.is_literature_supervisor());

REVOKE ALL ON FUNCTION public.is_literature_supervisor(),public.has_literature_access(),public.literature_course_access(),public.create_literature_codes(integer,integer,timestamptz,text),public.revoke_literature_code(uuid),public.redeem_literature_code(text),public.list_literature_mcq_sets(),public.get_literature_mcq_set(uuid),public.submit_literature_mcq(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.is_literature_supervisor(),public.has_literature_access(),public.literature_course_access(),public.create_literature_codes(integer,integer,timestamptz,text),public.revoke_literature_code(uuid),public.redeem_literature_code(text),public.list_literature_mcq_sets(),public.get_literature_mcq_set(uuid),public.submit_literature_mcq(uuid,jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.validate_literature_mcqs() FROM PUBLIC,anon;
CREATE INDEX IF NOT EXISTS literature_mcq_attempts_owner_idx ON public.literature_mcq_attempts(user_id,set_id,created_at DESC);
