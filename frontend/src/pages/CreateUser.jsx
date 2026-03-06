import { useState } from "react";
import { apiFetch } from "../services/api";
import { ROLES, ROLE_OPTIONS } from "../constants/roles";

export default function CreateUser() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.USER);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await apiFetch("/users/create", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          role
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar usuário");
      }

      setMessage("Usuário criado com sucesso!");
      setUsername("");
      setPassword("");
      setRole(ROLES.USER);     

    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Cadastrar Usuário</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Tipo de usuário</label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <button type="submit">Criar</button>

      </form>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

    </div>
  );
}