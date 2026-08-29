create extension if not exists pgcrypto;

create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) unique not null,
    password_hash text not null,
    created_at timestamptz not null default now()
);

create table if not exists rate_limit_policies (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) unique not null,
    algorithm varchar(50) not null check (algorithm in ('token_bucket', 'fixed_window', 'sliding_window')),
    request_limit integer not null check (request_limit > 0),
    window_seconds integer not null check (window_seconds > 0),
    burst_capacity integer not null check (burst_capacity > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists api_keys (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    key_prefix varchar(32) not null,
    key_hash text unique not null,
    name varchar(120) not null,
    policy_id uuid not null references rate_limit_policies(id),
    created_at timestamptz not null default now(),
    expires_at timestamptz,
    revoked_at timestamptz
);

create index if not exists idx_api_keys_hash on api_keys(key_hash);
create index if not exists idx_api_keys_active on api_keys(revoked_at) where revoked_at is null;

insert into rate_limit_policies (name, algorithm, request_limit, window_seconds, burst_capacity)
values
    ('free', 'token_bucket', 100, 60, 100),
    ('premium', 'token_bucket', 1000, 60, 1000),
    ('strict-login', 'sliding_window', 10, 60, 10)
on conflict (name) do nothing;
