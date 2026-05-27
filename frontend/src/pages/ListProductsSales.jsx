import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSoldItems } from "../services/saleService";
import { 
  Search, 
  Eye, 
  Calendar,
  DollarSign,
  Loader2,
  TrendingUp
} from "lucide-react";

export default function ListSoldItems() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;

  const today = new Date();
  const [month, setMonth] = useState((today.getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(today.getFullYear().toString());

  const { soldItems = [], loadSoldItems, loading } = getSoldItems();

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

  const filteredSoldItems = soldItems.filter((item) => 
    item.sku.toString().includes(search) || 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedItems = filteredSoldItems.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredSoldItems.length / itemsPerPage);


  const totalItemsSold = soldItems.reduce((acc, item) => acc + parseFloat(item.total_quantity), 0);

  console.log(totalPages)

  useEffect(() => {  
    loadSoldItems({ month: month, year: year });
  }, [month, year]); 

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Produtos Vendidos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Exibindo registros de {monthOptions.find(m => m.value === month)?.label} de {year}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Produtos Vendidos</p>
          </div>
          <h3 className="text-2xl font-black text-gray-800">
              {filteredSoldItems.length} {filteredSoldItems.length === 1 ? 'produto' : 'produtos'}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unidades Vendidas</p>
          </div>
          <h3 className="text-2xl font-black text-gray-800">
              {totalItemsSold} {totalItemsSold === 1 ? 'unidade' : 'unidades'}
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

      {/* Items Table */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Loading Overlay */}
        {loading && (
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
                  Nome
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                  SKU
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                   Total Vendidos
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600">
                   Faturado
                </th>              
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => (
                <tr key={item.name} className="border-t border-gray-100 transition-colors hover:bg-gray-50 group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">#{item.product_id ?? null}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{item.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {item.total_quantity}
                    </span>  
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-gray-800 text-right">
                    R$ {Number(item.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              
              {!loading && filteredSoldItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                    Nenhum produto encontrado para o período selecionado.
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