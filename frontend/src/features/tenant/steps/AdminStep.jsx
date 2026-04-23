import { useState } from "react";
import { User, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";

export default function AdminStep({ data, updateData, next, back }) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const newErrors = {};

    if (!data.firstName) newErrors.firstName = "Nome obrigatório";
    if (!data.lastName) newErrors.lastName = "Sobrenome obrigatório";
    if (!data.email) newErrors.email = "Email obrigatório";

    if (!data.password) {
      newErrors.password = "Senha obrigatória";
    } else if (data.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    return newErrors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    updateData({ [name]: value });
  }

  function handleNext() {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    // Simulação de processamento
    setTimeout(() => {
      setLoading(false);
      next();
    }, 800);
  }

  const labelClass = "flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1";
  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight text-balance">
          Criar conta de administrador
        </h2>
        <p className="text-gray-500 mt-2">
          Defina as credenciais do primeiro usuário com acesso total ao sistema.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          {/* Nome */}
          <div>
            <label className={labelClass}>
              <User className="w-3.5 h-3.5" /> Nome *
            </label>
            <input
              name="firstName"
              placeholder="Ex: João"
              value={data.firstName || ""}
              onChange={handleChange}
              className={`${inputClass} ${errors.firstName ? "border-red-500 focus:ring-red-100" : ""}`}
            />
            {errors.firstName && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 ml-1">
                <AlertCircle className="w-3 h-3" /> {errors.firstName}
              </p>
            )}
          </div>

          {/* Sobrenome */}
          <div>
            <label className={labelClass}>
              <User className="w-3.5 h-3.5" /> Sobrenome *
            </label>
            <input
              name="lastName"
              placeholder="Ex: Silva"
              value={data.lastName || ""}
              onChange={handleChange}
              className={`${inputClass} ${errors.lastName ? "border-red-500 focus:ring-red-100" : ""}`}
            />
          </div>

          {/* Email */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              <Mail className="w-3.5 h-3.5" /> Email Corporativo *
            </label>
            <input
              type="email"
              name="email"
              placeholder="joao@suaempresa.com"
              value={data.email || ""}
              onChange={handleChange}
              className={`${inputClass} ${errors.email ? "border-red-500 focus:ring-red-100" : ""}`}
            />
          </div>

          {/* Senha */}
          <div>
            <label className={labelClass}>
              <Lock className="w-3.5 h-3.5" /> Senha *
            </label>
            <input
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={data.password || ""}
              onChange={handleChange}
              className={`${inputClass} ${errors.password ? "border-red-500 focus:ring-red-100" : ""}`}
            />
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 ml-1">
                <AlertCircle className="w-3 h-3" /> {errors.password}
              </p>
            )}
          </div>

          {/* Confirmar senha */}
          <div>
            <label className={labelClass}>
              <ShieldCheck className="w-3.5 h-3.5" /> Confirmar senha *
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repita sua senha"
              value={data.confirmPassword || ""}
              onChange={handleChange}
              className={`${inputClass} ${errors.confirmPassword ? "border-red-500 focus:ring-red-100" : ""}`}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 ml-1">
                <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={back}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Próximo Passo
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}