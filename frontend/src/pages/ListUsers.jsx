import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/ListUsers.css";
import { getUsers, toggleUserStatus } from "../services/userService";

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
    const data = await getUsers();
    setUsers(data)
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
      setError(err.message);
      toast.error("Erro ao atualizar usuário");
    }finally {
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
  console.log("paginatedUsers: ")
  console.log(paginatedUsers)
  console.log("Users: ")
  console.log(users)
  console.log("filteredUsers: ")
  console.log(filteredUsers)

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div>

      <div className="page-header">
        <h1>Usuários</h1>

        <button
          className="create-btn"
          onClick={() => navigate("/users/create")}
        >
          + Criar Usuário
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="text"
        placeholder="Buscar usuário..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{
          marginBottom: "20px",
          padding: "8px",
          width: "250px"
        }}
      />

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Role</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>

            {paginatedUsers.map((user) => (

              <tr key={user.id}>

                <td>{user.id}</td>

                <td>{user.username}</td>

                <td className={user.role === "admin" ? "role-admin" : "role-user"}>
                  {user.role}
                </td>

                <td className={user.is_active ? "status-active" : "status-inactive"}>
                  {user.is_active ? "Ativo" : "Inativo"}
                </td>

                <td className="actions">

                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/users/edit/${user.id}`)}
                  >
                    Editar
                  </button>

                  <button
                    className={user.is_active ? "disable-btn" : "enable-btn"}
                    onClick={() => handleToggleStatus(user)}
                    disabled={loadingUserId === user.id}
                  >
                    {loadingUserId === user.id
                      ? "Processando..."
                      : user.is_active
                        ? "Desativar"
                        : "Ativar"}
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div style={{ marginTop: "20px" }}>

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>

        <span style={{ margin: "0 10px" }}>
          Página {page} de {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </button>

      </div>

    </div>
  );
}