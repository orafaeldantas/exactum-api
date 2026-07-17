import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import UserForm from "../../features/user-form/UserForm";
import { apiFetch } from "../../services/api";

export default function CreateUser() {
  const navigate = useNavigate();

  async function handleCreate(data) {
    try {
      const response = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response && response.ok) {
        toast.success("Usuário criado com sucesso!");
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

  return (
    <div>
      <UserForm onSubmit={handleCreate} submitText="Criar Usuário" />
    </div>
  );
}
