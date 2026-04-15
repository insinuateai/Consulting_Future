-- =============================================================================
-- Insinuate.ai — Intake sessions
-- Stores the chatbot-driven discovery conversations, synthesized synopsis,
-- and link to the generated prototype app.
-- =============================================================================

create table if not exists public.intake_sessions (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid references public.leads(id) on delete set null,
  email        text,
  messages     jsonb not null default '[]'::jsonb,
  insights     jsonb not null default '[]'::jsonb,
  synopsis     jsonb,
  app_id       text,
  prototype_url text,
  status       text not null default 'discovery',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists intake_sessions_lead_idx on public.intake_sessions (lead_id);
create index if not exists intake_sessions_email_idx on public.intake_sessions (email);
create index if not exists intake_sessions_status_idx on public.intake_sessions (status);

drop trigger if exists intake_sessions_set_updated_at on public.intake_sessions;
create trigger intake_sessions_set_updated_at
  before update on public.intake_sessions
  for each row execute function public.set_updated_at();

alter table public.intake_sessions enable row level security;

drop policy if exists "intake_sessions_service_all" on public.intake_sessions;
create policy "intake_sessions_service_all"
  on public.intake_sessions
  for all
  to service_role
  using (true)
  with check (true);
