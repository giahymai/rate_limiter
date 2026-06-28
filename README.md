# API Gateway with Rate Limiter & Live Dashboard

A lightweight API Gateway, built with **Java + Spring Boot**, that sits in front of any backend API and protects it with **rate limiting**, **response caching**, **concurrent request handling**, and **traffic logging** — paired with a **React dashboard** for real-time monitoring and live rule configuration.

> **Why this project?** It demonstrates core backend / system-design concepts that interviewers ask about (rate limiting algorithms, caching, concurrency, thread safety) while reusing prior React experience for a polished, demo-able dashboard. Built by a 2-person team over 4 weeks.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Team Roles](#team-roles)
6. [API Contract](#api-contract) — *the seam between backend & frontend*
7. [Build Plan (4 Weeks)](#build-plan-4-weeks)
8. [Getting Started](#getting-started)
9. [Demo](#demo)
10. [Project Structure](#project-structure)

---

## What It Does

Every client request passes **through** the gateway before reaching the real API. Because all traffic funnels through one place, the gateway can:

- **Limit** how often each client may call (prevent abuse / overload)
- **Cache** repeated responses (cut latency and load)
- **Handle** many simultaneous requests safely
- **Log** every request for monitoring

The **dashboard** then visualizes this traffic live and lets you change rules on the fly — no restart, no code change.

```
                  ┌─────────────────────────────────────────┐
   Client  ─────► │            API GATEWAY                   │ ─────►  Backend API
   (1000s of      │  • Rate limiter  • Cache  • Logger       │         (mock service)
    requests)     └──────────────────┬──────────────────────┘
                                     │ metrics / logs / config
                                     ▼
                            ┌──────────────────┐
                            │  React Dashboard │  live charts + rule config
                            └──────────────────┘
```

---

## Architecture

The system has three runnable parts:

| Component | Responsibility | Owner |
|-----------|---------------|-------|
| **Gateway service** | Intercepts requests, applies rate limiting + caching, logs traffic, exposes a management API | Backend |
| **Mock backend** | A trivial dummy API (e.g. returns weather JSON) so the gateway has something real to protect & cache | Backend |
| **Dashboard** | React SPA: real-time charts, request log table, live rule editor | Frontend |

The gateway and dashboard communicate **only** through the documented [API Contract](#api-contract). This clean boundary is what lets the two roles work in parallel.

---

## Features

### Core (Backend)
- **Rate limiting** — two pluggable algorithms:
  - *Token Bucket* — smooth limiting with burst allowance
  - *Sliding Window* — accurate request counting over a moving time window
- **Response caching** — store responses with **LRU eviction**; configurable TTL
- **Concurrency** — thread-safe counters and cache; correct under high parallel load
- **Traffic logging** — per-request record: client, timestamp, latency, allowed/blocked, cache hit/miss
- **Management API** — expose metrics, logs, and live-updatable config

### Dashboard (Frontend)
- **Live metrics** — requests/sec, blocked ratio, average latency, cache hit rate
- **Request log** — searchable / filterable table of recent traffic
- **Rule editor** — change rate-limit settings (e.g. 100 → 200 req/min) and apply instantly
- **Visual feedback** — blocked requests highlighted, latency drop visible when cache warms up

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Gateway | **Java 17+ · Spring Boot 3** | Spring Web for the proxy & management API |
| Mock backend | **Java · Spring Boot** | A minimal second Spring Boot app |
| Build tool | **Maven** | Wrapper (`./mvnw`) committed so no local install needed |
| Concurrency | `ConcurrentHashMap`, `AtomicInteger`/`AtomicLong`, `synchronized` where needed | Core of the thread-safe limiter & cache |
| Logging | **SLF4J + Logback** | Structured request logs |
| Dashboard | **React 18 + Vite** | Reuses project-1 frontend skills |
| Charts | **Recharts** | One charting library, learned well |
| Real-time | Polling first → WebSockets/SSE if time allows | Start simple |
| Load testing | **k6** *(or Apache Bench / hey)* | For the demo |

---

## Team Roles

A clean split so each teammate owns a distinct, CV-worthy slice — while still integrating like a real team.

### 👤 Backend Engineer
**Owns:** the gateway engine and everything behind the management API.

Responsibilities:
- Request interception & forwarding to the mock backend
- Rate limiting algorithms (Token Bucket, Sliding Window)
- Caching layer with LRU eviction
- Thread-safe / concurrent request handling
- Traffic logging & metrics aggregation
- Implement the management API endpoints (the contract)

**Skills demonstrated:** system design, concurrency, algorithms, API design, Spring Boot.

### 👤 Frontend Engineer
**Owns:** the dashboard and the experience of monitoring/configuring the gateway.

Responsibilities:
- React dashboard layout & state management
- Real-time data fetching (polling → WebSockets/SSE)
- Charts & visualizations
- Live rule-configuration UI
- Consuming the management API (the contract)

**Skills demonstrated:** React, real-time data handling, data visualization, UX.

### 🤝 Shared (both)
Week 1 fundamentals, agreeing the API contract, integration, load testing, documentation, and demo prep.

---

## API Contract

This is the **single most important coordination point**. Agree on it in Week 1 and freeze it early — it lets both roles build in parallel against a stable interface. (Shapes below are a starting proposal; refine together.)

### `GET /admin/metrics`
Returns current aggregated metrics for the dashboard.
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
Returns recent request records (newest first).
```json
[
  {
    "id": "req_8841",
    "clientId": "192.168.1.10",
    "timestamp": "2026-06-27T10:31:02Z",
    "path": "/weather",
    "latencyMs": 8,
    "status": "ALLOWED",
    "cache": "HIT"
  }
]
```

### `GET /admin/config`
Returns the current rate-limit rules.
```json
{
  "algorithm": "TOKEN_BUCKET",
  "limit": 100,
  "windowSeconds": 60,
  "cacheTtlSeconds": 30
}
```

### `PUT /admin/config`
Updates rules live (no restart). Body mirrors the `GET /admin/config` shape. Returns the applied config.

### Proxied traffic: `ANY /api/**`
Any request under `/api/**` is rate-limited, possibly served from cache, then forwarded to the mock backend. Returns **429 Too Many Requests** when the limit is exceeded.

> **Tip:** While the backend is still building these, the frontend can develop against a **mock server** (a small JSON stub returning the shapes above). That way neither role is blocked waiting on the other.

---

## Build Plan (4 Weeks)

### Week 1 — Fundamentals & Setup *(both, together)*
- [ ] Study Phase 0 of the learning roadmap (API gateway concept, HTTP, system design, rate limiter framing)
- [ ] **Agree & freeze the API contract** (above)
- [ ] Repo setup: monorepo with `/gateway`, `/mock-backend`, `/dashboard`; README; basic CI optional
- [ ] Scaffold both Spring Boot apps (Spring Initializr) and the Vite React app
- [ ] "Hello world" for each part: gateway forwards a request to the mock backend; dashboard renders an empty shell
- **Milestone:** a request flows Client → Gateway → Mock Backend → Client, and the dashboard loads.

### Weeks 2–3 — Parallel Build
Both tracks run at the same time, integrating against the frozen contract.

**Backend track**
- [ ] *Week 2:* Request interception + forwarding (Spring filter/interceptor); Token Bucket rate limiter; return 429 on limit
- [ ] *Week 2:* Traffic logging (SLF4J/Logback); implement `GET /admin/metrics` and `GET /admin/logs`
- [ ] *Week 3:* Sliding Window algorithm; make the limiter pluggable behind one interface
- [ ] *Week 3:* LRU response cache with TTL; concurrency hardening (`ConcurrentHashMap`, atomic counters); `GET`/`PUT /admin/config`
- **Backend milestone:** all contract endpoints live; limiter + cache correct under concurrent load.

**Frontend track**
- [ ] *Week 2:* Dashboard shell + data fetching from `/admin/metrics`; first live chart (requests/sec) with Recharts
- [ ] *Week 2:* Request log table from `/admin/logs` with filtering
- [ ] *Week 3:* Full metrics panel (blocked ratio, latency, cache hit rate); real-time updates (polling → WS/SSE)
- [ ] *Week 3:* Rule editor calling `PUT /admin/config`; visual highlight for blocked requests
- **Frontend milestone:** dashboard shows live data and can change rules end-to-end.

> **Mid-point integration (end of Week 2):** connect the real dashboard to the real gateway for the first time. Fix contract mismatches now, not in Week 4.

### Week 4 — Polish, Test & Demo *(both, together)*
- [ ] Build the load-test script (fire ~1000+ requests) with k6
- [ ] Tune & verify: blocked requests appear, latency drops when cache warms
- [ ] Polish UI; handle edge cases & errors
- [ ] Write final docs: architecture diagram, algorithm explanations, screenshots/GIF, **measured results**
- [ ] Record a short demo video
- **Final milestone:** a recruiter can read the README, run the project, and watch the demo.

---

## Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+** and npm
- Maven wrapper is included (`./mvnw`) — no separate Maven install needed

### Run the backend (gateway + mock)
```bash
# Terminal 1 — gateway on :8080
cd gateway
./mvnw spring-boot:run

# Terminal 2 — mock API on :9090
cd mock-backend
./mvnw spring-boot:run
```

### Run the dashboard
```bash
# Terminal 3 — dashboard on :5173
cd dashboard
npm install
npm run dev
```

### Try it
```bash
# Send a request through the gateway
curl http://localhost:8080/api/weather

# Hammer it to trigger rate limiting (watch for 429s)
for i in $(seq 1 200); do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/weather
done
```

---

## Demo

The headline demo: **fire ~1000 requests at the gateway and watch the dashboard react in real time.**

1. Start gateway, mock backend, and dashboard.
2. Open the dashboard.
3. Run the k6 load-test script.
4. Observe:
   - Requests/sec spikes on the live chart
   - A portion of requests turn **red (429 blocked)** once the limit is hit
   - **Average latency drops** as the cache warms up (repeated paths served from cache)
5. Live-edit the rate limit in the dashboard and watch the blocked ratio change immediately.

This single flow tells the whole story: rate limiting, caching, concurrency, and real-time monitoring — in one screen.

---

## Project Structure

```
api-gateway/
├── gateway/                  # Backend: gateway engine + management API (Spring Boot)
│   └── src/main/java/.../
│       ├── proxy/            #   request interception & forwarding
│       ├── ratelimit/        #   Token Bucket & Sliding Window (one interface)
│       ├── cache/            #   LRU cache with TTL
│       ├── logging/          #   traffic records & metrics aggregation
│       └── admin/            #   /admin/* management endpoints
├── mock-backend/             # Backend: trivial dummy API to protect (Spring Boot)
├── dashboard/                # Frontend: React + Vite monitoring & config UI
│   └── src/
│       ├── components/       #   charts, log table, rule editor
│       └── api/              #   client for the management API
├── load-test/                # Shared: k6 scripts for the demo
└── README.md
```

---

## Authors

Built by a 2-person team as a portfolio project.
- **Backend Engineer** — gateway engine, rate limiting, caching, concurrency (Java / Spring Boot)
- **Frontend Engineer** — React dashboard, real-time monitoring, rule configuration
