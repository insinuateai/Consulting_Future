-- Prova -- Supabase Migration 011
-- CCO Live Dashboard: analytics RPC + supporting indexes.

-- Indexes for fast analytics aggregation
create index if not exists idx_certs_user_created
  on certificates(user_id, created_at desc);

create index if not exists idx_certs_user_verdict
  on certificates(user_id, verdict);

create index if not exists idx_certs_metadata_gin
  on certificates using gin(metadata);

-- ---------------------------------------------------------------------------
-- RPC: cco_analytics
-- Returns all aggregated data the CCO dashboard needs in a single round-trip.
-- Parameters:
--   p_user_id      -- UUID of the requesting user
--   p_start        -- start of date range (inclusive)
--   p_end          -- end of date range (inclusive)
--   p_model        -- optional filter: metadata->>'model'
--   p_workflow     -- optional filter: metadata->>'workflow'
--   p_failure_type -- optional filter: failure->>'type'
-- ---------------------------------------------------------------------------
create or replace function cco_analytics(
  p_user_id      uuid,
  p_start        timestamptz,
  p_end          timestamptz,
  p_model        text default null,
  p_workflow     text default null,
  p_failure_type text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_result json;
begin
  with filtered as (
    select
      c.id,
      c.created_at,
      c.verdict,
      c.failure,
      c.metadata,
      date_trunc('week', c.created_at) as week_start
    from certificates c
    where
      c.user_id = p_user_id
      and c.created_at >= p_start
      and c.created_at <= p_end
      and (p_model        is null or c.metadata->>'model'        = p_model)
      and (p_workflow      is null or c.metadata->>'workflow'     = p_workflow)
      and (p_failure_type  is null or c.failure->>'type'         = p_failure_type)
  ),

  kpis as (
    select
      count(*) filter (where verdict = 'INVALID')                          as failures_caught,
      count(*)                                                              as certs_issued,
      case when count(*) = 0 then 0
           else round(100.0 * count(*) filter (where verdict = 'VALID') / count(*), 1)
      end                                                                   as avg_validity_rate
    from filtered
  ),

  policies_evidenced as (
    select count(distinct cp.policy_id) as cnt
    from certificate_policies cp
    where cp.cert_id in (select id from filtered)
  ),

  weekly as (
    select
      week_start,
      count(*) filter (where verdict = 'VALID')                            as valid_count,
      count(*) filter (where failure->>'type' = 'CIRCULAR')                as circular,
      count(*) filter (where failure->>'type' = 'CONTRADICTION')           as contradiction,
      count(*) filter (where failure->>'type' = 'UNSUPPORTED_LEAP')        as unsupported_leap
    from filtered
    group by week_start
    order by week_start
  ),

  by_model as (
    select
      coalesce(metadata->>'model', 'unknown')                              as model,
      count(*)                                                              as total,
      count(*) filter (where verdict = 'VALID')                            as valid_count,
      count(*) filter (where verdict = 'INVALID')                          as invalid_count
    from filtered
    group by metadata->>'model'
    order by total desc
    limit 20
  ),

  by_workflow as (
    select
      coalesce(metadata->>'workflow', 'untagged')                          as workflow,
      count(*)                                                              as total,
      count(*) filter (where verdict = 'VALID')                            as valid_count,
      count(*) filter (where verdict = 'INVALID')                          as invalid_count
    from filtered
    group by metadata->>'workflow'
    order by total desc
    limit 20
  ),

  by_failure as (
    select
      coalesce(failure->>'type', 'NONE')                                   as failure_type,
      count(*)                                                              as total
    from filtered
    group by failure->>'type'
    order by total desc
  )

  select json_build_object(
    'kpis', (
      select json_build_object(
        'failures_caught',    k.failures_caught,
        'certs_issued',       k.certs_issued,
        'avg_validity_rate',  k.avg_validity_rate,
        'policies_evidenced', pe.cnt
      )
      from kpis k, policies_evidenced pe
    ),
    'weekly_trend', (
      select json_agg(json_build_object(
        'week',            to_char(week_start, 'YYYY-MM-DD'),
        'valid',           valid_count,
        'circular',        circular,
        'contradiction',   contradiction,
        'unsupported_leap', unsupported_leap
      ) order by week_start)
      from weekly
    ),
    'by_model', (
      select json_agg(json_build_object(
        'model',   model,
        'total',   total,
        'valid',   valid_count,
        'invalid', invalid_count
      ))
      from by_model
    ),
    'by_workflow', (
      select json_agg(json_build_object(
        'workflow', workflow,
        'total',    total,
        'valid',    valid_count,
        'invalid',  invalid_count
      ))
      from by_workflow
    ),
    'by_failure_type', (
      select json_agg(json_build_object(
        'type',  failure_type,
        'count', total
      ))
      from by_failure
    )
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function cco_analytics(uuid, timestamptz, timestamptz, text, text, text)
  to authenticated, service_role;
