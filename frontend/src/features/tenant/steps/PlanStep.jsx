import { Check, ArrowRight, ArrowLeft, Rocket, TrendingUp, ShieldCheck } from "lucide-react";

export default function PlanStep({ data, updateData, next, back }) {
  function selectPlan(plan) {
    updateData({ type: plan });
  }

  function toggleFeature(feature) {
    updateData({
      features: {
        ...data.features,
        [feature]: !data.features?.[feature],
      },
    });
  }

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "R$ 299",
      description: "Ideal para pequenas operações",
      icon: <Rocket className="w-5 h-5" />,
    },
    {
      id: "growth",
      name: "Growth",
      price: "R$ 799",
      description: "Para empresas em expansão",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Sob consulta",
      description: "Segurança e escala total",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Escolha seu plano
        </h2>
        <p className="text-gray-500 mt-2">
          Selecione a base de recursos que melhor atende seu volume atual.
        </p>
      </div>

      {/* GRID DE PLANOS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = data.type === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => selectPlan(plan.id)}
              className={`
                relative flex cursor-pointer flex-col rounded-2xl border-2 p-5 transition-all duration-200
                ${isSelected 
                  ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-100" 
                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
                }
              `}
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                {plan.icon}
              </div>
              
              <h3 className={`font-bold ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <p className="text-xl font-black mt-1 text-gray-800">{plan.price}<span className="text-xs font-medium text-gray-400">/mês</span></p>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                {plan.description}
              </p>

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="w-3 h-3 stroke-[4px]" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FEATURES ADICIONAIS */}
      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
          Recursos Adicionais
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            { id: "predictive", label: "Estoque preditivo", desc: "IA para prever demanda futura" },
            { id: "alerts", label: "Alertas de ruptura", desc: "Notificações de estoque crítico" },
            { id: "import", label: "Importação de dados", desc: "Migre seu inventário via CSV/Excel" },
          ].map((feature) => (
            <div key={feature.id} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">{feature.label}</p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
              
              {/* Custom Switch Component */}
              <button
                onClick={() => toggleFeature(feature.id)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none
                  ${data.features?.[feature.id] ? "bg-blue-600" : "bg-gray-200"}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${data.features?.[feature.id] ? "translate-x-6" : "translate-x-1"}
                  `}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BOTÕES DE NAVEGAÇÃO */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={back}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <button
          onClick={next}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          Próximo Passo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}