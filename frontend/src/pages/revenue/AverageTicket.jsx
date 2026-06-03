import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAverageTicketMetrics } from "../../services/revenueService"
import LoadingOverlay from "../../components/Loader/LoadingOverlay";
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Target,
  BarChart3,
  Loader2,
} from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


export default function AverageTicketAnalytics() {
  const navigate = useNavigate();

  const { averageTicketMetrics = {}, loadAverageTicketMetrics, loading} = getAverageTicketMetrics()

  const today = new Date();

  const [month, setMonth] = useState(
    (today.getMonth() + 1).toString().padStart(2, "0")
  );

  const [year, setYear] = useState(today.getFullYear().toString());

  useEffect(() => {
    loadAverageTicketMetrics(month, year);
  }, [month, year]);

  // -----------------------------
  // CALCULATIONS
  // -----------------------------

  // avgMonthly: { labels: [...], values: [...] } → [{ month, value }]
  const historicalAverageTicket = useMemo(() => {
    const raw = averageTicketMetrics.avgMonthly;
    if (!raw?.labels || !raw?.values) return [];
    return raw.labels.map((label, i) => ({
      month: label,
      value: parseFloat(raw.values[i]) || 0,
    }));
  }, [averageTicketMetrics.avgMonthly]);

  // avgWeekday: { labels: [...], values: [...] } → [{ day, value }]
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

  const yearOptions = useMemo(() => {
    const years = [];

    for (let i = today.getFullYear(); i >= 2020; i--) {
      years.push(i.toString());
    }

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

    <LoadingOverlay loading={loading} message="Buscando dados...">
      <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Ticket Médio
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Análise financeira do comportamento de consumo dos clientes
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/sales")}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-100"
            >
              Voltar
            </button>

            <button
              onClick={() => navigate("/checkout")}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:scale-[1.02]"
            >
              Nova Venda
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500"
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
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          
          {/* TICKET MÉDIO */}
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-500">
                    Ticket Médio
                  </p>
                  <h2 className="text-3xl font-bold text-gray-800">
                    R${" "}
                    {averageTicket.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                  <Wallet className="h-7 w-7 text-blue-600" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Valor médio por venda
              </div>
            </div>
          </div>

          {/* TOTAL ORDERS */}
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-500">
                    Total de Pedidos
                  </p>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {totalOrders}
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                  <ShoppingCart className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Pedidos processados no período
              </div>
            </div>
          </div>

          {/* BIGGEST SALE */}
          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-500">
                    Maior Venda
                  </p>
                  <h2 className="text-3xl font-bold text-gray-800">
                    R${" "}
                    {highestSale.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
                  <TrendingUp className="h-7 w-7 text-purple-600" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                Melhor desempenho individual
              </div>
            </div>
          </div>

          {/* LOWEST SALE */}
          <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-500">
                    Menor Venda
                  </p>
                  <h2 className="text-3xl font-bold text-gray-800">
                    R${" "}
                    {lowestSale.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                  <Target className="h-7 w-7 text-amber-600" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Menor pedido registrado
              </div>
            </div>
          </div>

        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Historical Average Ticket */}
          <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Evolução do Ticket Médio
                </h2>

                <p className="text-sm text-gray-500">
                  Comparativo mensal do valor médio por venda
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <div className="h-[350px]">
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

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip
                    animationDuration={200}
                    animationEasing="ease-out"

                    cursor={{
                      fill: "rgba(241, 245, 249, 0.5)",
                      radius: 12
                    }}

                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 12px 30px rgba(19, 65, 172, 0.08)",
                      padding: "10px 14px"
                    }}

                    labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}
                    itemStyle={{ color: "#2563eb", fontWeight: 800, fontSize: "15px" }}

                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString("pt-BR")}`,
                      "Ticket"
                    ]}
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
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Insights Financeiros
              </h2>

              <p className="text-sm text-gray-500">
                Indicadores automáticos de performance
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />

                  <h4 className="text-sm font-bold text-emerald-700">
                    Crescimento Saudável
                  </h4>
                </div>

                <p className="text-sm leading-relaxed text-emerald-700">
                  O ticket médio apresentou crescimento consistente nos
                  últimos meses.
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />

                  <h4 className="text-sm font-bold text-blue-700">
                    Oportunidade
                  </h4>
                </div>

                <p className="text-sm leading-relaxed text-blue-700">
                  Considere estratégias de upsell para elevar ainda mais o
                  valor médio por pedido.
                </p>
              </div>

              <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />

                  <h4 className="text-sm font-bold text-purple-700">
                    Pico de Conversão
                  </h4>
                </div>

                <p className="text-sm leading-relaxed text-purple-700">
                  Quinta e sexta possuem os maiores tickets médios da
                  semana.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Analysis */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              Ticket Médio por Dia da Semana
            </h2>

            <p className="text-sm text-gray-500">
              Identifique os dias com maior potencial de faturamento
            </p>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTicket}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                  style={{ fontSize: '12px', fill: '#94a3b8', fontWeight: 500 }}
                />

                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                  style={{ fontSize: '12px', fill: '#94a3b8', fontWeight: 500 }}
                />

                <Tooltip
                  animationDuration={200}
                  animationEasing="ease-out"

                  cursor={{
                    fill: "rgba(241, 245, 249, 0.5)",
                    radius: 12
                  }}

                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 12px 30px rgba(19, 65, 172, 0.08)",
                    padding: "10px 14px"
                  }}

                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}
                  itemStyle={{ color: "#0f172a", fontWeight: 800, fontSize: "15px" }}

                  formatter={(value) => [
                    `R$ ${Number(value).toLocaleString("pt-BR")}`,
                    "Ticket"
                  ]}
                />

                <Bar
                  dataKey="value"
                  radius={[10, 10, 0, 0]}
                  fill="#10b981"
                  maxBarSize={150}
                  
                  activeBar={{
                    fill: "#059669",
                    radius: [10, 10, 0, 0],
                    style: { transition: "fill 0.2s ease" }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </LoadingOverlay>
  );
}