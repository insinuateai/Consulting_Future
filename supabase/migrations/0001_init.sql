-- =============================================================================
-- Insinuate.ai — Initial schema
-- Apply with: supabase db push (after `supabase link --project-ref ...`)
-- Or paste into Supabase SQL Editor.
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Helpers ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- leads -----------------------------------------------------------------------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  email       citext not null,
  company     text,
  domain      text,
  source      text,
  utm         jsonb,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create unique index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_domain_idx on public.leads (domain);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- dossiers --------------------------------------------------------------------
create type dossier_status as enum ('pending', 'streaming', 'complete', 'error');

create table if not exists public.dossiers (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  lead_id         uuid references public.leads(id) on delete set null,
  domain          text not null,
  company_name    text,
  industry        text,
  input           jsonb not null,
  xray            jsonb,
  analysis        jsonb,
  opportunities   jsonb,
  competitors     jsonb,
  model           text,
  status          dossier_status not null default 'pending',
  error           text,
  email_sent_at   timestamptz,
  shared_count    integer not null default 0,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);
create index if not exists dossiers_lead_id_idx on public.dossiers (lead_id);
create index if not exists dossiers_domain_idx on public.dossiers (domain);
create index if not exists dossiers_status_idx on public.dossiers (status);
create index if not exists dossiers_created_at_idx on public.dossiers (created_at desc);

-- conversations (Concierge, Voice, Boardroom) ---------------------------------
create type conversation_channel as enum ('concierge', 'voice', 'boardroom');

create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references public.leads(id) on delete set null,
  channel     conversation_channel not null,
  messages    jsonb not null default '[]'::jsonb,
  metadata    jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists conversations_lead_id_idx on public.conversations (lead_id);
create index if not exists conversations_channel_idx on public.conversations (channel);
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- agent_runs (Playground + observability) -------------------------------------
create type agent_run_status as enum ('queued', 'running', 'success', 'error');

create table if not exists public.agent_runs (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid references public.leads(id) on delete set null,
  dossier_id    uuid references public.dossiers(id) on delete set null,
  agent_slug    text not null,
  input         jsonb not null,
  output        jsonb,
  status        agent_run_status not null default 'queued',
  duration_ms   integer,
  tokens_in     integer,
  tokens_out    integer,
  cost_cents    integer,
  error         text,
  created_at    timestamptz not null default now()
);
create index if not exists agent_runs_lead_id_idx on public.agent_runs (lead_id);
create index if not exists agent_runs_agent_slug_idx on public.agent_runs (agent_slug);
create index if not exists agent_runs_status_idx on public.agent_runs (status);
create index if not exists agent_runs_created_at_idx on public.agent_runs (created_at desc);

-- scopes (self-serve SOW + checkout) ------------------------------------------
create type scope_status as enum ('draft', 'sent', 'signed', 'paid', 'kicked_off');

create table if not exists public.scopes (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid references public.leads(id) on delete set null,
  dossier_id          uuid references public.dossiers(id) on delete set null,
  line_items          jsonb not null,
  subtotal_cents      integer not null,
  total_cents         integer not null,
  stripe_session_id   text,
  sow_pandadoc_id     text,
  status              scope_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists scopes_lead_id_idx on public.scopes (lead_id);
create index if not exists scopes_status_idx on public.scopes (status);
create trigger scopes_set_updated_at
  before update on public.scopes
  for each row execute function public.set_updated_at();

-- builds (live build dashboards) ----------------------------------------------
create type build_status as enum ('planning', 'in_progress', 'shipped');

create table if not exists public.builds (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  client_name  text not null,
  public       boolean not null default false,
  repo_url     text,
  deploy_url   text,
  status       build_status not null default 'planning',
  metrics      jsonb,
  started_at   timestamptz not null default now(),
  shipped_at   timestamptz
);
create index if not exists builds_status_idx on public.builds (status);
create index if not exists builds_public_idx on public.builds (public) where public = true;

-- build_events (commit/deploy stream) -----------------------------------------
create table if not exists public.build_events (
  id          uuid primary key default gen_random_uuid(),
  build_id    uuid not null references public.builds(id) on delete cascade,
  kind        text not null,
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists build_events_build_id_idx on public.build_events (build_id, created_at desc);

-- generated_apps (Sprint 3 — Live App Generator) ------------------------------
create type generated_app_status as enum ('queued', 'building', 'ready', 'failed');

create table if not exists public.generated_apps (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references public.leads(id) on delete set null,
  prompt      text not null,
  app_name    text,
  summary     text,
  files       jsonb not null default '[]'::jsonb,
  repo_url    text,
  deploy_url  text,
  status      generated_app_status not null default 'queued',
  error       text,
  created_at  timestamptz not null default now(),
  ready_at    timestamptz
);
create index if not exists generated_apps_lead_id_idx on public.generated_apps (lead_id);
create index if not exists generated_apps_status_idx on public.generated_apps (status);

-- digital_employees (Sprint 5 — I3) -------------------------------------------
create type digital_employee_status as enum ('provisioning', 'active', 'expired', 'converted', 'cancelled');

create table if not exists public.digital_employees (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid references public.leads(id) on delete set null,
  name            text not null,
  role            text not null,
  task_brief      text not null,
  slack_team_id   text,
  status          digital_employee_status not null default 'provisioning',
  trial_started_at timestamptz not null default now(),
  trial_ends_at   timestamptz not null default now() + interval '7 days',
  converted_at    timestamptz,
  metadata        jsonb
);
create index if not exists digital_employees_lead_id_idx on public.digital_employees (lead_id);
create index if not exists digital_employees_status_idx on public.digital_employees (status);

-- workforce_reports (Sprint 9 — I10) ------------------------------------------
create table if not exists public.workforce_reports (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references public.leads(id) on delete set null,
  roles       jsonb not null,
  analysis    jsonb,
  status      text not null default 'pending',
  created_at  timestamptz not null default now()
);
create index if not exists workforce_reports_lead_id_idx on public.workforce_reports (lead_id);

-- widget_installs (Sprint 7 — I8 Open X-Ray Widget) ---------------------------
create table if not exists public.widget_partners (
  id              uuid primary key default gen_random_uuid(),
  partner_name    text not null,
  api_key         text not null unique,
  domain_allow    text[],
  rev_share_pct   numeric(5,2) not null default 15.00,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists widget_partners_api_key_idx on public.widget_partners (api_key);

create table if not exists public.widget_events (
  id              uuid primary key default gen_random_uuid(),
  partner_id      uuid references public.widget_partners(id) on delete cascade,
  lead_id         uuid references public.leads(id) on delete set null,
  event           text not null,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);
create index if not exists widget_events_partner_id_idx on public.widget_events (partner_id, created_at desc);

-- Row Level Security ----------------------------------------------------------
-- Default deny-all on all tables. Service role bypasses RLS for all writes.
-- Public reads are scoped via specific policies below.

alter table public.leads enable row level security;
alter table public.dossiers enable row level security;
alter table public.conversations enable row level security;
alter table public.agent_runs enable row level security;
alter table public.scopes enable row level security;
alter table public.builds enable row level security;
alter table public.build_events enable row level security;
alter table public.generated_apps enable row level security;
alter table public.digital_employees enable row level security;
alter table public.workforce_reports enable row level security;
alter table public.widget_partners enable row level security;
alter table public.widget_events enable row level security;

-- Public read for completed shared dossiers (the viral loop)
create policy "anon can read complete dossiers"
  on public.dossiers for select
  to anon
  using (status = 'complete');

-- Public read for public builds (build-in-public dashboards)
create policy "anon can read public builds"
  on public.builds for select
  to anon
  using (public = true);

create policy "anon can read events for public builds"
  on public.build_events for select
  to anon
  using (
    exists (
      select 1 from public.builds b
      where b.id = build_events.build_id and b.public = true
    )
  );

-- Required citext extension
create extension if not exists "citext";
