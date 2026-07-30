import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ShoppingCart,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAverageTicketMetrics } from "../../services/revenueService";

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
/*  Skeleton Card                                                     */
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
/*  StatCard                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(15,23,42,0.08)]">
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent to-blue-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            toneClasses[tone] || toneClasses.blue
          }`}
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AverageTicketAnalytics                                            */
/* ------------------------------------------------------------------ */
export default function AverageTicketAnalytics() {
  const navigate = useNavigate();
  const {
    averageTicketMetrics = {},
    loadAverageTicketMetrics,
    loading,
  } = getAverageTicketMetrics();

  const today = new Date();
  const [month, setMonth] = useState(
    (today.getMonth() + 1).toString().padStart(2, "0")
  );
  const [year, setYear] = useState(today.getFullYear().toString());

  useEffect(() => {
    loadAverageTicketMetrics(month, year);
  }, [month, year]);

  /* ---- Data processing ---- */
  const historicalAverageTicket = useMemo(() => {
    const raw = averageTicketMetrics.avgMonthly;
    if (!raw?.labels || !raw?.values) return [];
    return raw.labels.map((label, i) => ({
      month: label,
      value: parseFloat(raw.values[i]) || 0,
    }));
  }, [averageTicketMetrics.avgMonthly]);

  const weeklyTicket = useMemo(() => {
    const raw = averageTicketMetrics.avgWeekday;
    if (!raw?.labels || !raw?.values) return [];
    return raw.labels.map((label, i) => ({
      day: label,
      value: parseFloat(raw.values[i]) || 0,
    }));
  }, [averageTicketMetrics.avgWeekday]);

  const totalOrders = averageTicketMetrics.quantityOrder ?? 0;
  const averageTicket = parseFloat(averageTicketMetrics.averageTicket) || 0;
  const highestSale = parseFloat(averageTicketMetrics.biggestSale) || 0;
  const lowestSale = parseFloat(averageTicketMetrics.lowestSale) || 0;

  /* ---- Filter options ---- */
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = today.getFullYear(); i >= 2020; i--) years.push(i.toString());
    return years;
  }, []);

  const monthOptions = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  return (
    /*<LoadingOverlay
      loading={loading}
      minDuration={250}
      message="Buscando dados..."
    >*/
    <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
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
              Ticket Médio
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Análise financeira do comportamento de consumo dos clientes
          </p>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.35)] active:scale-[0.98]"
        >
          <ShoppingCart className="w-4 h-4" /> Nova Venda
        </button>
      </div>

      {/* ========== FILTERS ========== */}
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors duration-200 focus:border-blue-500"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors duration-200 focus:border-blue-500"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

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
              icon={Wallet}
              label="Ticket Médio"
              value={formatCurrency(averageTicket)}
              tone="blue"
            />
            <StatCard
              icon={ShoppingCart}
              label="Total de Pedidos"
              value={totalOrders}
              tone="emerald"
            />
            <StatCard
              icon={TrendingUp}
              label="Maior Venda"
              value={formatCurrency(highestSale)}
              tone="purple"
            />
            <StatCard
              icon={Target}
              label="Menor Venda"
              value={formatCurrency(lowestSale)}
              tone="amber"
            />
          </>
        )}
      </div>

      {/* ========== CHARTS AND INSIGHTS ========== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Evolution of Average Ticket Value*/}
        <div className="xl:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Evolução do Ticket Médio
              </h2>
              <p className="text-sm text-slate-500">
                Comparativo mensal do valor médio por venda
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="h-[350px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalAverageTicket}>
                  <defs>
                    <linearGradient
                      id="ticketGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                      boxShadow: "0 12px 30px rgba(19,65,172,0.08)",
                      padding: "10px 14px",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                    itemStyle={{
                      color: "#2563eb",
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                    formatter={(value) => [formatCurrency(value), "Ticket"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    fill="url(#ticketGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Insights  */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-800">
              Insights Financeiros
            </h2>
            <p className="text-sm text-slate-500">
              Indicadores automáticos de performance
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-emerald-700">
                  Crescimento Saudável
                </h4>
              </div>
              <p className="text-sm leading-relaxed text-emerald-700">
                O ticket médio apresentou crescimento consistente nos últimos
                meses.
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-blue-700">
                  Oportunidade
                </h4>
              </div>
              <p className="text-sm leading-relaxed text-blue-700">
                Considere estratégias de upsell para elevar ainda mais o valor
                médio por pedido.
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
                <h4 className="text-sm font-bold text-purple-700">
                  Pico de Conversão
                </h4>
              </div>
              <p className="text-sm leading-relaxed text-purple-700">
                Quinta e sexta possuem os maiores tickets médios da semana.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== WEEKLY ANALYSIS ========== */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-800">
            Ticket Médio por Dia da Semana
          </h2>
          <p className="text-sm text-slate-500">
            Identifique os dias com maior potencial de faturamento
          </p>
        </div>

        <div className="h-[320px]">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTicket}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#fff",
                    boxShadow: "0 12px 30px rgba(19,65,172,0.08)",
                    padding: "10px 14px",
                  }}
                  labelStyle={{
                    color: "#94a3b8",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                  itemStyle={{
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                  formatter={(value) => [formatCurrency(value), "Ticket"]}
                />
                <Bar
                  dataKey="value"
                  radius={[10, 10, 0, 0]}
                  fill="#10b981"
                  maxBarSize={150}
                  activeBar={{ fill: "#059669", radius: [10, 10, 0, 0] }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
    /*</LoadingOverlay>*/
  );
}
