import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { getTenants } from "../../services/platformService";

import {
  AlertTriangle,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Eye,
  Hash,
  Link2,
  LogIn,
  Power,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

export default function ManageCompanies() {
  const { tenants = [], loadTenants, loading } = getTenants();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const companiesPerPage = 6;

  const navigate = useNavigate();

  // Filter states
  const [filterPlan, setFilterPlan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Status modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [tenantToToggle, setTenantToToggle] = useState(null);

  // Details modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [tenantDetails, setTenantDetails] = useState(null);

  // Impersonate confirmation modal
  const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false);
  const [tenantToImpersonate, setTenantToImpersonate] = useState(null);

  useEffect(() => {
    loadTenants();
  }, [refreshTrigger]);

  // Extract unique plans (excluding SYSTEM)
  const availablePlans = Array.from(new Set(tenants.map((t) => t.plan))).filter(
    (plan) => plan && plan !== "SYSTEM"
  );

  // Filtering logic
  const filteredTenants = tenants.filter((t) => {
    if (t.name === "SYSTEM" || t.plan === "SYSTEM") return false;

    const searchLower = search.toLowerCase();
    const matchesSearch =
      (t.name?.toLowerCase() || "").includes(searchLower) ||
      (t.fantasyName?.toLowerCase() || "").includes(searchLower) ||
      (t.cnpj || "").includes(search);

    const matchesPlan = filterPlan ? t.plan === filterPlan : true;
    const matchesStatus =
      filterStatus === ""
        ? true
        : filterStatus === "active"
        ? t.isActive === true
        : filterStatus === "blocked"
        ? t.isActive === false
        : true;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const paginated = filteredTenants.slice(
    (page - 1) * companiesPerPage,
    page * companiesPerPage
  );
  const totalPages = Math.ceil(filteredTenants.length / companiesPerPage);

  // -------------------- Handlers --------------------
  function openImpersonateConfirmation(tenant) {
    setTenantToImpersonate(tenant);
    setIsImpersonateModalOpen(true);
  }

  async function confirmImpersonate() {
    if (!tenantToImpersonate) return;
    try {
      const response = await apiFetch(
        `/auth/run-impersonate/${tenantToImpersonate.uuid}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Erro ao gerar acesso");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsImpersonateModalOpen(false);
      setTenantToImpersonate(null);
    }
  }

  async function handleStatusToggle() {
    if (!tenantToToggle) return;
    const newStatus = !tenantToToggle.isActive;
    try {
      const response = await apiFetch(
        `/platform/status/tenant/${tenantToToggle.uuid}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error("Falha ao alterar status");
      toast.success(
        `Tenant ${newStatus ? "reativado" : "suspenso"} com sucesso`
      );
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsStatusModalOpen(false);
      setTenantToToggle(null);
    }
  }

  function handleDeleteClick() {
    toast("Funcionalidade de exclusão em desenvolvimento", { icon: "🔧" });
  }

  // Format helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const displayName = (t) => t.fantasyName || t.fantasy_name || t.name;
  const legalName = (t) => t.name;

  return (
    <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Building2 className="text-blue-600" />
            Empresas
            {!loading && (
              <span className="ml-3 rounded-full bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-700">
                {filteredTenants.length} ativa(s)
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administração de instâncias e empresas do ecossistema
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
          onClick={() => navigate("/create-tenant")}
        >
          + Nova Empresa
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Nome fantasia ou CNPJ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => {
            setFilterPlan(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-48 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-gray-600"
        >
          <option value="">Todos os Planos</option>
          {availablePlans.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-48 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-gray-600"
        >
          <option value="">Todos os Status</option>
          <option value="active">Ativa</option>
          <option value="blocked">Bloqueada</option>
        </select>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-white border border-gray-200 animate-pulse p-5 space-y-4"
            >
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-6 w-2/3 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
              <div className="flex gap-2 mt-4">
                <div className="h-10 w-full bg-gray-200 rounded-lg" />
                <div className="h-10 w-full bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Building2 className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">Nenhuma empresa encontrada</p>
          <p className="text-sm">Tente ajustar os filtros ou criar uma nova.</p>
        </div>
      ) : (
        <>
          {/* Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((t) => (
              <div
                key={t.uuid}
                className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-200"
              >
                {/* Access button */}
                <div className="flex justify-end items-start mb-3">
                  <button
                    onClick={() => openImpersonateConfirmation(t)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    title="Acessar como esta empresa"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Acessar
                  </button>
                </div>

                {/* Company name */}
                <h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-1 mb-1">
                  {displayName(t)}
                </h3>
                <p className="text-xs text-gray-400 mb-4 line-clamp-1">
                  {legalName(t)}
                </p>

                {/* Info grid */}
                <div className="mt-auto space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Plano
                    </span>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 uppercase">
                      {t.plan || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <CircleHelp className="w-3.5 h-3.5" /> Status
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        t.isActive === false
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {t.isActive === false ? "Bloqueada" : "Ativa"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Usuários
                    </span>
                    <span className="font-medium text-gray-700">
                      {t.users_count || t.usersCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Cadastro
                    </span>
                    <span className="font-medium text-gray-700 text-xs">
                      {formatDate(t.created_at || t.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" /> Slug
                    </span>
                    <span className="font-medium text-blue-600 text-xs">
                      /{t.slug}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setTenantDetails(t);
                      setIsDetailsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Detalhes
                  </button>
                  <button
                    onClick={() => {
                      setTenantToToggle(t);
                      setIsStatusModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Power className="w-4 h-4 text-amber-500" /> Ações
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Próxima <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ================ STATUS MODAL ================ */}
      {isStatusModalOpen && tenantToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsStatusModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Ações para {displayName(tenantToToggle)}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Escolha uma ação administrativa para este tenant.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleStatusToggle}
                className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-gray-50 font-semibold text-sm flex items-center gap-3 transition"
              >
                {tenantToToggle.isActive ? (
                  <>
                    <Power className="w-4 h-4 text-amber-500" />
                    <span>Suspender Acesso</span>
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 text-emerald-500" />
                    <span>Reativar Acesso</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-gray-50 font-semibold text-sm flex items-center gap-3 text-red-500 transition cursor-not-allowed opacity-60"
                title="Funcionalidade em desenvolvimento"
                disabled
              >
                <Trash2 className="w-4 h-4" /> Excluir Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================ DETAILS MODAL ================ */}
      {isDetailsModalOpen && tenantDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsDetailsModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 leading-tight">
                  {displayName(tenantDetails)}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {legalName(tenantDetails)}
                </p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-5">
              <DetailRow
                icon={<Hash className="w-4 h-4" />}
                label="CNPJ"
                value={tenantDetails.cnpj}
              />
              <DetailRow
                icon={<Link2 className="w-4 h-4" />}
                label="Slug"
                value={`/${tenantDetails.slug}`}
                valueClass="text-blue-600"
              />
              <DetailRow
                icon={<CreditCard className="w-4 h-4" />}
                label="Plano"
                value={
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 uppercase">
                    {tenantDetails.plan}
                  </span>
                }
              />
              <DetailRow
                icon={<CircleHelp className="w-4 h-4" />}
                label="Status"
                value={
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      tenantDetails.isActive === false
                        ? "bg-red-50 text-red-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {tenantDetails.isActive === false ? "Bloqueada" : "Ativa"}
                  </span>
                }
              />
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label="Criação"
                value={formatDate(
                  tenantDetails.created_at || tenantDetails.createdAt
                )}
              />
              <DetailRow
                icon={<Users className="w-4 h-4" />}
                label="Usuários"
                value={
                  tenantDetails.users_count || tenantDetails.usersCount || 0
                }
              />

              <DetailRow
                icon={<Hash className="w-4 h-4" />}
                label="Identificador"
                value={tenantDetails.uuid}
              />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================ IMPERSONATE CONFIRMATION MODAL ================ */}
      {isImpersonateModalOpen && tenantToImpersonate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsImpersonateModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Acessar como Empresa
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Você está prestes a assumir a identidade de{" "}
                <span className="font-semibold text-gray-700">
                  {displayName(tenantToImpersonate)}
                </span>
                . Essa ação é registrada e pode afetar a sessão atual.
              </p>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setIsImpersonateModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmImpersonate}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper for detail rows inside the modal
function DetailRow({ icon, label, value, valueClass = "text-gray-700" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 flex items-center gap-1.5">
        {icon} {label}
      </span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
