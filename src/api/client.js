const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3003').replace(/\/$/, '')

export async function request(path, options = {}) {
  const token = localStorage.getItem('swift_token')
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  let data = null
  if (response.status !== 204) {
    try { data = await response.json() } catch { data = null }
  }
  if (!response.ok) {
    const error = new Error(data?.error || 'Something went wrong. Please try again.')
    error.status = response.status
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      localStorage.removeItem('swift_token')
      localStorage.removeItem('swift_user')
      window.location.assign(`/login?expired=1&returnTo=${encodeURIComponent(window.location.pathname)}`)
    }
    throw error
  }
  return data
}

export const api = {
  login: body => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: body => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  jobs: params => request(`/api/jobs?${new URLSearchParams(params)}`),
  job: id => request(`/api/jobs/${id}`),
  mine: () => request('/api/jobs/mine'),
  createJob: body => request('/api/jobs', { method: 'POST', body: JSON.stringify(body) }),
  updateJob: (id, body) => request(`/api/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteJob: id => request(`/api/jobs/${id}`, { method: 'DELETE' }),
  company: id => request(`/api/companies/${id}`),
  myCompany: () => request('/api/companies/me'),
  saveCompany: (body, exists) => request(exists ? '/api/companies/me' : '/api/companies', { method: exists ? 'PATCH' : 'POST', body: JSON.stringify(body) }),
  apply: (id, form) => request(`/api/jobs/${id}/apply`, { method: 'POST', body: form }),
  applications: () => request('/api/applications/mine'),
  applicants: id => request(`/api/jobs/${id}/applications`),
  updateApplication: (id, status) => request(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
