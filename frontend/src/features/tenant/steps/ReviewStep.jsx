import { useState } from "react";
import { createTenantDraft } from "../services/tenantService";

export default function ReviewStep({ data, back }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);

      await createTenantDraft(data);

      alert("Tenant criado com sucesso!");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">
        Revisar informações
      </h2>

      <div className="space-y-6">

        {/* EMPRESA */}
        <div className="bg-white p-4 border rounded">
          <h3 className="font-semibold mb-2">Empresa</h3>
          <p><strong>Nome:</strong> {data.company.name}</p>
          <p><strong>CNPJ:</strong> {data.company.cnpj}</p>
          <p><strong>Razão social:</strong> {data.company.fantasyName}</p>
          <p><strong>Slug:</strong> {"app.exactum.com/" + data.company.slug}</p>
        </div>

        {/* ADMIN */}
        <div className="bg-white p-4 border rounded">
          <h3 className="font-semibold mb-2">Administrador</h3>
          <p><strong>Nome:</strong> {data.admin.firstName} {data.admin.lastName}</p>
          <p><strong>Email:</strong> {data.admin.email}</p>
        </div>

        {/* PLANO */}
        <div className="bg-white p-4 border rounded">
          <h3 className="font-semibold mb-2">Plano</h3>
          <p><strong>Tipo:</strong> {data.plan.type}</p>

          <div className="mt-2">
            <strong>Features:</strong>
            <ul className="list-disc ml-5 text-sm">
              {Object.entries(data.plan.features || {}).map(([key, value]) =>
                value ? <li key={key}>{key}</li> : null
              )}
            </ul>
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
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-md"
        >
          {loading ? "Criando..." : "Criar Tenant"}
        </button>
      </div>
    </div>
  );
}