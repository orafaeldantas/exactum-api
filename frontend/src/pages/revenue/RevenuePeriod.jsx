import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Download,
  Package,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TenantContext } from "../../context/TenantContext";
import { getRevenuePeriod } from "../../services/revenueService";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* ------------------------------------------------------------------ */
/*  Skeleton Cards                                                    */
/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-20 rounded bg-gray-200" />
          <div className="h-3 w-16 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                            StatCard                                */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, tone = "blue", trend }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(15,23,42,0.08)]">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent to-blue-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
            toneClasses[tone] || toneClasses.blue
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p
            className="text-2xl font-black tracking-tight text-slate-900"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </p>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs font-semibold">
            {trend >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            )}
            <span className={trend >= 0 ? "text-emerald-600" : "text-red-500"}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                 RevenueAnalytics core component                    */
/* ------------------------------------------------------------------ */
export default function RevenueAnalytics() {
  const navigate = useNavigate();
  const { tenantData } = useContext(TenantContext);
  const {
    revenuePeriod = {},
    loadRevenue,
    loading,
    loadGoal,
  } = getRevenuePeriod();
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    loadRevenue(period);
    loadGoal();
  }, [period]);

  /* ---- Extracted data ---- */
  const revenueMetrics = revenuePeriod.revenue_metrics ?? {};
  const paymentMetrics = revenuePeriod.payment_metrics ?? [];
  const topProduct = revenuePeriod.top_product ?? {};

  const totalRevenue = revenueMetrics.total_revenue ?? 0;
  const totalSales = revenueMetrics.total_sales ?? 0;
  const ticketAverage = revenueMetrics.average_ticket ?? 0;
  const totalProductsSold = revenueMetrics.total_products_sold ?? 0;

  /* ---- Monthly goal ---- */
  const monthlyGoal = parseFloat(tenantData?.goal ?? 0);
  const goalPercentage =
    monthlyGoal > 0 ? Math.min((totalRevenue / monthlyGoal) * 100, 100) : 0;
  const remainingGoal = monthlyGoal - totalRevenue;

  /* ---- Payment methods ---- */
  const findMethod = (method) =>
    paymentMetrics.find((item) => item.payment_method === method)?.revenue ?? 0;

  const salesByMethod = [
    {
      id: 1,
      method: "PIX",
      value: parseFloat(findMethod("pix")),
      percentage: totalRevenue
        ? ((findMethod("pix") / totalRevenue) * 100).toFixed(1)
        : 0,
    },
    {
      id: 2,
      method: "Crédito",
      value: parseFloat(findMethod("credit")),
      percentage: totalRevenue
        ? ((findMethod("credit") / totalRevenue) * 100).toFixed(1)
        : 0,
    },
    {
      id: 3,
      method: "Débito",
      value: parseFloat(findMethod("debit")),
      percentage: totalRevenue
        ? ((findMethod("debit") / totalRevenue) * 100).toFixed(1)
        : 0,
    },
    {
      id: 4,
      method: "Dinheiro",
      value: parseFloat(findMethod("money")),
      percentage: totalRevenue
        ? ((findMethod("money") / totalRevenue) * 100).toFixed(1)
        : 0,
    },
  ];

  /* ---- Channels (placeholder) ---- */
  const salesByChannel = [
    {
      id: 1,
      channel: "Loja Física",
      value: totalRevenue,
      percentage: 100,
    },
  ];

  /* ---- Period options ---- */
  const periodOptions = [
    { value: "today", label: "Hoje" },
    { value: "7d", label: "Últimos 7 dias" },
    { value: "30d", label: "Últimos 30 dias" },
    { value: "60d", label: "Últimos 60 dias" },
    { value: "90d", label: "Últimos 90 dias" },
    { value: "month", label: "Este mês" },
    { value: "year", label: "Este ano" },
  ];

  const showGoal = period === "today" || period === "month";
  const selectedPeriodLabel =
    periodOptions.find((p) => p.value === period)?.label || "";

  return (
    /*<LoadingOverlay
      loading={loading}
      minDuration={250}
      message="Buscando dados..."
    >*/
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ========== HEADER ========== */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm transition-all hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Centro Financeiro
            </h1>
            {/* Active period badge */}
            <span className="hidden sm:inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              {selectedPeriodLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Analise receitas, vendas, indicadores e desempenho operacional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* DATE RANGE FILTER */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* EXPORT */}
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* ========== MONTHLY TARGET ========== */}
      {showGoal && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)] animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Meta Mensal
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {Math.floor(goalPercentage)}%
                </p>
              </div>
            </div>
            <div className="flex-1 sm:ml-8">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>Progresso</span>
                <span className="font-medium">
                  {formatCurrency(monthlyGoal)}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  style={{ width: `${goalPercentage}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Atual</span>
                  <p className="font-semibold text-slate-800">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Faltam</span>
                  <p className="font-semibold text-slate-800">
                    {formatCurrency(remainingGoal > 0 ? remainingGoal : 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== KPI CARDS ========== */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              icon={CreditCard}
              label="Receita Total"
              value={formatCurrency(totalRevenue)}
              tone="blue"
              trend={/* Exemplo: poderia vir de revenueTrend */ undefined}
            />
            <StatCard
              icon={ShoppingCart}
              label="Total de Vendas"
              value={totalSales}
              tone="emerald"
            />
            <StatCard
              icon={CreditCard}
              label="Ticket Médio"
              value={formatCurrency(ticketAverage)}
              tone="purple"
            />
            <StatCard
              icon={Package}
              label="Produtos Vendidos"
              value={totalProductsSold}
              tone="indigo"
            />
          </>
        )}
      </div>

      {/* ========== FEATURED PRODUCT ========== */}
      {topProduct.product_name && !loading && (
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-1 duration-500 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Produto Destaque
              </p>
              <p className="text-lg font-bold text-slate-900">
                {topProduct.product_name}
              </p>
              <p className="text-sm text-slate-500">
                {topProduct.total_quantity} unidades vendidas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== ANALYTICS: Payments & Channels ========== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Revenue by Payment Method */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-base font-bold text-slate-800">
              Receita por Método de Pagamento
            </h2>
            <p className="text-sm text-slate-500">
              Distribuição financeira por forma de pagamento
            </p>
          </div>
          <div className="space-y-5 p-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between animate-pulse">
                      <div className="h-4 w-20 rounded bg-gray-200" />
                      <div className="h-4 w-16 rounded bg-gray-200" />
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-100" />
                  </div>
                ))
              : salesByMethod.map((item) => (
                  <div key={item.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700">
                          {item.method}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {item.percentage}% da receita
                        </p>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Recipe by Channel */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-base font-bold text-slate-800">
              Receita por Canal
            </h2>
            <p className="text-sm text-slate-500">
              Distribuição das vendas por origem
            </p>
          </div>
          <div className="space-y-5 p-6">
            {loading
              ? Array.from({ length: 1 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between animate-pulse">
                      <div className="h-4 w-24 rounded bg-gray-200" />
                      <div className="h-4 w-16 rounded bg-gray-200" />
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-100" />
                  </div>
                ))
              : salesByChannel.map((item) => (
                  <div key={item.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700">
                          {item.channel}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {item.percentage}% da receita
                        </p>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
    /*</LoadingOverlay>*/
  );
}
