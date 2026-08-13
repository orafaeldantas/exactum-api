import { Activity, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { TenantContext } from "../../context/TenantContext";

export default function UserForm({ initialData = {}, onSubmit, submitText }) {
  const { tenantData = [] } = useContext(TenantContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [email, setEmail] = useState("");

  const roles = () => {
    if (tenantData?.roles) {
      const firstRole = tenantData.roles.find((item) => item.uuid === role);
      const remainingRoles = tenantData.roles.filter(
        (item) => item.uuid !== role
      );
      return firstRole ? [firstRole, ...remainingRoles] : remainingRoles;
    }
    return [];
  };

  const formatLabel = (name) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || username);
      setIsActive(initialData.is_active ?? isActive);
      setEmail(initialData.email || email);
      setRole(initialData.role_uuid);
    }
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();
    const password_reset = password !== "" ? true : false;
    onSubmit({
      username,
      email,
      password,
      role,
      is_active: isActive,
      password_reset,
    });
  }

  return (
    <div className="max-h-[calc(100vh-64px)] overflow-y-auto custom-scroll">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md mb-15 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm animate-in fade-in duration-500">
          <form onSubmit={handleSubmit}>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {submitText === "Criar Usuário"
                  ? "Novo Usuário"
                  : "Editar Usuário"}
              </h2>
              <p className="text-sm text-gray-500">
                Preencha as informações abaixo
              </p>
            </div>

            {/* Campos (idênticos ao original) */}
            <div className="mb-5">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-slate-400" />
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Ex: joao_silva"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mb-5">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Mail className="w-4 h-4 text-slate-400" />
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Ex: joao_silva@suaempresa.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mb-5">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Lock className="w-4 h-4 text-slate-400" />
                Senha Provisória
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={submitText === "Criar Usuário"}
                placeholder="Digite a senha inicial"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mb-5">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Tipo de usuário
              </label>
              <select
                value={roles?.()[0]?.uuid}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {roles().map((role) => (
                  <option key={role.uuid} value={role.uuid}>
                    {formatLabel(role.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-8">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Activity className="w-4 h-4 text-slate-400" />
                Status
              </label>
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
            >
              {submitText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
