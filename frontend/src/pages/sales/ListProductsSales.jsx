import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSoldItems } from "../../services/saleService";
import LoadingOverlay from "../../components/Loader/LoadingOverlay";
import { 
  Search, 
  Eye, 
  Calendar,
  TrendingUp,
  Package,
  DollarSign
} from "lucide-react";

function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Componente StatCard no MESMO layout horizontal do referência
function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",   // adicionado para o card de faturamento
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

export default function ListSoldItems() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;

  const today = new Date();
  const [month, setMonth] = useState((today.getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(today.getFullYear().toString());

  const { soldItems = [], loadSoldItems, loading } = getSoldItems();

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
  const totalRevenue = soldItems.reduce((acc, item) => acc + Number(item.revenue), 0);

  useEffect(() => {  
    loadSoldItems({ month: month, year: year });
  }, [month, year]);

  return (
    <LoadingOverlay loading={loading} minDuration={250} message="Buscando dados...">
      <div className="min-h-screen bg-gray-50 p-6">
        
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Produtos Vendidos</h1>
            <p className="text-sm font-medium text-slate-500">
              Exibindo registros de {monthOptions.find(m => m.value === month)?.label} de {year}
            </p>
          </div>
        </div>

        {/* KPI Cards no mesmo layout horizontal do referência */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <StatCard
            icon={Package}
            label="Produtos Vendidos"
            value={`${filteredSoldItems.length} ${filteredSoldItems.length === 1 ? "produto" : "produtos"}`}
            tone="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Unidades Vendidas"
            value={`${totalItemsSold} ${totalItemsSold === 1 ? "unidade" : "unidades"}`}
            tone="emerald"
          />
          <StatCard
            icon={DollarSign}
            label="Faturamento Total"
            value={formatCurrency(totalRevenue)}
            tone="purple"
          />
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por SKU ou nome..." 
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
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm outline-none focus:border-blue-500"
              >
                {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm outline-none focus:border-blue-500"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">Nome</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase text-slate-500">SKU</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase text-slate-500">Total Vendidos</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-500">Faturado</th>              
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedItems.map((item) => (
                  <tr key={item.name} className="transition-colors duration-200 hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-slate-600">
                        {item.product_id ?? <span className="text-slate-300">N/A</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-sm font-medium text-slate-600">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                        {item.total_quantity}
                      </span>  
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-black text-slate-800" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(item.revenue)}
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

        {/* Paginação – modelo do referência aplicado */}
        {!loading && filteredSoldItems.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Mostrando <span className="font-semibold text-slate-700">{startIndex + 1}–{Math.min(endIndex, filteredSoldItems.length)}</span> de{" "}
              <span className="font-semibold text-slate-700">{filteredSoldItems.length}</span> itens
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