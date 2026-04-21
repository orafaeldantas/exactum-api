import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import ProductForm from "../components/ProductForm/ProductForm";

export default function EditProduct() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  async function loadProduct() {

    const response = await apiFetch(`/products/${id}`);

    const data = await response.json();

    setProduct(data);
  }

  useEffect(() => {
    loadProduct();
  }, []);

  async function handleUpdate(data) {

    const response = await apiFetch(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });

    if (response.ok) {
      navigate("/products");
    }

  }

  if (!product) {
    return <p>Carregando...</p>;
  }

  return (

    <div>

      <h1>Editar Produto</h1>

      <ProductForm
        initialData={product}
        onSubmit={handleUpdate}
        submitText="Salvar"
      />

    </div>

  );
}