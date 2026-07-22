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

export function createRole() {}

export function deleteRole() {}

export function updateRole() {}
