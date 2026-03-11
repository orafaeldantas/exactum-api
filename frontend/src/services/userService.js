import { apiFetch } from "./api";

export async function getUsers() {

  const response = await apiFetch("/users");

  if (!response.ok) {
    throw new Error("Erro ao carregar usuários");
  }

  return response.json();
}

export async function toggleUserStatus(userId, currentStatus) {

  const response = await apiFetch(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({
      is_active: !currentStatus
    })
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar status do usuário");
  }

  return response.json();
}