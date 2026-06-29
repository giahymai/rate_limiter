import http from 'k6/http'
import { sleep, check } from 'k6'
import { Counter } from 'k6/metrics'

const blocked = new Counter('blocked_requests')
const allowed = new Counter('allowed_requests')

export const options = {
  scenarios: {
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '60s', target: 200 },
        { duration: '30s', target: 10 },
      ],
    },
  },
}

const BASE_URL = __ENV.GATEWAY_URL || 'http://localhost:8080'

export default function () {
  // TODO: GET /api/weather, track 429 → blocked counter, 200 → allowed counter
  sleep(0.05)
}
