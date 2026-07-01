# API Gateway with Rate Limiter and Live Dashboard

A lightweight API gateway built with Java and Spring Boot. It sits in front of a mock backend API and protects it with rate limiting, response caching, concurrent request handling, and traffic logging. A React/Vite dashboard shows live gateway traffic and lets an operator change the active rate-limit rule without restarting the backend.

## What It Does

Every client request passes through the gateway before reaching the backend. Because all traffic funnels through one service, the project can:

- Limit how often each client may call the backend.
- Cache repeated responses to reduce latency and backend load.
- Handle concurrent requests with thread-safe counters and cache structures.
- Log every request for monitoring.
- Expose a management API consumed by the dashboard.

```text
Client
  |
  v
API Gateway (:8080)
  |-- rate limiter
  |-- response cache
  |-- request logger
  |-- /admin metrics, logs, config
  |
  v
Mock backend (:9090)

React dashboard (:5173)
  |
  v
/admin/* through the Vite proxy to the gateway
```

## Architecture

| Component | Path | Responsibility |
| --- | --- | --- |
| Gateway service | `gateway/` | Proxies `/api/**`, applies rate limits, caches responses, records traffic, exposes `/admin/*`. |
| Mock backend | `mock-backend/` | Provides simple `/weather` and `/health` endpoints for the gateway to protect. |
| Dashboard | `dashboard/` | Traffic War Room React SPA for live metrics, request logs, incident pressure, and rule configuration. |
| Load test | `load-test/` | k6 script for generating gateway traffic and 429 pressure. |

The frontend and backend meet at one contract: the gateway management API under `/admin/*`.

## Current Frontend Integration

The dashboard is intentionally integrated with the backend rather than being only a static demo:

- Polls `GET /admin/metrics` and `GET /admin/logs?limit=100` every 2 seconds.
- Loads `GET /admin/config` on startup.
- Saves rule edits with `PUT /admin/config`.
- Uses Vite dev-server proxy rules so the browser can call `/admin/*` and `/api/*` from `http://127.0.0.1:5173` or `http://localhost:5173`.
- Falls back to seeded dashboard data only when the gateway is unreachable, and labels that state as seed fallback.
- Derives incident feed, pressure gauge, request table, and live chart from backend metrics/log records.

## Features

### Backend

- Token Bucket rate limiter.
- Sliding Window rate limiter.
- Runtime rule switching through `/admin/config`.
- LRU response cache with configurable TTL.
- Traffic records with client id, timestamp, path, latency, status, and cache result.
- Aggregated metrics for requests/sec, total requests, blocked requests, blocked ratio, average latency, and cache hit rate.

### Dashboard

- Live Traffic War Room view.
- Metrics strip for requests/sec, total requests, blocked count, blocked ratio, latency, and cache hit rate.
- Recharts traffic chart fed by live backend samples.
- Request log table with local search by client, path, or request id.
- Status styling for `ALLOWED`, `BLOCKED`, `HIT`, `MISS`, and `SKIP`.
- Rule editor for algorithm, request limit, window seconds, and cache TTL.
- Mobile rule sheet and responsive dashboard layout.

## API Contract

### `GET /admin/metrics`

Returns current aggregate metrics.

```json
{
  "requestsPerSecond": 42,
  "totalRequests": 10543,
  "blockedRequests": 318,
  "blockedRatio": 0.03,
  "avgLatencyMs": 12.4,
  "cacheHitRate": 0.67
}
```

### `GET /admin/logs?limit=100&clientId=...`

Returns recent request records, newest first. `clientId` is optional and filters exact backend client ids.

```json
[
  {
    "id": "req_8841",
    "clientId": "127.0.0.1",
    "timestamp": "2026-06-27T10:31:02Z",
    "path": "/api/weather",
    "latencyMs": 8,
    "status": "ALLOWED",
    "cache": "HIT"
  }
]
```

### `GET /admin/config`

Returns the active gateway rule config.

```json
{
  "algorithm": "TOKEN_BUCKET",
  "limit": 100,
  "windowSeconds": 60,
  "cacheTtlSeconds": 30
}
```

### `PUT /admin/config`

Updates live gateway config and returns the applied config.

```json
{
  "algorithm": "SLIDING_WINDOW",
  "limit": 200,
  "windowSeconds": 60,
  "cacheTtlSeconds": 30
}
```

### `ANY /api/**`

Traffic under `/api/**` is rate-limited, optionally served from cache, then forwarded to the mock backend after stripping the `/api` prefix. For example, `/api/weather` is forwarded to the mock backend as `/weather`.

When the active limiter rejects a request, the gateway returns `429 Too Many Requests`.

## Getting Started

### Prerequisites

- Java 17 or newer.
- Maven available as `mvn`.
- Node.js 18 or newer and npm.

This repo currently does not include Maven wrapper scripts, so the commands below use `mvn`.

### Run the mock backend

```bash
cd mock-backend
mvn spring-boot:run
```

The mock backend runs on `http://localhost:9090`.

### Run the gateway

```bash
cd gateway
mvn spring-boot:run
```

The gateway runs on `http://localhost:8080`.

### Run the dashboard

```bash
cd dashboard
npm install
npm run dev
```

The dashboard runs on `http://localhost:5173` by default. It also works from `http://127.0.0.1:5173`.

## Try It

Send one request through the gateway:

```bash
curl http://localhost:8080/api/weather
```

Read live dashboard data through the gateway API:

```bash
curl http://localhost:8080/admin/metrics
curl "http://localhost:8080/admin/logs?limit=5"
curl http://localhost:8080/admin/config
```

Change the active rule:

```bash
curl -X PUT http://localhost:8080/admin/config \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"TOKEN_BUCKET","limit":100,"windowSeconds":60,"cacheTtlSeconds":30}'
```

## Load Test

The k6 script sends repeated requests to `/api/weather` and counts allowed versus blocked responses.

```bash
cd load-test
k6 run load-test.js
```

Set a custom gateway URL if needed:

```bash
GATEWAY_URL=http://localhost:8080 k6 run load-test.js
```

## Project Structure

```text
rate_limiter/
  gateway/
    src/main/java/com/gateway/
      admin/          # /admin management endpoints
      cache/          # LRU response cache and TTL behavior
      config/         # gateway.* configuration binding
      logging/        # request records and metrics aggregation
      proxy/          # /api proxy controller/service
      ratelimit/      # token bucket and sliding window limiters
  mock-backend/
    src/main/java/com/mock/
      WeatherController.java
  dashboard/
    src/
      api/            # gateway API client
      components/     # dashboard primitives and shadcn UI components
      data/           # fallback seed data for offline preview
      lib/            # shared utilities
      App.jsx         # Traffic War Room composition and live polling
  load-test/
    load-test.js
```

## Verification Checklist

- `mvn test` in `gateway/`.
- `mvn test` in `mock-backend/`.
- `npm run build` in `dashboard/`.
- Start all three services and open `http://127.0.0.1:5173/`.
- Confirm the dashboard shows `Backend live`.
- Generate traffic through `/api/weather` and confirm metrics/logs update.
- Edit the rule in the dashboard and confirm `/admin/config` returns the new values.
