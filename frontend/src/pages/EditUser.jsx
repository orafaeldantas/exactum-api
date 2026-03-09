import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function EditUser() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [isActive, setIsActive] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUser() {
    try {

      const response = await apiFetch(`/users/${id}`);

      if (!response.ok) {
        throw new Error("Erro ao carregar usuário");
      }

      const data = await response.json();

      setUsername(data.username);
      setRole(data.role);
      setIsActive(data.is_active);

    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function handleSubmit(e) {

    e.preventDefault();

    setMessage("");
    setError("");

    try {

      const response = await apiFetch(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          username,
          role,
          is_active: isActive
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar usuário");
      }

      setMessage("Usuário atualizado com sucesso!");

      setTimeout(() => {
        navigate("/users");
      }, 1000);

    } catch (err) {
      setError(err.message);
    }

  }

  return (

    <div>

      <h1>Editar Usuário</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Tipo de usuário</label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>

        <label>Status</label>

        <select
          value={isActive}
          onChange={(e) => setIsActive(e.target.value === "true")}
        >
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>

        <button type="submit">
          Atualizar
        </button>

      </form>

      {message && <p>{message}</p>}
      {error && <p style={{color:"red"}}>{error}</p>}

    </div>

  );
}