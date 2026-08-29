create table if not exists route_policies (
    id uuid primary key default gen_random_uuid(),
    method varchar(12) not null,
    route_pattern varchar(255) not null,
    policy_id uuid not null references rate_limit_policies(id) on delete cascade,
    enabled boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (method, route_pattern)
);

create table if not exists request_events (
    id bigserial primary key,
    method varchar(12) not null,
    route varchar(255) not null,
    identity_type varchar(24) not null,
    identity_value varchar(255) not null,
    policy_name varchar(100) not null,
    allowed boolean not null,
    status_code integer not null,
    request_limit integer not null,
    remaining integer not null,
    retry_after integer not null,
    duration_ms integer not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_request_events_created_at on request_events(created_at desc);
create index if not exists idx_request_events_route on request_events(route);
create index if not exists idx_route_policies_lookup on route_policies(method, route_pattern) where enabled = true;
