# Insinuate — Supabase

## First-time setup

1. Create a project at https://supabase.com/dashboard.
2. Copy `.env.example` → `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — never client)
3. Apply the migration:
   - **Easy:** paste `migrations/0001_init.sql` into SQL Editor → Run.
   - **CLI:** `npx supabase link --project-ref <ref>` then `npx supabase db push`.
4. Regenerate types:
   ```
   npx supabase gen types typescript --project-id <ref> > src/lib/supabase.types.ts
   ```

## Tables

| Table | Purpose |
|---|---|
| `leads` | Email captures + UTM tracking |
| `dossiers` | AI-generated strategic briefs (Sprint 1) |
| `conversations` | Concierge / Voice / Boardroom transcripts |
| `agent_runs` | Playground agent invocations + cost tracking |
| `scopes` | Self-serve SOWs + checkout state (Sprint 5) |
| `builds` + `build_events` | Live build dashboards (Sprint 6) |
| `generated_apps` | Live App Generator history (Sprint 3) |
| `digital_employees` | 7-day trial tracking (Sprint 5) |
| `workforce_reports` | Workforce Optimizer outputs (Sprint 9) |
| `widget_partners` + `widget_events` | Open X-Ray Widget partner program (Sprint 7) |

## RLS

Default deny. Two public-read policies:
- Completed dossiers (the viral loop).
- Public builds + their events (build-in-public).

All writes go through service-role from server actions / route handlers.
