# RateX

Distributed API rate limiting platform built with Go, Gin, Redis, PostgreSQL, Lua, Prometheus, Grafana, Docker, and a React dashboard.

## Features

- Redis-backed shared state for horizontal Go API instances.
- Token Bucket, Fixed Window, and Sliding Window algorithms.
- Atomic Lua scripts for Token Bucket and Sliding Window consistency.
- IP-based default limiting and API-key policy-based limiting.
- API key hashing with one-time secret reveal.
- CRUD admin endpoints for policies and API keys.
- Route-specific policy overrides for method/path combinations.
- Request event history, top route summaries, and timeline analytics.
- Production-style rate-limit headers and 429 responses.
- Configurable fail-open or fail-closed Redis behavior.
- Prometheus metrics and Grafana datasource provisioning.
- React dashboard for stats, policies, API keys, and endpoint testing.

## Run With Docker

```powershell
docker compose up --build
```

Services:

- API: `http://localhost:8081`
- React dashboard: run separately from `frontend/`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000` with `admin` / `admin`

The first database migration is mounted into PostgreSQL and seeds `free`, `premium`, and `strict-login` policies.

## Run Locally

Start Redis and PostgreSQL:

```powershell
docker compose up postgres redis
```

Run the Go API:

```powershell
go run ./cmd/server
```

Run the dashboard:

```powershell
cd frontend
npm install
npm run dev
```

Dashboard URL: `http://localhost:5173`

## API

Admin endpoints require `X-Admin-Token: dev-admin-token` unless changed in `.env`.

```http
GET    /healthz
GET    /readyz
GET    /metrics
GET    /api/stats
GET    /api/stats/timeline
GET    /api/stats/routes
GET    /api/policies
POST   /api/policies
PUT    /api/policies/:id
DELETE /api/policies/:id
GET    /api/keys
POST   /api/keys
DELETE /api/keys/:id
GET    /api/events
GET    /api/route-policies
POST   /api/route-policies
DELETE /api/route-policies/:id
GET    /v1/products
```

Apply all migrations manually for an existing local database:

```powershell
psql "postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable" -f .\migrations\001_init.sql
psql "postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable" -f .\migrations\002_observability_and_routes.sql
```

Create an API key:

```powershell
$policy = (Invoke-RestMethod http://localhost:8080/api/policies -Headers @{"X-Admin-Token"="dev-admin-token"})[0]
Invoke-RestMethod http://localhost:8081/api/keys `
  -Method Post `
  -Headers @{"X-Admin-Token"="dev-admin-token"} `
  -ContentType application/json `
  -Body (@{name="demo app"; policy_id=$policy.id} | ConvertTo-Json)
```

Call the protected endpoint:

```powershell
Invoke-WebRequest http://localhost:8081/v1/products -Headers @{"X-API-Key"="rx_live_your_key"}
```

RateX returns:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 60
```

When exceeded:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "retry_after": 12
}
```

## Distributed Demo

Run more than one API container against the same Redis:

```powershell
docker compose up --build --scale api=3
```

Then run:

```powershell
.\scripts\load-test.ps1 -Requests 200 -Concurrency 50
```

Because the counters and token state are centralized in Redis and Lua scripts execute atomically, multiple API instances share the same limit.

## Configuration

Copy `.env.example` to `.env` for local overrides.

Important values:

- `RATE_LIMIT_ALGORITHM`: `token_bucket`, `fixed_window`, or `sliding_window`
- `RATE_LIMIT_BACKEND`: `redis` for distributed limiting, `memory` for local development without Redis
- `RATE_LIMIT_DEFAULT_LIMIT`: default request allowance
- `RATE_LIMIT_WINDOW_SECONDS`: default window
- `RATE_LIMIT_BURST_CAPACITY`: token bucket capacity
- `RATE_LIMIT_FAILURE_MODE`: `closed` rejects on Redis errors, `open` allows traffic during Redis outages
- `ADMIN_TOKEN`: dashboard/admin API token

Fail closed protects infrastructure. Fail open favors availability but temporarily removes enforcement.

## Tests

```powershell
go test ./...
```

The test suite uses an in-memory Redis server and includes concurrent token-bucket verification.

## Added Feature Modules

- `internal/model/request_event.go`: request event and analytics response models
- `internal/model/route_policy.go`: route override model
- `internal/repository/request_event_repository.go`: event inserts, recent events, timeline, top routes
- `internal/repository/route_policy_repository.go`: route policy CRUD and lookup
- `internal/service/route_policy_service.go`: route policy validation
- `internal/handler/events.go`: analytics endpoints
- `internal/handler/route_policy.go`: route policy endpoints
- `frontend/src/api.js`: dashboard API client
- `frontend/src/App.jsx`: dashboard orchestration
- `frontend/src/components/*`: separated dashboard UI panels
