const API_BASE = import.meta.env.VITE_GATEWAY_API_BASE ?? ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Gateway API ${path} failed with ${response.status}`)
  }

  return response.json()
}

export function fetchMetrics(options) {
  return request('/admin/metrics', options)
}

export function fetchLogs({ limit = 100, clientId = '', signal } = {}) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (clientId) params.set('clientId', clientId)
  return request(`/admin/logs?${params.toString()}`, { signal })
}

export function fetchConfig(options) {
  return request('/admin/config', options)
}

export function updateConfig(config, options = {}) {
  const { algorithm, limit, windowSeconds, cacheTtlSeconds } = config
  return request('/admin/config', {
    method: 'PUT',
    body: JSON.stringify({ algorithm, limit, windowSeconds, cacheTtlSeconds }),
    ...options,
  })
}
