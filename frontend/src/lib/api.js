const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload.message || 'Request failed')
    }

    return payload
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the backend. Start the API server and try again.')
    }

    throw error
  }
}
