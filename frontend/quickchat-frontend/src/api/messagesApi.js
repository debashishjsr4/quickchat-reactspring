import { apiFetch } from "./http";

// GET /api/conversations/{id}/messages
export async function listMessages(conversationId) {
  return apiFetch(`/api/conversations/${conversationId}/messages`);
}

// POST /api/conversations/{id}/messages  { body }
export async function sendMessage(conversationId, body) {
  return apiFetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
