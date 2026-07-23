import { Building2, Mail, Package, Save, Target } from "lucide-react";
import { inputClass } from "../utils/styles";
import SectionCard from "./SectionCard";

export default function CompanyTab({
  form,
  saving,
  onChange,
  onMonthlyGoalChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <SectionCard
          icon={Target}
          iconTone="bg-blue-100 text-blue-600"
          title="Metas e Estoque"
          description="Configure metas mensais e regras do sistema"
        >
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Meta Mensal (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  name="monthlyGoal"
                  value={
                    form.monthlyGoal
                      ? Number(form.monthlyGoal).toLocaleString("pt-BR")
                      : ""
                  }
                  onChange={onMonthlyGoalChange}
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Estoque Mínimo Global
              </label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="minimumStock"
                  value={form.minimumStock}
                  onChange={onChange}
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Building2}
          iconTone="bg-emerald-100 text-emerald-600"
          title="Dados da Empresa"
          description="Informações institucionais utilizadas no sistema"
        >
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nome da Empresa
              </label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={onChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="companyEmail"
                  value={form.companyEmail}
                  onChange={onChange}
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Empresa"}
        </button>
      </div>
    </form>
  );
}
