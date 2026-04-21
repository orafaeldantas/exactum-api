import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { apiFetch } from "../services/api";
import "../styles/ListUsers.css";

export default function ListProducts() {

  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loadingId, setLoadingId] = useState(null);

  const productsPerPage = 5;

  const navigate = useNavigate();

  async function loadProducts() {
    try {
      const response = await apiFetch("/products");

      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }

      const data = await response.json();
      setProducts(data);

    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (page - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  async function handleToggleStatus(product) {

    const confirmAction = window.confirm(
      product.is_active
        ? "Desativar produto?"
        : "Ativar produto?"
    );

    if (!confirmAction) return;

    try {

      setLoadingId(product.id);

      const response = await apiFetch(`/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          is_active: !product.is_active
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar produto");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, is_active: !p.is_active }
            : p
        )
      );

      toast.success(
        product.is_active
          ? "Produto desativado"
          : "Produto ativado"
      );

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>

      {/* Header */}
      <div className="page-header">
        <h1>Produtos</h1>

        <button
          className="create-btn"
          onClick={() => navigate("/products/create")}
        >
          + Criar Produto
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar produto..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{
          marginBottom: "20px",
          padding: "8px",
          width: "250px"
        }}
      />

      {}
      <div className="table-container">
        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>

            {paginatedProducts.map((product) => (

              <tr key={product.id}>

                <td>{product.id}</td>

                <td>{product.name}</td>

                <td>R$ {Number(product.price).toFixed(2)}</td>

                <td>{product.stock_quantity}</td>

                <td className={product.is_active ? "status-active" : "status-inactive"}>
                  {product.is_active ? "Ativo" : "Inativo"}
                </td>

                <td className="actions">

                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/product/edit/${product.id}`)}
                  >
                    Editar
                  </button>

                  <button
                    className={product.is_active ? "disable-btn" : "enable-btn"}
                    onClick={() => handleToggleStatus(product)}
                    disabled={loadingId === product.id}
                  >
                    {loadingId === product.id
                      ? "Processando..."
                      : product.is_active
                        ? "Desativar"
                        : "Ativar"}
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      </div>

      {}
      <div style={{ marginTop: "20px" }}>

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>

        <span style={{ margin: "0 10px" }}>
          Página {page} de {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </button>

      </div>

    </div>
  );
}