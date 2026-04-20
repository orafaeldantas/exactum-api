import { useState } from "react";
import { createTenantDraft } from "../services/tenantService";

export default function CompanyStep({ data, updateData, next }) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const newErrors = {};

    if (!data.name) newErrors.name = "Razão social é obrigatória";
    if (!data.cnpj) newErrors.cnpj = "CNPJ é obrigatório";
    if (!data.slug) newErrors.slug = "Slug é obrigatório";

    return newErrors;
  }

  function formatCNPJ(value) {
    const v = value.replace(/\D/g, "").slice(0, 14);

    return v
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "cnpj") {
      updateData({ cnpj: formatCNPJ(value) });
      return;
    }

    updateData({ [name]: value });
  }

  function handleNext() {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {

      setLoading(true);

      //updateData({ id: response.id });

      next();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

 /* async function handleNext() {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const response = await createTenantDraft(data);

      // salva ID do tenant (IMPORTANTE)
      updateData({ id: response.id });

      next();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }*/

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-6">
        Dados da Empresa
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 gap-4">

          {/* Razão social */}
          <div className="col-span-2">
            <label className="text-sm text-gray-600">
              Razão social *
            </label>
            <input
              name="name"
              value={data.name || ""}
              onChange={handleChange}
              className={`w-full mt-1 p-2 border rounded-md ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Nome fantasia */}
          <div>
            <label className="text-sm text-gray-600">
              Nome fantasia
            </label>
            <input
              name="fantasyName"
              value={data.fantasyName || ""}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="text-sm text-gray-600">
              CNPJ *
            </label>
            <input
              name="cnpj"
              value={data.cnpj || ""}
              onChange={handleChange}
              className={`w-full mt-1 p-2 border rounded-md ${
                errors.cnpj ? "border-red-500" : ""
              }`}
            />
            {errors.cnpj && (
              <p className="text-xs text-red-500 mt-1">
                {errors.cnpj}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="col-span-2">
            <label className="text-sm text-gray-600">
              Identificador (slug) *
            </label>

            <div className="flex mt-1" >
              <span className="bg-gray-100 px-3 py-2 h-11 border border-r-0 rounded-l-md text-sm text-gray-500">
                app.exactum.com/
              </span>

              <input
                name="slug"
                value={data.slug || ""}
                onChange={handleChange}
                className={`flex-1 p-2 border rounded-r-md ${
                  errors.slug ? "border-red-500" : ""
                }`}
              />
            </div>

            {errors.slug && (
              <p className="text-xs text-red-500 mt-1">
                {errors.slug}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Botão */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleNext}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Próximo"}
        </button>
      </div>
    </div>
  );
}