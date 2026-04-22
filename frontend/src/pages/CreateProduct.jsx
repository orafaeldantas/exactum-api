import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import ProductForm from "../components/ProductForm/ProductForm";

export default function CreateProduct() {

  const navigate = useNavigate();

  async function handleCreate(data) {
    console.log(data)
    const response = await apiFetch("/products", {
      method: "POST",
      body: JSON.stringify(data)
    });

    if (response.ok) {
      navigate("/products");
    }

  }

  return (
    <div>

      <h1>Cadrastar Produto</h1>

      <ProductForm
        onSubmit={handleCreate}
        submitText="Criar produto"
      />

    </div>
  );
}