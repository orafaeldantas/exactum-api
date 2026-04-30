import { useState, useEffect } from "react";
import { apiFetch } from "./api";

export function getUsers() { 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await apiFetch("/users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }


  return { users, loadUsers, loading };
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