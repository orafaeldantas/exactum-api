import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSales } from "../services/saleService"; 
import { 
  Search, 
  Eye, 
  Calendar,
  DollarSign,
  Hash,
  ShoppingBag,
  Loader2,
  TrendingUp
} from "lucide-react";

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
  const { sales = [], invoicing, loadSales, isLoading } = getSales();

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
    sale.id.toString().includes(search) || 
    sale.payment_method?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const startIndex = (page - 1) * salesPerPage;
  const endIndex = startIndex + salesPerPage;

  const paginatedSales = filteredSales.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredSales.length / salesPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vendas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Exibindo registros de {monthOptions.find(m => m.value === month)?.label} de {year}
          </p>
        </div>
        <div className="w-70">
          <button 
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] flex items-center justify-center gap-2" 
            onClick={() => navigate("/checkout")}
          >
            <ShoppingBag className="w-4 h-4" /> Registrar Venda
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Faturamento Mensal</p>
          </div>
          <h3 className="text-2xl font-black text-gray-800">
            R$ {(invoicing || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Pedidos</p>
          </div>
          <h3 className="text-2xl font-black text-gray-800">
            {filteredSales.length} {filteredSales.length === 1 ? 'venda' : 'vendas'}
          </h3>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por ID ou pagamento..." 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1); 
            }}           
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm outline-none focus:border-blue-500"
            >
              {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <select 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm outline-none focus:border-blue-500"
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <span className="text-xs font-bold text-blue-600 uppercase">Atualizando Dados...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  <div className="flex items-center gap-2">ID</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  <div className="flex items-center gap-2">Data</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                   Pagamento
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600">
                   Total
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.map((sale) => (
                <tr key={sale.id} className="border-t border-gray-100 transition-colors hover:bg-gray-50 group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">#{sale.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sale.created_at).toLocaleDateString('pt-BR', { 
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-gray-800 text-right">
                    R$ {Number(sale.total_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300" 
                        onClick={() => navigate(`/sales/${sale.id}`)}
                      >
                        <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> Detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!isLoading && filteredSales.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                    Nenhuma venda encontrada para o período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-center gap-1">
        <div className="flex w-30 justify-end">    
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
        </div>  
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
          <span className="text-blue-600">{page}</span>
          <span className="mx-1 text-gray-400">/</span>
          <span>{totalPages || 1}</span>
        </div>
        <div className="w-30">        
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
}