const BASE = '/admin'

export async function fetchMetrics() {
  // TODO: GET /admin/metrics → return parsed JSON
}

export async function fetchLogs(limit = 100, clientId = '') {
  // TODO: GET /admin/logs?limit=&clientId= → return parsed JSON array
}

export async function fetchConfig() {
  // TODO: GET /admin/config → return parsed JSON
}

export async function updateConfig(config) {
  // TODO: PUT /admin/config with JSON body → return updated config
}
