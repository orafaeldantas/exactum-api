import { ArrowLeft, Box, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 text-center">
      {/* Logo */}
      <Link to="/" className="group mb-10 flex items-center gap-2 select-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-500/20 transition-transform duration-300 group-hover:scale-105">
          <Box className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Exactum
        </span>
      </Link>

      {/* Error code */}
      <h1 className="text-9xl font-black tracking-tighter text-slate-200">
        404
      </h1>

      {/* Headline */}
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        Página não encontrada
      </h2>

      {/* Description */}
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
        A página que você procura não existe, foi movida ou está temporariamente
        indisponível. Verifique o endereço ou volte ao painel.
      </p>

      {/* Actions */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-500/20 transition-all duration-300 hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-600/40 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Voltar ao início
        </Link>
        <Link
          to="/support"
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <LifeBuoy className="h-4 w-4 text-blue-600 transition-colors duration-300 group-hover:text-blue-700" />
          Central de ajuda
        </Link>
      </div>

      {/* Subtle branding */}
      <p className="mt-14 text-xs font-medium text-slate-400">
        © 2026 Exactum Tecnologia. Inteligência em cada unidade.
      </p>
    </div>
  );
}
