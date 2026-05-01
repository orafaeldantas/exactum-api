import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSales } from "../services/saleService"; 
import { 
  Search, 
  Eye, 
  Calendar,
  DollarSign,
  Hash,
  User,
  ShoppingBag,
  ChevronDown,
  Loader2 // Ícone para estado de carregamento
} from "lucide-react";

export default function ListSales() {
  // isLoading deve vir do seu hook/service
  const { sales = [], invoicing, loadSales, isLoading } = getSales();
  const navigate = useNavigate();

  // Initial Date
  const today = new Date();
  const [month, setMonth] = useState((today.getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(today.getFullYear().toString());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const salesPerPage = 10;

  /**
   * @hook useEffect
   * @description Re-fetches data whenever Month or Year changes on the Backend.
   */
  useEffect(() => {  
    // Agora passamos os filtros para a função que chama a API
    loadSales({ month, year });
  }, [month, year, loadSales]); 

  // Dinamic Year Options
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

  // Client-side search (apenas para o que já veio filtrado do mês)
  const filteredSales = sales.filter((sale) => 
    sale.id.toString().includes(search) || 
    sale.payment_method?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Vendas Mensais</h1>
          <p className="mt-1 text-sm text-gray-500">Dados processados no servidor para máxima performance</p>
        </div>
        
        <button
          onClick={() => navigate("/sales/create")}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
        >
          + Registrar Venda
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-b-4 border-b-blue-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receita em {month}/{year}</p>
          <h3 className="text-xl font-black text-gray-800">
            R$ {Number(invoicing || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        {/* ... outros cards ... */}
      </div>

      {/* FILTERS */}
      <div className="mb-6 flex flex-col gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrar nesta lista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-100 bg-gray-50 pl-11 pr-4 py-3 text-sm outline-none focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Mês:</label>
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm font-bold p-3 rounded-xl outline-none"
            >
              {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Ano:</label>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm font-bold p-3 rounded-xl outline-none"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
             {/* ... (Thead e Tbody permanecem iguais à versão anterior) ... */}
          </table>
        </div>
      </div>
    </div>
  );
}