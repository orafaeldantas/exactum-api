import { useState } from "react";
import { Building2, Globe, FileText, ArrowRight, AlertCircle } from "lucide-react";

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
    setLoading(true);
    // Simulação de delay para feedback visual
    setTimeout(() => {
      setLoading(false);
      next();
    }, 600);
  }

  const labelClass = "flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1";
  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Dados da Empresa
        </h2>
        <p className="text-gray-500 mt-2">
          Comece configurando as informações básicas da sua organização.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          {/* Razão social */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              <Building2 className="w-3.5 h-3.5" /> Razão social *
            </label>
            <input
              name="name"
              placeholder="Ex: Minha Empresa LTDA"
              value={data.name || ""}
              onChange={handleChange}
              className={`${inputClass} ${errors.name ? "border-red-500 focus:ring-red-100" : ""}`}
            />
            {errors.name && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 ml-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Nome fantasia */}
          <div>
            <label className={labelClass}>
              <FileText className="w-3.5 h-3.5" /> Nome fantasia
            </label>
            <input
              name="fantasyName"
              placeholder="Como sua empresa é conhecida"
              value={data.fantasyName || ""}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className={labelClass}>
              <FileText className="w-3.5 h-3.5" /> CNPJ *
            </label>
            <input
              name="cnpj"
              placeholder="00.000.000/0000-00"
              value={data.cnpj || ""}
              onChange={handleChange}
              className={`${inputClass} ${errors.cnpj ? "border-red-500 focus:ring-red-100" : ""}`}
            />
            {errors.cnpj && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 ml-1">
                <AlertCircle className="w-3 h-3" /> {errors.cnpj}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              <Globe className="w-3.5 h-3.5" /> Identificador único (Slug) *
            </label>
            <div className="group flex">
              <span className="flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 px-4 text-sm font-medium text-gray-500 transition group-focus-within:border-blue-500 group-focus-within:ring-4 group-focus-within:ring-blue-100">
                app.exactum.com/
              </span>
              <input
                name="slug"
                placeholder="minha-empresa"
                value={data.slug || ""}
                onChange={handleChange}
                className={`flex-1 rounded-r-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                  errors.slug ? "border-red-500 focus:ring-red-100" : ""
                }`}
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-400 ml-1">
              Este será o seu endereço de acesso exclusivo à plataforma.
            </p>
            {errors.slug && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 ml-1">
                <AlertCircle className="w-3 h-3" /> {errors.slug}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Próximo Passo
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}