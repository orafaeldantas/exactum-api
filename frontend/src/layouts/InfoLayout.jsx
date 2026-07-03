import { Outlet, NavLink, Link } from "react-router-dom";
import { Box, ArrowLeft } from "lucide-react";

const TABS = [
  { label: "Quem Somos", path: "/about" },
  { label: "Privacidade", path: "/privacy" },
  { label: "Termos", path: "/terms" },
  { label: "Suporte", path: "/support" },
];

export default function InfoLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 flex items-center justify-between sm:mb-8">
            <Link to="/" className="flex items-center gap-3 select-none">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">Exactum</h1>
                  <span className="hidden items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 sm:inline-flex">
                    Alpha
                  </span>
                </div>
                <p className="text-xs text-slate-500">Informações da Plataforma</p>
              </div>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar ao site</span>
            </Link>
          </div>

          {/* Tabs */}
          <nav className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:px-0" aria-label="Páginas institucionais">
            {TABS.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `shrink-0 rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.35)]"
                      : "text-slate-500 hover:bg-gray-100 hover:text-slate-700"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-6 py-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-400">
            &copy; 2026 Exactum Tecnologia. Todos os direitos reservados.
          </p>
          <p className="text-xs text-slate-400">
            Versão <span className="text-slate-500">Alpha</span> — em construção ativa.
          </p>
        </div>
      </footer>
    </div>
  );
}