import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getUsers, toggleUserStatus } from "../services/userService";

import { Eye, Pencil, Power } from 'lucide-react';

export default function ListUsers() {

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loadingUserId, setLoadingUserId] = useState(null);

  const usersPerPage = 5;

  const navigate = useNavigate();

  // Carregar usuários
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

  async function handleToggleStatus(user) {
    const confirmAction = window.confirm(
      user.is_active
        ? "Deseja desativar este usuário?"
        : "Deseja ativar este usuário?"
    );

    if (!confirmAction) return;

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
    }
  }

  // filtro de busca
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  // paginação
  const startIndex = (page - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">

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

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Busca */}
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

      {/* Table */}
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
                      {/* Editar */}
                      <button
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium 
                                   text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
                        onClick={() => navigate(`/users/edit/${user.id}`)}
                      >
                        <Pencil className="w-4 h-4 text-slate-400" />
                        Editar
                      </button>

                      {/* Ativar / Desativar */}
                      <button
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium 
                                   text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
                        onClick={() => handleToggleStatus(user)}
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

      {/* Paginação */}
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