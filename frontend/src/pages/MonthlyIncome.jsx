import { useMemo, useState, useEffect } from "react";
import { getFinancePeriod } from "../services/financeService";

import {
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Package,
  ShoppingCart,
  Target,
  TrendingUp,
} from "lucide-react";

export default function FinancialAnalytics() {

  const [period, setPeriod] = useState("month");

  const { financePeriod = {}, loadFinancePeriod, financeGoal = {}, loadFinanceGoal } = getFinancePeriod();

  useEffect(() => {
    loadFinancePeriod(period);
    loadFinanceGoal();
  }, [period]);

  /*
    DATA
  */

  const totalRevenue = financePeriod?.total_revenue ?? 0;
  const totalSales = financePeriod?.total_sales ?? 0;
  const ticketAverage = financePeriod?.average_ticket ?? 0;
  const totalProductsSold = financePeriod?.total_products_sold ?? 0;
 

  /*
    GOAL
  */

  const monthlyGoal = 150000;

  const goalPercentage = Math.min(
    (financeGoal / monthlyGoal) * 100,
    100
  );

  const remainingGoal = monthlyGoal - financeGoal;

  /*
    PAYMENT METHODS
  */

  const salesByMethod = [
    {
      id: 1,
      method: "PIX",
      value: financePeriod?.pix ?? 0,
      percentage:
        totalRevenue > 0
          ? (((financePeriod?.pix ?? 0) / totalRevenue) * 100).toFixed(2)
          : 0,
    },
    {
      id: 2,
      method: "Crédito",
      value: financePeriod?.credit ?? 0,
      percentage:
        totalRevenue > 0
          ? (((financePeriod?.credit ?? 0) / totalRevenue) * 100).toFixed(2)
          : 0,
    },
    {
      id: 3,
      method: "Débito",
      value: financePeriod?.debit ?? 0,
      percentage:
        totalRevenue > 0
          ? (((financePeriod?.debit ?? 0) / totalRevenue) * 100).toFixed(2)
          : 0,
    },
    {
      id: 4,
      method: "Dinheiro",
      value: financePeriod?.money ?? 0,
      percentage:
        totalRevenue > 0
          ? (((financePeriod?.money ?? 0) / totalRevenue) * 100).toFixed(2)
          : 0,
    },
  ];

  /*
    CHANNELS
  */

  const salesByChannel = [
    {
      id: 1,
      channel: "Loja Física",
      value: 68450.90,
      percentage: 53,
    },
    {
      id: 2,
      channel: "E-commerce",
      value: 38250.50,
      percentage: 30,
    },
    {
      id: 3,
      channel: "Marketplace",
      value: 21749.50,
      percentage: 17,
    },
  ];

  /*
    TOP PRODUCT
  */

  const topProduct = {
    name: financePeriod?.top_product ?? "---",
    quantity: financePeriod?.qtd_top_product ?? 0,
  };

  const formatCurrency = (value = 0) => {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div
      className="
        animate-in fade-in duration-500
        pb-10 h-full min-h-0 overflow-y-auto
        pr-3 custom-scroll
      "
    >

      {/* HEADER */}
      <div
        className="
          mb-8 flex flex-col gap-4
          lg:flex-row lg:items-center lg:justify-between
        "
      >

        <div>

          <div className="mb-2 flex items-center gap-3">

            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-2xl bg-emerald-600
                shadow-lg shadow-emerald-500/20
              "
            >
              <DollarSign className="h-5 w-5 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800">
              Centro Financeiro
            </h1>
          </div>

          <p className="text-sm text-gray-500">
            Analise receitas, vendas, indicadores e desempenho operacional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* FILTER */}
          <div className="relative">

            <Filter
              className="
                absolute left-4 top-1/2 h-4 w-4
                -translate-y-1/2 text-gray-400
              "
            />

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="
                rounded-xl border border-gray-200 bg-white
                py-3 pl-11 pr-10 text-sm font-medium
                text-gray-700 shadow-sm outline-none
                transition focus:border-blue-500
                focus:ring-4 focus:ring-blue-100
              "
            >
              <option value="today">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="60d">Últimos 60 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="month">Este mês</option>
              <option value="year">Este ano</option>
            </select>
          </div>

          {/* EXPORT */}
          <button
            className="
              flex items-center gap-2 rounded-xl
              border border-gray-200 bg-white
              px-5 py-3 text-sm font-semibold
              text-gray-700 shadow-sm transition-all
              hover:bg-gray-50
            "
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* HERO GOAL */}
      <div
        className="
          mb-8 overflow-hidden rounded-3xl
          bg-gradient-to-br from-amber-500
          via-orange-500 to-red-500
          p-8 text-white
        "
      >

        <div
          className="
            flex flex-col gap-8
            xl:flex-row xl:items-center xl:justify-between
          "
        >

          <div>

            <div
              className="
                mb-4 inline-flex items-center gap-2
                rounded-full bg-white/10
                px-4 py-2 text-sm font-medium
                backdrop-blur
              "
            >
              <Target className="h-4 w-4" />
              Meta mensal
            </div>

            <h2 className="text-5xl font-black tracking-tight">
              {Math.floor(goalPercentage)}%
            </h2>

            <p className="mt-3 text-orange-100">
              Progresso da meta financeira do mês atual
            </p>
          </div>

          <div className="w-full max-w-xl">

            <div className="mb-3 flex items-center justify-between">

              <span className="text-sm font-medium text-orange-100">
                Valor acumulado
              </span>

              <span className="text-sm font-bold text-white">
                {formatCurrency(monthlyGoal)}
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-white/20">

              <div
                style={{ width: `${goalPercentage}%` }}
                className="
                  h-full rounded-full bg-white
                  transition-all duration-700
                "
              />
            </div>

            <div className="mt-4 flex items-center justify-between">

              <div>

                <p className="text-xs text-orange-100">
                  Receita atual
                </p>

                <h3 className="text-lg font-bold text-white">
                  {formatCurrency(financeGoal)}
                </h3>
              </div>

              <div className="text-right">

                <p className="text-xs text-orange-100">
                  Falta para meta
                </p>

                <h3 className="text-lg font-bold text-white">
                  {formatCurrency(
                    remainingGoal > 0 ? remainingGoal : 0
                  )}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HERO REVENUE */}
      <div
        className="
          mb-8 overflow-hidden rounded-3xl
          bg-gradient-to-br from-emerald-600
          via-emerald-700 to-teal-700
          p-8 text-white
        "
      >

        <div
          className="
            flex flex-col gap-6
          "
        >

          <div>

            <div
              className="
                mb-4 inline-flex items-center gap-2
                rounded-full bg-white/10
                px-4 py-2 text-sm font-medium
                backdrop-blur
              "
            >
              <TrendingUp className="h-4 w-4" />
              Receita consolidada do período
            </div>

            <h2 className="text-5xl font-black tracking-tight">
              {formatCurrency(totalRevenue)}
            </h2>

            <p className="mt-3 text-base text-emerald-100">
              Resultado financeiro acumulado no período selecionado
            </p>
          </div>
        </div>
      </div>

      {/* KPI TITLE */}
      <div className="mb-4">

        <h2
          className="
            text-sm font-bold uppercase
            tracking-wider text-gray-400
          "
        >
          Indicadores do Período
        </h2>
      </div>

      {/* KPI GRID */}
      <div
        className="
          mb-8 grid grid-cols-1 gap-6
          md:grid-cols-2 xl:grid-cols-4
        "
      >

        {/* SALES */}
        <div
          className="
            overflow-hidden rounded-2xl border
            border-blue-100 bg-white shadow-sm
            transition-all hover:-translate-y-1
            hover:shadow-lg
          "
        >

          <div className="p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="mb-1 text-sm font-medium text-gray-500">
                  Total de Vendas
                </p>

                <h2 className="text-3xl font-bold text-gray-800">
                  {totalSales}
                </h2>
              </div>

              <div
                className="
                  flex h-14 w-14 items-center justify-center
                  rounded-2xl bg-blue-100
                "
              >
                <ShoppingCart className="h-7 w-7 text-blue-600" />
              </div>
            </div>

            <div
              className="
                inline-flex items-center gap-1
                rounded-full bg-blue-100
                px-3 py-1 text-xs font-semibold
                text-blue-700
              "
            >
              Operações realizadas no período
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div
          className="
            overflow-hidden rounded-2xl border
            border-indigo-100 bg-white shadow-sm
            transition-all hover:-translate-y-1
            hover:shadow-lg
          "
        >

          <div className="p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="mb-1 text-sm font-medium text-gray-500">
                  Produtos Vendidos
                </p>

                <h2 className="text-3xl font-bold text-gray-800">
                  {totalProductsSold}
                </h2>
              </div>

              <div
                className="
                  flex h-14 w-14 items-center justify-center
                  rounded-2xl bg-indigo-100
                "
              >
                <Package className="h-7 w-7 text-indigo-600" />
              </div>
            </div>

            <div
              className="
                inline-flex items-center gap-1
                rounded-full bg-indigo-100
                px-3 py-1 text-xs font-semibold
                text-indigo-700
              "
            >
              Itens movimentados no período
            </div>
          </div>
        </div>

        {/* TICKET */}
        <div
          className="
            overflow-hidden rounded-2xl border
            border-purple-100 bg-white shadow-sm
            transition-all hover:-translate-y-1
            hover:shadow-lg
          "
        >

          <div className="p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="mb-1 text-sm font-medium text-gray-500">
                  Ticket Médio
                </p>

                <h2 className="text-3xl font-bold text-gray-800">
                  {formatCurrency(ticketAverage)}
                </h2>
              </div>

              <div
                className="
                  flex h-14 w-14 items-center justify-center
                  rounded-2xl bg-purple-100
                "
              >
                <CreditCard className="h-7 w-7 text-purple-600" />
              </div>
            </div>

            <div
              className="
                inline-flex items-center gap-1
                rounded-full bg-purple-100
                px-3 py-1 text-xs font-semibold
                text-purple-700
              "
            >
              Valor médio por venda
            </div>
          </div>
        </div>

        {/* TOP PRODUCT */}
        <div
          className="
            overflow-hidden rounded-2xl border
            border-amber-100 bg-white shadow-sm
            transition-all hover:-translate-y-1
            hover:shadow-lg
          "
        >

          <div className="p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="mb-1 text-sm font-medium text-gray-500">
                  Produto Destaque
                </p>

                <h2 className="text-2xl font-bold text-gray-800">
                  {topProduct.name}
                </h2>
              </div>

              <div
                className="
                  flex h-14 w-14 items-center justify-center
                  rounded-2xl bg-amber-100
                "
              >
                <Package className="h-7 w-7 text-amber-600" />
              </div>
            </div>

            <div
              className="
                inline-flex items-center gap-1
                rounded-full bg-amber-100
                px-3 py-1 text-xs font-semibold
                text-amber-700
              "
            >
              {topProduct.quantity} unidades vendidas
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS GRID */}
      <div
        className="
          grid grid-cols-1 gap-8
          xl:grid-cols-2
        "
      >

        {/* PAYMENT METHODS */}
        <div
          className="
            overflow-hidden rounded-2xl
            border border-gray-200
            bg-white shadow-sm
          "
        >

          <div className="border-b border-gray-100 px-6 py-5">

            <div>

              <h2 className="text-lg font-bold text-gray-800">
                Receita por Método de Pagamento
              </h2>

              <p className="text-sm text-gray-500">
                Distribuição financeira por forma de pagamento
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">

            {salesByMethod.map((item) => (
              <div key={item.id}>

                <div className="mb-2 flex items-center justify-between">

                  <div>

                    <h3 className="text-sm font-semibold text-gray-700">
                      {item.method}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {item.percentage}% da receita
                    </p>
                  </div>

                  <span className="text-sm font-bold text-gray-800">
                    {formatCurrency(item.value)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="
                      h-full rounded-full
                      bg-gradient-to-r
                      from-blue-500 to-indigo-600
                    "
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHANNELS */}
        <div
          className="
            overflow-hidden rounded-2xl
            border border-gray-200
            bg-white shadow-sm
          "
        >

          <div className="border-b border-gray-100 px-6 py-5">

            <div>

              <h2 className="text-lg font-bold text-gray-800">
                Receita por Canal
              </h2>

              <p className="text-sm text-gray-500">
                Distribuição das vendas por origem
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">

            {salesByChannel.map((item) => (
              <div key={item.id}>

                <div className="mb-2 flex items-center justify-between">

                  <div>

                    <h3 className="text-sm font-semibold text-gray-700">
                      {item.channel}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {item.percentage}% da receita
                    </p>
                  </div>

                  <span className="text-sm font-bold text-gray-800">
                    {formatCurrency(item.value)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="
                      h-full rounded-full
                      bg-gradient-to-r
                      from-emerald-500 to-teal-600
                    "
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}