import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getUsers, toggleUserStatus } from "../services/userService";

import { Eye, Pencil, Power, AlertTriangle } from 'lucide-react';

export default function ListUsers() {

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loadingUserId, setLoadingUserId] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);

  const usersPerPage = 5;

  const navigate = useNavigate();

  // Load users from service
  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Erro ao carregar usuários");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Function to trigger the custom modal
  function openConfirmModal(user) {
    setUserToToggle(user);
    setIsModalOpen(true);
  }

  // Handle status update after modal confirmation
  async function handleConfirmToggle() {
    if (!userToToggle) return;
    
    const user = userToToggle;
    setIsModalOpen(false);

    try {
      setLoadingUserId(user.id);
      await toggleUserStatus(user.id, user.is_active);

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id
            ? { ...u, is_active: !u.is_active }
            : u
        )
      );

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

  // Search filter logic
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const startIndex = (page - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">

      {/* PROFESSIONAL CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsModalOpen(false)} 
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${userToToggle?.is_active ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                  <AlertTriangle className={`h-6 w-6 ${userToToggle?.is_active ? 'text-amber-600' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {userToToggle?.is_active ? 'Desativar Usuário' : 'Ativar Usuário'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Tem certeza que deseja alterar o status de <strong>{userToToggle?.username}</strong>?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${
                  userToToggle?.is_active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Usuários
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as permissões e acessos dos usuários
          </p>
        </div>
        <div className="w-70">
          <button
            className="
              w-70
              rounded-xl
              bg-blue-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-md
              transition-all
              duration-200
              hover:scale-[1.02]
              hover:bg-blue-700
              active:scale-[0.98]
            "
            onClick={() => navigate("/users/create")}
          >
            + Criar Usuário
          </button>
        </div>
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
          className="
            w-full
            max-w-sm
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-3
            text-sm
            shadow-sm
            outline-none
            transition
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-100
          "
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Usuário</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">#{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{user.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      rounded-full px-3 py-1 text-xs font-semibold
                      ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}
                    `}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                      ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}
                    `}>
                      <span className={`mr-2 h-2 w-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-gray-500"}`} />
                      {user.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-2 w-fit">
                      {/* Edit Action */}
                      <button
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium 
                                   text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
                        onClick={() => navigate(`/users/edit/${user.id}`)}
                      >
                        <Pencil className="w-4 h-4 text-slate-400" />
                        Editar
                      </button>

                      {/* Toggle Status Action */}
                      <button
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium 
                                   text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
                        onClick={() => openConfirmModal(user)}
                        disabled={loadingUserId === user.id}
                      >
                        <Power className={`w-4 h-4 ${user.is_active ? 'text-amber-500' : 'text-emerald-500'}`} />
                        {loadingUserId === user.id ? "..." : user.is_active ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-center gap-1">
        <div className="flex w-30 justify-end">    
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
        </div>  
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
          <span className="text-blue-600">{page}</span>
          <span className="mx-1 text-gray-400">/</span>
          <span>{totalPages || 1}</span>
        </div>
        <div className="w-30">        
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      </div>

    </div>
  );
}