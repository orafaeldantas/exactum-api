import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardMetrics } from "../../services/platformService";
import { getPlatformEvents } from "../../services/platformService";
import { UserContext } from "../../context/UserContext";
import {
  Building2,
  ShieldOff,
  Users,
  UserPlus,
  Plus,
  ArrowUpRight,
  LogIn,
  LogOut,
  Pencil,
  RotateCcw,
  UserCog,
  UserCheck,
  Activity,
} from "lucide-react";

const TONE_CLASSES = {
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-gray-100 text-slate-500",
  amber: "bg-amber-50 text-amber-600",
};

const ACTIVITY_META = {
  user_login: { icon: LogIn, tone: "blue" },
  user_logout: { icon: LogOut, tone: "slate" },
  tenant_created: { icon: Building2, tone: "emerald" },
  tenant_updated: { icon: Pencil, tone: "blue" },
  tenant_suspended: { icon: ShieldOff, tone: "red" },
  tenant_reactivated: { icon: RotateCcw, tone: "emerald" },
  impersonation_started: { icon: UserCog, tone: "amber" },
  impersonation_finished: { icon: UserCheck, tone: "amber" },
};

function summarizeActivity(log) {
  const p = log.payload || {};
  switch (log.event) {
    case "user_login":
      return `${p.email ?? "Usuário"} entrou no sistema`;
    case "user_logout":
      return `${p.email ?? "Usuário"} saiu do sistema`;
    case "tenant_created":
      return `Empresa ${p.tenant_name ?? ""} foi criada`;
    case "tenant_updated":
      return "Dados de uma empresa foram atualizados";
    case "tenant_suspended":
      return `Empresa ${p.tenant_name ?? ""} foi suspensa`;
    case "tenant_reactivated":
      return `Empresa ${p.tenant_name ?? ""} foi reativada`;
    case "impersonation_started":
      return `Acesso iniciado como ${p.target_user_email ?? "usuário"}`;
    case "impersonation_finished":
      return "Sessão de impersonação encerrada";
    default:
      return log.event;
  }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  return `há ${diffDays}d`;
}

function StatCard({ icon: Icon, label, value, tone, loading }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}>
        <Icon size={20} />
      </div>
      {loading ? (
        <div className="h-8 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
          {value ?? 0}
        </p>
      )}
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

/**
 * @component SystemDashboard
 * @description Central system dashboard: overview of companies (tenants),
 * platform users, and recent system activities.
 */
function SystemDashboard() {
  const navigate = useNavigate();
  const { profile } = useContext(UserContext);

  const { metrics = {}, getMetrics, loading } = getDashboardMetrics();
  const { events = [], loadEvents, loading: activitiesLoading } = getPlatformEvents();

  const activeCount = metrics.activeTenants;
  const blockedCount = metrics.blockedTenants;
  const tenantsCreatedCurrentMonth = metrics.tenantsCreatedCurrentMonth;
  const activeUsers = metrics.activeUsers;
  const recentCompanies = metrics.lastTenantsRegistered ?? [];
  const recentActivities = events.slice(0, 6);

  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([getMetrics(), loadEvents()]);
      } catch (error) {
        console.error("Error initializing super-admin panel: ", error);
      }
    };
    initData();
  }, []);

  const stats = [
    { label: "Empresas Ativas", value: activeCount, icon: Building2, tone: "emerald" },
    { label: "Empresas Bloqueadas", value: blockedCount, icon: ShieldOff, tone: "red" },
    { label: "Usuários Totais Ativos", value: activeUsers, icon: Users, tone: "blue" },
    { label: "Novas Empresas no Mês", value: tenantsCreatedCurrentMonth, icon: UserPlus, tone: "violet" },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll bg-gray-50 p-6">
      {/* --- HEADER + AÇÕES RÁPIDAS --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Olá, {profile?.username ?? "Administrador"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão geral da plataforma Exactum
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.35)] active:scale-95"
            onClick={() => navigate("/create-tenant")}
          >
            <Plus size={16} />
            Nova Empresa
          </button>
          <button
            onClick={() => navigate("/platform/manage-companies")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95"
          >
            Acessar Empresas
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* --- CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={loading} />
        ))}
      </div>

      {/* --- TABELAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Empresas */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Últimas Empresas
            </h2>
            <button
              onClick={() => navigate("/platform/manage-companies")}
              className="text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-blue-600"
            >
              Ver todas
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {!loading && recentCompanies.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-slate-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-400">Nenhuma empresa cadastrada ainda.</p>
              </div>
            ) : (
              recentCompanies.map((company) => (
                <div
                  key={company.uuid}
                  className="flex items-center justify-between px-5 py-3 transition-colors duration-150 hover:bg-gray-50/80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {company.fantasyName}
                    </p>
                    <p className="text-xs text-slate-400">
                      Cadastrada em{" "}
                      {new Date(company.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      company.isActive === false
                        ? "bg-red-50 text-red-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {company.isActive === false ? "Bloqueada" : "Ativa"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Atividades Recentes
            </h2>
            <button
              onClick={() => navigate("/platform/events")}
              className="text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-blue-600"
            >
              Ver tudo
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {activitiesLoading ? (
              <div className="space-y-3 px-5 py-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-100" />
                    <div className="h-3.5 flex-1 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-slate-400">
                  <Activity className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-400">Nenhuma atividade registrada ainda.</p>
              </div>
            ) : (
              recentActivities.map((log) => {
                const meta = ACTIVITY_META[log.event] ?? { icon: Activity, tone: "slate" };
                const Icon = meta.icon;
                return (
                  <div
                    key={log.payload?.request_id ?? `${log.event}-${log.createdAt}`}
                    className="flex items-start gap-3 px-5 py-3 transition-colors duration-150 hover:bg-gray-50/80"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[meta.tone]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-700">{summarizeActivity(log)}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{formatRelativeTime(log.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemDashboard;