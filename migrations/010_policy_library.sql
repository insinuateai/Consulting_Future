-- Prova — Supabase Migration 010
-- Policy Library: regulatory control registry and certificate mapping.

create table if not exists policies (
  id           text primary key,               -- e.g. "EU_AI_ACT_ART_15"
  framework    text not null,                  -- e.g. "EU_AI_ACT"
  article      text not null,                  -- e.g. "Art. 15"
  title        text not null,
  description  text not null,
  satisfied_by jsonb not null default '[]'     -- array of detection capability names
);

create table if not exists certificate_policies (
  cert_id   text not null references certificates(id),
  policy_id text not null references policies(id),
  primary key (cert_id, policy_id)
);

create index if not exists idx_cert_policies_policy on certificate_policies(policy_id);
create index if not exists idx_cert_policies_cert   on certificate_policies(cert_id);
