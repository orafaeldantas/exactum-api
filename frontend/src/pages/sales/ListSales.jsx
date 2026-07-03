import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSales } from "../../services/saleService";
import LoadingOverlay from "../../components/Loader/LoadingOverlay";
import {
  Search,
  Eye,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  ArrowLeft,
  ReceiptText,
} from "lucide-react";

function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black tracking-tight text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
          {value}
        </p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function ListSales() {
  const navigate = useNavigate();

  // Date States
  const today = new Date();
  const [month, setMonth] = useState((today.getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(today.getFullYear().toString());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const salesPerPage = 10;

  // Custom hook for fetching sales based on month/year
  const { sales = [], invoicing, loadSales, loading } = getSales();

  // Re-fetch when month or year changes
  useEffect(() => {  
    loadSales(month, year);
  }, [month, year]);
  
  // Dynamic Year Options
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = today.getFullYear(); i >= 2020; i--) years.push(i.toString());
    return years;
  }, []);

  const monthOptions = [
    { value: "01", label: "Janeiro" }, { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" }, { value: "04", label: "Abril" },
    { value: "05", label: "Maio" }, { value: "06", label: "Junho" },
    { value: "07", label: "Julho" }, { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" }, { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" }, { value: "12", label: "Dezembro" },
  ];

  // Local filter for quick search (ID or Payment Method)
  const filteredSales = sales.filter((sale) => 
    sale.uuid.toString().includes(search) || 
    sale.payment_method?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const startIndex = (page - 1) * salesPerPage;
  const endIndex = startIndex + salesPerPage;

  const paginatedSales = filteredSales.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredSales.length / salesPerPage);

  return (

    <LoadingOverlay loading={loading} minDuration={250} message="Buscando dados..."> 
      <div className="min-h-screen bg-gray-50 p-6 relative">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="group flex h-10 w-10 items-center justify-center rounded-full 
                          bg-white border border-gray-200 shadow-sm transition-all hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
              </button>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Vendas
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Exibindo registros de {monthOptions.find(m => m.value === month)?.label} de {year}
            </p>
          </div>
          <button
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.35)] active:scale-[0.98]"
            onClick={() => navigate("/checkout")}
          >
            <ShoppingBag className="w-4 h-4" /> Registrar Venda
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <StatCard icon={DollarSign} label="Faturamento Mensal" value={formatCurrency(invoicing)} tone="blue" />
          <StatCard
            icon={TrendingUp}
            label="Total de Pedidos"
            value={`${filteredSales.length} ${filteredSales.length === 1 ? "venda" : "vendas"}`}
            tone="emerald"
          />
        </div>

        {/* Filters Section */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por ID ou pagamento..." 
              value={search} 
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1); 
              }}           
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" 
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors duration-200 focus:border-blue-500"
              >
                {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors duration-200 focus:border-blue-500"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Sales Table */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pagamento
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((sale) => (
                  <tr key={sale.uuid} className="group border-t border-gray-100 transition-colors hover:bg-gray-50/80">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{sale.uuid}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(sale.created_at).toLocaleDateString('pt-BR', { 
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {sale.payment_method}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-right text-sm font-black text-slate-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCurrency(sale.total_price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50" 
                          onClick={() => navigate(`/sales/${sale.uuid}`)}
                        >
                          <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> Detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {!loading && filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-slate-400">
                          <ReceiptText className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          {search
                            ? `Nenhuma venda encontrada para "${search}".`
                            : "Nenhuma venda encontrada para o período selecionado."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredSales.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Mostrando <span className="font-semibold text-slate-700">{startIndex + 1}–{Math.min(endIndex, filteredSales.length)}</span> de{" "}
              <span className="font-semibold text-slate-700">{filteredSales.length}</span> vendas
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
    </LoadingOverlay> 
    
    
  );
}