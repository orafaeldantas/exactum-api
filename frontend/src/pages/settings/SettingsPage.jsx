import { useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Skeleton from "../../components/Loader/Skeleton";
import { AuthContext } from "../../context/AuthContext";
import { TenantContext } from "../../context/TenantContext";
import { UserContext } from "../../context/UserContext";
import { apiFetch } from "../../services/api";
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from "../../services/roleService";

import {
  Building2,
  Image as ImageIcon,
  Lock,
  LogOut,
  Mail,
  Package,
  Pencil,
  Plus,
  Save,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
  Trash2,
  User,
  X,
} from "lucide-react";

const TABS = [
  { key: "perfil", label: "Perfil", icon: User },
  { key: "empresa", label: "Empresa", icon: Building2 },
  { key: "sessoes", label: "Sessões", icon: LogOut },
  { key: "cargos", label: "Cargos", icon: Shield },
];

const RESOURCE_LABELS = {
  user: "Usuários",
  profile: "Perfil",
  product: "Produtos",
  sale: "Vendas",
  tenant: "Empresa",
  analytics: "Análises",
  inventory: "Estoque",
  goal: "Metas",
  rbac: "Cargos e Permissões",
  logs: "Logs",
};

const ACTION_LABELS = {
  create: "Criar",
  view: "Visualizar",
  update: "Editar",
  delete: "Excluir",
  cancel: "Cancelar",
  manage: "Gerenciar",
};

function humanize(str) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildPermissionMatrix(permissionCatalog) {
  const matrix = {};
  permissionCatalog.forEach((perm) => {
    const [resource, action] = perm.split(":");
    if (!resource || !action) return;
    if (!matrix[resource]) matrix[resource] = new Set();
    matrix[resource].add(action);
  });
  return matrix;
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function SectionCard({ icon: Icon, iconTone, title, description, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2 ${iconTone}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { loading, bootstrap, logout, user } = useContext(AuthContext);
  const { profile } = useContext(UserContext);
  const { tenantData } = useContext(TenantContext);
  const navigate = useNavigate();

  // Admin check usando profile (UserContext)
  const isAdmin = user?.role?.name === "administrator";

  const [activeTab, setActiveTab] = useState("perfil");
  const [reloadPage, setReloadPage] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    monthlyGoal: 0,
    minimumStock: 0,
    username: "",
    loginEmail: "",
    profileImage: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    if (!tenantData || !profile) return;

    if (reloadPage) {
      setReloadPage(false);
      bootstrap();
    }

    setForm((prevForm) => ({
      ...prevForm,
      companyName: tenantData.name ?? "",
      companyEmail: tenantData.corporate_email ?? "",
      minimumStock: tenantData.global_min_stock ?? 0,
      monthlyGoal: tenantData.goal ? parseInt(tenantData.goal) : 0,
      username: profile.username ?? "",
      loginEmail: profile.email ?? "",
    }));
  }, [tenantData, profile, reloadPage]);

  // Abas visíveis: "empresa" e "cargos" apenas para admin
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmitProfile(e) {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    const dataUser = {
      username: form.username,
      email: form.loginEmail,
      password: form.newPassword || undefined,
      confirmPassword: form.confirmPassword || undefined,
      currentPassword: form.currentPassword || undefined,
    };

    setSavingProfile(true);
    try {
      const response = await apiFetch(`/users/profile/${profile.uuid}`, {
        method: "PATCH",
        body: JSON.stringify(dataUser),
      });
      if (response.ok) {
        toast.success("Perfil atualizado com sucesso");
        setReloadPage(true);
      } else {
        toast.error("Erro ao atualizar o perfil");
      }
    } catch (error) {
      toast.error("Erro de conexão");
      console.error(error);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSubmitCompany(e) {
    e.preventDefault();
    const dataTenant = {
      companyName: form.companyName,
      companyEmail: form.companyEmail.trim() === "" ? null : form.companyEmail,
      minimumStock: form.minimumStock,
      monthlyGoal: form.monthlyGoal,
    };

    setSavingCompany(true);
    try {
      const response = await apiFetch("/tenants", {
        method: "PATCH",
        body: JSON.stringify(dataTenant),
      });
      if (response.ok) {
        toast.success("Dados da empresa atualizados com sucesso");
        setReloadPage(true);
      } else {
        toast.error("Erro ao atualizar os dados da empresa");
      }
    } catch (error) {
      toast.error("Erro de conexão");
      console.error(error);
    } finally {
      setSavingCompany(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
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

      {/* TABS */}
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

      {/* TAB CONTENT */}
      <div className="mx-auto max-w-3xl">
        {activeTab === "perfil" && (
          <form onSubmit={handleSubmitProfile} className="space-y-8">
            {/* Perfil: layout lado a lado */}
            <SectionCard
              icon={User}
              iconTone="bg-purple-100 text-purple-600"
              title="Perfil"
              description="Informações da conta"
            >
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                {/* Avatar e botão alterar foto */}
                <div className="flex shrink-0 flex-col items-center gap-3">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    {profile?.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="Avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-gray-50"
                  >
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                    Alterar Foto
                  </button>
                </div>

                {/* Campos nome e email à direita */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Nome de Usuário
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Email de Login
                    </label>
                    <input
                      type="email"
                      name="loginEmail"
                      value={form.loginEmail}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Segurança (senhas) */}
            <SectionCard
              icon={Lock}
              iconTone="bg-amber-100 text-amber-600"
              title="Segurança"
              description="Atualize sua senha de acesso"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </SectionCard>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {savingProfile ? "Salvando..." : "Salvar Perfil"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "empresa" && isAdmin && (
          <form onSubmit={handleSubmitCompany} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <SectionCard
                icon={Target}
                iconTone="bg-blue-100 text-blue-600"
                title="Metas e Estoque"
                description="Configure metas mensais e regras do sistema"
              >
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Meta Mensal (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        R$
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="monthlyGoal"
                        value={
                          form.monthlyGoal
                            ? Number(form.monthlyGoal).toLocaleString("pt-BR")
                            : ""
                        }
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, "");
                          e.target.value = onlyDigits;
                          handleChange(e);
                        }}
                        className={`${inputClass} pl-12`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Estoque Mínimo Global
                    </label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        name="minimumStock"
                        value={form.minimumStock}
                        onChange={handleChange}
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={Building2}
                iconTone="bg-emerald-100 text-emerald-600"
                title="Dados da Empresa"
                description="Informações institucionais utilizadas no sistema"
              >
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Corporativo
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        name="companyEmail"
                        value={form.companyEmail}
                        onChange={handleChange}
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingCompany}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {savingCompany ? "Salvando..." : "Salvar Empresa"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "sessoes" && (
          <SessionsTab logout={logout} navigate={navigate} isAdmin={isAdmin} />
        )}

        {activeTab === "cargos" && isAdmin && <RolesTab />}
      </div>
    </div>
  );
}

/* ============================================================
   SESSIONS TAB
   ============================================================ */
function SessionsTab({ logout, navigate, isAdmin }) {
  const [confirmMine, setConfirmMine] = useState(false);
  const [confirmTenant, setConfirmTenant] = useState(false);
  const [savingMine, setSavingMine] = useState(false);
  const [savingTenant, setSavingTenant] = useState(false);

  async function handleRevokeMine() {
    setConfirmMine(false);
    setSavingMine(true);
    try {
      const response = await apiFetch("/auth/sessions/revoke-all", {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      toast.success("Sessões encerradas. Você será desconectado.");
      logout();
      navigate("/login");
    } catch (err) {
      toast.error("Erro ao encerrar suas sessões");
    } finally {
      setSavingMine(false);
    }
  }

  async function handleRevokeTenant() {
    setConfirmTenant(false);
    setSavingTenant(true);
    try {
      const response = await apiFetch("/tenants/sessions/revoke-all", {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      toast.success("Todas as sessões da empresa foram encerradas.");
    } catch (err) {
      toast.error("Erro ao encerrar as sessões da empresa");
    } finally {
      setSavingTenant(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionCard
        icon={LogOut}
        iconTone="bg-blue-100 text-blue-600"
        title="Minha Sessão"
        description="Encerre seu próprio acesso em todos os dispositivos"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-md text-sm text-slate-600">
            Isso desconecta sua conta de qualquer dispositivo onde você esteja
            logado, incluindo este. Você precisará entrar novamente.
          </p>
          <button
            type="button"
            onClick={() => setConfirmMine(true)}
            disabled={savingMine}
            className="shrink-0 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingMine ? "Encerrando..." : "Encerrar minhas sessões"}
          </button>
        </div>
      </SectionCard>

      {/* Zona de risco visível apenas para admin */}
      {isAdmin && (
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/40">
          <div className="border-b border-red-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-red-800">
                  Zona de Risco
                </h2>
                <p className="text-sm text-red-600/80">
                  Ações que afetam todos os usuários da empresa
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <p className="max-w-md text-sm text-red-700">
                Encerra a sessão de <strong>todos os usuários</strong> desta
                empresa imediatamente. Use após um incidente de segurança ou
                desligamento de um funcionário.
              </p>
              <button
                type="button"
                onClick={() => setConfirmTenant(true)}
                disabled={savingTenant}
                className="shrink-0 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingTenant ? "Encerrando..." : "Encerrar todas as sessões"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação (minhas sessões) */}
      {confirmMine && (
        <ConfirmModal
          icon={LogOut}
          iconTone="bg-amber-100 text-amber-600"
          title="Encerrar minhas sessões"
          description="Você será desconectado de todos os dispositivos, incluindo este. Deseja continuar?"
          confirmLabel="Sim, encerrar"
          confirmTone="bg-amber-500 hover:bg-amber-600"
          onCancel={() => setConfirmMine(false)}
          onConfirm={handleRevokeMine}
        />
      )}

      {/* Modal de confirmação (todas as sessões do tenant) */}
      {confirmTenant && (
        <ConfirmModal
          icon={ShieldAlert}
          iconTone="bg-red-100 text-red-600"
          title="Encerrar todas as sessões da empresa"
          description="Isso vai desconectar imediatamente TODOS os usuários deste tenant, sem aviso prévio. Essa ação não pode ser desfeita."
          confirmLabel="Sim, encerrar todas"
          confirmTone="bg-red-600 hover:bg-red-700"
          onCancel={() => setConfirmTenant(false)}
          onConfirm={handleRevokeTenant}
        />
      )}
    </div>
  );
}

/* ============================================================
   CONFIRM MODAL (genérico)
   ============================================================ */
function ConfirmModal({
  icon: Icon,
  iconTone,
  title,
  description,
  confirmLabel,
  confirmTone,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconTone}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${confirmTone}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROLES TAB (apenas admin)
   ============================================================ */
function RolesTab() {
  const { rolesWithPermissions, loadRolesWithPermissions, loadingRoles } =
    getRoles();

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRolesWithPermissions();
  }, []);

  const adminRole = useMemo(
    () => rolesWithPermissions.find((r) => r.name === "administrator"),
    [rolesWithPermissions]
  );

  const permissionCatalog = useMemo(
    () => (adminRole ? adminRole.permissions : []),
    [adminRole]
  );

  function openCreate() {
    setEditingRole(null);
    setFormOpen(true);
  }

  function openEdit(role) {
    setEditingRole(role);
    setFormOpen(true);
  }

  async function handleSaveRole({ name, permissions }) {
    setSaving(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.uuid, { name, permissions });
        toast.success("Cargo atualizado com sucesso");
      } else {
        await createRole({ name, permissions });
        toast.success("Cargo criado com sucesso");
      }
      await loadRolesWithPermissions();
      setFormOpen(false);
    } catch (err) {
      toast.error("Erro ao salvar cargo");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRole(deleteTarget.uuid);
      toast.success("Cargo excluído com sucesso");
      await loadRolesWithPermissions();
    } catch (err) {
      toast.error("Erro ao excluir cargo. Verifique se ele ainda está em uso.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const isAdminRole = (role) => role.name === "administrator";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Cargos e Permissões
          </h2>
          <p className="text-sm text-slate-500">
            Defina o que cada papel pode fazer no sistema
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Criar Cargo
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loadingRoles ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : rolesWithPermissions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center text-slate-400">
            <Shield className="h-10 w-10" />
            <p className="text-sm">Nenhum cargo cadastrado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rolesWithPermissions.map((role) => {
              const isAdmin = isAdminRole(role);
              return (
                <div
                  key={role.uuid}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {humanize(role.name)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {role.permissions?.length ?? 0} permissão
                      {(role.permissions?.length ?? 0) !== 1 ? "ões" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(role)}
                      disabled={isAdmin}
                      title={
                        isAdmin
                          ? "O cargo de administrador não pode ser editado"
                          : "Editar cargo"
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                        isAdmin
                          ? "cursor-not-allowed border-gray-100 text-gray-300"
                          : "border-gray-200 bg-white text-slate-500 hover:border-gray-300 hover:bg-gray-50 hover:text-slate-700"
                      }`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(role)}
                      disabled={isAdmin}
                      title={
                        isAdmin
                          ? "O cargo de administrador não pode ser excluído"
                          : "Excluir cargo"
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                        isAdmin
                          ? "cursor-not-allowed border-gray-100 text-gray-300"
                          : "border-gray-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <RoleFormModal
          initialRole={editingRole}
          permissionCatalog={permissionCatalog}
          saving={saving}
          onCancel={() => setFormOpen(false)}
          onSave={handleSaveRole}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          icon={Trash2}
          iconTone="bg-red-100 text-red-600"
          title="Excluir Cargo"
          description={`Esta ação não pode ser desfeita. Usuários com o cargo "${deleteTarget.name}" podem perder acesso a partes do sistema.`}
          confirmLabel={deleting ? "Excluindo..." : "Sim, excluir"}
          confirmTone="bg-red-600 hover:bg-red-700"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

/* ============================================================
   ROLE FORM MODAL
   ============================================================ */
function RoleFormModal({
  initialRole,
  permissionCatalog,
  saving,
  onCancel,
  onSave,
}) {
  const [name, setName] = useState(initialRole?.name ?? "");
  const [selected, setSelected] = useState(
    new Set(initialRole?.permissions ?? [])
  );

  const matrix = useMemo(
    () => buildPermissionMatrix(permissionCatalog),
    [permissionCatalog]
  );
  const resources = Object.keys(matrix);
  const allActions = useMemo(() => {
    const set = new Set();
    permissionCatalog.forEach((p) => {
      const action = p.split(":")[1];
      if (action) set.add(action);
    });
    return [...set];
  }, [permissionCatalog]);

  function togglePermission(permKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(permKey) ? next.delete(permKey) : next.add(permKey);
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe um nome para o cargo");
      return;
    }
    onSave({ name: name.trim(), permissions: [...selected] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">
            {initialRole ? "Editar Cargo" : "Criar Cargo"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-gray-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nome do Cargo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Gerente de Estoque"
            className={`${inputClass} mb-6`}
          />

          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Permissões
          </label>
          {resources.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nenhuma permissão disponível. Verifique o cargo administrador.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Recurso
                    </th>
                    {allActions.map((action) => (
                      <th
                        key={action}
                        className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        {ACTION_LABELS[action] ?? humanize(action)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resources.map((resource) => (
                    <tr key={resource}>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {RESOURCE_LABELS[resource] ?? humanize(resource)}
                      </td>
                      {allActions.map((action) => {
                        const exists = matrix[resource].has(action);
                        const permKey = `${resource}:${action}`;
                        return (
                          <td key={action} className="px-3 py-3 text-center">
                            {exists ? (
                              <input
                                type="checkbox"
                                checked={selected.has(permKey)}
                                onChange={() => togglePermission(permKey)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Cargo"}
          </button>
        </div>
      </form>
    </div>
  );
}
