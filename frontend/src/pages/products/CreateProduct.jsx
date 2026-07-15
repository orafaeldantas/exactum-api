import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import ProductForm from "../../features/product-form/ProductForm";
import toast from "react-hot-toast";

export default function CreateProduct() {
  const navigate = useNavigate();

  async function handleCreate(data) {
    try {
      const response = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(data)
      });

      if (response && response.ok) {
        toast.success("Produto criado com sucesso!");
        navigate("/products");
      }
   
    } catch (error) {

      const status = error.status || error.response?.status;

      console.log(status)

      if (status === 409) {         
        toast.error("Erro ao salvar: Este SKU já está cadastrado.");
      } else if (status === 400) {
        toast.error("Dados inválidos. Verifique o formulário.");
      } else {
        toast.error("Erro interno no servidor (500). Tente mais tarde.");
      }
    }
  }

  return (
    <div>
      <ProductForm
        onSubmit={handleCreate}
        submitText="Criar produto"
      />
    </div>
  );
}
