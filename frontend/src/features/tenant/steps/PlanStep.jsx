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
  
    return (
      <div className="max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6">
          Escolha seu plano
        </h2>
  
        {/* PLANOS */}
        <div className="grid grid-cols-3 gap-4">
  
          {/* Starter */}
          <div
            onClick={() => selectPlan("starter")}
            className={`p-4 border rounded-lg cursor-pointer ${
              data.type === "starter" && "border-indigo-600"
            }`}
          >
            <h3 className="font-semibold">Starter</h3>
            <p className="text-sm text-gray-500">R$ 299/mês</p>
          </div>
  
          {/* Growth */}
          <div
            onClick={() => selectPlan("growth")}
            className={`p-4 border rounded-lg cursor-pointer ${
              data.type === "growth" && "border-indigo-600"
            }`}
          >
            <h3 className="font-semibold">Growth</h3>
            <p className="text-sm text-gray-500">R$ 799/mês</p>
          </div>
  
          {/* Enterprise */}
          <div
            onClick={() => selectPlan("enterprise")}
            className={`p-4 border rounded-lg cursor-pointer ${
              data.type === "enterprise" && "border-indigo-600"
            }`}
          >
            <h3 className="font-semibold">Enterprise</h3>
            <p className="text-sm text-gray-500">Sob consulta</p>
          </div>
  
        </div>
  
        {/* FEATURES */}
        <div className="mt-8 bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Configurações iniciais</h3>
  
          <div className="space-y-4">
  
            <div className="flex justify-between items-center">
              <span>Estoque preditivo</span>
              <input
                type="checkbox"
                checked={data.features?.predictive || false}
                onChange={() => toggleFeature("predictive")}
              />
            </div>
  
            <div className="flex justify-between items-center">
              <span>Alertas de ruptura</span>
              <input
                type="checkbox"
                checked={data.features?.alerts || false}
                onChange={() => toggleFeature("alerts")}
              />
            </div>
  
            <div className="flex justify-between items-center">
              <span>Importação de dados</span>
              <input
                type="checkbox"
                checked={data.features?.import || false}
                onChange={() => toggleFeature("import")}
              />
            </div>
  
          </div>
        </div>
  
        {/* BOTÕES */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={back}
            className="px-4 py-2 border rounded-md"
          >
            Voltar
          </button>
  
          <button
            onClick={next}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md"
          >
            Próximo
          </button>
        </div>
      </div>
    );
  }