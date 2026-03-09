import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import UserForm from "../components/UserForm/UserForm";

export default function EditUser() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  async function loadUser() {

    const response = await apiFetch(`/users/${id}`);

    const data = await response.json();

    setUser(data);
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function handleUpdate(data) {

    const response = await apiFetch(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });

    if (response.ok) {
      navigate("/users");
    }

  }

  if (!user) {
    return <p>Carregando...</p>;
  }

  return (

    <div>

      <h1>Editar Usuário</h1>

      <UserForm
        initialData={user}
        onSubmit={handleUpdate}
        submitText="Atualizar usuário"
      />

    </div>

  );
}