import { useState, useContext } from "react";
import { apiFetch } from "./api";
import { AuthContext } from "../context/AuthContext";


export function getUser() { 
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  async function loadUser() {
    try {
      setLoading(true);
      const response = await apiFetch(`/users/${user.id}`);
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  return { userData, loadUser, loading };
}



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

export async function toggleUserStatus(userUuid, currentStatus) {

  const response = await apiFetch(`/users/${userUuid}`, {
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