import { Check, ArrowRight, ArrowLeft, Rocket, TrendingUp, ShieldCheck, Clock, Lock } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "Grátis",
    priceNote: "durante o Alpha",
    description: "Ideal para pequenas operações que estão começando a organizar o estoque.",
    icon: Rocket,
    available: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: null,
    description: "Para empresas em expansão que precisam de mais controle e visibilidade.",
    icon: TrendingUp,
    available: false,
    highlights: ["Múltiplos usuários", "Relatórios avançados", "Suporte prioritário"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sob consulta",
    description: "Segurança dedicada e escala total para operações maiores.",
    icon: ShieldCheck,
    available: false,
    highlights: ["Segurança dedicada", "SLA personalizado", "Onboarding assistido"],
  },
];

const ADDONS = [
  {
    id: "alerts",
    label: "Alertas de ruptura",
    desc: "Notificações de estoque crítico",
    available: true,
  },
  {
    id: "import",
    label: "Importação de dados",
    desc: "Migre seu inventário via CSV/Excel",
    available: false,
  },
  {
    id: "predictive",
    label: "Estoque preditivo",
    desc: "IA para prever demanda futura",
    available: false,
  },
];

export default function PlanStep({ data, updateData, next, back }) {
  function selectPlan(plan) {
    if (!plan.available) return;
    updateData({ type: plan.id });
  }

  function toggleFeature(feature) {
    if (!feature.available) return;
    updateData({
      features: {
        ...data.features,
        [feature.id]: !data.features?.[feature.id],
      },
    });
  }

  const canProceed = Boolean(data.type);

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Escolha seu plano
        </h2>
        <p className="text-slate-500 mt-2">
          Selecione a base de recursos que melhor atende seu volume atual.
        </p>
      </div>

      {/* GRID DE PLANOS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan, index) => {
          const isSelected = data.type === plan.id;
          const Icon = plan.icon;

          return (
            <div
              key={plan.id}
              onClick={() => selectPlan(plan)}
              style={{ animationDelay: `${index * 90}ms` }}
              className={`
                animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both
                relative flex flex-col rounded-2xl border-2 p-5 transition-all duration-200
                ${
                  !plan.available
                    ? "cursor-not-allowed border-gray-100 bg-gray-50/60"
                    : isSelected
                    ? "cursor-pointer border-blue-600 bg-blue-50/30 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_24px_-8px_rgba(37,99,235,0.2)] ring-4 ring-blue-100"
                    : "cursor-pointer border-gray-100 bg-white hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.02),0_16px_32px_-16px_rgba(15,23,42,0.15)]"
                }
              `}
            >
              {!plan.available && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                  <Clock className="h-2.5 w-2.5" />
                  Em breve
                </span>
              )}

              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  !plan.available
                    ? "bg-gray-100 text-gray-400"
                    : isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <h3 className={`font-bold ${!plan.available ? "text-slate-500" : isSelected ? "text-blue-900" : "text-slate-900"}`}>
                {plan.name}
              </h3>

              {plan.price ? (
                <p className={`text-xl font-black mt-1 ${!plan.available ? "text-slate-400" : "text-slate-800"}`}>
                  {plan.price}
                  {plan.priceNote && (
                    <span className="ml-1.5 text-xs font-medium text-slate-400">{plan.priceNote}</span>
                  )}
                </p>
              ) : (
                <p className="text-xl font-black mt-1 text-slate-300">Em definição</p>
              )}

              <p className={`mt-2 text-xs leading-relaxed ${!plan.available ? "text-slate-400" : "text-slate-500"}`}>
                {plan.description}
              </p>

              {plan.highlights && (
                <ul className="mt-4 flex flex-col gap-1.5 border-t border-gray-100 pt-4">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {isSelected && plan.available && (
                <div className="absolute top-4 right-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="w-3 h-3 stroke-[4px]" />
                  </div>
                </div>
              )}

              {!plan.available && (
                <div className="absolute bottom-4 right-4 text-slate-300">
                  <Lock className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FEATURES ADICIONAIS */}
      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
          Recursos Adicionais
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {ADDONS.map((feature) => {
            const isOn = feature.available && Boolean(data.features?.[feature.id]);
            return (
              <div
                key={feature.id}
                className={`flex items-center justify-between gap-4 p-3 rounded-xl transition-colors ${
                  feature.available ? "hover:bg-gray-50" : "opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{feature.label}</p>
                    {!feature.available && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-600">
                        Em breve
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>

                {/* Custom Switch Component */}
                <button
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  disabled={!feature.available}
                  title={!feature.available ? "Disponível em breve" : undefined}
                  aria-pressed={isOn}
                  className={`
                    relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none
                    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    ${!feature.available ? "cursor-not-allowed bg-gray-200" : isOn ? "bg-blue-600" : "bg-gray-200"}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${isOn ? "translate-x-6" : "translate-x-1"}
                    `}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTÕES DE NAVEGAÇÃO */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={back}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="flex flex-col items-end gap-2">
          {!canProceed && (
            <p className="text-xs font-medium text-slate-400">Selecione um plano para continuar</p>
          )}
          <button
            onClick={next}
            disabled={!canProceed}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3),0_16px_32px_-12px_rgba(37,99,235,0.25)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.35),0_20px_40px_-12px_rgba(37,99,235,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3),0_16px_32px_-12px_rgba(37,99,235,0.25)]"
          >
            Próximo Passo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}