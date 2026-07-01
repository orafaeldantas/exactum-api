import { useState } from "react";
import { useContext, useEffect } from "react";
import { getDashboardMetrics } from "../../services/platformService";
import { useNavigate } from "react-router-dom";
// import { UserContext } from "../../context/UserContext";
// import { getUsers } from "../../services/userService";
// import { getActivities } from "../../services/activityService";
// import DashboardSkeleton from "../../components/Loader/DashboardSkeleton";
import {
  Building2,
  ShieldOff,
  Users,
  UserPlus,
  Plus,
  ArrowUpRight,
} from "lucide-react";

/**
 * @component SystemDashboard
 * @description Central system dashboard: overview of companies (tenants),
 * platform users, and recent system activities.
 */
function SystemDashboard() {
  const navigate = useNavigate();
  const { kpi = [], getKPIs, loading } = getDashboardMetrics();
  const profile = { username: "Rafael" };


  const activeCount = kpi.activeTenants;
  const blockedCount = kpi.blockedTenants;
  const tenantsCreatedCurrentMonth = kpi.tenantsCreatedCurrentMonth;
  const companies = [
    { id: 1, name: "Mercado Bom Preço", status: "active", createdAt: "2026-06-28" },
    { id: 2, name: "Construtora Vale Verde", status: "active", createdAt: "2026-06-25" },
    { id: 3, name: "Auto Peças Silva", status: "blocked", createdAt: "2026-06-22" },
    { id: 4, name: "Farmácia Saúde+", status: "active", createdAt: "2026-06-20" },
    { id: 5, name: "Padaria Pão Dourado", status: "active", createdAt: "2026-06-18" },
  ];

  const activeUsers = kpi.activeUsers;

  // const { activities = [], loadActivities } = getActivities();
  const activities = [
    { id: 1, description: "Empresa 'Mercado Bom Preço' cadastrada", createdAt: "2026-06-30T09:12:00" },
    { id: 2, description: "Usuário admin@valeverde.com criado", createdAt: "2026-06-29T17:40:00" },
    { id: 3, description: "Empresa 'Auto Peças Silva' bloqueada por inadimplência", createdAt: "2026-06-29T11:05:00" },
    { id: 4, description: "Plano da empresa 'Farmácia Saúde+' atualizado para Pro", createdAt: "2026-06-28T15:22:00" },
    { id: 5, description: "Usuário joao.dev@padariapao.com criado", createdAt: "2026-06-27T10:08:00" },
    { id: 6, description: "Empresa 'Padaria Pão Dourado' cadastrada", createdAt: "2026-06-26T08:50:00" },
  ];

  useEffect(() => {
     const initData = async () => {
       try {
         await Promise.all([getKPIs()]);
       } catch (error) {
         console.error("Error initializing super-admin panel: ", error);
       } finally {
       }
     };
     initData();
   }, []);


  const stats = [
    {
      label: "Empresas Ativas",
      value: activeCount,
      icon: Building2,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Empresas Bloqueadas",
      value: blockedCount,
      icon: ShieldOff,
      accent: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Usuários Totais Ativos",
      value: activeUsers,
      icon: Users,
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Novas Empresas no Mês",
      value: tenantsCreatedCurrentMonth,
      icon: UserPlus,
      accent: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const recentCompanies = companies.slice(0, 5);
  const recentActivities = activities.slice(0, 6);

  return (
    <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll bg-gray-50 p-6">
      {/* --- HEADER + AÇÕES RÁPIDAS --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Olá, {profile?.username}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visão geral da plataforma Exactum
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
            onClick={() => navigate("/create-tenant")}
          >
            + Nova Empresa
          </button>
          <button
            onClick={() => navigate("/system/manage-companies")}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-800 shadow-md transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95"
          >
            Acessar Empresas
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* --- CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, accent, bg }) => (
          <div
            key={label}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bg} ${accent} mb-4`}
            >
              <Icon size={20} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* --- TABELAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Empresas */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Últimas Empresas
            </h2>
            <button
              onClick={() => navigate("/super-admin/empresas")}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Ver todas
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentCompanies.length === 0 ? (
              <p className="text-sm text-gray-400 px-5 py-6 text-center">
                Nenhuma empresa cadastrada ainda.
              </p>
            ) : (
              recentCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {company.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Cadastrada em{" "}
                      {new Date(company.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      company.status === "blocked"
                        ? "bg-red-50 text-red-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {company.status === "blocked" ? "Bloqueada" : "Ativa"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Atividades Recentes
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-400 px-5 py-6 text-center">
                Nenhuma atividade registrada ainda.
              </p>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-5 py-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(activity.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemDashboard;