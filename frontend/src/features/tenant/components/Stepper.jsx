import { Check, CircleDot, Box } from "lucide-react";

export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <aside className="w-80 min-h-screen bg-slate-900 text-white p-8 flex flex-col border-r border-slate-800">
      
      {/* Header do Setup */}
      <div className="mb-12 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Exactum</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Setup de Empresa
          </p>
        </div>
      </div>

      {/* Lista de Passos */}
      <div className="flex flex-col gap-8 relative">
        {/* Linha conectora vertical (opcional, dá um toque profissional) */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-800" />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div
              key={stepNumber}
              onClick={() => onStepClick?.(stepNumber)}
              className={`flex items-start gap-4 cursor-pointer group transition-all`}
            >
              {/* Círculo do Passo */}
              <div
                className={`
                  relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                      : isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 ring-4 ring-blue-900/30"
                      : "bg-slate-800 text-slate-500 group-hover:bg-slate-700"
                  }
                `}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : stepNumber}
              </div>

              {/* Textos do Passo */}
              <div className="flex flex-col">
                <p className={`
                  text-[10px] uppercase tracking-wider font-bold mb-0.5 transition-colors
                  ${isActive ? "text-blue-500" : "text-slate-500"}
                `}>
                  Etapa {stepNumber}
                </p>
                <p
                  className={`
                    text-sm font-semibold transition-colors
                    ${
                      isActive
                        ? "text-white"
                        : isCompleted
                        ? "text-slate-300"
                        : "text-slate-600 group-hover:text-slate-400"
                    }
                  `}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-8 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <CircleDot className="w-3 h-3 text-slate-500" />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Conformidade e Termos
          </p>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Ao prosseguir com a criação do <span className="text-slate-400">tenant</span>, você concorda automaticamente com nossas políticas de uso de dados e segurança.
        </p>
      </div>
    </aside>
  );
}