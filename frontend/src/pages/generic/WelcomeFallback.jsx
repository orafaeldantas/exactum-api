import { Box, LifeBuoy, LogOut, ShieldQuestion } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";

export default function WelcomeFallback() {
  const { logout } = useContext(AuthContext);
  const { profile } = useContext(UserContext);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 text-center">
      {/* Logo */}
      <Link to="/" className="group mb-8 flex items-center gap-2 select-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-500/20 transition-transform duration-300 group-hover:scale-105">
          <Box className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Exactum
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-900/5">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200">
            <ShieldQuestion className="h-7 w-7 text-amber-600" />
          </div>

          {/* Greeting */}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Olá, {profile?.username || "visitante"}! 👋
          </h1>

          {/* Message */}
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Bem-vindo ao Exactum. No momento, sua conta não possui permissões
            para acessar os módulos do sistema.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Entre em contato com o administrador da sua empresa para solicitar
            acesso às funcionalidades.
          </p>

          {/* Actions */}
          <div className="mt-7 flex flex-col items-center gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-center">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
            >
              <LifeBuoy className="h-4 w-4" />
              Central de ajuda
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-12 text-xs font-medium text-slate-400">
        © 2026 Exactum Tecnologia. Inteligência em cada unidade.
      </p>
    </div>
  );
}
