import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../features/product-form/ProductForm";
import { apiFetch } from "../../services/api";

export default function CreateProduct() {
  const navigate = useNavigate();

  async function handleCreate(data) {
    try {
      const response = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response && response.ok) {
        toast.success("Produto criado com sucesso!");
        navigate("/products");
      }
    } catch (error) {
      const status = error.status || error.response?.status;

      if (status === 409) {
        toast.error("Erro ao salvar: Este SKU já está cadastrado.");
      } else if (status === 422) {
        toast.error("Dados inválidos. Verifique o formulário.");
      } else {
        toast.error("Erro interno no servidor (500). Tente mais tarde.");
      }
    }
  }

  return (
    <div>
      <ProductForm onSubmit={handleCreate} submitText="Criar produto" />
    </div>
  );
}
