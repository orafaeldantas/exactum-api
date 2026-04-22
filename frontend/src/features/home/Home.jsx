import { useNavigate } from "react-router-dom";
import { Box, BarChart3, Bell, LayoutDashboard, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Box className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Exactum</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/create-tenant")}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gray-50/50 py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
            </span>
            Nova versão 2.0 disponível
          </div>
          
          <h2 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            Controle seu estoque com <span className="text-blue-600">inteligência</span>
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 leading-relaxed">
            Preveja demanda, evite rupturas e maximize seu lucro com análise preditiva integrada à sua gestão diária.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/create-tenant")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] sm:w-auto"
            >
              Criar minha empresa
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition-all hover:bg-gray-50 sm:w-auto">
              Ver Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h3 className="text-3xl font-bold text-slate-900">Tudo o que você precisa</h3>
          <p className="mt-4 text-slate-500">Gestão simplificada para empresas que buscam escala.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="mb-2 text-xl font-bold text-slate-800">Previsão de Demanda</h4>
            <p className="text-slate-600 leading-relaxed text-sm">
              Antecipe necessidades com base em histórico e tendências de mercado usando algoritmos preditivos.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="mb-2 text-xl font-bold text-slate-800">Alertas Inteligentes</h4>
            <p className="text-slate-600 leading-relaxed text-sm">
              Receba notificações em tempo real antes que o estoque acabe ou quando houver excesso de produtos.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h4 className="mb-2 text-xl font-bold text-slate-800">Gestão Centralizada</h4>
            <p className="text-slate-600 leading-relaxed text-sm">
              Visualize toda sua operação em um dashboard intuitivo e tome decisões baseadas em dados reais.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER - Simples e Limpo */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-gray-50/50">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Box className="w-5 h-5" />
            <span className="font-bold">Exactum</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 Exactum Tecnologia. Inteligência em cada unidade.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-blue-600">Privacidade</a>
            <a href="#" className="hover:text-blue-600">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}