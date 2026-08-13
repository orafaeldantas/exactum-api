import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import UserFormSkeleton from "../../components/Loader/UserFormSkeleton";
import UserForm from "../../features/user-form/UserForm";
import { apiFetch } from "../../services/api";

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
    try {
      const response = await apiFetch(`/users/${uuid}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (response && response.ok) {
        toast.success("Usuário atualizado com sucesso!");
        navigate("/users");
      }
    } catch (error) {
      const status = error.status || error.response?.status;

      if (status === 409) {
        toast.error("Erro ao salvar: Este email já está cadastrado.");
      } else if (status === 422) {
        toast.error("Dados inválidos. Verifique o formulário.");
      } else {
        toast.error("Erro interno no servidor (500). Tente mais tarde.");
      }
    }
  }

  if (!user) {
    return <UserFormSkeleton />;
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
