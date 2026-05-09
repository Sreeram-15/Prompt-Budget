create table if not exists audits (
  id uuid primary key,
  created_at timestamptz not null default now(),
  audit_input jsonb not null,
  audit_result jsonb not null,
  total_monthly_spend numeric not null,
  total_monthly_savings numeric not null,
  total_annual_savings numeric not null,
  use_case text not null,
  team_size integer not null
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  audit_id uuid not null references audits(id) on delete cascade,
  email text not null,
  company_name text,
  role text,
  team_size integer,
  consultation_requested boolean not null default false
);

create table if not exists rate_limits (
  key_hash text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  primary key (key_hash, window_start)
);
