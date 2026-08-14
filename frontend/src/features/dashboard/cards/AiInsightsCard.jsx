import { Clock, Zap } from "lucide-react";

function AiInsightsCard({}) {
  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 text-white relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute top-0 right-0 w-[240px] h-[240px] opacity-[0.04]">
        <Zap size={240} />
      </div>

      {/* EM BREVE */}
      <span className="absolute right-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
        <Clock className="h-3 w-3" />
        Em breve
      </span>

      <div className="relative z-10">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/15 flex items-center justify-center">
              <Zap size={18} className="text-blue-400" />
            </div>

            <div>
              <h4 className="text-lg font-black">Análise Inteligente</h4>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Insights automáticos com base no comportamento operacional
              </p>
            </div>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="space-y-4">
          <div className="rounded-3xl p-5 border border-slate-800 bg-white/[0.03] hover:border-blue-800 transition-all">
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-widest font-black text-blue-400">
                PREVISÃO DE ESTOQUE
              </p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Produtos com maior giro podem atingir limite mínimo nos próximos
              dias.
            </p>
          </div>

          <div className="rounded-3xl p-5 border border-slate-800 bg-white/[0.03] hover:border-emerald-800 transition-all">
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400">
                OPORTUNIDADE DE VENDA
              </p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Alguns produtos apresentam crescimento consistente no período.
            </p>
          </div>

          <div className="rounded-3xl p-5 bg-white/[0.02] border border-slate-800">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">
              RESUMO EXECUTIVO
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Ticket médio mantém tendência positiva em relação ao período
              anterior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiInsightsCard;
