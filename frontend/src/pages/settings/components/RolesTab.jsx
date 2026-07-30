import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { useRolesManagement } from "../hooks/useRolesManagement";
import { humanize } from "../utils/humanize";
import ConfirmModal from "./ConfirmModal";
import RoleFormModal from "./RoleFormModal";

export default function RolesTab() {
  const {
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
  } = useRolesManagement();

  const isAdminRole = (role) => role.name === "administrator";
  const isRestrictedAccessRole = (role) => role.name === "acesso_restrito";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Cargos e Permissões
          </h2>
          <p className="text-sm text-slate-500">
            Defina o que cada papel pode fazer no sistema
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Criar Cargo
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loadingRoles ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : rolesWithPermissions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center text-slate-400">
            <Shield className="h-10 w-10" />
            <p className="text-sm">Nenhum cargo cadastrado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rolesWithPermissions.map((role) => {
              const isAdmin = isAdminRole(role);
              const isRestrictedAccess = isRestrictedAccessRole(role);
              return (
                <div
                  key={role.uuid}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {humanize(role.name)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {role.permissions?.length}
                      {(role.permissions?.length ?? 0) !== 1
                        ? " permissões"
                        : " permissão"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(role)}
                      disabled={isAdmin}
                      title={
                        isAdmin
                          ? "O cargo de administrador não pode ser editado"
                          : "Editar cargo"
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                        isAdmin
                          ? "cursor-not-allowed border-gray-100 text-gray-300"
                          : "border-gray-200 bg-white text-slate-500 hover:border-gray-300 hover:bg-gray-50 hover:text-slate-700"
                      }`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(role)}
                      disabled={isAdmin || isRestrictedAccess}
                      title={
                        isAdmin
                          ? "O cargo de administrador não pode ser excluído"
                          : isRestrictedAccess
                          ? "Este cargo não pode ser excluído"
                          : "Excluir Cargo"
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                        isAdmin || isRestrictedAccess
                          ? "cursor-not-allowed border-gray-100 text-gray-300"
                          : "border-gray-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <RoleFormModal
          initialRole={editingRole}
          permissionCatalog={permissionCatalog}
          saving={saving}
          onCancel={() => setFormOpen(false)}
          onSave={handleSaveRole}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          icon={Trash2}
          iconTone="bg-red-100 text-red-600"
          title="Excluir Cargo"
          description={`Esta ação não pode ser desfeita. Usuários com o cargo "${deleteTarget.name}" podem perder acesso a partes do sistema.`}
          confirmLabel={deleting ? "Excluindo..." : "Sim, excluir"}
          confirmTone="bg-red-600 hover:bg-red-700"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
