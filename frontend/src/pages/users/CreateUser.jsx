import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import UserForm from "../../features/user-form/UserForm";

export default function CreateUser() {

  const navigate = useNavigate();

  async function handleCreate(data) {

    const response = await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(data)
    });

    if (response.ok) {
      navigate("/users");
    }

  }

  return (
    <div>
      
      <UserForm
        onSubmit={handleCreate}
        submitText="Criar Usuário"
      />

    </div>
  );
}