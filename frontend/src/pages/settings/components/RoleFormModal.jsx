import { Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ACTION_LABELS, RESOURCE_LABELS } from "../constants/permissions";
import { buildPermissionMatrix } from "../utils/buildPermissionMatrix";
import { humanize } from "../utils/humanize";
import { inputClass } from "../utils/styles";

export default function RoleFormModal({
  initialRole,
  permissionCatalog,
  saving,
  onCancel,
  onSave,
}) {
  const [name, setName] = useState(initialRole?.name ?? "");
  const [selected, setSelected] = useState(
    new Set(initialRole?.permissions ?? [])
  );

  const matrix = useMemo(
    () => buildPermissionMatrix(permissionCatalog),
    [permissionCatalog]
  );
  const resources = Object.keys(matrix);
  const allActions = useMemo(() => {
    const set = new Set();
    permissionCatalog.forEach((p) => {
      const action = p.split(":")[1];
      if (action) set.add(action);
    });
    return [...set];
  }, [permissionCatalog]);

  function togglePermission(permKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(permKey) ? next.delete(permKey) : next.add(permKey);
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe um nome para o cargo");
      return;
    }
    onSave({ name: name.trim(), permissions: [...selected] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">
            {initialRole ? "Editar Cargo" : "Criar Cargo"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-gray-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nome do Cargo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Gerente de Estoque"
            className={`${inputClass} mb-6`}
          />

          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Permissões
          </label>
          {resources.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nenhuma permissão disponível. Verifique o cargo administrador.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Recurso
                    </th>
                    {allActions.map((action) => (
                      <th
                        key={action}
                        className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        {ACTION_LABELS[action] ?? humanize(action)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resources.map((resource) => (
                    <tr key={resource}>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {RESOURCE_LABELS[resource] ?? humanize(resource)}
                      </td>
                      {allActions.map((action) => {
                        const exists = matrix[resource].has(action);
                        const permKey = `${resource}:${action}`;
                        return (
                          <td key={action} className="px-3 py-3 text-center">
                            {exists ? (
                              <input
                                type="checkbox"
                                checked={selected.has(permKey)}
                                onChange={() => togglePermission(permKey)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Cargo"}
          </button>
        </div>
      </form>
    </div>
  );
}
