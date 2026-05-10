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

create or replace function increment_rate_limit(
  p_key_hash text,
  p_window_start timestamptz,
  p_limit integer
)
returns boolean
language plpgsql
as $$
declare
  next_count integer;
begin
  insert into rate_limits (key_hash, window_start, count)
  values (p_key_hash, p_window_start, 1)
  on conflict (key_hash, window_start)
  do update set count = rate_limits.count + 1
  returning count into next_count;

  return next_count <= p_limit;
end;
$$;
