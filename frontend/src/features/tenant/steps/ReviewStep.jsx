import { useState } from "react";
import { createTenantDraft } from "../services/tenantService";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  User, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  Globe, 
  Mail, 
  ChevronRight 
} from "lucide-react";

export default function ReviewStep({ data, back }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    try {
      setLoading(true);
      await createTenantDraft(data);
      navigate("/success");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const sectionClass = "bg-white p-6 border border-gray-200 rounded-2xl shadow-sm";
  const labelClass = "text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-0.5";
  const valueClass = "text-sm font-semibold text-gray-800";

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Revisar informações
        </h2>
        <p className="text-gray-500 mt-2">
          Confira os dados abaixo antes de finalizar a criação da sua empresa.
        </p>
      </div>

      <div className="space-y-4">
        {/* SEÇÃO: EMPRESA */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Dados da Empresa</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className={labelClass}>Razão Social</span>
              <p className={valueClass}>{data.company.name}</p>
            </div>
            <div>
              <span className={labelClass}>Nome Fantasia</span>
              <p className={valueClass}>{data.company.fantasyName || "Não informado"}</p>
            </div>
            <div>
              <span className={labelClass}>CNPJ</span>
              <p className={valueClass}>{data.company.cnpj}</p>
            </div>
            <div>
              <span className={labelClass}>Endereço de Acesso</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-sm font-bold text-blue-600 italic">
                  app.exactum.com/{data.company.slug}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO: ADMIN */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Administrador Responsável</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className={labelClass}>Nome Completo</span>
              <p className={valueClass}>{data.admin.firstName} {data.admin.lastName}</p>
            </div>
            <div>
              <span className={labelClass}>E-mail de Acesso</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <p className={valueClass}>{data.admin.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO: PLANO */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Plano Selecionado</h3>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className={labelClass}>Tipo de Assinatura</span>
              <p className="text-lg font-black text-gray-900 capitalize">
                {data.plan.type}
              </p>
            </div>

            <div className="flex-1 md:max-w-xs">
              <span className={labelClass}>Recursos Ativados</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(data.plan.features || {}).map(([key, value]) =>
                  value ? (
                    <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" />
                      {key}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÕES DE NAVEGAÇÃO */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          onClick={back}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar e Editar
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
            flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl 
            bg-emerald-600 px-10 py-4 text-sm font-bold text-white shadow-lg 
            shadow-emerald-200 transition-all hover:bg-emerald-700 
            active:scale-[0.98] disabled:opacity-50
          "
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Confirmar e Criar Empresa
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}