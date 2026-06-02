import { useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { UserContext } from "../../context/UserContext";
import { AuthContext } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

import {
  Settings,
  User,
  Lock,
  Mail,
  Image as ImageIcon,
  Save,
  ShieldCheck,
  Bell,
} from "lucide-react";

export default function UserSettingsPage() {
  const { loading } = useContext(AuthContext);
  const { profile } = useContext(UserContext);
  const [loadingUserSettings, setLoadingUserSettings] = useState(false)

  const [form, setForm] = useState({
    username: "",
    loginEmail: "",
    profileImage: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: true,
  });

  useEffect(() => {
  
    if (!profile) 
      return;
    
    setForm((prevForm) => ({
      ...prevForm,
      username: profile.username ?? "",
      loginEmail: profile.email ?? "",
    }));
    
  }, [profile]);
     
  if (loading) {
    return <Loader message="Carregando..." />;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
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

    const dataUser = {
      username: form.username,
      email: form.loginEmail,
      password: form.newPassword,
      confirmPassword: form.confirmPassword,
      currentPassword: form.currentPassword
    };

    try {
      const [responseUser] = await Promise.all([
        apiFetch(`/users/basic-data/${profile.id}`, {
          method: "PATCH",
          body: JSON.stringify(dataUser),
        }),
      ]);
  
      if (responseUser.ok) {
        toast.success("Dados atualizados com sucesso");
      } else {
        toast.error("Erro ao atualizar os dados");
      }
  
    } catch (error) {
      toast.error("Erro de conexão");
      console.error(error);
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
              Minha Conta
            </h1>
          </div>

          <p className="text-sm text-gray-500">
            Gerencie seus dados pessoais e preferências de acesso
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              Conta Protegida
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">

          <div className="space-y-8 xl:col-span-2">

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

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2">
                    <Bell className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Preferências
                    </h2>

                    <p className="text-sm text-gray-500">
                      Ajuste notificações e preferências da conta
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">

                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Receber notificações
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Receba alertas importantes do sistema e atividades da conta
                    </p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={form.notifications}
                      onChange={handleChange}
                      className="peer sr-only"
                    />

                    <div
                      className="
                        peer h-6 w-11 rounded-full bg-gray-300
                        after:absolute after:left-[2px] after:top-[2px]
                        after:h-5 after:w-5 after:rounded-full
                        after:bg-white after:transition-all
                        peer-checked:bg-blue-600
                        peer-checked:after:translate-x-full
                      "
                    />
                  </label>
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
                      Informações da sua conta
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">

                {/* FOTO */}
                <div className="mb-6 flex flex-col items-center">
                  <div
                    className="
                      mb-4 flex h-24 w-24 items-center justify-center
                      rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                      shadow-lg
                    "
                  >
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

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email de Login
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      name="loginEmail"
                      value={form.loginEmail}
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

            {/* CARD INFO */}
            <div
              className="
                rounded-2xl border border-indigo-100 bg-gradient-to-br
                from-indigo-600 to-blue-700 p-6 text-white shadow-xl
              "
            >
              <h3 className="mb-2 text-lg font-bold">
                Área do Usuário
              </h3>

              <p className="text-sm leading-relaxed text-indigo-100">
                Atualize suas credenciais, gerencie preferências pessoais
                e mantenha sua conta segura dentro do Exactum ERP.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-200">
                <ShieldCheck className="h-4 w-4" />
                Segurança de Conta Ativa
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

            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

      </form>
    </div>
  );
}