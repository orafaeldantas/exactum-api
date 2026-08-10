import { Settings, ShieldCheck } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "../../components/Loader/Skeleton";
import { AuthContext } from "../../context/AuthContext";
import { TenantContext } from "../../context/TenantContext";
import { UserContext } from "../../context/UserContext";
import CompanyTab from "./components/CompanyTab";
import ProfileTab from "./components/ProfileTab";
import RolesTab from "./components/RolesTab";
import SessionsTab from "./components/SessionsTab";
import { TABS } from "./constants/tabs";
import { useCompanyForm } from "./hooks/useCompanyForm";
import { useProfileForm } from "./hooks/useProfileForm";

export default function SettingsPage() {
  const { loading, bootstrap, logout, user } = useContext(AuthContext);
  const { profile } = useContext(UserContext);
  const { tenantData } = useContext(TenantContext);
  const navigate = useNavigate();

  const isAdmin = user?.role?.name === "administrador";
  const [activeTab, setActiveTab] = useState("perfil");

  const profileHook = useProfileForm(profile, tenantData, bootstrap);
  const companyHook = useCompanyForm(tenantData, bootstrap);

  const visibleTabs = TABS.filter((tab) => {
    if (tab.key === "empresa" || tab.key === "cargos") return isAdmin;
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-lg space-y-6">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-5 w-40 mx-auto" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32 mx-auto rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)]">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Configurações
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Gerencie preferências do sistema, metas e dados da empresa
          </p>
        </div>
        {isAdmin && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">
                Painel Administrativo
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <nav className="mb-8 flex flex-wrap gap-1 border-b border-gray-200">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:border-gray-300 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab content */}
      <div className="mx-auto max-w-3xl">
        {activeTab === "perfil" && (
          <ProfileTab
            profile={profile}
            form={profileHook.form}
            saving={profileHook.saving}
            onChange={profileHook.handleChange}
            onSubmit={profileHook.handleSubmit}
          />
        )}

        {activeTab === "empresa" && isAdmin && (
          <CompanyTab
            form={companyHook.form}
            saving={companyHook.saving}
            onChange={companyHook.handleChange}
            onMonthlyGoalChange={companyHook.handleMonthlyGoalChange}
            onSubmit={companyHook.handleSubmit}
          />
        )}

        {activeTab === "sessoes" && (
          <SessionsTab logout={logout} navigate={navigate} isAdmin={isAdmin} />
        )}

        {activeTab === "cargos" && isAdmin && <RolesTab />}
      </div>
    </div>
  );
}
