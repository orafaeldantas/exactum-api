import { useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../../../context/AuthContext";
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from "../../../services/roleService";

export function useRolesManagement() {
  const { rolesWithPermissions, loadRolesWithPermissions, loadingRoles } =
    getRoles();
  const { bootstrap } = useContext(AuthContext);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRolesWithPermissions();
  }, []);

  const adminRole = useMemo(
    () => rolesWithPermissions.find((r) => r.name === "administrador"),
    [rolesWithPermissions]
  );

  const permissionCatalog = useMemo(
    () => (adminRole ? adminRole.permissions : []),
    [adminRole]
  );

  function openCreate() {
    setEditingRole(null);
    setFormOpen(true);
  }

  function openEdit(role) {
    setEditingRole(role);
    setFormOpen(true);
  }

  async function handleSaveRole({ name, permissions }) {
    setSaving(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.uuid, { name, permissions });
        toast.success("Cargo atualizado com sucesso");
      } else {
        await createRole({ name, permissions });
        toast.success("Cargo criado com sucesso");
      }
      await loadRolesWithPermissions();
      await bootstrap();
      setFormOpen(false);
    } catch (err) {
      toast.error("Erro ao salvar cargo");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRole(deleteTarget.uuid);
      toast.success("Cargo excluído com sucesso");
      await loadRolesWithPermissions();
    } catch (err) {
      toast.error("Erro ao excluir cargo. Verifique se ele ainda está em uso.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return {
    rolesWithPermissions,
    loadingRoles,
    formOpen,
    editingRole,
    saving,
    deleteTarget,
    deleting,
    permissionCatalog,
    openCreate,
    openEdit,
    setFormOpen,
    setDeleteTarget,
    handleSaveRole,
    handleConfirmDelete,
  };
}
