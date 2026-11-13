-- Recalculate challenge totals without deleting any study history or points.
-- Apply this migration through the active database migration runner.
CREATE OR REPLACE FUNCTION public.get_my_study_challenges()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  with mine as (
    select c.*, me.status as my_status, coalesce(cp.display_name, 'Student') as creator_name
    from public.study_challenges c
    join public.study_challenge_members me on me.challenge_id = c.id and me.user_id = auth.uid()
    left join public.profiles cp on cp.user_id = c.creator_id
    where me.status <> 'declined'
    union all
    select c.*, 'open'::text as my_status, coalesce(cp.display_name, 'Student') as creator_name
    from public.study_challenges c
    left join public.profiles cp on cp.user_id = c.creator_id
    where c.is_public and c.status = 'active' and c.ends_at > now()
      and not exists (select 1 from public.study_challenge_members m where m.challenge_id = c.id and m.user_id = auth.uid())
  ), session_intervals as (
    -- Legacy sessions have only a saved-at timestamp and a studied duration.
    -- Infer their interval, then intersect it with the challenge and server time.
    select m.challenge_id, m.user_id,
      greatest(c.starts_at, s.created_at - make_interval(secs => greatest(0, least(s.duration_seconds, 43200)))) as study_start,
      least(s.created_at, c.ends_at, now()) as study_end
    from public.study_challenge_members m
    join mine c on c.id = m.challenge_id
    join public.study_sessions s on s.user_id = m.user_id
    where m.status = 'accepted' and s.created_at <= now()
      and s.created_at > c.starts_at and s.duration_seconds > 0
  ), session_ranges as (
    -- A second device or duplicate save must not award the same seconds twice.
    select challenge_id, user_id,
      range_agg(tstzrange(study_start, study_end, '[)')) as studied
    from session_intervals
    where study_end > study_start
    group by challenge_id, user_id
  ), participant_totals as (
    select m.challenge_id, m.user_id, m.status,
      coalesce(p.display_name, 'Student') as display_name,
      coalesce((select floor(sum(extract(epoch from upper(study_period) - lower(study_period))))
        from unnest(r.studied) as study_period), 0)::bigint as total_seconds
    from public.study_challenge_members m
    join mine c on c.id = m.challenge_id
    left join public.profiles p on p.user_id = m.user_id
    left join session_ranges r on r.challenge_id = m.challenge_id and r.user_id = m.user_id
    where m.status <> 'declined'
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id, 'title', c.title, 'creatorId', c.creator_id, 'creatorName', c.creator_name,
      'startsAt', c.starts_at, 'endsAt', c.ends_at, 'status', c.status, 'myStatus', c.my_status,
      'isPublic', c.is_public,
      'participants', (select coalesce(jsonb_agg(jsonb_build_object(
          'userId', pt.user_id, 'displayName', pt.display_name, 'status', pt.status, 'totalSeconds', pt.total_seconds
        ) order by case when pt.status = 'accepted' then 0 else 1 end, pt.total_seconds desc, pt.display_name asc), '[]'::jsonb)
        from participant_totals pt where pt.challenge_id = c.id)
    ) order by case when c.is_public and c.status = 'active' and c.ends_at > now() then 0 when c.my_status = 'pending' then 1 when c.status = 'active' and c.ends_at > now() then 2 else 3 end, c.ends_at desc), '[]'::jsonb)
  from mine c;
$$;
REVOKE ALL ON FUNCTION public.get_my_study_challenges() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_study_challenges() TO authenticated;

COMMENT ON FUNCTION public.get_my_study_challenges() IS
  'Ranks saved study time within the challenge window, merging overlapping sessions. Legacy sessions use saved-at minus capped duration as their inferred start.';
