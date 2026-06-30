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
  const res = http.get(`${BASE_URL}/api/weather`)

  if (res.status === 429) {
    blocked.add(1)
  } else {
    allowed.add(1)
  }

  check(res, { 'status 200 or 429': r => r.status === 200 || r.status === 429 })
  sleep(0.05)
}
