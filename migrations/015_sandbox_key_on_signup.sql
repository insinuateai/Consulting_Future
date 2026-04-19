-- 015_sandbox_key_on_signup.sql
-- Auto-provision a sandbox API key when a new user signs up.
-- Uses a one-time pending_keys table so the raw key can be shown once in the dashboard.

-- One-time readable key store (TTL enforced by dashboard read + delete, or a cron)
create table if not exists pending_keys (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references users(id) on delete cascade,
  raw_key    text        not null,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz not null default now()
);

-- RLS: user can only read their own pending key
alter table pending_keys enable row level security;
create policy "pending_keys_select_own"
  on pending_keys for select
  using (auth.uid() = user_id);
create policy "pending_keys_delete_own"
  on pending_keys for delete
  using (auth.uid() = user_id);

-- Updated trigger: also insert an api_key + pending_key on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_raw_key    text;
  v_key_hash   text;
begin
  -- Sync to public.users
  insert into public.users (id, email, created_at, plan)
  values (new.id, new.email, now(), 'free')
  on conflict (id) do update set email = excluded.email;

  -- Generate a random API key: sk-prova-<32 hex chars>
  v_raw_key  := 'sk-prova-' || encode(gen_random_bytes(16), 'hex');
  v_key_hash := encode(digest(v_raw_key, 'sha256'), 'hex');

  -- Insert hashed key into api_keys
  insert into public.api_keys (user_id, key_hash, label, is_active)
  values (new.id, v_key_hash, 'sandbox', true);

  -- Write plaintext key to pending_keys (shown once, expires in 10 min)
  insert into public.pending_keys (user_id, raw_key)
  values (new.id, v_raw_key);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
