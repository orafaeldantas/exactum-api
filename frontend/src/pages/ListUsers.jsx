import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/ListUsers.css";

export default function ListUsers() {

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const usersPerPage = 5;

  const navigate = useNavigate();

  async function loadUsers() {
    try {

      const response = await apiFetch("/users");

      if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
      }

      const data = await response.json();

      setUsers(data);

    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // 🔎 filtro de busca
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  // 📄 paginação
  const startIndex = (page - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage-1;

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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

      {error && <p style={{color:"red"}}>{error}</p>}

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

                  <button className="disable-btn">
                    Desativar
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div style={{marginTop:"20px"}}>

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>

        <span style={{margin:"0 10px"}}>
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