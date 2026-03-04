import { useState } from "react";
import { apiFetch } from "../services/api";

export default function CreateUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
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
          is_admin: isAdmin,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar usuário");
      }

      setMessage("Usuário criado com sucesso!");
      setUsername("");
      setPassword("");
      setIsAdmin(false);
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

        <label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          É administrador?
        </label>

        <button type="submit">Criar</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}