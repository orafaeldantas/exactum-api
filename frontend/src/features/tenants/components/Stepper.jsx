import { Check, CircleDot, Box } from "lucide-react";
import { Link } from "react-router-dom";

const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Stepper({ steps, currentStep, onStepClick }) {
  const progressPercent =
    steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <aside className="sticky top-0 flex h-screen w-80 shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-8 text-white">
      {/* Local keyframes — kept scoped to this component */}
      <style>{`
        @keyframes floatBlob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10px, -14px) scale(1.05); }
        }
        @keyframes pingSlow {
          0% { transform: scale(1); opacity: 0.55; }
          70%, 100% { transform: scale(1.9); opacity: 0; }
        }
        .blob-a { animation: floatBlob 10s ease-in-out infinite; }
        .ping-slow { animation: pingSlow 2.4s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .blob-a, .ping-slow { animation: none !important; }
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="blob-a absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_BG }}
        />
      </div>

      {/* Logo */}
      <div className="relative mb-12 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.5)]">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Exactum</h1>
            <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400">
              Alpha
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Setup de Empresa
          </p>
        </div>
      </div>

      {/* Steps */}
      <nav className="relative flex flex-1 flex-col gap-1" aria-label="Progresso da configuração">
        {/* Track (full) */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-800" />
        {/* Track (filled) */}
        <div
          className="absolute left-[15px] top-2 w-px bg-gradient-to-b from-blue-500 to-emerald-500 transition-all duration-700 ease-out"
          style={{ height: `${progressPercent}%` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <button
              key={stepNumber}
              type="button"
              onClick={() => onStepClick?.(stepNumber)}
              aria-current={isActive ? "step" : undefined}
              className="group relative z-10 flex items-start gap-4 rounded-lg py-3 text-left transition-colors duration-200 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {/* Step circle */}
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                {isActive && (
                  <span className="ping-slow absolute inset-0 rounded-full bg-blue-500/40" aria-hidden="true" />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-[0_4px_12px_-2px_rgba(16,185,129,0.5)]"
                      : isActive
                      ? "bg-blue-600 text-white shadow-[0_4px_16px_-2px_rgba(37,99,235,0.6)] ring-4 ring-blue-500/20"
                      : "bg-slate-800 text-slate-500 group-hover:scale-105 group-hover:bg-slate-700 group-hover:text-slate-300"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : stepNumber}
                </span>
              </span>

              {/* Step text */}
              <span className="flex flex-col pt-0.5">
                <span
                  className={`mb-0.5 text-[10px] uppercase tracking-wider font-bold transition-colors duration-200 ${
                    isActive ? "text-blue-400" : "text-slate-500"
                  }`}
                >
                  Etapa {stepNumber}
                </span>
                <span
                  className={`text-sm font-semibold transition-all duration-200 group-hover:translate-x-0.5 ${
                    isActive
                      ? "text-white"
                      : isCompleted
                      ? "text-slate-300"
                      : "text-slate-600 group-hover:text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="mt-0.5 text-xs leading-snug text-slate-600">{step.description}</span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="relative mt-10 border-t border-slate-800 pt-6">
        <div className="mb-2 flex items-center gap-2">
          <CircleDot className="w-3 h-3 text-slate-500" />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Conformidade e Termos
          </p>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Ao prosseguir com a criação do <span className="text-slate-400">tenant</span>, você concorda com nossas{" "}
          <Link
            to="/terms"
            className="text-slate-400 underline decoration-slate-700 underline-offset-2 transition-colors duration-200 hover:text-blue-400 hover:decoration-blue-400"
          >
            políticas de uso de dados e segurança
          </Link>
          .
        </p>
      </div>
    </aside>
  );
}