import { apiFetch } from "./http";

// GET /api/conversations
export async function listConversations() {
  return apiFetch("/api/conversations");
}

// POST /api/conversations/direct  { otherUsername }
export async function startOrReuseDirect(otherUsername) {
  return apiFetch("/api/conversations/direct", {
    method: "POST",
    body: JSON.stringify({ otherUsername }),
  });
}
