import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../services/api";
import UserForm from "../../features/user-form/UserForm";

export default function EditUser() {

  const { uuid } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  async function loadUser() {

    const response = await apiFetch(`/users/${uuid}`);

    const data = await response.json();

    setUser(data);
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function handleUpdate(data) {

    const response = await apiFetch(`/users/${uuid}`, {
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

      <UserForm
        initialData={user}
        onSubmit={handleUpdate}
        submitText="Atualizar usuário"
      />

    </div>

  );
}