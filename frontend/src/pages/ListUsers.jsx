import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/ListUsers.css";

export default function ListUsers() {

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

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

            {users.map((user) => (

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

                  <button className="edit-btn">
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

    </div>
  );
}