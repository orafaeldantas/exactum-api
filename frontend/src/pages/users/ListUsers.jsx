import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

import {
  deleteUser,
  getUsers,
  toggleUserStatus,
} from "../../services/userService";

import {
  AlertTriangle,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  Trash2,
  UserSearch,
} from "lucide-react";

const ROLE_LABELS = {
  administrador: "Administrador",
  gerente_de_vendas: "Gerente de Vendas",
  vendedor: "Vendedor",
  estoquista: "Estoquista",
  super_admin: "Administrador do Sistema",
  acesso_restrito: "Acesso Restrito (sem cargo definido)",
};

const ROLE_TONE = {
  administrador: "bg-purple-50 text-purple-700",
  gerente_de_vendas: "bg-blue-50 text-blue-700",
  vendedor: "bg-emerald-50 text-emerald-700",
  estoquista: "bg-amber-50 text-amber-700",
  super_admin: "bg-slate-100 text-slate-700",
  acesso_restrito: "bg-zinc-200 text-zinc-800",
};

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        ROLE_TONE[role] ?? "bg-gray-100 text-slate-600"
      }`}
    >
      {ROLE_LABELS[role] ?? role ?? "—"}
    </span>
  );
}

function RowActions({
  user,
  isRestricted,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function runAndClose(fn) {
    if (isRestricted) return;
    fn();
    setOpen(false);
  }

  const restrictedTitle = isRestricted
    ? "Você não possui permissão para esta ação"
    : undefined;

  return (
    <div className="relative flex justify-end" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Ações do usuário"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-500 shadow-sm transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {isLoading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="menu"
            className="fixed right-auto left-auto mt-11 z-50 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_32px_-12px_rgba(15,23,42,0.2)]"
          >
            <button
              type="button"
              role="menuitem"
              title={restrictedTitle}
              disabled={isRestricted}
              onClick={() => runAndClose(onEdit)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Pencil className="h-4 w-4 text-slate-400" />
              Editar
            </button>
            <button
              type="button"
              role="menuitem"
              title={restrictedTitle}
              disabled={isRestricted}
              onClick={() => runAndClose(onToggleStatus)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Power
                className={`h-4 w-4 ${
                  user.is_active ? "text-amber-500" : "text-emerald-500"
                }`}
              />
              {user.is_active ? "Desativar" : "Ativar"}
            </button>
            <div className="border-t border-gray-100" />
            <button
              type="button"
              role="menuitem"
              title={restrictedTitle}
              disabled={isRestricted}
              onClick={() => runAndClose(onDelete)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-t border-gray-100">
          {Array.from({ length: 5 }).map((__, j) => (
            <td key={j} className="px-6 py-4">
              <div
                className="h-4 animate-pulse rounded bg-gray-100"
                style={{ width: j === 1 ? "70%" : "50%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default function ListUsers() {
  const { users = [], loadUsers, loading } = getUsers();

  const [error, setError] = useState("");
  const { impersonateMode } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingUserId, setLoadingUserId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const usersPerPage = 11;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDados = async () => {
      try {
        await loadUsers();
      } catch (err) {
        setError(err.message || "Erro ao carregar usuários");
      }
    };

    fetchDados();
  }, []);

  function openConfirmModal(user) {
    setUserToToggle(user);
    setIsModalOpen(true);
  }

  function openDeleteModal(user) {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }

  async function handleConfirmToggle() {
    if (!userToToggle) return;

    const user = userToToggle;
    setIsModalOpen(false);

    try {
      setLoadingUserId(user.uuid);

      await toggleUserStatus(user.uuid, user.is_active);

      await loadUsers();

      toast.success(
        user.is_active
          ? "Usuário desativado com sucesso"
          : "Usuário ativado com sucesso"
      );
    } catch (err) {
      toast.error("Erro ao atualizar usuário");
    } finally {
      setLoadingUserId(null);
      setUserToToggle(null);
    }
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return;

    const user = userToDelete;
    setIsDeleteModalOpen(false);

    try {
      setLoadingUserId(user.uuid);

      await deleteUser(user.uuid);

      await loadUsers();

      toast.success("Usuário excluído com sucesso");
    } catch (err) {
      toast.error("Erro ao excluir usuário");
    } finally {
      setLoadingUserId(null);
      setUserToDelete(null);
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.uuid.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (page - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* STATUS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    userToToggle?.is_active ? "bg-amber-100" : "bg-emerald-100"
                  }`}
                >
                  <AlertTriangle
                    className={`h-6 w-6 ${
                      userToToggle?.is_active
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {userToToggle?.is_active
                      ? "Desativar Usuário"
                      : "Ativar Usuário"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Tem certeza que deseja alterar o status de{" "}
                    <strong>{userToToggle?.username}</strong>?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${
                  userToToggle?.is_active
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Excluir Usuário
                  </h3>
                  <p className="text-sm text-slate-500">
                    Esta ação não pode ser desfeita. Deseja mesmo excluir{" "}
                    <strong>{userToDelete?.username}</strong>?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 active:scale-95"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Usuários
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie as permissões e acessos dos usuários
          </p>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.35)] active:scale-[0.98]"
          onClick={() => navigate("/users/create")}
        >
          <Plus className="h-4 w-4" />
          Criar Usuário
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Papel
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ações
                </th>
              </tr>
            </thead>

            {loading ? (
              <TableSkeleton />
            ) : (
              <tbody>
                {paginatedUsers.map((user) => {
                  const isRestricted =
                    ["admin"].includes(user.role) && impersonateMode !== true;
                  return (
                    <tr
                      key={user.uuid}
                      className="border-t border-gray-100 transition-colors duration-150 hover:bg-gray-50/80"
                    >
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {user.uuid}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {user.username}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            user.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`mr-2 h-2 w-2 rounded-full ${
                              user.is_active ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {user.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RowActions
                          user={user}
                          isRestricted={isRestricted}
                          isLoading={loadingUserId === user.uuid}
                          onEdit={() => navigate(`/users/edit/${user.uuid}`)}
                          onToggleStatus={() => openConfirmModal(user)}
                          onDelete={() => openDeleteModal(user)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-slate-400">
                          <UserSearch className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          {search
                            ? `Nenhum usuário encontrado para "${search}".`
                            : "Nenhum usuário cadastrado ainda."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredUsers.length > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            Mostrando{" "}
            <span className="font-semibold text-slate-700">
              {startIndex + 1}–{Math.min(endIndex, filteredUsers.length)}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-slate-700">
              {filteredUsers.length}
            </span>{" "}
            usuários
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <span className="text-blue-600">{page}</span>
              <span className="mx-1 text-slate-400">/</span>
              <span>{totalPages || 1}</span>
            </div>
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
