import { apiRequest } from '../lib/api'

export function sendChatPayload(payload) {
  return apiRequest('/api/chat', {
    method: 'POST',
    body: payload,
  })
}

export function getChatHistory() {
  return apiRequest('/api/chat/history')
}
