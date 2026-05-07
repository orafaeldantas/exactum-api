import { useMemo, useState } from "react";

import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Goal,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function FinancialAnalytics() {

  const [period, setPeriod] = useState("month");

  /*
    MOCK DATA
  */

  const totalRevenue = 128450.90;
  const totalSales = 324;
  const ticketAverage = totalRevenue / totalSales;

  const monthlyGoal = 150000;
  const goalPercentage = (totalRevenue / monthlyGoal) * 100;

  /*
    TODAY DATA
  */

  const todayRevenue = 9840.90;
  const todaySales = 24;
  const todayProducts = 184;
  const todayTransactions = 39;

  /*
    PAYMENT METHODS
  */

  const salesByMethod = [
    {
      id: 1,
      method: "PIX",
      value: 48250.90,
      percentage: 37,
    },
    {
      id: 2,
      method: "Crédito",
      value: 52890.40,
      percentage: 41,
    },
    {
      id: 3,
      method: "Débito",
      value: 19340.30,
      percentage: 15,
    },
    {
      id: 4,
      method: "Dinheiro",
      value: 7969.30,
      percentage: 7,
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
    RECENT TRANSACTIONS
  */

  const recentTransactions = [
    {
      id: 1042,
      customer: "Carlos Silva",
      method: "PIX",
      total: 1899.90,
      status: "Pago",
      date: "05/05/2026",
    },
    {
      id: 1043,
      customer: "Fernanda Costa",
      method: "Crédito",
      total: 459.90,
      status: "Pago",
      date: "05/05/2026",
    },
    {
      id: 1044,
      customer: "Lucas Pereira",
      method: "Débito",
      total: 789.90,
      status: "Pago",
      date: "04/05/2026",
    },
    {
      id: 1045,
      customer: "Marina Souza",
      method: "Dinheiro",
      total: 249.90,
      status: "Pago",
      date: "04/05/2026",
    },
  ];

  const revenueGrowth = useMemo(() => {
    return "+18.4%";
  }, []);

  function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">

      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-3">

            <div className="
              flex h-11 w-11 items-center justify-center
              rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-500/20
            ">
              <DollarSign className="h-5 w-5 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800">
              Centro Financeiro
            </h1>
          </div>

          <p className="text-sm text-gray-500">
            Analise receitas, vendas, transações e indicadores operacionais
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* FILTER */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="
                rounded-xl border border-gray-200 bg-white
                py-3 pl-11 pr-10 text-sm font-medium text-gray-700
                shadow-sm outline-none transition
                focus:border-blue-500 focus:ring-4 focus:ring-blue-100
              "
            >
              <option value="today">Hoje</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Este mês</option>
              <option value="year">Este ano</option>
            </select>
          </div>

          {/* EXPORT */}
          <button
            className="
              flex items-center gap-2 rounded-xl border border-gray-200
              bg-white px-5 py-3 text-sm font-semibold text-gray-700
              shadow-sm transition-all hover:bg-gray-50
            "
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* PERIOD TITLE */}
      <div className="mb-4">
        <h2 className="
          text-sm font-bold uppercase tracking-wider text-gray-400
        ">
          Indicadores do Período
        </h2>
      </div>

      {/* PERIOD CARDS */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        {/* RECEITA */}
        <div className="
          overflow-hidden rounded-2xl border border-emerald-100
          bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg
        ">
          <div className="p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="mb-1 text-sm font-medium text-gray-500">
                  Receita Total
                </p>

                <h2 className="text-3xl font-bold text-gray-800">
                  {formatCurrency(totalRevenue)}
                </h2>
              </div>

              <div className="
                flex h-14 w-14 items-center justify-center
                rounded-2xl bg-emerald-100
              ">
                <Wallet className="h-7 w-7 text-emerald-600" />
              </div>
            </div>

            <div className="
              inline-flex items-center gap-1 rounded-full
              bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700
            ">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {revenueGrowth} vs período anterior
            </div>
          </div>
        </div>

        {/* SALES */}
        <div className="
          overflow-hidden rounded-2xl border border-blue-100
          bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg
        ">
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

              <div className="
                flex h-14 w-14 items-center justify-center
                rounded-2xl bg-blue-100
              ">
                <ShoppingCart className="h-7 w-7 text-blue-600" />
              </div>
            </div>

            <div className="
              inline-flex items-center gap-1 rounded-full
              bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700
            ">
              <TrendingUp className="h-3.5 w-3.5" />
              Alto volume operacional
            </div>
          </div>
        </div>

        {/* TICKET */}
        <div className="
          overflow-hidden rounded-2xl border border-purple-100
          bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg
        ">
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

              <div className="
                flex h-14 w-14 items-center justify-center
                rounded-2xl bg-purple-100
              ">
                <CreditCard className="h-7 w-7 text-purple-600" />
              </div>
            </div>

            <div className="
              inline-flex items-center gap-1 rounded-full
              bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700
            ">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +9.3% crescimento
            </div>
          </div>
        </div>

        {/* META */}
        <div className="
          overflow-hidden rounded-2xl border border-amber-100
          bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg
        ">
          <div className="p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="mb-1 text-sm font-medium text-gray-500">
                  Meta Mensal
                </p>

                <h2 className="text-3xl font-bold text-gray-800">
                  {Math.floor(goalPercentage)}%
                </h2>
              </div>

              <div className="
                flex h-14 w-14 items-center justify-center
                rounded-2xl bg-amber-100
              ">
                <Goal className="h-7 w-7 text-amber-600" />
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                {formatCurrency(totalRevenue)}
              </span>

              <span className="text-xs font-medium text-gray-500">
                {formatCurrency(monthlyGoal)}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                style={{ width: `${goalPercentage}%` }}
                className="
                  h-full rounded-full bg-gradient-to-r
                  from-amber-400 to-orange-500
                "
              />
            </div>
          </div>
        </div>
      </div>

      {/* TODAY TITLE */}
      <div className="mb-4">
        <h2 className="
          text-sm font-bold uppercase tracking-wider text-gray-400
        ">
          Indicadores de Hoje
        </h2>
      </div>

      {/* TODAY CARDS */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        {/* TODAY REVENUE */}
        <div className="
          rounded-2xl border border-gray-200 bg-white p-6 shadow-sm
          transition-all hover:-translate-y-1 hover:shadow-lg
        ">
          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">
                Receita Hoje
              </p>

              <h2 className="text-2xl font-bold text-emerald-600">
                {formatCurrency(todayRevenue)}
              </h2>
            </div>

            <div className="
              flex h-12 w-12 items-center justify-center
              rounded-2xl bg-emerald-100
            ">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Atualizado em tempo real
          </p>
        </div>

        {/* TODAY SALES */}
        <div className="
          rounded-2xl border border-gray-200 bg-white p-6 shadow-sm
          transition-all hover:-translate-y-1 hover:shadow-lg
        ">
          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">
                Vendas Hoje
              </p>

              <h2 className="text-2xl font-bold text-gray-800">
                {todaySales}
              </h2>
            </div>

            <div className="
              flex h-12 w-12 items-center justify-center
              rounded-2xl bg-blue-100
            ">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Operações realizadas hoje
          </p>
        </div>

        {/* PRODUCTS */}
        <div className="
          rounded-2xl border border-gray-200 bg-white p-6 shadow-sm
          transition-all hover:-translate-y-1 hover:shadow-lg
        ">
          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">
                Produtos Vendidos
              </p>

              <h2 className="text-2xl font-bold text-gray-800">
                {todayProducts}
              </h2>
            </div>

            <div className="
              flex h-12 w-12 items-center justify-center
              rounded-2xl bg-purple-100
            ">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Quantidade total de itens
          </p>
        </div>

        {/* TRANSACTIONS */}
        <div className="
          rounded-2xl border border-gray-200 bg-white p-6 shadow-sm
          transition-all hover:-translate-y-1 hover:shadow-lg
        ">
          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">
                Transações Hoje
              </p>

              <h2 className="text-2xl font-bold text-gray-800">
                {todayTransactions}
              </h2>
            </div>

            <div className="
              flex h-12 w-12 items-center justify-center
              rounded-2xl bg-amber-100
            ">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Fluxo financeiro diário
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">

        {/* LEFT */}
        <div className="space-y-8 xl:col-span-2">

          {/* PAYMENT METHODS */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

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
                        h-full rounded-full bg-gradient-to-r
                        from-blue-500 to-indigo-600
                      "
                    />
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* CHANNELS */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

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
                        h-full rounded-full bg-gradient-to-r
                        from-emerald-500 to-teal-600
                      "
                    />
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* TRANSACTIONS */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Últimas Transações
                </h2>

                <p className="text-sm text-gray-500">
                  Movimentações financeiras recentes
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Venda
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Cliente
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Método
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Total
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {recentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-t border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        #{transaction.id}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {transaction.customer}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {transaction.method}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        {formatCurrency(transaction.total)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="
                          inline-flex items-center rounded-full
                          bg-green-100 px-3 py-1 text-xs font-semibold text-green-700
                        ">
                          Pago
                        </span>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-8">

          {/* RESULT */}
          <div className="
            rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700
            p-6 text-white shadow-xl
          ">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-emerald-100">
                  Receita Atual
                </p>

                <h2 className="mt-1 text-4xl font-bold">
                  {formatCurrency(totalRevenue)}
                </h2>
              </div>

              <div className="
                flex h-14 w-14 items-center justify-center
                rounded-2xl bg-white/10 backdrop-blur
              ">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">

              <div className="mb-2 flex items-center justify-between text-sm">

                <span className="text-emerald-100">
                  Meta Mensal
                </span>

                <span className="font-semibold text-white">
                  {formatCurrency(monthlyGoal)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/20">

                <div
                  style={{ width: `${goalPercentage}%` }}
                  className="h-full rounded-full bg-white"
                />
              </div>

              <div className="mt-2 text-right text-xs font-semibold text-emerald-100">
                {Math.floor(goalPercentage)}% concluído
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-6 py-5">

              <h2 className="text-lg font-bold text-gray-800">
                Resumo Operacional
              </h2>
            </div>

            <div className="space-y-5 p-6">

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Ticket Médio
                </span>

                <span className="text-sm font-bold text-gray-800">
                  {formatCurrency(ticketAverage)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Vendas no Período
                </span>

                <span className="text-sm font-bold text-gray-800">
                  {totalSales}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Receita Hoje
                </span>

                <span className="text-sm font-bold text-emerald-600">
                  {formatCurrency(todayRevenue)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Produtos Vendidos Hoje
                </span>

                <span className="text-sm font-bold text-gray-800">
                  {todayProducts}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}