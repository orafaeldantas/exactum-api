import { Image as ImageIcon, Lock, Save, User } from "lucide-react";
import { inputClass } from "../utils/styles";
import SectionCard from "./SectionCard";

export default function ProfileTab({
  profile,
  form,
  saving,
  onChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <SectionCard
        icon={User}
        iconTone="bg-purple-100 text-purple-600"
        title="Perfil"
        description="Informações da conta"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row">
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

          <div className="flex-1 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Nome de Usuário
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={onChange}
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
                onChange={onChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </SectionCard>

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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Perfil"}
        </button>
      </div>
    </form>
  );
}
