import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      
      {/* Container Principal com Animação */}
      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 text-center max-w-lg animate-in fade-in zoom-in duration-500">

        {/* Ícone de Sucesso Estilizado */}
        <div className="relative mx-auto w-20 h-20 mb-8">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
          <div className="relative w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5px]" />
          </div>
          {/* Pequenos brilhos decorativos */}
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 animate-pulse" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Empresa configurada!
        </h1>

        <div className="space-y-4 mb-10">
          <p className="text-gray-600 leading-relaxed">
            Seu ambiente corporativo na <span className="font-bold text-blue-600">Exactum</span> foi criado e já está operacional.
          </p>
          
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50">
            <p className="text-sm text-blue-700 font-medium">
              Utilize o e-mail e senha do administrador que você acabou de cadastrar para acessar o painel.
            </p>
          </div>
        </div>

        {/* Botão de Ação Principal */}
        <button
          onClick={() => navigate("/login")}
          className="group w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
        >
          Acessar Plataforma
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-8 text-xs text-gray-400">
          Precisa de ajuda? <a href="#" className="text-blue-600 hover:underline font-semibold">Fale com o suporte</a>
        </p>

      </div>
    </div>
  );
}