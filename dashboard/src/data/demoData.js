export const selectedDashboard = {
  name: 'Traffic War Room',
  description: 'Dark traffic-control board with pressure lanes and operator actions.',
}

export const initialRules = {
  algorithm: 'TOKEN_BUCKET',
  limit: 100,
  windowSeconds: 60,
  cacheTtlSeconds: 30,
}

export const fallbackMetrics = {
  requestsPerSecond: 42,
  totalRequests: 10543,
  blockedRequests: 318,
  blockedRatio: 0.03,
  avgLatencyMs: 12.4,
  cacheHitRate: 0.67,
}

export const history = [
  { time: '10:16', rps: 34, blocked: 2, cacheHit: 18 },
  { time: '10:17', rps: 46, blocked: 5, cacheHit: 22 },
  { time: '10:18', rps: 31, blocked: 3, cacheHit: 21 },
  { time: '10:19', rps: 43, blocked: 4, cacheHit: 26 },
  { time: '10:20', rps: 37, blocked: 3, cacheHit: 24 },
  { time: '10:21', rps: 52, blocked: 9, cacheHit: 31 },
  { time: '10:22', rps: 67, blocked: 12, cacheHit: 39 },
  { time: '10:23', rps: 58, blocked: 6, cacheHit: 42 },
  { time: '10:24', rps: 72, blocked: 8, cacheHit: 48 },
  { time: '10:25', rps: 61, blocked: 5, cacheHit: 44 },
  { time: '10:26', rps: 49, blocked: 4, cacheHit: 37 },
  { time: '10:27', rps: 54, blocked: 7, cacheHit: 41 },
  { time: '10:28', rps: 63, blocked: 11, cacheHit: 45 },
  { time: '10:29', rps: 85, blocked: 26, cacheHit: 51 },
  { time: '10:30', rps: 70, blocked: 13, cacheHit: 47 },
  { time: '10:31', rps: 56, blocked: 5, cacheHit: 43 },
  { time: '10:32', rps: 44, blocked: 3, cacheHit: 35 },
  { time: '10:33', rps: 51, blocked: 6, cacheHit: 39 },
  { time: '10:34', rps: 39, blocked: 2, cacheHit: 33 },
  { time: '10:35', rps: 42, blocked: 4, cacheHit: 36 },
]

export const logs = [
  { id: 'req_12', clientId: '192.168.1.10', path: '/api/weather', latencyMs: 8.7, status: 'ALLOWED', cache: 'HIT', timestamp: '10:25:30.123' },
  { id: 'req_11', clientId: '192.168.1.12', path: '/api/weather', latencyMs: 12.1, status: 'ALLOWED', cache: 'MISS', timestamp: '10:25:30.120' },
  { id: 'req_10', clientId: '10.0.0.5', path: '/api/health', latencyMs: 15.3, status: 'ALLOWED', cache: 'SKIP', timestamp: '10:25:29.985' },
  { id: 'req_9', clientId: '192.168.1.15', path: '/api/weather', latencyMs: 9.2, status: 'ALLOWED', cache: 'HIT', timestamp: '10:25:29.872' },
  { id: 'req_8', clientId: '192.168.1.20', path: '/api/weather', latencyMs: 23.4, status: 'ALLOWED', cache: 'MISS', timestamp: '10:25:29.654' },
  { id: 'req_7', clientId: '192.168.1.22', path: '/api/weather', latencyMs: null, status: 'BLOCKED', cache: 'SKIP', timestamp: '10:25:29.543' },
  { id: 'req_6', clientId: '192.168.1.22', path: '/api/weather', latencyMs: null, status: 'BLOCKED', cache: 'SKIP', timestamp: '10:25:29.412' },
  { id: 'req_5', clientId: '10.0.0.8', path: '/api/health', latencyMs: 5.6, status: 'ALLOWED', cache: 'HIT', timestamp: '10:25:29.311' },
  { id: 'req_4', clientId: '192.168.1.25', path: '/api/weather', latencyMs: 11.0, status: 'ALLOWED', cache: 'HIT', timestamp: '10:25:29.201' },
  { id: 'req_3', clientId: '192.168.1.30', path: '/api/weather', latencyMs: 31.2, status: 'ALLOWED', cache: 'MISS', timestamp: '10:25:29.102' },
  { id: 'req_2', clientId: '203.0.113.77', path: '/api/weather', latencyMs: null, status: 'BLOCKED', cache: 'SKIP', timestamp: '10:25:28.881' },
  { id: 'req_1', clientId: '198.51.100.23', path: '/api/weather', latencyMs: 44.2, status: 'ALLOWED', cache: 'MISS', timestamp: '10:25:28.650' },
]
