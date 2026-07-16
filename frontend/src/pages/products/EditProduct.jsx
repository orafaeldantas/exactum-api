import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../../features/product-form/ProductForm";
import { apiFetch } from "../../services/api";

export default function EditProduct() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  async function loadProduct() {
    const response = await apiFetch(`/products/${uuid}`);

    const data = await response.json();

    setProduct(data);
  }

  useEffect(() => {
    loadProduct();
  }, []);

  async function handleUpdate(data) {
    try {
      const response = await apiFetch(`/products/${uuid}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (response && response.ok) {
        toast.success("Produto atualizado com sucesso!");
        navigate("/products");
      }
    } catch (error) {
      const status = error.status || error.response?.status;

      console.log(status);

      if (status === 409) {
        toast.error("Erro ao salvar: Este SKU já está cadastrado.");
      } else if (status === 400) {
        toast.error("Dados inválidos. Verifique o formulário.");
      } else {
        toast.error("Erro interno no servidor (500). Tente mais tarde.");
      }
    }
  }

  if (!product) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <ProductForm
        initialData={product}
        onSubmit={handleUpdate}
        submitText="Salvar"
      />
    </div>
  );
}
