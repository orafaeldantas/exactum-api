import {
  ArrowLeft,
  Info,
  Package,
  Printer,
  SearchX,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingOverlay from "../../components/Loader/LoadingOverlay";
import { getSaleItems } from "../../services/saleService";

function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatCard({ icon: Icon, label, value, unit, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
      <h3
        className="text-2xl font-black tracking-tight text-slate-900"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
        {unit && (
          <span className="ml-2 text-sm font-medium text-slate-500">
            {unit}
          </span>
        )}
      </h3>
    </div>
  );
}

export default function SaleDetails() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const { saleItems, loadSaleItems, loading } = getSaleItems();

  useEffect(() => {
    loadSaleItems(uuid);
  }, [uuid]);

  const sale = saleItems?.sale;
  const items = saleItems?.items || [];

  if (!sale && !loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-slate-400">
          <SearchX className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-slate-600">
          Venda não encontrada ou erro ao carregar.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  const totalUnits = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <LoadingOverlay
      loading={loading}
      minDuration={250}
      message="Buscando dados..."
    >
      <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm transition-all duration-200 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Detalhes da Venda
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Pedido #{sale?.uuid ?? sale?.id} •{" "}
                {sale?.created_at
                  ? new Date(sale?.created_at).toLocaleDateString("pt-BR")
                  : "Data Indisponível"}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors duration-200 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" /> Imprimir Comprovante
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Info className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Informações Gerais
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Pagamento:{" "}
              <span className="text-slate-800">
                {sale?.payment_method || "N/A"}
              </span>
            </p>
            <p className="text-sm font-semibold text-slate-600">
              Hora:{" "}
              <span className="text-slate-800">
                {sale?.created_at
                  ? new Date(sale?.created_at).toLocaleTimeString("pt-BR")
                  : "--:--"}
              </span>
            </p>
          </div>

          <StatCard
            icon={ShoppingCart}
            label="Volume de Itens"
            value={totalUnits}
            unit="unidades"
            tone="purple"
          />
          <StatCard
            icon={Tag}
            label="Valor Total"
            value={formatCurrency(sale?.total_price)}
            tone="emerald"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="border-b border-gray-100 bg-gray-50/50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
                <Package className="h-5 w-5 text-blue-600" /> Produtos do Pedido
              </h2>
            </div>
          </div>

          <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase text-slate-500">
                    Qtd
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-500">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-200 hover:bg-gray-50/80"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-slate-600">
                        {item.sku || (
                          <span className="text-slate-300">N/A</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                        {item.quantity}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-right text-sm font-black text-slate-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCurrency(
                        Number(item.item_price || 0) * item.quantity
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-end px-6 py-4">
              <span className="mr-8 flex items-center text-sm font-bold uppercase tracking-widest text-slate-500">
                Total do Pedido:
              </span>
              <span
                className="text-xl font-black text-blue-600"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatCurrency(sale?.total_price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </LoadingOverlay>
  );
}
