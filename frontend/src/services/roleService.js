import { useState } from "react";
import { apiFetch } from "./api";

export function getRoles() {
  const [rolesWithPermissions, setRolesWithPermissions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  async function loadRolesWithPermissions() {
    try {
      setLoadingRoles(true);
      const response = await apiFetch("/rbac/roles-permissions");
      const data = await response.json();
      setRolesWithPermissions(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoadingRoles(false);
    }
  }

  return { rolesWithPermissions, loadRolesWithPermissions, loadingRoles };
}

export async function createRole({ name, permissions }) {
  await apiFetch("/rbac/roles", {
    method: "POST",
    body: JSON.stringify({ name, permissions }),
  });
}

export async function updateRole(uuid, { name, permissions }) {
  await apiFetch(`/rbac/roles/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify({ name, permissions }),
  });
}

export async function deleteRole(uuid) {
  await apiFetch(`/rbac/roles/${uuid}`, {
    method: "DELETE",
  });
}
