import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, AlertCircle, Save } from "lucide-react";
import { apiFetch } from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("A nova senha deve ter pelo menos 6 caracteres.");
    }

    if (password !== confirmPassword) {
      return setError("As senhas não coincidem.");
    }

    setLoading(true);

    try {

      const response = await apiFetch(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        navigate("/dashboard");
      }

      console.log("Senha atualizada com sucesso");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erro ao atualizar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/50">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-100">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Primeiro Acesso
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sua senha é provisória. Por favor, defina uma nova senha de segurança para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* New Password */}
          <div className="relative">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Save button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="
              flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 
              text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all 
              hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Atualizar Senha
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          A nova senha será validada nos critérios de segurança da Exactum.
        </p>
      </div>
    </div>
  );
}