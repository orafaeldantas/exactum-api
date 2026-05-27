import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAverageTicketMetrics } from "../services/revenueService"

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

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 border-l-4 border-l-blue-500 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-blue-500" />

            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Ticket Médio
            </p>
          </div>

          <h3 className="text-3xl font-black text-gray-800">
            R${" "}
            {averageTicket.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </h3>

        </div>

        <div className="rounded-2xl border border-gray-200 border-l-4 border-l-emerald-500 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-emerald-500" />

            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total de Pedidos
            </p>
          </div>

          <h3 className="text-3xl font-black text-gray-800">
            {totalOrders}
          </h3>

          <p className="mt-3 text-sm text-gray-500">
            Pedidos processados no período
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 border-l-4 border-l-purple-500 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />

            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Maior Venda
            </p>
          </div>

          <h3 className="text-3xl font-black text-gray-800">
            R${" "}
            {highestSale.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </h3>

          <p className="mt-3 text-sm text-gray-500">
            Melhor desempenho individual
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 border-l-4 border-l-amber-500 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" />

            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Menor Venda
            </p>
          </div>

          <h3 className="text-3xl font-black text-gray-800">
            R${" "}
            {lowestSale.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </h3>

          <p className="mt-3 text-sm text-gray-500">
            Menor pedido registrado
          </p>
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

                <Tooltip formatter={(value) => [`R$ ${value}`, "Ticket"]} />

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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip formatter={(value) => [`R$ ${value}`, "Ticket"]} />

              <Bar
                dataKey="value"
                radius={[10, 10, 0, 0]}
                fill="#10b981"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />

            <span className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Carregando Indicadores...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}