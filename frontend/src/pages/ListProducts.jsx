import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { apiFetch } from "../services/api";

import { Eye, Pencil, Power, Trash2, AlertTriangle } from 'lucide-react';

export default function ListProducts() {

  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loadingId, setLoadingId] = useState(null);

  // Status Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToToggle, setProductToToggle] = useState(null);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const productsPerPage = 5;

  const navigate = useNavigate();

  // Load products from API
  async function loadProducts() {
    try {
      const response = await apiFetch("/products");

      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }

      const data = await response.json();
      setProducts(data);
      console.log(data)

    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const startIndex = (page - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Trigger professional status toggle modal
  function openConfirmModal(product) {
    setProductToToggle(product);
    setIsModalOpen(true);
  }

  // Trigger professional delete modal
  function openDeleteModal(product) {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  }

  // Handle status toggle after modal confirmation
  async function handleConfirmToggle() {
    if (!productToToggle) return;
    
    const product = productToToggle;
    setIsModalOpen(false);

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
      setProductToToggle(null);
    }
  }

  // Handle product deletion after modal confirmation
  async function handleConfirmDelete() {
    if (!productToDelete) return;

    const product = productToDelete;
    setIsDeleteModalOpen(false);

    try {
      setLoadingId(product.id);

      const response = await apiFetch(`/products/${product.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir produto");
      }

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Produto excluído com sucesso");

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
      setProductToDelete(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">

      {/* PROFESSIONAL STATUS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsModalOpen(false)} 
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${productToToggle?.is_active ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                  <AlertTriangle className={`h-6 w-6 ${productToToggle?.is_active ? 'text-amber-600' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {productToToggle?.is_active ? 'Desativar Produto' : 'Ativar Produto'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Tem certeza que deseja alterar o status de <strong>{productToToggle?.name}</strong>?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
              <button onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button onClick={handleConfirmToggle} className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${productToToggle?.is_active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFESSIONAL DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsDeleteModalOpen(false)} 
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Excluir Produto</h3>
                  <p className="text-sm text-slate-500">
                    Esta ação não pode ser desfeita. Deseja mesmo excluir <strong>{productToDelete?.name}</strong>?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button onClick={handleConfirmDelete} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 active:scale-95">
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Produtos</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie os produtos cadastrados no sistema</p>
        </div>
        <div className="w-70">
          <button className="w-70 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98]" onClick={() => navigate("/products/create")}>
            + Criar Produto
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {/* Search Input */}
      <div className="mb-6">
        <input type="text" placeholder="Buscar produto..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Preço</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Estoque</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">#{product.id}</td>
                  <td className="px-6 py-4"><div className="font-medium text-gray-800">{product.name}</div></td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">R$ {Number(product.price).toFixed(2)}</td>
                  <td className="px-6 py-4"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{product.stock_quantity} un.</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${product.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      <span className={`mr-2 h-2 w-2 rounded-full ${product.is_active ? "bg-green-500" : "bg-gray-500"}`} />
                      {product.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-2 w-fit">
                      <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300" onClick={() => navigate(`/products/${product.id}`)}>
                        <Eye className="w-4 h-4 text-slate-400" /> Detalhes
                      </button>
                      <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300" onClick={() => navigate(`/product/edit/${product.id}`)}>
                        <Pencil className="w-4 h-4 text-slate-400" /> Editar
                      </button>
                      <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50" onClick={() => openConfirmModal(product)} disabled={loadingId === product.id}>
                        <Power className={`w-4 h-4 ${product.is_active ? 'text-amber-500' : 'text-emerald-500'}`} />
                        {loadingId === product.id ? "..." : product.is_active ? "Desativar" : "Ativar"}
                      </button>
                      <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-200" onClick={() => openDeleteModal(product)}>
                        <Trash2 className="w-4 h-4 text-red-500" /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-center gap-1">
        <div className="flex w-30 justify-end">    
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            ← Anterior
          </button>
        </div>  
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
          <span className="text-blue-600">{page}</span>
          <span className="mx-1 text-gray-400">/</span>
          <span>{totalPages || 1}</span>
        </div>
        <div className="w-30">        
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
}