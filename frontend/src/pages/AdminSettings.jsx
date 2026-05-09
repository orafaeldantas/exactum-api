import { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import { getTenantData } from "../services/tenantService"
import { getUser } from "../services/userService"
import Loader from "../components/Loader/Loader";
import { AuthContext } from "../context/AuthContext";

import {
  Settings,
  Target,
  User,
  Lock,
  Building2,
  Mail,
  Image as ImageIcon,
  Save,
  ShieldCheck,
  Package,
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const { tenantData = {}, loadTenantData } = getTenantData();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    monthlyGoal: 0,
    minimumStock: 0,
    username: user.username,
    loginEmail: user.email,
    profileImage: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);  
      await loadTenantData();
      setLoading(false);
    };
  
    fetchData();
  }, []);
  
  useEffect(() => {
    if (Object.keys(tenantData).length > 0) {
      setForm((prevForm) => ({
        ...prevForm,
        companyName: tenantData.name ?? "",
        companyEmail: tenantData.corporate_email ?? "",
        minimumStock: tenantData.global_min_stock ?? 0,
        monthlyGoal: parseInt(tenantData.goal) ?? 0,
      }));
    }
  }, [tenantData]);
  
  if (loading) {
    return <Loader message="Carregando configurações..." />;
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      form.newPassword &&
      form.newPassword !== form.confirmPassword
    ) {
      toast.error("As senhas não coincidem");
      return;
    }

  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
              <Settings className="h-5 w-5 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800">
              Configurações
            </h1>
          </div>

          <p className="text-sm text-gray-500">
            Gerencie preferências do sistema, metas e dados da empresa
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              Painel Administrativo
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* GRID */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">

          {/* LEFT */}
          <div className="space-y-8 xl:col-span-2">

            {/* META E ESTOQUE */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-2">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Metas e Estoque
                    </h2>

                    <p className="text-sm text-gray-500">
                      Configure metas mensais e regras do sistema
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                {/* META */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Meta Mensal (R$)
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      R$
                    </span>

                    <input
                      type="number"
                      name="monthlyGoal"
                      value={form.monthlyGoal}
                      onChange={handleChange}
                      className="
                        w-full rounded-xl border border-gray-200 bg-white
                        py-3 pl-12 pr-4 text-sm shadow-sm outline-none transition
                        focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                      "
                    />
                  </div>
                </div>

                {/* ESTOQUE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Estoque Mínimo Global
                  </label>

                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="number"
                      name="minimumStock"
                      value={form.minimumStock}
                      onChange={handleChange}
                      className="
                        w-full rounded-xl border border-gray-200 bg-white
                        py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition
                        focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                      "
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* DADOS EMPRESA */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Dados da Empresa
                    </h2>

                    <p className="text-sm text-gray-500">
                      Informações institucionais utilizadas no sistema
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                {/* NOME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nome da Empresa
                  </label>

                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    className="
                      w-full rounded-xl border border-gray-200 bg-white
                      px-4 py-3 text-sm shadow-sm outline-none transition
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                    "
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Corporativo
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      name="companyEmail"
                      value={form.companyEmail}
                      onChange={handleChange}
                      className="
                        w-full rounded-xl border border-gray-200 bg-white
                        py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition
                        focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                      "
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* SEGURANÇA */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-100 p-2">
                    <Lock className="h-5 w-5 text-amber-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Segurança
                    </h2>

                    <p className="text-sm text-gray-500">
                      Atualize sua senha de acesso
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Senha Atual
                  </label>

                  <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="
                      w-full rounded-xl border border-gray-200 bg-white
                      px-4 py-3 text-sm shadow-sm outline-none transition
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                    "
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nova Senha
                  </label>

                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="
                      w-full rounded-xl border border-gray-200 bg-white
                      px-4 py-3 text-sm shadow-sm outline-none transition
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                    "
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Confirmar Senha
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="
                      w-full rounded-xl border border-gray-200 bg-white
                      px-4 py-3 text-sm shadow-sm outline-none transition
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                    "
                  />
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-8">

            {/* PERFIL */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-100 p-2">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Perfil
                    </h2>

                    <p className="text-sm text-gray-500">
                      Informações da conta administrativa
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">

                {/* FOTO */}
                <div className="mb-6 flex flex-col items-center">
                  <div className="
                    mb-4 flex h-24 w-24 items-center justify-center
                    rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                    shadow-lg
                  ">
                    <User className="h-10 w-10 text-white" />
                  </div>

                  <button
                    type="button"
                    className="
                      flex items-center gap-2 rounded-xl border border-gray-200
                      bg-white px-4 py-2 text-sm font-medium text-gray-700
                      shadow-sm transition-all hover:bg-gray-50
                    "
                  >
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    Alterar Foto
                  </button>
                </div>

                {/* USERNAME */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nome de Usuário
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="
                      w-full rounded-xl border border-gray-200 bg-white
                      px-4 py-3 text-sm shadow-sm outline-none transition
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                    "
                  />
                </div>

                {/* EMAIL LOGIN */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email de Login
                  </label>

                  <input
                    type="email"
                    name="loginEmail"
                    value={form.loginEmail}
                    onChange={handleChange}
                    className="
                      w-full rounded-xl border border-gray-200 bg-white
                      px-4 py-3 text-sm shadow-sm outline-none transition
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                    "
                  />
                </div>

              </div>
            </div>

            {/* CARD INFO */}
            <div className="
              rounded-2xl border border-blue-100 bg-gradient-to-br
              from-blue-600 to-indigo-700 p-6 text-white shadow-xl
            ">
              <h3 className="mb-2 text-lg font-bold">
                Exactum ERP
              </h3>

              <p className="text-sm leading-relaxed text-blue-100">
                Centralize configurações críticas do sistema, metas comerciais,
                preferências operacionais e segurança administrativa.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
                <ShieldCheck className="h-4 w-4" />
                Segurança Administrativa Ativa
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="
              flex items-center gap-2 rounded-xl bg-blue-600
              px-6 py-3 text-sm font-semibold text-white shadow-lg
              shadow-blue-500/20 transition-all duration-200
              hover:scale-[1.02] hover:bg-blue-700
              active:scale-[0.98]
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            <Save className="h-4 w-4" />
            {loading ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>

      </form>
    </div>
  );
}