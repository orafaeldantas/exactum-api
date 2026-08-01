import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlignLeft,
  Boxes,
  LayoutGrid,
  Package,
  Pencil,
  Tag,
  X,
} from "lucide-react";
import { useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { TenantContext } from "../../../context/TenantContext";

function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-semibold text-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onEdit,
}) {
  const { tenantData } = useContext(TenantContext);

  const lowStockThreshold = tenantData?.global_min_stock ?? 5;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  const isLowStock =
    product && Number(product.stock_quantity) <= lowStockThreshold;
  const isActive = product?.is_active ?? product?.isActive ?? true;

  return createPortal(
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.25)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="product-modal-title"
                    className="truncate text-lg font-bold tracking-tight text-slate-900"
                  >
                    {product.name || "Produto sem nome"}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        isActive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-slate-500"
                      }`}
                    >
                      {isActive ? "Ativo" : "Inativo"}
                    </span>
                    {isLowStock && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                        Estoque baixo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-gray-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-6">
              {/* Preço em destaque */}
              <div className="rounded-xl bg-blue-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">
                  Preço
                </p>
                <p
                  className="mt-0.5 text-2xl font-black text-blue-700"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoRow icon={Boxes} label="Estoque">
                  <span
                    className={isLowStock ? "text-amber-600" : "text-slate-800"}
                  >
                    {product.stock_quantity ?? 0} unidades
                  </span>
                </InfoRow>

                <InfoRow icon={Tag} label="SKU">
                  {product.sku || "—"}
                </InfoRow>

                <InfoRow icon={LayoutGrid} label="Categoria">
                  {product.category || "Sem categoria"}
                </InfoRow>

                <InfoRow icon={Activity} label="Status de venda">
                  {isActive ? "Disponível" : "Indisponível"}
                </InfoRow>
              </div>

              {product.description && (
                <InfoRow icon={AlignLeft} label="Descrição">
                  <p className="font-medium leading-relaxed text-slate-600">
                    {product.description}
                  </p>
                </InfoRow>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors duration-200 hover:bg-gray-100 hover:text-slate-700"
              >
                Fechar
              </button>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
