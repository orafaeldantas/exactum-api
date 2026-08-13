import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { TenantContext } from "../../context/TenantContext";

import ProductDetailsModal from "../../features/product-form/list-product-modal/ProductDetailsModal";
import { apiFetch } from "../../services/api";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Eye,
  MoreVertical,
  PackageSearch,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
} from "lucide-react";

function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function RowActions({
  product,
  isLoading,
  onDetails,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const { permissions } = useContext(AuthContext);

  const hasPermission = (code) => permissions.includes(code);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function runAndClose(fn) {
    fn();
    setOpen(false);
  }

  return (
    <div className="relative flex justify-end" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Ações do produto"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-500 shadow-sm transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {isLoading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="menu"
            className="fixed right-auto left-auto mt-11 z-50 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_32px_-12px_rgba(15,23,42,0.2)]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => runAndClose(onDetails)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 text-slate-400" />
              Detalhes
            </button>
            {hasPermission("product:update") && (
              <button
                type="button"
                role="menuitem"
                onClick={() => runAndClose(onEdit)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 text-slate-400" />
                Editar
              </button>
            )}
            {hasPermission("product:update") && (
              <button
                type="button"
                role="menuitem"
                onClick={() => runAndClose(onToggleStatus)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-gray-50"
              >
                <Power
                  className={`h-4 w-4 ${
                    product.is_active ? "text-amber-500" : "text-emerald-500"
                  }`}
                />
                {product.is_active ? "Desativar" : "Ativar"}
              </button>
            )}

            <div className="border-t border-gray-100" />
            {hasPermission("product:delete") && (
              <button
                type="button"
                role="menuitem"
                onClick={() => runAndClose(onDelete)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p
          className="text-2xl font-black tracking-tight text-slate-900"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-t border-gray-100">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-6 py-4">
              <div
                className="h-4 animate-pulse rounded bg-gray-100"
                style={{ width: j === 1 ? "70%" : "50%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default function ListProducts() {
  const { tenantData } = useContext(TenantContext);
  const { permissions } = useContext(AuthContext);

  const lowStockThreshold = tenantData?.global_min_stock ?? 5;

  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loadingId, setLoadingId] = useState(null);

  // Status Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToToggle, setProductToToggle] = useState(null);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Details Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);

  const productsPerPage = 8;

  const navigate = useNavigate();

  // Load products from API
  async function loadProducts() {
    setLoading(true);
    try {
      const response = await apiFetch("/products");

      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  // Summary counts
  const activeCount = products.filter((p) => p.is_active).length;
  const lowStockCount = products.filter(
    (p) => Number(p.stock_quantity) <= lowStockThreshold
  ).length;

  function openConfirmModal(product) {
    setProductToToggle(product);
    setIsModalOpen(true);
  }

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
      setLoadingId(product.uuid);

      const response = await apiFetch(`/products/${product.uuid}`, {
        method: "PATCH",
        body: JSON.stringify({
          is_active: !product.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar produto");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.uuid === product.uuid ? { ...p, is_active: !p.is_active } : p
        )
      );

      toast.success(
        product.is_active ? "Produto desativado" : "Produto ativado"
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
      setLoadingId(product.uuid);

      const response = await apiFetch(`/products/${product.uuid}`, {
        method: "DELETE",
      });

      if (response && !response.ok) {
        throw new Error("Erro ao excluir produto");
      }

      setProducts((prev) => prev.filter((p) => p.uuid !== product.uuid));
      toast.success("Produto excluído com sucesso");
    } catch (err) {
      toast.error("Não foi possível excluir o produto");
    } finally {
      setLoadingId(null);
      setProductToDelete(null);
    }
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
      {/* DETAILS MODAL */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onEdit={
          permissions.includes("product:update")
            ? (product) => navigate(`/product/edit/${product.uuid}`)
            : false
        }
      />

      {/* STATUS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    productToToggle?.is_active
                      ? "bg-amber-100"
                      : "bg-emerald-100"
                  }`}
                >
                  <AlertTriangle
                    className={`h-6 w-6 ${
                      productToToggle?.is_active
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {productToToggle?.is_active
                      ? "Desativar Produto"
                      : "Ativar Produto"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Tem certeza que deseja alterar o status de{" "}
                    <strong>{productToToggle?.name}</strong>?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${
                  productToToggle?.is_active
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
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
                  <h3 className="text-lg font-bold text-slate-800">
                    Excluir Produto
                  </h3>
                  <p className="text-sm text-slate-500">
                    Esta ação não pode ser desfeita. Deseja mesmo excluir{" "}
                    <strong>{productToDelete?.name}</strong>?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 active:scale-95"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Produtos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie os produtos cadastrados no sistema
          </p>
        </div>
        {permissions.includes("product:create") && (
          <button
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.35)] active:scale-[0.98]"
            onClick={() => navigate("/products/create")}
          >
            <Plus className="h-4 w-4" />
            Criar Produto
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Boxes}
          label="Produtos cadastrados"
          value={products.length}
          tone="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Produtos ativos"
          value={activeCount}
          tone="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label={`Estoque baixo (≤ ${lowStockThreshold} un.)`}
          value={lowStockCount}
          tone="amber"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Preço
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Estoque
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ações
                </th>
              </tr>
            </thead>

            {loading ? (
              <TableSkeleton />
            ) : (
              <tbody>
                {paginatedProducts.map((product) => {
                  const isLowStock =
                    Number(product.stock_quantity) <= lowStockThreshold;
                  return (
                    <tr
                      key={product.uuid}
                      className="border-t border-gray-100 transition-colors hover:bg-gray-50/80"
                    >
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {product.uuid}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {product.name}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm font-semibold text-slate-700"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isLowStock
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-slate-700"
                          }`}
                        >
                          {product.stock_quantity} un.
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            product.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`mr-2 h-2 w-2 rounded-full ${
                              product.is_active
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {product.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RowActions
                          product={product}
                          isLoading={loadingId === product.uuid}
                          onDetails={() => setSelectedProduct(product)}
                          onEdit={() =>
                            navigate(`/product/edit/${product.uuid}`)
                          }
                          onToggleStatus={() => openConfirmModal(product)}
                          onDelete={() => openDeleteModal(product)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-slate-400">
                          <PackageSearch className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          {search
                            ? `Nenhum produto encontrado para "${search}".`
                            : "Nenhum produto cadastrado ainda."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredProducts.length > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            Mostrando{" "}
            <span className="font-semibold text-slate-700">
              {startIndex + 1}–{Math.min(endIndex, filteredProducts.length)}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-slate-700">
              {filteredProducts.length}
            </span>{" "}
            produtos
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <span className="text-blue-600">{page}</span>
              <span className="mx-1 text-slate-400">/</span>
              <span>{totalPages || 1}</span>
            </div>
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
