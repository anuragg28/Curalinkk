import { apiRequest } from '../lib/api'

export function sendChatPayload(payload) {
  return apiRequest('/chat', {
    method: 'POST',
    body: payload,
  })
}

export function getChatHistory() {
  return apiRequest('/chat/history')
}
