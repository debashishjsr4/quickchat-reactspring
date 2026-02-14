import { apiFetch } from "./http";

export async function listUsers() {
  return apiFetch("/api/users");
}
