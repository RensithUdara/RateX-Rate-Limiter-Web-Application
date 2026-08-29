# ⚡ RateX

**RateX** is a distributed API rate limiting platform built with a Go backend and a React dashboard. It supports shared Redis-backed limits, PostgreSQL persistence, API key access control, route-specific policies, telemetry, and a polished admin UI.

## ✨ Features

- 🚦 Distributed rate limiting across multiple Go API instances
- 🧠 Token Bucket, Fixed Window, and Sliding Window algorithms
- 🔐 API key creation, hashing, revocation, and policy assignment
- 🛣️ Route-specific rate limits for method/path combinations
- 📊 Request analytics, recent events, top routes, and timeline charts
- 🧾 Admin CRUD APIs for policies, API keys, and route policies
- 🧪 Playground for live endpoint testing with headers, cURL, and responses
- 🐘 PostgreSQL migrations and seeded default policies
- 🔴 Redis shared state, with optional memory backend for local development
- 📈 Prometheus metrics and Grafana dashboard support
- 🐳 Docker Compose setup for PostgreSQL, Redis, API, Nginx, Prometheus, and Grafana

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Go, Gin |
| Rate limit state | Redis or in-memory backend |
| Database | PostgreSQL |
| Frontend | React, Vite, TypeScript build, Recharts |
| Observability | Prometheus, Grafana |
| Deployment helpers | Docker, Docker Compose, Nginx |

## 📁 Project Structure

```text
RateX/
├── cmd/server/                 # Go API entrypoint
├── internal/config/            # Environment configuration
├── internal/handler/           # HTTP handlers
├── internal/limiter/           # Rate limiting algorithms
├── internal/middleware/        # Gin middleware
├── internal/model/             # Domain models
├── internal/repository/        # PostgreSQL repositories
├── internal/service/           # Business logic
├── migrations/                 # PostgreSQL schema and seed data
├── frontend/                   # React dashboard
├── deploy/                     # Nginx, Prometheus, Grafana config
├── scripts/                    # Load-test helper scripts
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🚀 Quick Start

### 1. Create `.env`

Copy the example file:

```powershell
Copy-Item .env.example .env
```

For local development without Redis, set:

```env
RATE_LIMIT_BACKEND=memory
HTTP_PORT=8081
DATABASE_URL=postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8081
VITE_ADMIN_TOKEN=dev-admin-token
```

### 2. Prepare PostgreSQL

Open `psql` as the `postgres` user:

```powershell
psql -U postgres
```

Then run:

```sql
drop database if exists ratex;
drop user if exists ratex;

create user ratex with password 'ratex';
create database ratex owner ratex;
\q
```

Apply migrations:

```powershell
psql "postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable" -f .\migrations\001_init.sql
psql "postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable" -f .\migrations\002_observability_and_routes.sql
```

### 3. Run the Go API

```powershell
go run ./cmd/server
```

Local API URL:

```text
http://localhost:8081
```

### 4. Run the React Dashboard

```powershell
cd frontend
npm install
npm run dev
```

Dashboard URL:

```text
http://localhost:5173
```

## 🐳 Run With Docker

Start the full infrastructure:

```powershell
docker compose up --build
```

Services:

| Service | URL |
| --- | --- |
| API via Nginx | `http://localhost:8081` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3000` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

Grafana login:

```text
Username: admin
Password: admin
```

To scale API instances against the same Redis state:

```powershell
docker compose up --build --scale api=3
```

## ⚙️ Environment Variables

| Variable | Example | Description |
| --- | --- | --- |
| `APP_ENV` | `development` | Runtime environment |
| `HTTP_PORT` | `8081` | Go API port for local run |
| `DATABASE_URL` | `postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable` | PostgreSQL connection string |
| `REDIS_ADDR` | `localhost:6379` | Redis host and port |
| `REDIS_PASSWORD` | empty | Redis password |
| `REDIS_DB` | `0` | Redis database number |
| `RATE_LIMIT_ALGORITHM` | `token_bucket` | Default limiter algorithm |
| `RATE_LIMIT_BACKEND` | `redis` or `memory` | Shared Redis or local memory backend |
| `RATE_LIMIT_DEFAULT_LIMIT` | `100` | Default request limit |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Default window size |
| `RATE_LIMIT_BURST_CAPACITY` | `100` | Token bucket burst capacity |
| `RATE_LIMIT_FAILURE_MODE` | `closed` | `closed` rejects on backend failure, `open` allows requests |
| `ADMIN_TOKEN` | `dev-admin-token` | Admin API token |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | CORS origin for dashboard |
| `VITE_API_BASE_URL` | `http://localhost:8081` | Frontend API base URL |
| `VITE_ADMIN_TOKEN` | `dev-admin-token` | Frontend admin token |

## 🧪 Test Commands

Run backend tests:

```powershell
go test ./...
```

Build frontend:

```powershell
cd frontend
npm run build
```

Preview frontend production build:

```powershell
cd frontend
npm run preview
```

## 🔌 API Endpoints

Admin endpoints require:

```http
X-Admin-Token: dev-admin-token
```

### Health and Metrics

```http
GET /healthz
GET /readyz
GET /metrics
```

### Analytics

```http
GET /api/stats
GET /api/stats/timeline
GET /api/stats/routes
GET /api/events?limit=30
```

### Policies

```http
GET    /api/policies
POST   /api/policies
PUT    /api/policies/:id
DELETE /api/policies/:id
```

Policy body:

```json
{
  "name": "premium",
  "algorithm": "token_bucket",
  "request_limit": 1000,
  "window_seconds": 60,
  "burst_capacity": 1000
}
```

### API Keys

```http
GET    /api/keys
POST   /api/keys
DELETE /api/keys/:id
```

Create key body:

```json
{
  "name": "Demo application",
  "policy_id": "policy-uuid-here"
}
```

⚠️ The full API key is shown only once after creation. Store it safely.

### Route Policies

```http
GET    /api/route-policies
POST   /api/route-policies
PUT    /api/route-policies/:id
DELETE /api/route-policies/:id
```

Route policy body:

```json
{
  "method": "GET",
  "route_pattern": "/v1/products",
  "policy_id": "policy-uuid-here",
  "enabled": true
}
```

### Protected Demo Endpoint

```http
GET /v1/products
```

With API key:

```powershell
Invoke-WebRequest "http://localhost:8081/v1/products" -Headers @{"X-API-Key"="rx_live_your_key"}
```

Without an API key, RateX falls back to IP-based limiting.

## 🧭 Dashboard Pages

- 🏠 **Overview**: high-level metrics, traffic chart, recent requests, top routes
- 🔑 **API Keys**: create, copy, and revoke API keys
- 🛡️ **Policies**: create, edit, search, and delete rate limit policies
- 🛣️ **Routes**: attach policies to HTTP methods and paths
- 📊 **Analytics**: inspect request history and route usage
- 🧪 **Playground**: send test requests and inspect response, headers, rate limits, and cURL
- 📚 **Documentation**: setup commands, migrations, endpoints, and usage snippets

## 📦 Default Seed Policies

The first migration seeds useful starter policies:

| Policy | Algorithm | Limit |
| --- | --- | --- |
| `free` | `fixed_window` | starter traffic |
| `premium` | `token_bucket` | burst-friendly traffic |
| `strict-login` | `sliding_window` | strict login protection |

## 🧠 Rate Limiting Behavior

RateX returns standard headers on protected responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 60
```

When a request is blocked:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "retry_after": 12
}
```

## 📈 Load Testing

Run the helper script after the API is running:

```powershell
.\scripts\load-test.ps1 -Requests 200 -Concurrency 50
```

For distributed testing, run multiple API instances with Docker and Redis:

```powershell
docker compose up --build --scale api=3
```

## 🛠️ Troubleshooting

### ❌ PostgreSQL password authentication failed

Recreate the local user/database:

```powershell
psql -U postgres
```

```sql
drop database if exists ratex;
drop user if exists ratex;
create user ratex with password 'ratex';
create database ratex owner ratex;
\q
```

Then rerun migrations.

### ❌ Redis connection refused

Use memory mode for local development:

```env
RATE_LIMIT_BACKEND=memory
```

Or start Redis with Docker:

```powershell
docker run --name ratex-redis -p 6379:6379 -d redis:7-alpine
```

### ❌ CORS blocked from `localhost:5173`

Check `.env`:

```env
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8081
```

Restart the Go server after changing `.env`.

### ❌ Policy delete fails

Policies that are assigned to API keys or route policies cannot be deleted. Reassign/delete those records first, then delete the policy.

## ✅ Development Checklist

- Start PostgreSQL
- Run migrations
- Start Go API
- Start React dashboard
- Create or select a policy
- Create an API key
- Add a route policy
- Test `/v1/products` in Playground
- Check Analytics for request events

## 📄 License

This project is ready for learning, demos, and portfolio use. Add your preferred license before publishing publicly.
