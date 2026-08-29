const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'dev-admin-token'

const adminHeaders = {
  'Content-Type': 'application/json',
  'X-Admin-Token': ADMIN_TOKEN,
}

export async function getStats() {
  return request('/api/stats')
}

export async function getTimeline() {
  return request('/api/stats/timeline')
}

export async function getTopRoutes() {
  return request('/api/stats/routes')
}

export async function getPolicies() {
  return request('/api/policies', { headers: adminHeaders })
}

export async function createPolicy(policy) {
  return request('/api/policies', { method: 'POST', headers: adminHeaders, body: JSON.stringify(policy) })
}

export async function deletePolicy(id) {
  return request(`/api/policies/${id}`, { method: 'DELETE', headers: adminHeaders, empty: true })
}

export async function getKeys() {
  return request('/api/keys', { headers: adminHeaders })
}

export async function createKey(key) {
  return request('/api/keys', { method: 'POST', headers: adminHeaders, body: JSON.stringify(key) })
}

export async function revokeKey(id) {
  return request(`/api/keys/${id}`, { method: 'DELETE', headers: adminHeaders, empty: true })
}

export async function getEvents(limit = 30) {
  return request(`/api/events?limit=${limit}`, { headers: adminHeaders })
}

export async function getRoutePolicies() {
  return request('/api/route-policies', { headers: adminHeaders })
}

export async function createRoutePolicy(routePolicy) {
  return request('/api/route-policies', { method: 'POST', headers: adminHeaders, body: JSON.stringify(routePolicy) })
}

export async function deleteRoutePolicy(id) {
  return request(`/api/route-policies/${id}`, { method: 'DELETE', headers: adminHeaders, empty: true })
}

export async function sendDemoRequest(apiKey) {
  const headers = apiKey ? { 'X-API-Key': apiKey } : {}
  const response = await fetch(`${API_BASE}/v1/products`, { headers })
  const body = await response.json().catch(() => ({}))
  return {
    status: response.status,
    limit: response.headers.get('X-RateLimit-Limit'),
    remaining: response.headers.get('X-RateLimit-Remaining'),
    retryAfter: response.headers.get('Retry-After'),
    body,
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${response.status} ${response.statusText}${text ? `: ${text.trim()}` : ''}`)
  }
  if (options.empty || response.status === 204) {
    return null
  }
  return response.json()
}
