import { useEffect, useState, useContext } from "react"; // Added useContext
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../../services/api";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext

import { 
  Building2, Eye, Power, Trash2, AlertTriangle, 
  ShieldCheck, CreditCard, Search, Link2, Hash
} from 'lucide-react';

export default function ManageCompanies() {
  const [tenants, setTenants] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const companiesPerPage = 6;

  const navigate = useNavigate();
  const { impersonate } = useContext(AuthContext); // Hooking into AuthContext

  // Modal States
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [tenantToToggle, setTenantToToggle] = useState(null);

  async function loadTenants() {
    try {
      const response = await apiFetch("/superadmin/companies");
      if (!response.ok) throw new Error("Erro ao carregar instâncias");
      const data = await response.json();
      setTenants(data);
    } catch (err) {
      toast.error(err.message);
    }
  }

  useEffect(() => { loadTenants(); }, []);

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.fantasy_name.toLowerCase().includes(search.toLowerCase()) ||
    t.cnpj.includes(search)
  );

  const paginated = filteredTenants.slice((page - 1) * companiesPerPage, page * companiesPerPage);
  const totalPages = Math.ceil(filteredTenants.length / companiesPerPage);

  // Improved Impersonate function using AuthContext
  async function handleImpersonate(tenantId) {
    try {
      setLoadingId(tenantId);
      const response = await apiFetch(`/superadmin/impersonate/${tenantId}`, { method: "POST" });
      
      if (!response.ok) throw new Error("Erro ao gerar acesso");
      
      const { token } = await response.json();

      // Call context function to handle state and storage
      await impersonate(token);

      toast.success("Acesso autorizado!");
      navigate("/dashboard");
      // window.location.reload() is now handled inside AuthContext for better sync
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Building2 className="text-blue-600" /> Tenants
          </h1>
          <p className="mt-1 text-sm text-gray-500">Administração de instâncias e empresas do ecossistema</p>
        </div>
        <button 
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
          onClick={() => navigate("/superadmin/companies/create")}
        >
          + Novo Tenant
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Nome fantasia ou CNPJ..." 
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
        />
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((t) => (
          <div key={t.id} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
            
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                ID: {t.id}
              </span>
              <button 
                onClick={() => handleImpersonate(t.id)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                disabled={loadingId === t.id}
              >
                <ShieldCheck className={`w-5 h-5 ${loadingId === t.id ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-1">{t.fantasy_name || t.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{t.name}</p>

            <div className="space-y-2 border-t border-gray-50 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Hash className="w-3.5 h-3.5"/> CNPJ:</span>
                <span className="font-medium text-slate-700">{t.cnpj}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Link2 className="w-3.5 h-3.5"/> Slug:</span>
                <span className="font-medium text-blue-600">/{t.slug}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><CreditCard className="w-3.5 h-3.5"/> Plano:</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 uppercase">{t.plan}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button 
                onClick={() => navigate(`/superadmin/companies/${t.id}`)}
                className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Eye className="w-4 h-4" /> Detalhes
              </button>
              <button 
                onClick={() => { setTenantToToggle(t); setIsStatusModalOpen(true); }}
                className="flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Power className="w-4 h-4 text-amber-500" /> Gerenciar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40">Anterior</button>
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-2 text-sm font-bold text-gray-700">{page} / {totalPages}</div>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40">Próxima</button>
        </div>
      )}

      {/* Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsStatusModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Ações para {tenantToToggle?.fantasy_name}</h3>
            <p className="text-sm text-slate-500 mb-6">Escolha uma ação administrativa para este tenant.</p>
            <div className="flex flex-col gap-2">
              <button className="w-full text-left p-3 rounded-xl border border-slate-100 hover:bg-slate-50 font-semibold text-sm flex items-center gap-3">
                <Power className="w-4 h-4 text-amber-500" /> Suspender Acesso
              </button>
              <button className="w-full text-left p-3 rounded-xl border border-slate-100 hover:bg-slate-50 font-semibold text-sm flex items-center gap-3 text-red-600">
                <Trash2 className="w-4 h-4" /> Excluir Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}